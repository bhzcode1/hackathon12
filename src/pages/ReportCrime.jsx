import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocateFixed, Plus, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { CRIME_TYPES, createReport } from "../data/mockData";

export default function ReportCrime() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: "",
    type: "Theft",
    description: "",
    anonymous: true,
  });
  const [evidence, setEvidence] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function handleFiles(e) {
    const files = Array.from(e.target.files || []).map((f) => URL.createObjectURL(f));
    setEvidence((prev) => [...prev, ...files]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await createReport({
      type: form.type,
      location: form.location || "Current location, Bangalore",
      description: form.description,
      anonymous: form.anonymous,
      dateTime: new Date().toISOString(),
    });
    setSubmitting(false);
    navigate("/my-reports");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Report a Crime" />

        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-navy-900">
                Location
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-brand-200 text-brand-600 text-xs font-semibold px-2.5 py-1.5 hover:bg-brand-50"
                >
                  <LocateFixed size={14} />
                  Use My Location
                </button>
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="MG Road, Bangalore, Karnataka"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">Crime Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {CRIME_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Provide details about the incident..."
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">Date & Time</label>
              <input
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">Upload Evidence</label>
              <div className="flex gap-3 flex-wrap">
                {evidence.map((src, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEvidence((ev) => ev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="h-20 w-20 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500 cursor-pointer">
                  <Plus size={22} />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium text-navy-900">
                Anonymous Report
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, anonymous: !f.anonymous }))}
                className={`h-6 w-11 rounded-full transition-colors relative ${form.anonymous ? "bg-brand-600" : "bg-slate-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.anonymous ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold py-3.5 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
