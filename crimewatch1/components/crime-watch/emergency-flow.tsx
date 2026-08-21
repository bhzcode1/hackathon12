"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { generateReferenceId, type IncidentType } from "@/lib/crime-watch/data"
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Camera,
  Mic,
  Square,
  Stethoscope,
  Siren,
  Flame,
  HelpCircle,
  Check,
  ShieldCheck,
  X,
  PhoneCall,
} from "lucide-react"

const HOLD_MS = 3000

type Step = "locating" | "confirm" | "details" | "sent"

interface EmergencyFlowProps {
  onExit: () => void
}

const emergencyTypes: { id: IncidentType; label: string; icon: typeof Siren; color: string }[] = [
  { id: "medical", label: "Medical", icon: Stethoscope, color: "text-[oklch(0.55_0.12_300)]" },
  { id: "crime", label: "Crime in progress", icon: Siren, color: "text-emergency" },
  { id: "fire", label: "Fire", icon: Flame, color: "text-[oklch(0.7_0.17_55)]" },
  { id: "other", label: "Other", icon: HelpCircle, color: "text-muted-foreground" },
]

export function EmergencyFlow({ onExit }: EmergencyFlowProps) {
  const [step, setStep] = useState<Step>("locating")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  const [type, setType] = useState<IncidentType | null>(null)
  const [photo, setPhoto] = useState(false)
  const [recording, setRecording] = useState(false)
  const [voiceSecs, setVoiceSecs] = useState(0)
  const [hasVoice, setHasVoice] = useState(false)
  const [refId] = useState(generateReferenceId)

  // Simulate GPS capture
  useEffect(() => {
    const t = setTimeout(() => {
      setCoords({ lat: 37.7749, lng: -122.4194 })
      setStep("confirm")
    }, 2200)
    return () => clearTimeout(t)
  }, [])

  // Voice recording timer
  useEffect(() => {
    if (!recording) return
    const iv = setInterval(() => setVoiceSecs((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [recording])

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current
    const p = Math.min(1, elapsed / HOLD_MS)
    setHoldProgress(p)
    if (p >= 1) {
      setStep("details")
      return
    }
    holdRef.current = requestAnimationFrame(tick)
  }, [])

  const startHold = () => {
    startRef.current = Date.now()
    holdRef.current = requestAnimationFrame(tick)
  }
  const endHold = () => {
    if (holdRef.current) cancelAnimationFrame(holdRef.current)
    setHoldProgress(0)
  }

  useEffect(() => () => { if (holdRef.current) cancelAnimationFrame(holdRef.current) }, [])

  const secondsLeft = Math.ceil((1 - holdProgress) * (HOLD_MS / 1000))

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[oklch(0.18_0.03_25)] text-white">
    <div className="flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-6 sm:max-w-lg">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white">
          {step === "sent" ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {step === "sent" ? "Close" : "Cancel"}
        </button>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
          <Siren className="h-4 w-4 text-emergency" /> Emergency
        </span>
      </div>

      {/* LOCATING */}
      {step === "locating" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
              <MapPin className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>
          <h1 className="mt-8 text-xl font-semibold">Getting your location…</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Pinpointing your exact position
          </p>
        </div>
      )}

      {/* CONFIRM — hold 3s */}
      {step === "confirm" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            Location locked · {coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)}
          </div>
          <h1 className="mt-8 text-2xl font-bold text-balance">Hold to confirm emergency</h1>
          <p className="mt-2 text-sm text-white/60">Press and hold for 3 seconds to prevent accidental alerts.</p>

          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="relative mt-10 flex h-56 w-56 select-none items-center justify-center rounded-full outline-none"
            aria-label="Hold to confirm emergency"
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="oklch(1 0 0 / 0.12)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="oklch(0.65 0.24 27)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - holdProgress)}
                style={{ transition: holdProgress === 0 ? "stroke-dashoffset 0.2s" : "none" }}
              />
            </svg>
            <span
              className={cn(
                "flex h-40 w-40 flex-col items-center justify-center rounded-full bg-emergency shadow-2xl shadow-[oklch(0.58_0.24_27_/_0.5)] transition",
                holdProgress > 0 ? "scale-95" : "animate-pulse",
              )}
            >
              <Siren className="h-9 w-9" />
              <span className="mt-1 text-4xl font-bold tabular-nums">
                {holdProgress > 0 ? secondsLeft : ""}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-white/80">
                {holdProgress > 0 ? "Keep holding" : "Hold"}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* DETAILS */}
      {step === "details" && (
        <div className="flex flex-1 flex-col pt-6">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300">
            <Check className="h-4 w-4" /> Location captured — you can send now or add details.
          </div>

          {/* Type select */}
          <p className="mt-6 text-sm font-medium text-white/80">What&apos;s happening? <span className="text-white/40">(optional)</span></p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {emergencyTypes.map((t) => {
              const active = type === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setType(active ? null : t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-5 transition active:scale-95",
                    active ? "border-emergency bg-emergency/15" : "border-white/10 bg-white/5",
                  )}
                >
                  <t.icon className={cn("h-8 w-8", t.color)} />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              )
            })}
          </div>

          {/* Photo + voice */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setPhoto((p) => !p)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-medium transition active:scale-95",
                photo ? "border-primary bg-primary/15 text-white" : "border-white/10 bg-white/5 text-white/80",
              )}
            >
              {photo ? <Check className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              {photo ? "Photo added" : "Add photo"}
            </button>
            <button
              onClick={() => {
                if (recording) {
                  setRecording(false)
                  setHasVoice(true)
                } else {
                  setVoiceSecs(0)
                  setHasVoice(false)
                  setRecording(true)
                }
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-medium transition active:scale-95",
                recording
                  ? "border-emergency bg-emergency/20 text-white"
                  : hasVoice
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 bg-white/5 text-white/80",
              )}
            >
              {recording ? <Square className="h-4 w-4 fill-current" /> : hasVoice ? <Check className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {recording ? "Stop" : hasVoice ? "Voice added" : "Voice note"}
            </button>
          </div>

          {/* Waveform while recording */}
          {recording && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emergency" />
              <div className="flex flex-1 items-center gap-0.5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-emergency/70"
                    style={{
                      height: `${20 + Math.abs(Math.sin(i * 1.3 + voiceSecs)) * 24}px`,
                      animation: "pulse 0.8s ease-in-out infinite",
                      animationDelay: `${i * 40}ms`,
                    }}
                  />
                ))}
              </div>
              <span className="tabular-nums text-sm text-white/70">0:{String(voiceSecs).padStart(2, "0")}</span>
            </div>
          )}

          {/* Send */}
          <div className="mt-auto pt-6">
            <Button
              onClick={() => setStep("sent")}
              className="h-14 w-full gap-2 rounded-2xl bg-emergency text-base font-semibold text-emergency-foreground hover:bg-emergency/90"
            >
              <Siren className="h-5 w-5" /> Send Now
            </Button>
            <p className="mt-2 text-center text-xs text-white/50">Location alone is enough — everything else is optional.</p>
          </div>
        </div>
      )}

      {/* SENT */}
      {step === "sent" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500">
              <Check className="h-12 w-12" strokeWidth={3} />
            </div>
          </div>
          <h1 className="mt-8 text-2xl font-bold text-balance">Help is on the way</h1>
          <p className="mt-2 max-w-xs text-sm text-white/60 text-pretty">
            Your report was sent to the nearest response team with your live location. Stay safe and keep your phone
            nearby.
          </p>

          <div className="mt-6 w-full rounded-2xl bg-white/5 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Reference ID</span>
              <span className="font-mono text-sm font-semibold text-white">{refId}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
              <ShieldCheck className="h-4 w-4" /> Dispatch notified · ETA 4–7 min
            </div>
          </div>

          <a
            href="tel:911"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/15 py-3.5 text-sm font-semibold text-white"
          >
            <PhoneCall className="h-4 w-4" /> Call emergency line directly
          </a>

          <Button onClick={onExit} variant="ghost" className="mt-3 text-white/70 hover:bg-white/10 hover:text-white">
            Back to home
          </Button>
        </div>
      )}
    </div>
    </div>
  )
}
