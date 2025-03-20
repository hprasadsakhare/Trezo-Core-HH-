"use client";
import { useState } from "react";
import { AlertTriangle, Bitcoin, User, DollarSign } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { contractABI } from "../contracts/abi";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function LiquidatePage() {
  const [userAddress, setUserAddress] = useState("");
  const [loanValue, setLoanValue] = useState<string>("");
  const [btcCollateral, setBtcCollateral] = useState<string>("");
  const [btcPrice, setBtcPrice] = useState(60000); // Simulated BTC price
  const LIQUIDATION_THRESHOLD = 80; // 80% Collateral Ratio
  const router = useRouter();

  // Calculate collateral value in USDT
  const collateralValue = (Number(btcCollateral) * btcPrice) / 1e8;
  const liquidationRisk =
    (collateralValue * 100) / Number(loanValue) < LIQUIDATION_THRESHOLD;

  const { accountData, connectWallet } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const contractAddress: string =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

  const loadContract = async () => {
    await connectWallet();

    const providerInstance = new ethers.BrowserProvider(window.ethereum);
    const signer = await providerInstance.getSigner();

    const contractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    console.log("Contract Instance: ", contractInstance);
    setContract(contractInstance);
    return contractInstance;
  };

  const handleLiquidate = async () => {
    try {
      const contractInstance = await loadContract();
      if (!contractInstance) {
        console.error("Contract not loaded");
        return;
      }

      const tx = await contractInstance.liquidate(userAddress);
      console.log("Transaction: ", tx);
      setTimeout(() => {
        toast.success("Loan liquidated successfully");
      }, 1500);
      router.push("/");
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Failed to liquidate loan");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <ToastContainer />
      <div className="p-8 bg-gray-800 shadow-2xl rounded-2xl max-w-md w-full border border-orange-500/20">
        <h2 className="text-2xl font-bold text-orange-500 text-center mb-6 flex items-center justify-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Loan Liquidation
        </h2>

        {/* User Address Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg"
            placeholder="Enter user address"
          />
          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Loan Value Input */}
        <div className="relative mb-4">
          <input
            type="number"
            value={loanValue}
            onChange={(e) => setLoanValue(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg"
            placeholder="Enter USDT Loan Amount"
          />
          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
        </div>

        {/* BTC Collateral Input */}
        <div className="relative mb-4">
          <input
            type="number"
            value={btcCollateral}
            onChange={(e) => setBtcCollateral(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg"
            placeholder="Enter BTC Collateral"
          />
          <Bitcoin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
        </div>

        {/* Loan Details */}
        {Number(loanValue) > 0 && Number(btcCollateral) > 0 && (
          <div className="text-white text-sm mb-4 p-4 bg-gray-700 rounded-lg border-2 border-orange-500/30">
            <p className="mb-2">
              Collateral Value:{" "}
              <span className="font-semibold text-orange-500">
                ${collateralValue.toFixed(2)}
              </span>
            </p>
            <p className="mb-2">
              Loan Value:{" "}
              <span className="font-semibold text-orange-500">
                ${loanValue}
              </span>
            </p>
            {liquidationRisk ? (
              <p className="text-red-500 font-bold">⚠ Liquidation Required!</p>
            ) : (
              <p className="text-green-500 font-bold">✅ Safe</p>
            )}
          </div>
        )}

        {/* Liquidate Button */}
        <button
          disabled={!liquidationRisk}
          onClick={handleLiquidate}
          className={`w-full bg-gradient-to-r ${
            liquidationRisk
              ? "from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              : "from-gray-600 to-gray-700 cursor-not-allowed"
          } text-white py-4 px-6 rounded-lg transition-all duration-300 font-bold shadow-lg hover:shadow-orange-500/25`}
        >
          Liquidate Loan
        </button>
      </div>
    </div>
  );
}
