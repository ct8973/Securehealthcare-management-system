// src/layouts/DashboardLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

export default function DashboardLayout({ children, title, menuItems }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-500">
          {title}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems?.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-600 transition"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
