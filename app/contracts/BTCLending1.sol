// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CustomBTC.sol";
import "./CustomUSDT.sol";

contract BTCLending is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // State variables
    CustomBTC public immutable btcToken;
    CustomUSDT public immutable usdtToken;
    IERC20 public immutable btcTokenInterface;
    IERC20 public immutable usdtTokenInterface;
    
    uint256 public constant COLLATERALIZATION_RATIO = 150; // 150%
    uint256 public constant LIQUIDATION_THRESHOLD = 130; // 130%
    uint256 public constant LIQUIDATION_BONUS = 105; // 5% bonus for liquidators
    uint256 public constant PRICE_PRECISION = 1e8;
    
    // Price constants
    uint256 public constant MIN_BTC_PRICE = 80000 * PRICE_PRECISION; // $80,000
    uint256 public constant MAX_BTC_PRICE = 84000 * PRICE_PRECISION; // $84,000
    uint256 public constant USDT_PRICE = 82000 * PRICE_PRECISION; // $82,000
    
    uint256 public currentBtcPrice;
    
    struct Position {
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 lastUpdateTime;
        bool isActive;
    }
    
    mapping(address => Position) public positions;
    uint256 public totalCollateral;
    uint256 public totalBorrowed;
    
    // Events
    event PositionOpened(address indexed user, uint256 collateralAmount, uint256 borrowedAmount);
    event PositionClosed(address indexed user);
    event CollateralAdded(address indexed user, uint256 amount);
    event CollateralRemoved(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Liquidated(address indexed user, address indexed liquidator);
    event BtcPriceUpdated(uint256 newPrice);
    event DebugLog(string message, uint256 value);
    
    // Custom errors
    error InsufficientBalance(uint256 required, uint256 available);
    error InsufficientAllowance(uint256 required, uint256 available);
    error InvalidAmount();
    error PositionAlreadyExists();
    error NoActivePosition();
    error InsufficientCollateral();
    error PositionNotLiquidatable();
    error ContractPaused();
    
    constructor(
        address _btcToken,
        address _usdtToken
    ) Ownable(msg.sender) {
        require(_btcToken != address(0), "Invalid BTC token address");
        require(_usdtToken != address(0), "Invalid USDT token address");
        
        btcToken = CustomBTC(_btcToken);
        usdtToken = CustomUSDT(_usdtToken);
        btcTokenInterface = IERC20(_btcToken);
        usdtTokenInterface = IERC20(_usdtToken);
        currentBtcPrice = (MIN_BTC_PRICE + MAX_BTC_PRICE) / 2; // Set initial price to middle of range
    }
    
    function updateBtcPrice(uint256 newPrice) external onlyOwner {
        require(newPrice >= MIN_BTC_PRICE && newPrice <= MAX_BTC_PRICE, "Price out of range");
        currentBtcPrice = newPrice;
        emit BtcPriceUpdated(newPrice);
    }
    
    function getBtcPrice() public view returns (uint256) {
        return currentBtcPrice;
    }
    
    function calculateHealthFactor(address user) public view returns (uint256) {
        Position storage position = positions[user];
        if (!position.isActive) return 0;
        
        uint256 collateralValue = (position.collateralAmount * getBtcPrice()) / PRICE_PRECISION;
        uint256 borrowedValue = (position.borrowedAmount * USDT_PRICE) / PRICE_PRECISION;
        
        return (collateralValue * 100) / borrowedValue;
    }
    
    function openPosition(uint256 collateralAmount, uint256 borrowAmount) external nonReentrant whenNotPaused {
        emit DebugLog("Starting openPosition", 0);
        
        if (paused()) revert ContractPaused();
        
        if (collateralAmount == 0 || borrowAmount == 0) {
            emit DebugLog("Invalid amount", collateralAmount);
            revert InvalidAmount();
        }
        
        if (positions[msg.sender].isActive) {
            emit DebugLog("Position already exists", 0);
            revert PositionAlreadyExists();
        }
        
        // Check user's BTC balance
        uint256 userBalance = btcTokenInterface.balanceOf(msg.sender);
        emit DebugLog("User BTC balance", userBalance);
        
        if (userBalance < collateralAmount) {
            emit DebugLog("Insufficient balance", userBalance);
            revert InsufficientBalance(collateralAmount, userBalance);
        }
        
        // Check allowance
        uint256 allowance = btcTokenInterface.allowance(msg.sender, address(this));
        emit DebugLog("Allowance", allowance);
        
        if (allowance < collateralAmount) {
            emit DebugLog("Insufficient allowance", allowance);
            revert InsufficientAllowance(collateralAmount, allowance);
        }
        
        // Calculate and verify collateralization ratio
        uint256 collateralValue = (collateralAmount * getBtcPrice()) / PRICE_PRECISION;
        uint256 borrowValue = (borrowAmount * USDT_PRICE) / PRICE_PRECISION;
        uint256 ratio = (collateralValue * 100) / borrowValue;
        
        emit DebugLog("Collateral value", collateralValue);
        emit DebugLog("Borrow value", borrowValue);
        emit DebugLog("Ratio", ratio);
        
        if (ratio < COLLATERALIZATION_RATIO) {
            emit DebugLog("Insufficient collateral ratio", ratio);
            revert InsufficientCollateral();
        }
        
        // Transfer collateral - Using try/catch with external contract calls
        bool transferSuccess = false;
        try btcTokenInterface.transferFrom(msg.sender, address(this), collateralAmount) returns (bool success) {
            transferSuccess = success;
        } catch {
            emit DebugLog("BTC transfer failed", 0);
            revert("Failed to transfer BTC collateral");
        }
        
        if (!transferSuccess) {
            emit DebugLog("BTC transfer returned false", 0);
            revert("Failed to transfer BTC collateral");
        }
        
        // Update position
        positions[msg.sender] = Position({
            collateralAmount: collateralAmount,
            borrowedAmount: borrowAmount,
            lastUpdateTime: block.timestamp,
            isActive: true
        });
        
        totalCollateral += collateralAmount;
        totalBorrowed += borrowAmount;
        
        // Transfer borrowed amount - Using try/catch with external contract calls
        bool usdtTransferSuccess = false;
        try usdtTokenInterface.transfer(msg.sender, borrowAmount) returns (bool success) {
            usdtTransferSuccess = success;
        } catch {
            // If USDT transfer fails, revert the entire transaction
            btcTokenInterface.transfer(msg.sender, collateralAmount);
            totalCollateral -= collateralAmount;
            totalBorrowed -= borrowAmount;
            positions[msg.sender].isActive = false;
            emit DebugLog("USDT transfer failed", 0);
            revert("Failed to transfer USDT");
        }
        
        if (!usdtTransferSuccess) {
            // If USDT transfer returns false, revert the entire transaction
            btcTokenInterface.transfer(msg.sender, collateralAmount);
            totalCollateral -= collateralAmount;
            totalBorrowed -= borrowAmount;
            positions[msg.sender].isActive = false;
            emit DebugLog("USDT transfer returned false", 0);
            revert("Failed to transfer USDT");
        }
        
        emit PositionOpened(msg.sender, collateralAmount, borrowAmount);
    }
    
    function closePosition() external nonReentrant {
        Position storage position = positions[msg.sender];
        if (!position.isActive) revert NoActivePosition();
        
        // Repay borrowed amount
        uint256 borrowedAmount = position.borrowedAmount;
        SafeERC20.safeTransferFrom(usdtTokenInterface, msg.sender, address(this), borrowedAmount);
        
        // Return collateral
        uint256 collateralAmount = position.collateralAmount;
        SafeERC20.safeTransfer(btcTokenInterface, msg.sender, collateralAmount);
        
        // Update state
        totalCollateral -= collateralAmount;
        totalBorrowed -= borrowedAmount;
        position.isActive = false;
        
        emit PositionClosed(msg.sender);
    }
    
    function addCollateral(uint256 amount) external nonReentrant {
        Position storage position = positions[msg.sender];
        if (!position.isActive) revert NoActivePosition();
        
        // Check user's BTC balance
        uint256 userBalance = btcTokenInterface.balanceOf(msg.sender);
        if (userBalance < amount) {
            revert InsufficientBalance(amount, userBalance);
        }
        
        // Check allowance
        uint256 allowance = btcTokenInterface.allowance(msg.sender, address(this));
        if (allowance < amount) {
            revert InsufficientAllowance(amount, allowance);
        }
        
        SafeERC20.safeTransferFrom(btcTokenInterface, msg.sender, address(this), amount);
        position.collateralAmount += amount;
        totalCollateral += amount;
        
        emit CollateralAdded(msg.sender, amount);
    }
    
    function removeCollateral(uint256 amount) external nonReentrant {
        Position storage position = positions[msg.sender];
        if (!position.isActive) revert NoActivePosition();
        
        if (amount > position.collateralAmount) revert InvalidAmount();
        
        uint256 newCollateralAmount = position.collateralAmount - amount;
        uint256 collateralValue = (newCollateralAmount * getBtcPrice()) / PRICE_PRECISION;
        uint256 borrowValue = (position.borrowedAmount * USDT_PRICE) / PRICE_PRECISION;
        
        if ((collateralValue * 100) / borrowValue < COLLATERALIZATION_RATIO) {
            revert InsufficientCollateral();
        }
        
        position.collateralAmount = newCollateralAmount;
        totalCollateral -= amount;
        
        SafeERC20.safeTransfer(btcTokenInterface, msg.sender, amount);
        
        emit CollateralRemoved(msg.sender, amount);
    }
    
    function borrow(uint256 amount) external nonReentrant {
        Position storage position = positions[msg.sender];
        if (!position.isActive) revert NoActivePosition();
        
        uint256 collateralValue = (position.collateralAmount * getBtcPrice()) / PRICE_PRECISION;
        uint256 newBorrowedAmount = position.borrowedAmount + amount;
        uint256 newBorrowValue = (newBorrowedAmount * USDT_PRICE) / PRICE_PRECISION;
        
        if ((collateralValue * 100) / newBorrowValue < COLLATERALIZATION_RATIO) {
            revert InsufficientCollateral();
        }
        
        position.borrowedAmount = newBorrowedAmount;
        totalBorrowed += amount;
        
        SafeERC20.safeTransfer(usdtTokenInterface, msg.sender, amount);
        
        emit Borrowed(msg.sender, amount);
    }
    
    function repay(uint256 amount) external nonReentrant {
        Position storage position = positions[msg.sender];
        if (!position.isActive) revert NoActivePosition();
        
        if (amount > position.borrowedAmount) revert InvalidAmount();
        
        // Check user's USDT balance
        uint256 userBalance = usdtTokenInterface.balanceOf(msg.sender);
        if (userBalance < amount) {
            revert InsufficientBalance(amount, userBalance);
        }
        
        // Check allowance
        uint256 allowance = usdtTokenInterface.allowance(msg.sender, address(this));
        if (allowance < amount) {
            revert InsufficientAllowance(amount, allowance);
        }
        
        SafeERC20.safeTransferFrom(usdtTokenInterface, msg.sender, address(this), amount);
        position.borrowedAmount -= amount;
        totalBorrowed -= amount;
        
        emit Repaid(msg.sender, amount);
    }
    
    function liquidate(address user) external nonReentrant {
        Position storage position = positions[user];
        if (!position.isActive) revert NoActivePosition();
        if (calculateHealthFactor(user) >= LIQUIDATION_THRESHOLD) revert PositionNotLiquidatable();
        
        uint256 collateralAmount = position.collateralAmount;
        uint256 borrowedAmount = position.borrowedAmount;
        
        // Calculate liquidation bonus
        uint256 liquidationBonus = (collateralAmount * (LIQUIDATION_BONUS - 100)) / 100;
        uint256 remainingCollateral = collateralAmount - liquidationBonus;
        
        // Repay borrowed amount
        SafeERC20.safeTransferFrom(usdtTokenInterface, msg.sender, address(this), borrowedAmount);
        
        // Transfer liquidation bonus to liquidator
        SafeERC20.safeTransfer(btcTokenInterface, msg.sender, liquidationBonus);
        
        // Transfer remaining collateral to user
        if (remainingCollateral > 0) {
            SafeERC20.safeTransfer(btcTokenInterface, user, remainingCollateral);
        }
        
        // Update state
        totalCollateral -= collateralAmount;
        totalBorrowed -= borrowedAmount;
        position.isActive = false;
        
        emit Liquidated(user, msg.sender);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}