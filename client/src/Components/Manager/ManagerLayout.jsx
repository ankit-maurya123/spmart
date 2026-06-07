import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useManagerAuth } from "../../context/ManagerAuthContext";
import ManagerSidebar from "./ManagerSidebar";
import ManagerHeader from "./ManagerHeader";
import ScrollToTop from "../ScrollToTop";

export default function ManagerLayout() {
  const { manager, loading } = useManagerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!manager) return <Navigate to="/manager/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
      <ScrollToTop />
      <ManagerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ManagerHeader onToggleSidebar={() => setSidebarOpen((p) => !p)} />

      <main className="pt-16 lg:ml-64">
        <div className="p-3 sm:p-5 lg:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
