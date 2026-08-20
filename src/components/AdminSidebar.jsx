import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/reports", label: "All Reports", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  return (
    <aside className="w-56 shrink-0 rounded-2xl bg-navy-950 text-slate-300 p-4 flex flex-col">
      <p className="text-white font-bold px-2 pb-4">Admin Panel</p>
      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-navy-800 hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-800 hover:text-white"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}
