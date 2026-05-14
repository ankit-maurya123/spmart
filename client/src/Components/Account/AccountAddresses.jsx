import React, { useState } from "react";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "../../hooks/useAddresses";
import usePageMeta from "../../hooks/usePageMeta";

const LABEL_OPTIONS = [
  { key: "Home",  icon: "🏠" },
  { key: "Work",  icon: "💼" },
  { key: "Other", icon: "📍" },
];

const blankForm = {
  label:    "Home",
  name:     "",
  phone:    "",
  address:  "",
  city:     "",
  state:    "",
  pincode:  "",
  landmark: "",
  isDefault:false,
};

const AccountAddresses = () => {
  usePageMeta({ title: "Addresses", noIndex: true });
  const { data: addresses = [], isLoading } = useAddresses();
  const addMut    = useAddAddress();
  const updateMut = useUpdateAddress();
  const deleteMut = useDeleteAddress();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [showForm, setShowForm] = useState(false);

  const beginAdd = () => {
    setForm(blankForm);
    setEditingId(null);
    setShowForm(true);
  };

  const beginEdit = (addr) => {
    setForm({ ...blankForm, ...addr });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await updateMut.mutateAsync({ id: editingId, ...form });
      else await addMut.mutateAsync(form);
      setShowForm(false);
      setEditingId(null);
      setForm(blankForm);
    } catch {/* surfaced via mutation error */}
  };

  const removeAddr = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try { await deleteMut.mutateAsync(id); } catch {}
  };

  const setDefault = async (addr) => {
    if (addr.isDefault) return;
    try { await updateMut.mutateAsync({ id: addr._id, isDefault: true }); } catch {}
  };

  const submitting = addMut.isPending || updateMut.isPending;
  const error = addMut.error || updateMut.error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Saved Addresses</h1>
          <p className="text-sm text-gray-500">Manage where your orders should be delivered.</p>
        </div>
        {!showForm && (
          <button
            onClick={beginAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white border-2 border-violet-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-extrabold text-gray-900">
            {editingId ? "Edit Address" : "Add New Address"}
          </h2>

          {/* Label selector */}
          <div className="flex gap-2">
            {LABEL_OPTIONS.map((o) => {
              const active = form.label === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setForm({ ...form, label: o.key })}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{o.icon}</span>
                  {o.key}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Full Name" required value={form.name} onChange={onChange("name")} />
            <Input label="Phone" type="tel" required value={form.phone} onChange={onChange("phone")} placeholder="9876543210" />
          </div>
          <Input label="Address (House no, street, area)" required value={form.address} onChange={onChange("address")} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="City"    required value={form.city}    onChange={onChange("city")} />
            <Input label="State"   required value={form.state}   onChange={onChange("state")} />
            <Input label="Pincode" required value={form.pincode} onChange={onChange("pincode")} inputMode="numeric" maxLength={6} />
          </div>
          <Input label="Landmark (optional)" value={form.landmark} onChange={onChange("landmark")} />

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-violet-600"
            />
            <span className="text-sm text-gray-700">Make this my default address</span>
          </label>

          {error && (
            <p className="text-sm font-bold text-rose-500">
              {error.response?.data?.error || "Failed to save address."}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-xl disabled:opacity-60"
            >
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(blankForm); }}
              className="px-6 py-3 text-sm font-extrabold text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-5xl mb-3">📍</p>
          <h3 className="text-base font-extrabold text-gray-900">No addresses saved yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">Add an address to speed up your checkout.</p>
          <button
            onClick={beginAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-full"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {addresses.map((a) => (
            <li
              key={a._id}
              className={`bg-white border-2 rounded-2xl p-4 sm:p-5 ${
                a.isDefault ? "border-violet-300" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[10px] font-extrabold uppercase">
                    {LABEL_OPTIONS.find((l) => l.key === a.label)?.icon || "📍"} {a.label}
                  </span>
                  {a.isDefault && (
                    <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-extrabold uppercase">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => beginEdit(a)}
                    className="p-1.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
                    aria-label="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeAddr(a._id)}
                    className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                    aria-label="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-sm font-extrabold text-gray-900">{a.name}</p>
              <p className="text-[13px] text-gray-600 mt-0.5">{a.phone}</p>
              <p className="text-[13px] text-gray-700 mt-2 leading-relaxed">
                {a.address},<br />
                {a.city}, {a.state} – {a.pincode}
                {a.landmark && <span className="block text-gray-500">Landmark: {a.landmark}</span>}
              </p>

              {!a.isDefault && (
                <button
                  onClick={() => setDefault(a)}
                  className="mt-3 text-xs font-extrabold text-violet-600 hover:underline"
                >
                  Set as default
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Input = ({ label, required, ...rest }) => (
  <label className="block">
    <span className="block text-xs font-bold text-gray-700 mb-1.5">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </span>
    <input
      {...rest}
      required={required}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400"
    />
  </label>
);

export default AccountAddresses;
