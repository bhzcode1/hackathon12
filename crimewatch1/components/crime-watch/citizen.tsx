"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IncidentMap } from "@/components/crime-watch/incident-map"
import {
  publicIncidents,
  myReports as seedReports,
  incidentTypeMeta,
  generateReferenceId,
  type Incident,
  type IncidentType,
  type IncidentStatus,
} from "@/lib/crime-watch/data"
import {
  ShieldCheck,
  Loader2,
  MapPin,
  Plus,
  FileText,
  Flame,
  Filter,
  Check,
  X,
  Siren,
  Radio,
} from "lucide-react"

interface CitizenProps {
  onExit: () => void
  onEmergency: () => void
}

const statusMeta: Record<IncidentStatus, { label: string; step: number }> = {
  submitted: { label: "Submitted", step: 1 },
  verified: { label: "Verified", step: 2 },
  "action-taken": { label: "Action Taken", step: 3 },
}

export function Citizen({ onExit, onEmergency }: CitizenProps) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")

  if (!loggedIn) {
    return (
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
        {/* Form */}
        <div className="mx-auto w-full max-w-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Log in to report incidents and track their status."
              : "Sign up to report incidents and follow up on them."}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setLoggedIn(true)
            }}
            className="mt-8 space-y-3"
          >
            {mode === "signup" && (
              <input
                required
                placeholder="Full name"
                className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
            <input
              required
              placeholder="Email or phone number"
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              required
              type="password"
              placeholder="Password"
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
              {mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-muted-foreground">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>

          <button
            onClick={onEmergency}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-emergency/30 bg-emergency/5 py-3 text-sm font-semibold text-emergency transition hover:bg-emergency/10"
          >
            <Siren className="h-4 w-4" /> Skip — report an emergency now
          </button>
        </div>

        {/* Side visual */}
        <div className="hidden rounded-3xl border border-border bg-card p-4 shadow-sm lg:block">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Radio className="h-4 w-4 text-primary" /> Live in your city
            </h2>
            <span className="text-xs text-muted-foreground">{publicIncidents.length} incidents</span>
          </div>
          <IncidentMap incidents={publicIncidents} aspectClassName="aspect-[4/3]" />
        </div>
      </div>
    )
  }

  return <CitizenDashboard onExit={onExit} onEmergency={onEmergency} />
}

function CitizenDashboard({ onEmergency }: CitizenProps) {
  const [locating, setLocating] = useState(true)
  const [heatmap, setHeatmap] = useState(false)
  const [activeType, setActiveType] = useState<IncidentType | "all">("all")
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("24h")
  const [reports, setReports] = useState<Incident[]>(seedReports)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLocating(false), 1600)
    return () => clearTimeout(t)
  }, [])

  const filtered = publicIncidents.filter((i) => activeType === "all" || i.type === activeType)
  const types: (IncidentType | "all")[] = ["all", "crime", "theft", "fire", "medical", "other"]

  const addReport = (r: Incident) => setReports((prev) => [r, ...prev])

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as Alex Rivera · Downtown area</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Report an Incident
          </Button>
          <button
            onClick={onEmergency}
            className="flex items-center gap-2 rounded-lg bg-emergency px-4 py-2 text-sm font-semibold text-emergency-foreground transition hover:opacity-90"
          >
            <Siren className="h-4 w-4" /> Emergency
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Map + filters */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> Incidents near you
              </span>
              <button
                onClick={() => setHeatmap((h) => !h)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                  heatmap ? "bg-emergency/15 text-emergency" : "bg-secondary text-secondary-foreground",
                )}
              >
                <Flame className="h-3.5 w-3.5" /> Heatmap {heatmap ? "on" : "off"}
              </button>
            </div>

            {locating ? (
              <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-border bg-secondary text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locating you…
              </div>
            ) : (
              <IncidentMap incidents={filtered} showMe heatmap={heatmap} aspectClassName="aspect-[16/10]" />
            )}

            {/* Type filters */}
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Filter by type
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition",
                    activeType === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {t === "all" ? "All types" : incidentTypeMeta[t].label}
                </button>
              ))}
            </div>

            {/* Time range */}
            <div className="mt-3 flex gap-2">
              {(["1h", "24h", "7d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={cn(
                    "flex-1 rounded-lg border py-1.5 text-xs font-medium transition",
                    timeRange === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  Last {r}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* My reports */}
        <section>
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" /> My Reports
              <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {reports.length}
              </span>
            </h2>
            <div className="space-y-3">
              {reports.map((r) => {
                const s = statusMeta[r.status]
                return (
                  <div key={r.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{r.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {r.address} · {r.time} · <span className="font-mono">{r.id}</span>
                        </p>
                      </div>
                      <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", incidentTypeMeta[r.type].color)} />
                    </div>
                    {/* Status tracker */}
                    <div className="mt-4 flex items-center">
                      {(["submitted", "verified", "action-taken"] as IncidentStatus[]).map((st, idx) => {
                        const stepNo = statusMeta[st].step
                        const done = stepNo <= s.step
                        return (
                          <div key={st} className="flex flex-1 items-center last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                                  done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                                )}
                              >
                                {done ? <Check className="h-3.5 w-3.5" /> : stepNo}
                              </div>
                              <span
                                className={cn(
                                  "text-[10px]",
                                  done ? "font-medium text-foreground" : "text-muted-foreground",
                                )}
                              >
                                {statusMeta[st].label}
                              </span>
                            </div>
                            {idx < 2 && (
                              <div className={cn("mx-1 h-0.5 flex-1", stepNo < s.step ? "bg-primary" : "bg-border")} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {showModal && <ReportModal onClose={() => setShowModal(false)} onSubmit={addReport} />}
    </div>
  )
}

function ReportModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: Incident) => void }) {
  const [type, setType] = useState<IncidentType>("theft")
  const [title, setTitle] = useState("")
  const [address, setAddress] = useState("")
  const types: IncidentType[] = ["crime", "theft", "fire", "medical", "other"]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Report an incident</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Non-urgent reports. For emergencies, use the SOS button.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit({
              id: generateReferenceId(),
              type,
              title: title || incidentTypeMeta[type].label,
              x: 40,
              y: 40,
              time: "Just now",
              status: "submitted",
              priority: "medium",
              address: address || "Location pending",
            })
            onClose()
          }}
          className="mt-5 space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Incident type</label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    type === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {incidentTypeMeta[t].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bike stolen from rack"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Union Square"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-1.5">
              <Check className="h-4 w-4" /> Submit report
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
