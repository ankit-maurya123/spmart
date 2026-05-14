import React from "react";
import { Link } from "react-router-dom";
import usePageMeta from "../../hooks/usePageMeta";

// Mock wallet data — until a real wallet model is added on the server.
const MOCK_TXNS = [
  { id: "T1001", type: "credit", amount: 50,  reason: "Refund for cancelled order #SPM-001012", date: "2026-05-02" },
  { id: "T1002", type: "credit", amount: 100, reason: "Welcome bonus",                          date: "2026-04-22" },
  { id: "T1003", type: "debit",  amount: 20,  reason: "Used in order #SPM-001008",              date: "2026-04-25" },
];

const AccountWallet = () => {
  usePageMeta({ title: "Wallet", noIndex: true });
  const balance = MOCK_TXNS.reduce(
    (acc, t) => acc + (t.type === "credit" ? t.amount : -t.amount),
    0
  );

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 sm:p-8 text-white">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">SPMart Wallet</p>
        <p className="mt-1 text-4xl sm:text-5xl font-extrabold leading-tight">₹{balance}</p>
        <p className="text-sm text-white/85 mt-1">Available balance</p>
        <div className="flex gap-2 mt-5">
          <button className="px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-extrabold hover:scale-105 transition-transform">
            + Add Money
          </button>
          <Link
            to="/store"
            className="px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold hover:bg-white/30 transition-colors"
          >
            Use at Checkout
          </Link>
        </div>
      </div>

      {/* Transactions */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-extrabold text-gray-900 mb-4">Recent Transactions</h2>
        <ul className="space-y-3">
          {MOCK_TXNS.map((t) => {
            const credit = t.type === "credit";
            return (
              <li key={t.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                    credit ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-500"
                  }`}
                >
                  {credit ? "↓" : "↑"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{t.reason}</p>
                  <p className="text-[11px] text-gray-500">
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}#{t.id}
                  </p>
                </div>
                <span className={`text-sm font-extrabold ${credit ? "text-green-600" : "text-rose-500"}`}>
                  {credit ? "+" : "−"}₹{t.amount}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-[11px] text-gray-400 italic mt-4 pt-3 border-t border-gray-100">
          * Demo data. Real wallet integration coming soon.
        </p>
      </section>
    </div>
  );
};

export default AccountWallet;
