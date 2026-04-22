import { useState, useRef, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  useAdminProfile,
  useUpdateProfile,
  useRemoveAvatar,
  useChangePassword,
} from "../../hooks/useAdmin";

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-3">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.06] p-6">
        <div className="space-y-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const { admin } = useAdminAuth();
  const { data: profile, isLoading } = useAdminProfile();
  const updateProfile = useUpdateProfile();
  const removeAvatar = useRemoveAvatar();
  const changePassword = useChangePassword();

  const fileInputRef = useRef(null);

  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Image must be under 2MB." });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileMsg({ type: "", text: "" });
  };

  const handleRemoveAvatar = () => {
    if (!profile?.avatar) return;
    removeAvatar.mutate(undefined, {
      onSuccess: () => {
        setAvatarPreview(null);
        setAvatarFile(null);
        setProfileMsg({ type: "success", text: "Avatar removed." });
      },
      onError: () => {
        setProfileMsg({ type: "error", text: "Failed to remove avatar." });
      },
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("phone", phone.trim());
    formData.append("bio", bio.trim());
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    updateProfile.mutate(formData, {
      onSuccess: () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      },
      onError: (err) => {
        setProfileMsg({
          type: "error",
          text: err?.response?.data?.error || "Failed to update profile.",
        });
      },
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: (data) => {
          setPasswordMsg({ type: "success", text: data.message });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => {
          setPasswordMsg({
            type: "error",
            text: err?.response?.data?.error || "Failed to verify password.",
          });
        },
      }
    );
  };

  const displayAvatar = avatarPreview || (profile?.avatar ? profile.avatar : null);
  const initials = (profile?.name || admin?.email || "A").charAt(0).toUpperCase();

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0e0e24] overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Admin avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Info */}
            <div className="flex-1 pt-2 sm:pt-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.name || "Admin"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{admin?.email}</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Super Admin
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-2 sm:mt-0">
              {profile?.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={removeAvatar.isPending}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {removeAvatar.isPending ? "Removing..." : "Remove Photo"}
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
              >
                Change Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Form */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Personal Information
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Email Address
              </label>
              <input
                value={admin?.email || ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-500 dark:text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell something about yourself..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all resize-none"
            />
          </div>

          {profileMsg.text && (
            <div
              className={`text-sm px-4 py-2.5 rounded-xl border ${
                profileMsg.type === "success"
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                  : "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
            >
              {updateProfile.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Change Password
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrentPw ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
              />
            </div>
          </div>

          {passwordMsg.text && (
            <div
              className={`text-sm px-4 py-2.5 rounded-xl border ${
                passwordMsg.type === "success"
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                  : "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white/10 text-white text-sm font-medium hover:bg-gray-800 dark:hover:bg-white/[0.15] transition-all duration-200 disabled:opacity-60"
            >
              {changePassword.isPending ? "Verifying..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-gray-200/60 dark:border-white/[0.06] p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Account Info
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Super Admin
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Member Since</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {profile?.updatedAt
                ? new Date(profile.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
