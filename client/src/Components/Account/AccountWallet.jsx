import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWallet, useAddMoney } from "../../hooks/useWallet";
import { useUserAuth } from "../../context/UserAuthContext";
import usePageMeta from "../../hooks/usePageMeta";

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

const METHODS = [
  { val: "upi",        label: "UPI",         sub: "GPay, PhonePe, Paytm", icon: "📱" },
  { val: "card",       label: "Card",        sub: "Debit / Credit Card",  icon: "💳" },
  { val: "netbanking", label: "Net Banking", sub: "All major banks",      icon: "🏦" },
];

const UPI_VPA = "spmart@upi"; // Demo merchant VPA; replace with real one later.
const UPI_NAME = "SPMart";

const buildUpiUrl = (amount, txnRef) =>
  `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Wallet Topup " + txnRef)}`;

const qrSrc = (data, size = 220) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(data)}`;

/* ── Page ──────────────────────────────────────────────────────── */
const AccountWallet = () => {
  usePageMeta({ title: "Wallet", noIndex: true });
  const { user } = useUserAuth();
  const { data, isLoading } = useWallet();

  const balance = data?.balance ?? 0;
  const txns = data?.transactions || [];

  const [showAdd, setShowAdd] = useState(false);

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!txns.length) return { credited: 0, spent: 0, count: 0 };
    let credited = 0, spent = 0;
    txns.forEach((t) => {
      if (t.type === "credit") credited += t.amount;
      else if (t.type === "debit") spent += t.amount;
    });
    return { credited, spent, count: txns.length };
  }, [txns]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Balance card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-5 sm:p-7 text-white">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-white/70 font-bold">SPMart Wallet</p>
              <p className="text-xs text-white/80 mt-0.5 truncate">{user?.name}'s balance</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>

          {isLoading ? (
            <div className="h-12 w-44 bg-white/20 rounded-xl animate-pulse" />
          ) : (
            <p className="text-4xl sm:text-5xl font-extrabold leading-none">
              ₹{balance.toLocaleString("en-IN")}
            </p>
          )}
          <p className="text-xs text-white/85 mt-1.5">Available balance</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2.5 rounded-full bg-white text-emerald-700 text-xs sm:text-sm font-extrabold hover:scale-105 transition-transform inline-flex items-center gap-1.5 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Money
            </button>
            <Link
              to="/checkout"
              className="px-4 py-2.5 rounded-full bg-white/20 border border-white/30 text-white text-xs sm:text-sm font-extrabold hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Use at Checkout
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <StatTile icon="↓" label="Credited" amount={stats.credited} color="text-green-600 bg-green-50" />
        <StatTile icon="↑" label="Spent"    amount={stats.spent}    color="text-rose-500  bg-rose-50" />
        <StatTile icon="#" label="Txns"     amount={stats.count}    color="text-violet-600 bg-violet-50" raw />
      </div>

      {/* Transactions */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-extrabold text-gray-900">Transaction History</h2>
          {txns.length > 0 && (
            <span className="text-[11px] font-bold text-gray-400">{txns.length} total</span>
          )}
        </div>

        {isLoading ? (
          <ul className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  <div className="h-2.5 w-1/3 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded" />
              </li>
            ))}
          </ul>
        ) : txns.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-5xl mb-2">💸</p>
            <p className="text-sm font-bold text-gray-700">No transactions yet</p>
            <p className="text-[11px] text-gray-400">Add money to get started.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {txns.map((t) => {
              const credit = t.type === "credit";
              return (
                <li
                  key={t._id || t.createdAt}
                  className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                >
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      credit ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {credit ? "↓" : "↑"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{t.reason}</p>
                    <p className="text-[11px] text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(t.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                      {t.method && <> · {t.method.toUpperCase()}</>}
                    </p>
                  </div>
                  <span className={`text-sm font-extrabold flex-shrink-0 ${credit ? "text-green-600" : "text-rose-500"}`}>
                    {credit ? "+" : "−"}₹{t.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ─ Add Money modal ─ */}
      {showAdd && (
        <AddMoneyModal onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
};

/* ── Pieces ────────────────────────────────────────────────────── */
function StatTile({ icon, label, amount, color, raw = false }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 text-center">
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-extrabold ${color}`}>
        {icon}
      </span>
      <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-1.5 leading-none">
        {raw ? amount : `₹${amount.toLocaleString("en-IN")}`}
      </p>
      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

/* ── Add Money Modal ───────────────────────────────────────────── */
function AddMoneyModal({ onClose }) {
  // step: amount → method → upi-pay | card-pay | bank-pay → success
  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("upi");

  // Card form
  const [cardForm, setCardForm] = useState({ number: "", name: "", exp: "", cvv: "" });

  const addMoneyMut = useAddMoney();
  const [err, setErr] = useState("");

  // Lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const finalAmount = useMemo(() => {
    const c = Math.floor(Number(custom));
    return Number.isFinite(c) && c > 0 ? c : amount;
  }, [amount, custom]);

  const txnRef = useMemo(
    () => "WAL" + Math.floor(100000 + Math.random() * 900000),
    []
  );

  /** Simulate payment success → call backend topup → success step. */
  const completeTopup = async () => {
    setErr("");
    try {
      await addMoneyMut.mutateAsync({ amount: finalAmount, method });
      setStep("success");
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to add money. Please try again.");
    }
  };

  const goToPayment = () => {
    if (finalAmount < 10) {
      setErr("Minimum amount is ₹10");
      return;
    }
    if (finalAmount > 50000) {
      setErr("Maximum single top-up is ₹50,000");
      return;
    }
    setErr("");
    if (method === "upi") setStep("upi-pay");
    else if (method === "card") setStep("card-pay");
    else setStep("bank-pay");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
        onClick={() => !addMoneyMut.isPending && onClose()}
      />
      <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              {step !== "amount" && step !== "success" && (
                <button
                  onClick={() => setStep("amount")}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700"
                  aria-label="Back"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h3 className="text-base font-extrabold text-gray-900 truncate">
                {step === "success" ? "Money Added" : "Add Money to Wallet"}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={addMoneyMut.isPending}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {step === "amount" && (
              <>
                {/* Amount input */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 mb-4 border border-emerald-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-1">Enter Amount</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-gray-800">₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setErr(""); }}
                      placeholder={amount.toString()}
                      className="w-full bg-transparent text-4xl font-extrabold text-gray-900 focus:outline-none placeholder-gray-400"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Min ₹10 · Max ₹50,000 per top-up</p>
                </div>

                {/* Quick amounts */}
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Quick add</p>
                <div className="grid grid-cols-5 gap-2 mb-5">
                  {QUICK_AMOUNTS.map((q) => {
                    const active = finalAmount === q && !custom;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => { setAmount(q); setCustom(""); setErr(""); }}
                        className={`py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        ₹{q}
                      </button>
                    );
                  })}
                </div>

                {/* Payment method */}
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Payment Method</p>
                <div className="space-y-2 mb-3">
                  {METHODS.map((m) => {
                    const active = method === m.val;
                    return (
                      <label
                        key={m.val}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          active ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input type="radio" checked={active} onChange={() => setMethod(m.val)} className="sr-only" />
                        <span className="text-2xl flex-shrink-0">{m.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-gray-900">{m.label}</p>
                          <p className="text-[11px] text-gray-500">{m.sub}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? "border-emerald-500" : "border-gray-300"}`}>
                          {active && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {err && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-lg mb-3">{err}</p>
                )}
              </>
            )}

            {step === "upi-pay" && (
              <UpiPayView
                amount={finalAmount}
                txnRef={txnRef}
                processing={addMoneyMut.isPending}
                err={err}
                onComplete={completeTopup}
              />
            )}

            {step === "card-pay" && (
              <CardPayView
                amount={finalAmount}
                form={cardForm}
                setForm={setCardForm}
                processing={addMoneyMut.isPending}
                err={err}
                onComplete={completeTopup}
              />
            )}

            {step === "bank-pay" && (
              <BankPayView
                amount={finalAmount}
                processing={addMoneyMut.isPending}
                err={err}
                onComplete={completeTopup}
              />
            )}

            {step === "success" && (
              <SuccessView amount={finalAmount} txnRef={txnRef} onClose={onClose} />
            )}
          </div>

          {/* Sticky CTA — amount step only */}
          {step === "amount" && (
            <div className="px-5 py-3.5 bg-white border-t border-gray-100">
              <button
                onClick={goToPayment}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold transition-colors flex items-center justify-center gap-2"
              >
                Pay ₹{finalAmount} via {METHODS.find((m) => m.val === method).label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── UPI Pay (QR + "I have paid") ─────────────────────────────── */
function UpiPayView({ amount, txnRef, processing, err, onComplete }) {
  const upiUrl = buildUpiUrl(amount, txnRef);
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-1">Scan this QR with any UPI app</p>
      <p className="text-[11px] text-gray-400 mb-4">
        GPay · PhonePe · Paytm · BHIM · Amazon Pay
      </p>

      <div className="inline-block p-3 rounded-2xl border-2 border-emerald-200 bg-white mb-4">
        <img
          src={qrSrc(upiUrl, 220)}
          alt="UPI QR Code"
          className="w-[220px] h-[220px] block"
          loading="lazy"
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-3 text-left">
        <Row label="Amount"   value={`₹${amount}`} />
        <Row label="To"       value={UPI_NAME} />
        <Row label="UPI ID"   value={UPI_VPA} mono />
        <Row label="Txn Ref"  value={txnRef} mono />
      </div>

      <a
        href={upiUrl}
        className="block sm:hidden mb-3 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-extrabold"
      >
        Open in UPI App →
      </a>

      {err && <p className="text-xs font-bold text-rose-500 mb-2">{err}</p>}

      <button
        onClick={onComplete}
        disabled={processing}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verifying…
          </>
        ) : (
          <>I have paid · Verify</>
        )}
      </button>

      <p className="text-[10px] text-gray-400 mt-2">
        Demo: Tap "I have paid" to simulate a successful UPI payment.
      </p>
    </div>
  );
}

/* ── Card Pay (mock form) ─────────────────────────────────────── */
function CardPayView({ amount, form, setForm, processing, err, onComplete }) {
  const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp  = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const valid =
    form.number.replace(/\s/g, "").length === 16 &&
    form.name.trim().length > 1 &&
    /^\d{2}\/\d{2}$/.test(form.exp) &&
    form.cvv.length === 3;

  return (
    <div>
      {/* Card visual */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black p-5 text-white mb-5">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            SPMart Card
          </span>
          <span className="text-xs font-extrabold tracking-widest">VISA</span>
        </div>
        <p className="text-base sm:text-lg font-mono tracking-wider mb-4 truncate">
          {form.number || "•••• •••• •••• ••••"}
        </p>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px] uppercase text-white/60 tracking-wider">Card Holder</p>
            <p className="text-xs font-bold uppercase truncate">{form.name || "Your Name"}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase text-white/60 tracking-wider">Expires</p>
            <p className="text-xs font-bold">{form.exp || "MM/YY"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <input
          value={form.number}
          onChange={(e) => setForm({ ...form, number: fmtCard(e.target.value) })}
          placeholder="Card Number"
          inputMode="numeric"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-400"
        />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name on Card"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-emerald-400"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.exp}
            onChange={(e) => setForm({ ...form, exp: fmtExp(e.target.value) })}
            placeholder="MM/YY"
            inputMode="numeric"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none focus:border-emerald-400"
          />
          <input
            value={form.cvv}
            onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
            placeholder="CVV"
            type="password"
            inputMode="numeric"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your card details are encrypted with 256-bit SSL
      </div>

      {err && <p className="text-xs font-bold text-rose-500 mb-2">{err}</p>}

      <button
        onClick={onComplete}
        disabled={!valid || processing}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? "Processing…" : `Pay ₹${amount}`}
      </button>
    </div>
  );
}

/* ── Bank Pay (mock dropdown) ─────────────────────────────────── */
function BankPayView({ amount, processing, err, onComplete }) {
  const BANKS = ["HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Kotak", "Yes Bank", "Punjab National Bank"];
  const [bank, setBank] = useState(BANKS[0]);

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Choose your bank to continue</p>
      <select
        value={bank}
        onChange={(e) => setBank(e.target.value)}
        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold focus:outline-none focus:border-emerald-400 mb-3"
      >
        {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
        <span className="text-base">⚠️</span>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          You'll be redirected to <span className="font-bold">{bank}</span>'s secure portal to complete the payment of <span className="font-bold">₹{amount}</span>.
        </p>
      </div>

      {err && <p className="text-xs font-bold text-rose-500 mb-2">{err}</p>}

      <button
        onClick={onComplete}
        disabled={processing}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold transition-colors disabled:opacity-60"
      >
        {processing ? "Redirecting…" : `Continue to ${bank}`}
      </button>
    </div>
  );
}

/* ── Success ──────────────────────────────────────────────────── */
function SuccessView({ amount, txnRef, onClose }) {
  return (
    <div className="text-center py-3">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-1">₹{amount} Added!</h3>
      <p className="text-sm text-gray-500 mb-5">Your wallet has been topped up successfully.</p>

      <div className="bg-gray-50 rounded-xl p-3 mb-5 text-left">
        <Row label="Amount" value={`₹${amount}`} />
        <Row label="Txn Ref" value={txnRef} mono />
        <Row label="Status" value="Success" pill="bg-green-100 text-green-700" />
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold transition-colors"
      >
        Done
      </button>
    </div>
  );
}

function Row({ label, value, mono = false, pill = "" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0">
      <span className="text-[11px] text-gray-500">{label}</span>
      {pill ? (
        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${pill}`}>
          {value}
        </span>
      ) : (
        <span className={`text-xs font-extrabold text-gray-900 ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default AccountWallet;
