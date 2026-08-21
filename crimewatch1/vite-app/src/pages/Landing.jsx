import { useNavigate } from "react-router-dom";
import { ShieldAlert, ShieldCheck, Siren, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* -----------------------------------------------------------------
   SCROLL / AMBIENT BACKGROUND ANIMATION GOES HERE.
   This <div id="landing-bg"> sits behind everything (absolute,
   inset-0, -z-10) and is the mount point for your animation code —
   whether that's a Framer Motion component, a canvas/WebGL layer,
   or a scroll-triggered particle effect. Render it as the first
   child of the wrapper below so it sits behind the hero content,
   and give it "pointer-events-none" so it never blocks clicks.
------------------------------------------------------------------ */

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-950 text-white">
      {/* --- animated background mount point --- */}
      <div id="landing-bg" className="absolute inset-0 -z-10 pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="text-brand-400" size={32} />
          <span className="text-2xl font-bold">SafeCity</span>
        </div>
        <p className="text-slate-400 text-sm mb-12 text-center max-w-sm">
          Real-time crime reporting for citizens and police, in one place.
        </p>

        {user && (
          <button
            onClick={() => navigate(user.role === "police" ? "/admin" : "/dashboard")}
            className="mb-8 flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300"
          >
            Continue to your dashboard <ArrowRight size={16} />
          </button>
        )}

        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-xl">
          <button
            onClick={() => navigate("/login")}
            className="reveal-on-scroll group flex flex-col items-center gap-3 rounded-2xl bg-navy-900 border border-navy-700 hover:border-brand-500 px-6 py-8 text-center transition-colors"
          >
            <span className="h-14 w-14 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center group-hover:bg-brand-600/30">
              <ShieldCheck size={26} />
            </span>
            <span className="font-semibold">Login</span>
            <span className="text-xs text-slate-400">Citizen or Police / Authority</span>
          </button>

          <button
            onClick={() => navigate("/emergency")}
            className="reveal-on-scroll group flex flex-col items-center gap-3 rounded-2xl bg-danger-600 hover:bg-danger-500 px-6 py-8 text-center shadow-lg shadow-red-900/30 transition-colors"
          >
            <span className="h-16 w-16 rounded-full bg-white/15 flex items-center justify-center animate-pulse">
              <Siren size={30} />
            </span>
            <span className="font-bold text-lg">Emergency SOS</span>
            <span className="text-xs text-red-100">No login needed — instant alert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
