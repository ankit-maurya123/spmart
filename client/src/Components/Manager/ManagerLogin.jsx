import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";
import usePageMeta from "../../hooks/usePageMeta";

export default function ManagerLogin() {
  usePageMeta({ title: "Order Manager Login", noIndex: true });
  const { manager, login } = useManagerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  if (manager) return <Navigate to="/manager" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/manager", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link to="/" className="block text-center mb-6">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-500/30">
              S
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">SPMART</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
              Order Panel
            </span>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100/50 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-3 shadow-lg shadow-emerald-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Order Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to manage orders & view products.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="block text-xs font-bold text-gray-700 mb-1.5">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErr(""); }}
                placeholder="manager@spmart.com"
                required
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-gray-700 mb-1.5">Password</span>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErr(""); }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-3 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 flex items-center justify-center"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            {err && (
              <p className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Hint card — change to your liking in ManagerLogin.jsx */}
          <div className="mt-5 pt-5 border-t border-gray-100 bg-emerald-50/40 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 pb-5 sm:pb-6 rounded-b-3xl">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-1">Need help signing in?</p>
            <p className="text-[11px] text-gray-600 leading-snug">
              Use the manager credentials configured by your admin. Manager creds are
              set via <code className="font-mono">MANAGER_EMAIL</code> / <code className="font-mono">MANAGER_PASSWORD</code> in <code className="font-mono">server/.env</code>.
            </p>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Admin credentials also work on this panel.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Are you an admin? <Link to="/admin/login" className="font-bold text-emerald-700 hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
