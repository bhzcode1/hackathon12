import { useEffect, useState } from "react";
import { ChevronRight, MapPin, Clock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import { fetchMyReports, CRIME_MARKER_COLORS } from "../data/mockData";

export default function MyReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchMyReports().then(setReports);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="My Reports" />

        <main className="flex-1 p-6">
          <div className="max-w-3xl bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
            {reports.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-400">
                You haven't filed any reports yet.
              </p>
            )}
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-5 reveal-on-scroll">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CRIME_MARKER_COLORS[r.type] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900">{r.type}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(r.dateTime).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {r.location}
                    </span>
                  </div>
                </div>
                <StatusBadge status={r.status} />
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
