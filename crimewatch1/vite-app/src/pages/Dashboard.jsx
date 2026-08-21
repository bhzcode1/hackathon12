import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import CrimeMap from "../components/CrimeMap";
import { fetchReports, fetchStats, CRIME_MARKER_COLORS } from "../data/mockData";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports().then(setReports);
    fetchStats().then(setStats);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Dashboard" />

        <main className="flex-1 p-6">
          <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-sm">
            <CrimeMap reports={reports} />

            {/* stats card overlay */}
            {stats && (
              <div className="absolute left-4 bottom-20 z-[400] bg-white rounded-2xl shadow-xl px-6 py-4 hidden sm:block reveal-on-scroll">
                <p className="text-sm font-semibold text-navy-900 mb-3">Crime Statistics (Today)</p>
                <div className="flex gap-6">
                  <Stat label="Total Reports" value={stats.total} color="text-brand-600" />
                  <Stat label="Verified" value={stats.verified} color="text-green-600" />
                  <Stat label="Pending" value={stats.pending} color="text-amber-500" />
                  <Stat label="Rejected" value={stats.rejected} color="text-red-500" />
                </div>
              </div>
            )}

            {/* legend */}
            <div className="absolute left-4 bottom-4 z-[400] hidden sm:flex items-center gap-4 bg-white rounded-full shadow-xl px-5 py-2.5 text-xs font-medium text-slate-600">
              {Object.entries(CRIME_MARKER_COLORS).map(([type, color]) => (
                <span key={type} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {type}
                </span>
              ))}
            </div>

            <button
              onClick={() => navigate("/report")}
              className="absolute right-4 bottom-4 z-[400] flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-3 shadow-xl transition-colors"
            >
              <Plus size={18} />
              Report Crime
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
