import { useEffect, useState } from "react";
import { Bell, Clock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { fetchNotifications, markNotificationRead } from "../data/mockData";

export default function Notifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchNotifications().then(setItems);
  }, []);

  async function handleRead(id) {
    const updated = await markNotificationRead(id);
    setItems(updated);
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Notifications" />

        <main className="flex-1 p-6">
          <div className="max-w-2xl bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
            {items.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-400">No notifications yet.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleRead(n.id)}
                className="w-full flex items-start gap-3 p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className={`mt-1 rounded-full p-2 ${n.read ? "bg-slate-100 text-slate-400" : "bg-brand-100 text-brand-600"}`}>
                  <Bell size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.read ? "text-slate-500" : "text-navy-900"}`}>
                    {n.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400 mt-1.5">
                    <Clock size={11} />
                    {new Date(n.time).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
