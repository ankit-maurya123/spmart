import React, { useState } from "react";
import { useChangePassword } from "../../hooks/useProfile";
import usePageMeta from "../../hooks/usePageMeta";

const AccountChangePassword = () => {
  usePageMeta({ title: "Change Password", noIndex: true });
  const mut = useChangePassword();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 6)        return setErr("New password must be at least 6 characters.");
    if (form.next !== form.confirm)  return setErr("Passwords don't match.");
    if (form.current === form.next)  return setErr("New password must be different.");
    try {
      await mut.mutateAsync({ currentPassword: form.current, newPassword: form.next });
      setOk(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setOk(false), 2500);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to change password.");
    }
  };

  const Field = ({ label, k }) => (
    <label className="block">
      <span className="block text-xs font-bold text-gray-700 mb-1.5">{label}</span>
      <div className="relative">
        <input
          type={show[k] ? "text" : "password"}
          value={form[k]}
          onChange={onChange(k)}
          required
          minLength={k === "current" ? 1 : 6}
          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-violet-400"
        />
        <button
          type="button"
          onClick={() => setShow({ ...show, [k]: !show[k] })}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700"
          aria-label={show[k] ? "Hide" : "Show"}
        >
          {show[k] ? "🙈" : "👁️"}
        </button>
      </div>
    </label>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 max-w-xl">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Change Password</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Use a strong password you don't reuse elsewhere.</p>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Current Password" k="current" />
        <Field label="New Password" k="next" />
        <Field label="Confirm New Password" k="confirm" />

        {err && (
          <p className="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">
            {err}
          </p>
        )}
        {ok && (
          <p className="text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Password updated successfully
          </p>
        )}

        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-xl disabled:opacity-60"
        >
          {mut.isPending ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default AccountChangePassword;
