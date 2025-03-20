"use client";

import { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { accountData, connectWallet } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-black text-white shadow-md p-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center mx-auto">
        <a href="/" className="text-6xl ml-9 font-semibold text-orange-500">
          Trezo
        </a>

        <div className="hidden md:flex space-x-6 items-center">
          <button
            onClick={connectWallet}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 mr-9 rounded-lg transition duration-300"
          >
            {accountData.address ? "Connected" : "Connect Wallet"}
          </button>

          {accountData.address && (
            <div className="text-sm text-gray-300">
              <p>
                {accountData.address.slice(0, 6)}...
                {accountData.address.slice(-4)}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 bg-black p-4 rounded-lg shadow-lg space-y-4">
          <button
            onClick={connectWallet}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            {accountData.address ? "Connected" : "Connect Wallet"}
          </button>

          {accountData.address && (
            <div className="text-sm text-gray-300 text-center">
              <p>
                {accountData.address.slice(0, 6)}...
                {accountData.address.slice(-4)}
              </p>
            </div>
          )}
        </div>
      )}
      <div className="border-orange-400 border-2 mt-4"></div>
    </nav>
  );
}
