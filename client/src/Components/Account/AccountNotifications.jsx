import React, { useEffect, useState } from "react";
import { useUserAuth } from "../../context/UserAuthContext";
import { useUpdateProfile } from "../../hooks/useProfile";
import usePageMeta from "../../hooks/usePageMeta";

const TOGGLES = [
  { key: "email",    label: "Email notifications",     desc: "Receipts, order updates and promotions via email." },
  { key: "sms",      label: "SMS notifications",        desc: "Get order status texts on your phone." },
  { key: "orderUpd", label: "Order status updates",     desc: "Be notified when your order is confirmed, shipped, or delivered." },
  { key: "offers",   label: "Offers & promotions",      desc: "Receive exclusive deals and seasonal coupons." },
];

const AccountNotifications = () => {
  usePageMeta({ title: "Notifications", noIndex: true });
  const { user } = useUserAuth();
  const updateMut = useUpdateProfile();
  const [prefs, setPrefs] = useState({ email: true, sms: false, offers: true, orderUpd: true });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.notifications) setPrefs((p) => ({ ...p, ...user.notifications }));
  }, [user]);

  const toggle = (key) => async () => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await updateMut.mutateAsync({ notifications: next });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setPrefs(prefs); // rollback
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Notification Preferences</h1>
        <p className="text-sm text-gray-500">Choose how SPMart reaches you.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
        {TOGGLES.map((t) => {
          const active = !!prefs[t.key];
          return (
            <div key={t.key} className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-gray-900">{t.label}</p>
                <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{t.desc}</p>
              </div>
              <button
                onClick={toggle(t.key)}
                role="switch"
                aria-checked={active}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors ${
                  active ? "bg-violet-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform mt-1 ${
                    active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {saved && (
        <p className="text-sm font-bold text-green-600 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Preferences saved
        </p>
      )}
    </div>
  );
};

export default AccountNotifications;
