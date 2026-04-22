import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAdminProfile, useUpdateSettings } from "../../hooks/useAdmin";

function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        enabled ? "bg-cyan-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SettingRow({ icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] p-6">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdminSettings() {
  const { darkMode, toggleTheme } = useTheme();
  const { data: profile, isLoading } = useAdminProfile();
  const updateSettings = useUpdateSettings();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderAlerts: true,
    reviewAlerts: true,
    lowStockAlerts: false,
    language: "en",
    timezone: "UTC",
  });
  const [saveMsg, setSaveMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (profile?.settings) {
      setSettings(profile.settings);
    }
  }, [profile]);

  const handleToggle = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSaveMsg({ type: "", text: "" });

    updateSettings.mutate(updated, {
      onSuccess: () => {
        setSaveMsg({ type: "success", text: "Settings saved!" });
        setTimeout(() => setSaveMsg({ type: "", text: "" }), 2000);
      },
      onError: () => {
        setSaveMsg({ type: "error", text: "Failed to save." });
        setSettings((prev) => ({ ...prev, [key]: !value }));
      },
    });
  };

  const handleSelect = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSaveMsg({ type: "", text: "" });

    updateSettings.mutate(updated, {
      onSuccess: () => {
        setSaveMsg({ type: "success", text: "Settings saved!" });
        setTimeout(() => setSaveMsg({ type: "", text: "" }), 2000);
      },
      onError: () => {
        setSaveMsg({ type: "error", text: "Failed to save." });
      },
    });
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Save Indicator */}
      {saveMsg.text && (
        <div
          className={`text-sm px-4 py-2.5 rounded-xl border transition-all ${
            saveMsg.type === "success"
              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
              : "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
          }`}
        >
          {saveMsg.text}
        </div>
      )}

      {/* Appearance */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Appearance
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Customize how the admin panel looks.</p>

        <SettingRow
          icon={
            darkMode ? (
              <svg className="w-4.5 h-4.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          }
          title="Dark Mode"
          description={darkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          <Toggle enabled={darkMode} onChange={toggleTheme} />
        </SettingRow>

        <SettingRow
          icon={
            <svg className="w-4.5 h-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          }
          title="Language"
          description="Choose your preferred language"
        >
          <select
            value={settings.language}
            onChange={(e) => handleSelect("language", e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </SettingRow>

        <SettingRow
          icon={
            <svg className="w-4.5 h-4.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Timezone"
          description="Set your local timezone"
        >
          <select
            value={settings.timezone}
            onChange={(e) => handleSelect("timezone", e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </SettingRow>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Manage which alerts you receive.</p>

        <SettingRow
          icon={
            <svg className="w-4.5 h-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          title="Email Notifications"
          description="Receive email alerts for important updates"
        >
          <Toggle
            enabled={settings.emailNotifications}
            onChange={(v) => handleToggle("emailNotifications", v)}
            disabled={updateSettings.isPending}
          />
        </SettingRow>

        <SettingRow
          icon={
            <svg className="w-4.5 h-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          title="Order Alerts"
          description="Get notified when new orders are placed"
        >
          <Toggle
            enabled={settings.orderAlerts}
            onChange={(v) => handleToggle("orderAlerts", v)}
            disabled={updateSettings.isPending}
          />
        </SettingRow>

        <SettingRow
          icon={
            <svg className="w-4.5 h-4.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          title="Review Alerts"
          description="Get notified when customers leave reviews"
        >
          <Toggle
            enabled={settings.reviewAlerts}
            onChange={(v) => handleToggle("reviewAlerts", v)}
            disabled={updateSettings.isPending}
          />
        </SettingRow>

        <SettingRow
          icon={
            <svg className="w-4.5 h-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          title="Low Stock Alerts"
          description="Get notified when product stock runs low"
        >
          <Toggle
            enabled={settings.lowStockAlerts}
            onChange={(v) => handleToggle("lowStockAlerts", v)}
            disabled={updateSettings.isPending}
          />
        </SettingRow>
      </div>

      {/* Store Info */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Store Information
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Basic store configuration details.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Store Name</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">SPMART</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Grocery Store</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">MERN Stack</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Version</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">1.0.0</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-red-200/60 dark:border-red-500/20 p-6">
        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Danger Zone
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Irreversible and destructive actions.</p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-red-50/50 dark:bg-red-500/[0.05] border border-red-100 dark:border-red-500/10">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Clear All Data</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              This will permanently delete all products, reviews, and categories.
            </p>
          </div>
          <button
            onClick={() => alert("This action is not available in the current version.")}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors whitespace-nowrap"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}
