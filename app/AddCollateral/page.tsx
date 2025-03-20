"use client";
import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { contractABI } from "../contracts/abi";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function Page() {
  const [collateralAmount, setCollateralAmount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const contractAddress: string =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
  const [balance, setBalance] = useState(BigInt(0));
  const { accountData, connectWallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    loadContract();
  }, []);

  const loadContract = async () => {
    try {
      await connectWallet();

      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();

      if (accountData.address) {
        const balance = await providerInstance.getBalance(accountData.address);
        setBalance(balance);
      }

      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      setContract(contractInstance);
      return contractInstance;
    } catch (error) {
      console.error("Error loading contract:", error);
    }
  };

  const handleAddCollateral = async () => {
    if (!contract) {
      await loadContract();
    }

    if (!contract) {
      console.error("Contract not loaded");
      return;
    }

    try {
      const tx = await contract.addCollateral(collateralAmount);
      console.log("Transaction: ", tx);
      setTimeout(() => {
        toast.success("Collateral added successfully");
      }, 1500);
      router.push("/OpenPosition");
    } catch (error) {
      console.error("Error adding collateral:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <ToastContainer />
      <div className="p-8 bg-gray-800 shadow-2xl rounded-2xl max-w-md w-full border border-orange-500/20">
        <h2 className="text-2xl font-bold text-orange-500 text-center mb-6">
          Add Collateral
        </h2>

        <div className="mb-6">
          <input
            type="number"
            id="addCollateralAmount"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            placeholder="Amount (BTC)"
            className="w-full p-4 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg mb-4"
          />

          <button
            onClick={handleAddCollateral}
            id="addCollateral"
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 font-bold shadow-lg hover:shadow-orange-500/25"
          >
            Add Collateral
          </button>
          <p className="text-lg text-orange-500 text-center mt-4 font-medium">
            Balance: {balance.toString()}
          </p>
        </div>
      </div>
    </div>
  );
}
