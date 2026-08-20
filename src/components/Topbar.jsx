import { Search, Bell, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {title && <h1 className="text-lg font-bold text-navy-900 shrink-0">{title}</h1>}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm rounded-lg bg-slate-100 px-3 py-2 text-slate-500">
          <Search size={16} />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
            placeholder="Search location..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-sm text-slate-500">
          <MapPin size={16} />
          Bangalore, India
        </div>
        <button className="relative text-slate-500 hover:text-navy-900">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-danger-500 border-2 border-white" />
        </button>
        <div className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-semibold">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
