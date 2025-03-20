"use client";
import { useState } from "react";
import { DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { contractABI } from "../contracts/abi";
import { ToastContainer, toast } from "react-toastify";

export default function RepayLoan() {
  const [isUsdt, setIsUsdt] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const router = useRouter();
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

  const handleRepayLoan = async () => {
    try {
      const contractInstance = await loadContract();
      if (!contractInstance) {
        console.error("Failed to load contract");
        return;
      }

      const tx = await contractInstance.repay(repaymentAmount);
      console.log("Transaction: ", tx);
      setTimeout(() => {
        toast.success("Loan repaid successfully");
      }, 1500);
      router.push("/Liquidate");
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <ToastContainer />
      <div className="p-8 bg-gray-800 shadow-2xl rounded-2xl max-w-md w-full border border-orange-500/20">
        <h2 className="text-2xl font-bold text-orange-500 text-center mb-6">
          Repay Loan
        </h2>

        <div className="mb-6">
          <input
            type="number"
            value={repaymentAmount}
            onChange={(e) => setRepaymentAmount(e.target.value)}
            placeholder="Amount"
            className="w-full p-4 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg mb-4"
          />

          <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg mb-4 border-2 border-orange-500/30">
            <span className="text-white font-medium">
              Pay with {isUsdt ? "USDT" : "WBTC"}
            </span>
            <button
              onClick={() => setIsUsdt(!isUsdt)}
              className={`relative w-12 h-6 flex items-center rounded-full ${
                isUsdt ? "bg-orange-500" : "bg-gray-600"
              } transition-all`}
            >
              <span
                className={`absolute left-1 w-5 h-5 bg-white rounded-full transition-all ${
                  isUsdt ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {repaymentAmount && (
            <p className="text-white text-sm mb-4">
              You are repaying:{" "}
              <span className="font-semibold text-orange-500">
                {repaymentAmount} {isUsdt ? "USDT" : "WBTC"}
              </span>
            </p>
          )}

          <button
            onClick={handleRepayLoan}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 font-bold shadow-lg hover:shadow-orange-500/25"
          >
            Repay Loan
          </button>
        </div>
      </div>
    </div>
  );
}
