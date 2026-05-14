import React, { useState } from "react";
import usePageMeta from "../../hooks/usePageMeta";

const COUPONS = [
  { code: "SPMART20",  off: "₹50 off",   min: "Orders ₹999+",  desc: "Save ₹50 on bulk grocery orders.",                expiry: "2026-12-31" },
  { code: "WELCOME50", off: "₹50 off",   min: "First order",   desc: "First-time customer welcome discount.",          expiry: "2026-12-31" },
  { code: "FREESHIP",  off: "Free Delivery", min: "Any order", desc: "Skip the delivery fee on your next order.",      expiry: "2026-08-31" },
  { code: "OIL15",     off: "15% off",   min: "Cooking Oils",  desc: "On any oil from Fortune, Sunflower or SPMart.",  expiry: "2026-09-30" },
  { code: "SNACK10",   off: "10% off",   min: "Snacks",        desc: "Munchies, biscuits & chocolates.",               expiry: "2026-07-31" },
];

const AccountCoupons = () => {
  usePageMeta({ title: "Coupons", noIndex: true });
  const [copied, setCopied] = useState(null);

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {/* clipboard unavailable */}
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Coupons</h1>
        <p className="text-sm text-gray-500">Apply these at checkout to save extra.</p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {COUPONS.map((c) => (
          <li
            key={c.code}
            className="relative bg-white border-2 border-dashed border-violet-300 rounded-2xl p-4 sm:p-5 overflow-hidden"
          >
            {/* decorative side notches */}
            <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-50 border-2 border-violet-300" />
            <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-50 border-2 border-violet-300" />

            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-xs font-extrabold text-violet-600 uppercase tracking-wider">{c.off}</p>
                <p className="text-base sm:text-lg font-extrabold text-gray-900 mt-0.5">{c.code}</p>
                <p className="text-[11px] text-gray-500">{c.min}</p>
              </div>
              <button
                onClick={() => copy(c.code)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all ${
                  copied === c.code
                    ? "bg-green-100 text-green-700"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                {copied === c.code ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-snug">{c.desc}</p>
            <p className="text-[10px] text-gray-400 italic mt-2">
              Valid till {new Date(c.expiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountCoupons;
