"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { IncidentMap } from "@/components/crime-watch/incident-map"
import type { View } from "@/components/crime-watch/top-nav"
import {
  verifyQueue,
  publicIncidents,
  crimeTrend,
  topHotspots,
  incidentTypeMeta,
} from "@/lib/crime-watch/data"
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Check,
  X,
  Sparkles,
  Camera,
  Mic,
  MapPin,
  TrendingUp,
  Flame,
  ClipboardList,
  BarChart3,
  LogOut,
} from "lucide-react"

interface PoliceProps {
  onExit: () => void
  onNavigate?: (view: View) => void
}

export function Police({ onExit }: PoliceProps) {
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return (
      <div className="mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-12 px-6 py-12 text-police-foreground lg:grid-cols-2">
        {/* Form */}
        <div className="mx-auto w-full max-w-md">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-sm text-police-foreground/60 transition hover:text-police-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </button>

          <div className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-police-accent">
            <Lock className="h-3.5 w-3.5" /> Restricted Access
          </div>
          <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <ShieldCheck className="h-7 w-7 text-police-accent" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Authority Portal</h1>
          <p className="mt-2 text-sm text-police-foreground/60">
            Verified law enforcement personnel only. All access is logged and audited.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setLoggedIn(true)
            }}
            className="mt-8 space-y-3"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-police-foreground/70">Badge / Officer ID</label>
              <input
                required
                placeholder="e.g. SFPD-40921"
                className="h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-police-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-police-foreground/70">Department email</label>
              <input
                required
                type="email"
                placeholder="officer@dept.gov"
                className="h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-police-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-police-foreground/70">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-police-accent"
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-police-accent text-sm font-semibold text-police transition hover:opacity-90"
            >
              <Lock className="h-4 w-4" /> Secure Sign In
            </button>
          </form>
        </div>

        {/* Side visual */}
        <div className="hidden rounded-3xl border border-white/10 bg-white/5 p-4 lg:block">
          <div className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold">
            <Flame className="h-4 w-4 text-emergency" /> Live incident hotspots
          </div>
          <IncidentMap incidents={publicIncidents} heatmap dark aspectClassName="aspect-[4/3]" />
        </div>
      </div>
    )
  }

  return <PoliceDashboard onExit={onExit} />
}

function PoliceDashboard({ onExit }: PoliceProps) {
  const [queue, setQueue] = useState(verifyQueue)
  const maxTrend = Math.max(...crimeTrend.map((d) => d.count))

  const resolve = (id: string) => setQueue((q) => q.filter((i) => i.id !== id))

  return (
    <div className="min-h-dvh text-police-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-police/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-6">
          <ShieldCheck className="h-5 w-5 text-police-accent" />
          <div>
            <p className="text-sm font-semibold leading-none">Central Dispatch</p>
            <p className="mt-0.5 text-xs text-police-foreground/50">Officer M. Chen · SFPD-40921</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
            On duty
          </span>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-police-foreground/70 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit portal
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-6">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Pending review", value: queue.length, tone: "text-police-accent" },
            { label: "Active today", value: 27, tone: "text-white" },
            { label: "High priority", value: queue.filter((q) => q.priority === "high").length, tone: "text-emergency" },
            { label: "Resolved (24h)", value: 41, tone: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <p className={cn("text-3xl font-bold tabular-nums", s.tone)}>{s.value}</p>
              <p className="mt-1 text-xs text-police-foreground/50">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left: map + analytics */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                <Flame className="h-4 w-4 text-emergency" /> Incident hotspots
              </div>
              <IncidentMap incidents={publicIncidents} heatmap dark aspectClassName="aspect-[16/9]" />
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {/* Trend chart */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-police-accent" /> 7-day crime trend
                </h3>
                <div className="mt-4 flex h-32 items-stretch gap-1.5">
                  {crimeTrend.map((d) => (
                    <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                      <div
                        className="w-full rounded-t bg-police-accent/70 transition-all hover:bg-police-accent"
                        style={{ height: `${Math.max(6, (d.count / maxTrend) * 100)}%` }}
                        title={`${d.count} reports`}
                      />
                      <span className="text-[10px] text-police-foreground/50">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotspot list */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <BarChart3 className="h-4 w-4 text-police-accent" /> Top hotspots
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {topHotspots.map((h, i) => (
                    <li key={h.name} className="flex items-center gap-2 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] font-bold text-police-foreground/70">
                        {i + 1}
                      </span>
                      <span className="truncate text-police-foreground/90">{h.name}</span>
                      <span className="ml-auto text-xs text-police-foreground/50">{h.reports}</span>
                      <span
                        className={cn(
                          "w-12 text-right text-xs font-medium",
                          h.change.startsWith("+") ? "text-emergency" : "text-emerald-400",
                        )}
                      >
                        {h.change}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Right: verify queue */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-police-accent" /> Reports to Verify
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">{queue.length}</span>
            </h2>
            <div className="space-y-3">
              {queue.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-police-foreground/50">
                  Queue cleared. Nice work.
                </p>
              )}
              {queue.map((r) => {
                const meta = incidentTypeMeta[r.type]
                return (
                  <div key={r.id} className="rounded-xl border border-white/10 bg-background/40 p-4">
                    <div className="flex items-start gap-3">
                      <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", meta.color)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{r.title}</p>
                          {r.priority === "high" && (
                            <span className="rounded bg-emergency/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emergency">
                              High
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-police-foreground/50">
                          <MapPin className="h-3 w-3" /> {r.address} · {r.time}
                        </p>

                        {/* AI suggestion */}
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-police-accent/10 px-2.5 py-1.5 text-xs">
                          <Sparkles className="h-3.5 w-3.5 text-police-accent" />
                          <span className="text-police-foreground/80">
                            AI: <span className="font-medium">{r.aiCategory}</span>
                          </span>
                          <span
                            className={cn(
                              "ml-auto rounded px-1.5 py-0.5 font-semibold",
                              (r.aiConfidence ?? 0) >= 80
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-amber-500/15 text-amber-400",
                            )}
                          >
                            {r.aiConfidence}% match
                          </span>
                        </div>

                        {/* Attachments */}
                        {(r.hasPhoto || r.hasVoice) && (
                          <div className="mt-2 flex gap-2 text-xs text-police-foreground/50">
                            {r.hasPhoto && (
                              <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-1">
                                <Camera className="h-3 w-3" /> Photo
                              </span>
                            )}
                            {r.hasVoice && (
                              <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-1">
                                <Mic className="h-3 w-3" /> Voice
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => resolve(r.id)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                          >
                            <Check className="h-3.5 w-3.5" /> Verify &amp; dispatch
                          </button>
                          <button
                            onClick={() => resolve(r.id)}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-police-foreground/70 transition hover:bg-white/5"
                          >
                            <X className="h-3.5 w-3.5" /> Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
