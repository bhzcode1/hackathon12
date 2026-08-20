import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Siren, Camera, X, LocateFixed, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";
import { createReport } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

export default function Emergency() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleFiles(e) {
    const picked = Array.from(e.target.files || []).map((f) => ({
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video"),
      name: f.name,
    }));
    setFiles((prev) => [...prev, ...picked]);
  }

  async function handleSubmit() {
    setSubmitting(true);
    await createReport({
      type: "Emergency",
      location: "Current location, Bangalore",
      description: note || "Emergency SOS triggered — immediate assistance requested.",
      anonymous: !user,
      dateTime: new Date().toISOString(),
    });
    setSubmitting(false);
    setSent(true);
  }

  const backTo = user ? (user.role === "police" ? "/admin" : "/dashboard") : "/";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link to={backTo} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-brand-500" size={20} />
          <span className="font-bold text-navy-900">SafeCity</span>
        </div>
        <span className="w-12" />
      </header>

      {sent ? (
        <main className="flex items-center justify-center p-6 min-h-[calc(100vh-65px)]">
          <div className="max-w-md text-center bg-white rounded-2xl shadow-sm p-10">
            <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
            <h2 className="text-xl font-bold text-navy-900 mb-2">Help is on the way</h2>
            <p className="text-sm text-slate-500 mb-6">
              Your emergency alert, location, and any evidence you attached have been sent to
              the nearest police unit. Stay safe.
            </p>
            <button
              onClick={() => navigate(backTo)}
              className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-2.5"
            >
              {user ? "Back to Dashboard" : "Back to Home"}
            </button>
          </div>
        </main>
      ) : (
        <main className="p-6 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <Siren className="text-danger-600 shrink-0" size={22} />
              <p className="text-sm text-red-700">
                This sends an immediate alert with your live location to police
                {user ? "" : " — no login needed"}. Only use for genuine emergencies.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <LocateFixed size={16} className="text-brand-500" />
                Current location, Bangalore
              </span>
              <span className="text-xs font-semibold text-green-600">Location locked</span>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">
                Attach photo or video (optional)
              </label>
              <div className="flex gap-3 flex-wrap">
                {files.map((f, i) => (
                  <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden bg-slate-100">
                    {f.isVideo ? (
                      <video src={f.url} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={f.url} alt="" className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setFiles((fs) => fs.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="h-24 w-24 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500 cursor-pointer">
                  <Camera size={20} />
                  <span className="text-[10px]">Photo/Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">
                Quick note (optional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything police should know right away..."
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-danger-600 hover:bg-danger-500 disabled:opacity-60 text-white font-bold py-4 transition-colors"
            >
              <Siren size={20} />
              {submitting ? "Sending alert..." : "Send Emergency Alert"}
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
