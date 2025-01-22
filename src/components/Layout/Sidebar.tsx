import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  FileCheck,
  BarChart3,
  Bell,
  Settings,
  Upload,
} from "lucide-react";

interface SidebarProps {
  isMobile?: boolean;
}

const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Upload, label: "Invoice Upload", path: "/invoice-upload" },
    { icon: CreditCard, label: "ITC Eligibility", path: "/itc-eligibility" },
    { icon: FileCheck, label: "Reconciliation", path: "/reconciliation" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const sidebarClasses = isMobile
    ? "flex h-full w-full flex-col bg-white"
    : "flex h-screen w-64 flex-col bg-white border-r border-gray-200";

  return (
    <div className={sidebarClasses}>
      <div className="flex items-center gap-2 px-4 py-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">ITC</span>
        </div>
        <span className="text-xl font-semibold">ITC Manager</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary-100 text-primary-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;