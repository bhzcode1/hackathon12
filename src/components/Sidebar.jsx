import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Bell, User, LogOut, ShieldAlert, Siren } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/report", label: "Report Crime", icon: FileText },
  { to: "/my-reports", label: "My Reports", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-navy-950 text-slate-300 min-h-screen">
      <div className="flex items-center gap-2 px-6 py-6">
        <ShieldAlert className="text-brand-400" size={26} />
        <div>
          <p className="text-white font-bold leading-tight">SafeCity</p>
          <p className="text-[11px] text-slate-400 leading-tight">Real-time Crime Reporting</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-navy-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <div className="p-4">
        <button
          onClick={() => navigate("/emergency")}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-danger-600 hover:bg-danger-500 text-white font-semibold py-3 transition-colors animate-pulse hover:animate-none"
        >
          <Siren size={18} />
          SOS Emergency Help
        </button>
      </div>
    </aside>
  );
}
