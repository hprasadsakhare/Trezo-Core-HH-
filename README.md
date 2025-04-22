## Trezo

<img width="1614" alt="Screenshot 2025-03-20 at 18 54 43" src="https://github.com/user-attachments/assets/b1dbfc68-d25e-405b-8e95-bddcfe850f43" />

## Overview
Trezo is a decentralized lending platform that enables users to deposit BTC as collateral and borrow USDT against it. The platform ensures secure lending with a well-defined collateralization and liquidation mechanism.

## Contract Address: 0x1B590fd181c96792dAffD9F0225DF0B956481Bb5

### **Key Features**
- Uses **OpenZeppelin** contracts for security (ReentrancyGuard, Pausable, Ownable).
- Implements **BTC lending** with **collateralization** and **liquidation mechanisms**.
- Uses **CustomBTC** and **CustomUSDT** tokens.
- Has a **collateralization ratio of 150%** and a **liquidation threshold of 130%**.
- Implements **price-based liquidation**.

![Image](https://github.com/user-attachments/assets/605c7cd6-3937-480c-905b-359465fcb897)
![Image](https://github.com/user-attachments/assets/c3a73736-1d77-4543-9560-8b2705112b76)
![Image](https://github.com/user-attachments/assets/5a9f2337-b586-4547-b9c8-9113af446e42)
![Image](https://github.com/user-attachments/assets/b9504954-6f4b-4690-a6d6-8917683bbcf6)
![Image](https://github.com/user-attachments/assets/614f1107-e536-4ce6-82bb-af705c317b5a)
![Image](https://github.com/user-attachments/assets/c31468da-25bc-4e7f-a898-be2f1c84ed76)
![Image](https://github.com/user-attachments/assets/45221f2b-e144-4b4b-b31b-182100d4ad63)


## **Smart Contract Functions**

### **1. Collateral & Borrowing Functions**
- **`openPosition(uint256 btcAmount)`**: Deposits BTC as collateral and borrows USDT.
- **`addCollateral(uint256 btcAmount)`**: Adds more BTC as collateral to an existing position.
- **`removeCollateral(uint256 btcAmount)`**: Withdraws a portion of the BTC collateral.
- **`borrow(uint256 usdtAmount)`**: Borrows USDT against the BTC collateral.
- **`repay(uint256 usdtAmount)`**: Repays the borrowed USDT.

### **2. Liquidation Functions**
- **`liquidate(address user)`**: If the collateral falls below the **liquidation threshold**, this function liquidates the user's collateral.

### **3. Admin Functions**
- **`pause()`** / **`unpause()`**: Allows the owner to **pause/unpause** lending operations.
- **`setBtcPrice(uint256 price)`**: Updates the **BTC price** for liquidation calculations.

### **4. Utility Functions**
- **`getPosition(address user)`**: Fetches **position details** (collateral, borrowed amount, last update).
- **`getCurrentBtcPrice()`**: Returns the **latest BTC price**.

## **Getting Started**

1. **Fork the Repository**

2. **Clone the Repository**

   Once you have forked the repository, clone it to your local development environment using the following command:

   ```sh
   $ https://github.com/<your_github_username>/Trezo-Core-HH-.git
   ```

   Replace **your-username** with your GitHub username.

3. **Create a Branch**

   Move into the project's directory and create a new branch for your contributions:

   ```sh
   cd Trezo-Core-HH-
   git checkout -b my-feature-branch
   ```

   Replace **my-feature-branch** with a descriptive branch name related to your changes.

4. **Make Your Changes**

   Now it's time to work on your contributions! Feel free to add new features, improve the user interface, enhance backend or frontend functionality, or fix any issues you find.

5. **Check the changed files**

   ```sh
   git status
   ```

6. **Commit Your Changes**

   ```sh
   git add .
   git commit -m "<EXPLAIN-YOUR_CHANGES>"
   ```

7. **Push to Your Forked Repository**

   ```sh
   git push origin my-feature-branch
   ```

   Replace **my-feature-branch** with the name of your branch.

8. **Create a Pull Request**

   Go to your forked repository on GitHub, and you should see a "Compare & pull request" button. Click on it to create a pull request (PR) from your branch to the main Trezo-Core-HH- repository.

## **Links**
- **Deployed Link**: [Trezo App](https://trezocorehh.vercel.app/)
- **Demo Video**: [YouTube](https://youtu.be/x5wtCYep7RA)

## **The Team**
- **Hariprasad Sakhare** [(@hprasadsakhare)](https://github.com/hprasadsakhare) - Full Stack Web3 Developer
- **Vidip** [(@ghoshvidip26)](https://github.com/ghoshvidip26) - Full Stack Developer
