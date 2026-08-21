"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { IncidentMap } from "@/components/crime-watch/incident-map"
import { publicIncidents } from "@/lib/crime-watch/data"
import { Siren, LogIn, Radio, MapPinned, Sparkles, ArrowRight, ShieldCheck, Clock } from "lucide-react"

interface LandingProps {
  onEmergency: () => void
  onCitizen: () => void
  onPolice: () => void
}

const features = [
  { icon: Siren, label: "Instant SOS", desc: "One tap sends your live location — no login required." },
  { icon: MapPinned, label: "Live mapping", desc: "See verified incidents around you as they happen." },
  { icon: Sparkles, label: "AI verified", desc: "Reports are triaged and scored before dispatch." },
]

export function Landing({ onEmergency, onCitizen, onPolice }: LandingProps) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // background moves slower than scroll (parallax)
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  // hero text fades and lifts as you scroll past it
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"])

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-16">
      {/* Hero with parallax background */}
      <div ref={heroRef} className="relative overflow-hidden rounded-3xl">
        {/* Parallax background layer */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,oklch(0.58_0.24_27_/_0.15),transparent_60%),radial-gradient(circle_at_80%_70%,oklch(0.55_0.12_300_/_0.12),transparent_55%)]"
        />

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
        >
          {/* Left: copy + actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Average dispatch response 4–7 min
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-balance lg:text-5xl">
              Report crime in real time. Get help faster.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
              Instant emergency reporting, live incident mapping, and AI-assisted verification — connecting citizens and
              authorities the moment something happens.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onEmergency}
                className="group relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-emergency px-5 py-4 text-left text-emergency-foreground shadow-lg shadow-[oklch(0.58_0.24_27_/_0.35)] transition hover:opacity-95 active:scale-[0.98]"
              >
                <span className="absolute -right-6 -top-6 h-24 w-24 animate-ping rounded-full bg-white/10" />
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Siren className="h-6 w-6" />
                </span>
                <span className="relative">
                  <span className="block text-lg font-bold leading-none">Report Emergency</span>
                  <span className="mt-1 block text-xs text-emergency-foreground/85">No login · Sends location</span>
                </span>
                <ArrowRight className="relative ml-auto h-5 w-5 opacity-80 transition group-hover:translate-x-1" />
              </button>

              <Button
                onClick={onCitizen}
                size="lg"
                variant="secondary"
                className="h-auto flex-1 justify-start gap-3 rounded-2xl px-5 py-4 text-base"
              >
                <LogIn className="h-5 w-5" />
                <span className="flex flex-col items-start leading-none">
                  <span className="font-semibold">Citizen Login</span>
                  <span className="mt-1 text-xs font-normal text-muted-foreground">Track your reports</span>
                </span>
                <ArrowRight className="ml-auto h-5 w-5 opacity-70" />
              </Button>
            </div>

            {/* Feature list */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <f.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold">{f.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: live map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="rounded-3xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Radio className="h-4 w-4 text-primary" />
                Live incident map
              </h2>
              <span className="text-xs text-muted-foreground">{publicIncidents.length} incidents nearby</span>
            </div>
            <IncidentMap
              incidents={publicIncidents}
              aspectClassName="aspect-[4/3] lg:aspect-[4/5] xl:aspect-[4/4]"
            />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 px-1 text-xs text-muted-foreground">
              {[
                ["Crime", "bg-[oklch(0.58_0.24_27)]"],
                ["Medical", "bg-[oklch(0.55_0.12_300)]"],
                ["Fire", "bg-[oklch(0.7_0.17_55)]"],
                ["Theft", "bg-[oklch(0.6_0.15_255)]"],
                ["Other", "bg-[oklch(0.6_0.02_260)]"],
              ].map(([label, color]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Authority strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-police/20 bg-police px-6 py-5 text-police-foreground sm:flex-row"
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-police-accent" />
          <div>
            <p className="text-sm font-semibold">Are you law enforcement?</p>
            <p className="text-xs text-police-foreground/60">Access the verified dispatch and incident portal.</p>
          </div>
        </div>
        <button
          onClick={onPolice}
          className="flex items-center gap-2 rounded-xl bg-police-accent px-4 py-2.5 text-sm font-semibold text-police transition hover:opacity-90 active:scale-[0.98]"
        >
          Police / Authority Login
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  )
}