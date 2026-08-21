import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import Topbar from "../../components/Topbar";
import AdminSidebar from "../../components/AdminSidebar";
import { fetchReports, fetchStats, CRIME_MARKER_COLORS } from "../../data/mockData";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchStats().then(setStats);
    fetchReports().then(setReports);
  }, []);

  const byType = Object.keys(CRIME_MARKER_COLORS).map(
    (type) => reports.filter((r) => r.type === type).length
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Admin" />
        <main className="flex-1 p-6 flex gap-6">
          <AdminSidebar />

          <div className="flex-1 space-y-6 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="Total Complaints" value={stats?.total} color="text-brand-600" />
              <StatCard label="Resolved" value={stats?.resolved} color="text-indigo-600" />
              <StatCard label="Verified" value={stats?.verified} color="text-green-600" />
              <StatCard label="Pending" value={stats?.pending} color="text-amber-500" />
              <StatCard label="Rejected" value={stats?.rejected} color="text-red-500" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-navy-900 mb-4">Reports by Crime Type</h3>
                <Doughnut
                  data={{
                    labels: Object.keys(CRIME_MARKER_COLORS),
                    datasets: [{ data: byType, backgroundColor: Object.values(CRIME_MARKER_COLORS), borderWidth: 0 }],
                  }}
                  options={{ plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } } }}
                />
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-navy-900 mb-4">Report Volume</h3>
                <Bar
                  data={{
                    labels: Object.keys(CRIME_MARKER_COLORS),
                    datasets: [{ label: "Reports", data: byType, backgroundColor: "#7c4dff", borderRadius: 6 }],
                  }}
                  options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 reveal-on-scroll">
      <p className={`text-2xl font-bold ${color}`}>{value ?? "—"}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
