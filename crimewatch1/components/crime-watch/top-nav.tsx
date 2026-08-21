"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck, Siren, LayoutDashboard, ShieldAlert } from "lucide-react"

export type View = "landing" | "emergency" | "citizen" | "police"

interface TopNavProps {
  current: View
  onNavigate: (view: View) => void
}

export function TopNav({ current, onNavigate }: TopNavProps) {
  const links: { view: View; label: string; icon: typeof ShieldCheck }[] = [
    { view: "landing", label: "Home", icon: LayoutDashboard },
    { view: "citizen", label: "Citizen", icon: ShieldCheck },
    { view: "police", label: "Authority", icon: ShieldAlert },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 transition hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Crime Watch</span>
        </button>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button
              key={l.view}
              onClick={() => onNavigate(l.view)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                current === l.view
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
          <button
            onClick={() => onNavigate("emergency")}
            className="flex items-center gap-2 rounded-lg bg-emergency px-4 py-2 text-sm font-semibold text-emergency-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            <Siren className="h-4 w-4" />
            Emergency
          </button>
        </div>
      </div>
    </header>
  )
}
