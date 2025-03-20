"use client";
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { contractABI } from "../contracts/abi";

export default function Page() {
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

  const handleClosePosition = async () => {
    await loadContract();
    if (!contract) {
      console.error("Contract not loaded");
      return;
    }
    console.log("Contract: ", contract);
    try {
      const tx = await contract.closePosition();
      console.log("Transaction: ", tx);
    } catch (error) {
      console.error("Error: ", error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-xl rounded-2xl max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
          Close Position
        </h2>

        <div className="mb-6">
          <button
            id="closePosition"
            onClick={handleClosePosition}
            className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Close Position
          </button>
        </div>
      </div>
    </div>
  );
}
