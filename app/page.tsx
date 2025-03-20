"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bitcoin } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white px-8 py-12 overflow-hidden">
      {/* Floating Bitcoin Icons */}
      {[...Array(30)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute text-orange-500 opacity-50 drop-shadow-lg"
          initial={{ y: Math.random() * 100, x: Math.random() * 100 }}
          animate={{
            y: ["0%", "10%", "-10%", "0%"],
            x: ["0%", "5%", "-5%", "0%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 5 + Math.random() * 3,
            ease: "easeInOut",
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          <Bitcoin className="w-14 h-14" />
        </motion.div>
      ))}

      {/* Central Floating Bitcoin */}
      <motion.div
        className="mb-6"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      >
        <Bitcoin className="w-16 h-16 text-orange-500 drop-shadow-lg" />
      </motion.div>

      {/* Title & Description */}
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-7xl font-extrabold text-orange-500">
          Welcome to Trezo
        </h1>
        <p className="text-2xl text-gray-300 mt-4 max-w-2xl">
          Secure, Decentralized, and Transparent Lending & Borrowing Platform
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mt-12">
        {[
          {
            text: "Add Collateral",
            description: "Deposit BTC as collateral for your loan",
            icon: "💰",
            path: "/AddCollateral",
          },
          {
            text: "Lock BTC",
            description: "Lock your BTC in the protocol",
            icon: "🔒",
            path: "/LockBTC",
          },
          {
            text: "Open Position",
            description: "Start a new lending position",
            icon: "📈",
            path: "/OpenPosition",
          },
          {
            text: "Borrow",
            description: "Borrow against your collateral",
            icon: "💸",
            path: "/Borrow",
          },
          {
            text: "Repay",
            description: "Repay your outstanding loan",
            icon: "💱",
            path: "/Repay",
          },
          {
            text: "Close Position",
            description: "Close your lending position",
            icon: "🔚",
            path: "/ClosePosition",
          },
          {
            text: "Liquidate",
            description: "Liquidate undercollateralized positions",
            icon: "⚠️",
            path: "/Liquidate",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            onClick={() => router.push(item.path)}
            className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6 cursor-pointer hover:bg-gray-800/80 transition-all duration-300"
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(255, 165, 0, 0.2)",
            }}
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold text-orange-500 mb-2">
              {item.text}
            </h3>
            <p className="text-gray-400 text-sm">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-16 text-center max-w-xl px-6">
        <p className="text-gray-400 text-lg leading-relaxed">
          Need financial assistance? Use our smart contract-based lending system
          for secure transactions.
        </p>
      </div>
    </main>
  );
}
