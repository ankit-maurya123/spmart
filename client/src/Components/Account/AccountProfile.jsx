import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../context/UserAuthContext";
import { useUpdateProfile } from "../../hooks/useProfile";
import usePageMeta from "../../hooks/usePageMeta";

const AccountProfile = () => {
  usePageMeta({ title: "Personal Info", noIndex: true });
  const { user } = useUserAuth();
  const updateMut = useUpdateProfile();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    dob: "",
  });
  const [savedAt, setSavedAt] = useState(null);

  // Hydrate when user loads / changes
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : "",
    });
  }, [user]);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMut.mutateAsync({
        name:   form.name.trim(),
        phone:  form.phone.trim(),
        gender: form.gender,
        dob:    form.dob || null,
      });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch {/* surfaced via mutation error */}
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Personal Information</h1>
          <p className="text-sm text-gray-500 mt-0.5">Keep your details up to date for a smoother checkout.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
            {(form.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-gray-900 truncate">{user?.email}</p>
            <p className="text-[11px] text-gray-500">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input
              type="text"
              value={form.name}
              onChange={onChange("name")}
              required
              minLength={2}
              className="input"
            />
          </Field>

          <Field label="Phone Number">
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={onChange("phone")}
              placeholder="+91 9876543210"
              className="input"
            />
          </Field>

          <Field label="Email" hint="Email cannot be changed">
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input opacity-60 cursor-not-allowed"
            />
          </Field>

          <Field label="Date of Birth">
            <input
              type="date"
              value={form.dob}
              onChange={onChange("dob")}
              max={new Date().toISOString().slice(0, 10)}
              className="input"
            />
          </Field>

          <Field label="Gender">
            <div className="grid grid-cols-3 gap-2">
              {["male", "female", "other"].map((g) => {
                const active = form.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-colors ${
                      active
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        {updateMut.isError && (
          <p className="text-sm font-bold text-rose-500">
            {updateMut.error?.response?.data?.error || "Failed to save changes."}
          </p>
        )}

        <div className="flex items-center gap-3 pt-3">
          <button
            type="submit"
            disabled={updateMut.isPending}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-xl disabled:opacity-60 transition-colors"
          >
            {updateMut.isPending ? "Saving…" : "Save Changes"}
          </button>
          {savedAt && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          )}
        </div>
      </form>

      {/* tiny helper to keep markup compact */}
      <style>{`
        .input {
          width: 100%; padding: 0.625rem 0.875rem;
          border-radius: 0.75rem; border: 1px solid rgb(229 231 235);
          background: white; color: rgb(17 24 39);
          font-size: 0.875rem; transition: border-color .15s;
        }
        .input:focus { outline: none; border-color: rgb(167 139 250); }
        .input::placeholder { color: rgb(156 163 175); }
      `}</style>
    </div>
  );
};

const Field = ({ label, hint, required, children }) => (
  <label className="block">
    <span className="block text-xs font-bold text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </span>
    {children}
    {hint && <span className="block text-[10px] text-gray-400 mt-1">{hint}</span>}
  </label>
);

export default AccountProfile;
