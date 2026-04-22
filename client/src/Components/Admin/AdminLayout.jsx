import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const { admin, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading spinner while verifying token
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050510] flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050510]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AdminHeader onToggleSidebar={() => setSidebarOpen((p) => !p)} />

      {/* Main content */}
      <main className="pt-16 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
