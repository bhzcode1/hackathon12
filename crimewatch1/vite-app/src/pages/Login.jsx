import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ShieldAlert, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "police" ? "police" : "citizen";
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState(initialRole);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === "login") {
      login(form.email || `${role}@example.com`, role);
      navigate(role === "police" ? "/admin" : "/dashboard");
    } else {
      register(form.name || "Citizen", form.email || "citizen@example.com");
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-4xl">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex items-center justify-center gap-2 mb-8">
          <ShieldAlert className="text-brand-400" size={30} />
          <span className="text-2xl font-bold text-white">SafeCity</span>
        </div>

        {/* mobile tab toggle */}
        <div className="flex md:hidden mb-4 rounded-xl bg-navy-900 p-1">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
                mode === m ? "bg-brand-600 text-white" : "text-slate-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={`rounded-2xl bg-white p-8 shadow-xl ${mode !== "login" ? "hidden md:block md:opacity-60" : ""}`}
          >
            <div className="mb-6">
              <div className="h-14 w-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-3">
                <ShieldAlert size={26} />
              </div>
              <h2 className="text-xl font-bold text-navy-900">Welcome Back!</h2>
              <p className="text-sm text-slate-500">Login to your account</p>
            </div>

            <form onSubmit={mode === "login" ? handleSubmit : (e) => { e.preventDefault(); setMode("login"); }} className="space-y-4">
              <div>
                <span className="mb-1.5 block text-sm font-medium text-navy-900">Login as</span>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {[
                    { key: "citizen", label: "Citizen" },
                    { key: "police", label: "Police / Authority" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRole(r.key)}
                      className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors ${
                        role === r.key ? "bg-white text-brand-600 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Email" type="email" placeholder="you@example.com"
                value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              <PasswordField label="Password" value={form.password} show={showPw} setShow={setShowPw}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
              <div className="text-right">
                <button type="button" className="text-xs text-brand-600 font-medium hover:underline">
                  Forgot Password?
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 transition-colors"
              >
                Login
              </button>
              <p className="text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("register")} className="text-brand-600 font-semibold hover:underline">
                  Register
                </button>
              </p>
            </form>
          </div>

          <div
            className={`rounded-2xl bg-white p-8 shadow-xl ${mode !== "register" ? "hidden md:block md:opacity-60" : ""}`}
          >
            <div className="mb-6">
              <div className="h-14 w-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-3">
                <ShieldAlert size={26} />
              </div>
              <h2 className="text-xl font-bold text-navy-900">Create Account</h2>
              <p className="text-sm text-slate-500">Register a new account</p>
            </div>

            <form onSubmit={mode === "register" ? handleSubmit : (e) => { e.preventDefault(); setMode("register"); }} className="space-y-4">
              <Field label="Full Name" placeholder="Your Name"
                value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              <Field label="Email" type="email" placeholder="you@example.com"
                value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              <PasswordField label="Password" value={form.password} show={showPw} setShow={setShowPw}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 transition-colors"
              >
                Register
              </button>
              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="text-brand-600 font-semibold hover:underline">
                  Login
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-900">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function PasswordField({ label, value, onChange, show, setShow }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-900">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
