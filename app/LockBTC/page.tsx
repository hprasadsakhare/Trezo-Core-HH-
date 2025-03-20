"use client";
import { useState } from "react";
import { Bitcoin } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { contractABI } from "../contracts/abi";

export default function Page() {
  const [btcCollateral, setBtcCollateral] = useState("");
  const { accountData, connectWallet } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const contractAddress: string =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

  const loadContract = async () => {
    await connectWallet(); // Ensure wallet is connected first

    const providerInstance = new ethers.BrowserProvider(window.ethereum);
    const signer = await providerInstance.getSigner(); // Get signer

    const contractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    console.log("Contract Instance: ", contractInstance);
    setContract(contractInstance);
    return contractInstance;
  };

  const handleLockBTC = async () => {
    await loadContract();
    if (!contract) {
      console.error("Contract not loaded");
      return;
    }
    console.log("Contract: ", contract);
    try {
      const tx = await contract.lockBTC(btcCollateral);
      console.log("Transaction: ", tx);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-xl rounded-2xl max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Bitcoin className="w-6 h-6 text-yellow-500" />
          Lock BTC as Collateral
        </h2>

        <div className="relative">
          <input
            type="number"
            className="w-full p-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
            placeholder="Enter BTC amount"
            value={btcCollateral}
            onChange={(e) => setBtcCollateral(e.target.value)}
          />

          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            ₿
          </span>
        </div>

        {btcCollateral && (
          <p className="mt-3 text-gray-600 text-sm">
            You are locking{" "}
            <span className="font-semibold text-gray-900">
              {btcCollateral} BTC
            </span>
          </p>
        )}

        <button
          onClick={handleLockBTC}
          className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition"
        >
          Lock BTC
        </button>
      </div>
    </div>
  );
}
