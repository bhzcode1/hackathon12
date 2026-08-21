import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Check, X } from "lucide-react";
import Topbar from "../../components/Topbar";
import AdminSidebar from "../../components/AdminSidebar";
import StatusBadge from "../../components/StatusBadge";
import { fetchReports, updateReportStatus, CRIME_TYPES } from "../../data/mockData";

const PAGE_SIZE = 5;

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReports().then(setReports);
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (status !== "All" && r.status !== status) return false;
      if (type !== "All" && r.type !== type) return false;
      if (query && !`${r.id} ${r.location}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [reports, status, type, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function setReportStatus(id, newStatus) {
    const updated = await updateReportStatus(id, newStatus);
    setReports((rs) => rs.map((r) => (r.id === id ? updated : r)));
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Admin" />
        <main className="flex-1 p-6 flex gap-6">
          <AdminSidebar />

          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="font-bold text-navy-900">All Crime Reports</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  {["All", "Pending", "Verified", "Rejected"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={type}
                  onChange={(e) => { setType(e.target.value); setPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option>All</option>
                  {CRIME_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <Search size={14} className="text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder="Search reports..."
                    className="text-sm outline-none w-32"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100">
                    <th className="py-2 pr-4 font-medium">Report ID</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Location</th>
                    <th className="py-2 pr-4 font-medium">Date & Time</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-navy-900">{r.id}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.type}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.location}</td>
                      <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">
                        {new Date(r.dateTime).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <button className="hover:text-brand-600"><Eye size={16} /></button>
                          <button onClick={() => setReportStatus(r.id, "Verified")} className="hover:text-green-600">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setReportStatus(r.id, "Rejected")} className="hover:text-red-500">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">No reports match these filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-5">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium ${
                    p === page ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
