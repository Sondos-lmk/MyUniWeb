import { useEffect, useState } from "react";
import api from "../services/api";


export default function WalletButton() {
  const [balance, setBalance] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const res = await api.get("/payment/wallet");
        setBalance(res.data.balance);
      } catch (err) {
        console.error("Failed to load wallet:", err);
      }
    };

    loadWallet();
  }, []);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        💰 Wallet
      </button>

      {hover && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-800 text-white text-sm px-3 py-1 rounded shadow-lg z-20">
          Balance: <strong>{balance} EGP</strong>
        </div>
      )}
    </div>
  );
}
