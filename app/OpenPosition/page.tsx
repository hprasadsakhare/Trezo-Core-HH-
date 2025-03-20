"use client";
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { contractABI } from "../contracts/abi";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function Page() {
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const { accountData, connectWallet } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const contractAddress: string =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const router = useRouter();

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
  const handleLoadContract = async () => {
    try {
      const contractInstance = await loadContract();
      if (!contractInstance) {
        console.error("Failed to load contract");
        return null;
      }
      return contractInstance;
    } catch (error) {
      console.error("Error loading contract:", error);
      return null;
    }
  };
  const handleOpenPosition = async () => {
    await handleLoadContract();
    if (!contract) {
      console.error("Contract not loaded");
      return;
    }
    console.log("Contract: ", contract);
    try {
      const tx = await contract.openPosition(collateralAmount, borrowAmount);
      console.log("Transaction: ", tx);
      setTimeout(() => {
        toast.success("Loan created successfully");
      }, 1500);
      router.push("/Repay");
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <ToastContainer />
      <div className="p-8 bg-gray-800 shadow-2xl rounded-2xl max-w-md w-full border border-orange-500/20">
        <h2 className="text-2xl font-bold text-orange-500 text-center mb-6">
          Open Position
        </h2>

        <div className="mb-6">
          <input
            type="number"
            id="collateralAmount"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            placeholder="Collateral Amount (BTC)"
            className="w-full p-4 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg mb-4"
          />

          <input
            type="number"
            id="borrowAmount"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="Borrow Amount (USDT)"
            className="w-full p-4 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg mb-4"
          />

          <button
            onClick={handleOpenPosition}
            id="openPosition"
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 font-bold shadow-lg hover:shadow-orange-500/25"
          >
            Open Position
          </button>
        </div>
      </div>
    </div>
  );
}
