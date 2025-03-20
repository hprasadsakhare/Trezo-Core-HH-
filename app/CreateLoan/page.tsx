"use client";
import { useState } from "react";
import { Bitcoin, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { contractABI } from "../contracts/abi";

export default function Page() {
  const [btcAddress, setBtcAddress] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const router = useRouter();
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

  const handleCreateLoan = async () => {
    await loadContract();
    if (!contract) {
      console.error("Contract not loaded");
      return;
    }
    console.log("Contract: ", contract);
    try {
      const tx = await contract.createLoan(btcAddress, usdtAddress);
      console.log("Transaction: ", tx);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-xl rounded-2xl max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
          Enter Wallet Addresses
        </h2>

        <div className="mb-6">
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-yellow-500" />
            BTC Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={btcAddress}
              onChange={(e) => setBtcAddress(e.target.value)}
              className="w-full p-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-shadow shadow-sm"
              placeholder="Enter BTC Address"
            />

            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              ₿
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            USDT Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={usdtAddress}
              onChange={(e) => setUsdtAddress(e.target.value)}
              className="w-full p-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow shadow-sm"
              placeholder="Enter USDT Address"
            />

            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              💵
            </span>
          </div>
        </div>

        <button
          onClick={handleCreateLoan}
          className="mt-4 w-full bg-orange-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition"
        >
          Save Addresses
        </button>
      </div>
    </div>
  );
}
