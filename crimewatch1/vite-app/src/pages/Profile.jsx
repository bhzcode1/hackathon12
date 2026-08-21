import { useState } from "react";
import { User, Mail, Shield, Save } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    updateProfile({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Profile" />

        <main className="flex-1 p-6">
          <div className="max-w-xl bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="font-bold text-navy-900 text-lg">{user?.name}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full px-2.5 py-0.5 capitalize mt-1">
                  <Shield size={11} />
                  {user?.role === "police" ? "Police / Authority" : "Citizen"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-navy-900">
                  <User size={14} /> Full Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-navy-900">
                  <Mail size={14} /> Email
                </span>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 outline-none"
                />
              </label>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 transition-colors"
              >
                <Save size={16} />
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
