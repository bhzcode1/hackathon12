"use client"

import { cn } from "@/lib/utils"
import { incidentTypeMeta, type Incident } from "@/lib/crime-watch/data"
import { MapPin, Navigation } from "lucide-react"

interface IncidentMapProps {
  incidents: Incident[]
  heatmap?: boolean
  showMe?: boolean
  className?: string
  dark?: boolean
  /** Tailwind class controlling the map's height/aspect. Defaults to a 4:3 box. */
  aspectClassName?: string
}

export function IncidentMap({
  incidents,
  heatmap = false,
  showMe = false,
  className,
  dark = false,
  aspectClassName = "aspect-[4/3]",
}: IncidentMapProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border",
        dark ? "border-white/10" : "border-border",
        className,
      )}
      role="img"
      aria-label={`Map showing ${incidents.length} incidents`}
    >
      {/* Map base */}
      <div
        className={cn(
          "absolute inset-0",
          dark ? "bg-[oklch(0.22_0.04_262)]" : "bg-[oklch(0.94_0.02_235)]",
        )}
      />
      {/* Grid streets */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="streets" width="14%" height="14%" patternUnits="userSpaceOnUse">
            <path
              d="M 400 0 L 0 0 0 400"
              fill="none"
              stroke={dark ? "oklch(0.32 0.04 262)" : "oklch(0.88 0.02 235)"}
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#streets)" />
        {/* main diagonal road */}
        <line x1="0%" y1="80%" x2="100%" y2="20%" stroke={dark ? "oklch(0.36 0.03 262)" : "oklch(0.82 0.02 240)"} strokeWidth="6" />
        <line x1="10%" y1="0%" x2="60%" y2="100%" stroke={dark ? "oklch(0.36 0.03 262)" : "oklch(0.82 0.02 240)"} strokeWidth="4" />
        {/* river */}
        <path
          d="M -5 30 C 30 45, 55 15, 105 35"
          fill="none"
          stroke={dark ? "oklch(0.4 0.08 235)" : "oklch(0.78 0.09 230)"}
          strokeWidth="10"
          transform="scale(1,1)"
          vectorEffect="non-scaling-stroke"
          style={{ transform: "scaleX(4) scaleY(4)" }}
          opacity={0.5}
        />
      </svg>

      {/* Heatmap blobs */}
      {heatmap &&
        incidents
          .filter((i) => i.priority !== "low")
          .map((i) => (
            <div
              key={`heat-${i.id}`}
              className="pointer-events-none absolute rounded-full blur-2xl"
              style={{
                left: `${i.x}%`,
                top: `${i.y}%`,
                width: i.priority === "high" ? 120 : 80,
                height: i.priority === "high" ? 120 : 80,
                transform: "translate(-50%, -50%)",
                background:
                  i.priority === "high"
                    ? "radial-gradient(circle, oklch(0.58 0.24 27 / 0.55), transparent 70%)"
                    : "radial-gradient(circle, oklch(0.7 0.17 55 / 0.4), transparent 70%)",
              }}
            />
          ))}

      {/* Markers */}
      {incidents.map((i) => {
        const meta = incidentTypeMeta[i.type]
        return (
          <div
            key={i.id}
            className="group absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{ left: `${i.x}%`, top: `${i.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              {i.priority === "high" && (
                <span className={cn("absolute -top-1 h-7 w-7 animate-ping rounded-full opacity-60", meta.color)} />
              )}
              <MapPin
                className={cn(
                  "relative h-6 w-6 fill-current drop-shadow",
                  i.type === "crime" && "text-[oklch(0.58_0.24_27)]",
                  i.type === "medical" && "text-[oklch(0.55_0.12_300)]",
                  i.type === "fire" && "text-[oklch(0.7_0.17_55)]",
                  i.type === "theft" && "text-[oklch(0.55_0.15_255)]",
                  i.type === "other" && "text-[oklch(0.55_0.02_260)]",
                )}
              />
              <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background group-hover:block">
                {i.title} · {i.time}
              </div>
            </div>
          </div>
        )
      })}

      {/* Current location */}
      {showMe && (
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-3 animate-ping rounded-full bg-primary/30" />
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary shadow-lg">
            <Navigation className="h-2.5 w-2.5 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Spacer to give the box its height */}
      <div className={cn("invisible w-full", aspectClassName)} />
    </div>
  )
}
