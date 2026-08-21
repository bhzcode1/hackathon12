"use client"

import { useState } from "react"
import { TopNav, type View } from "@/components/crime-watch/top-nav"
import { Landing } from "@/components/crime-watch/landing"
import { EmergencyFlow } from "@/components/crime-watch/emergency-flow"
import { Citizen } from "@/components/crime-watch/citizen"
import { Police } from "@/components/crime-watch/police"

export default function Page() {
  const [view, setView] = useState<View>("landing")

  // Emergency runs as an immersive full-screen flow without the app chrome.
  if (view === "emergency") {
    return (
      <main className="min-h-dvh bg-background">
        <EmergencyFlow onExit={() => setView("landing")} />
      </main>
    )
  }

  // Authority portal uses its own dark chrome.
  if (view === "police") {
    return (
      <main className="min-h-dvh bg-police">
        <Police onExit={() => setView("landing")} onNavigate={setView} />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <TopNav current={view} onNavigate={setView} />
      {view === "landing" && (
        <Landing
          onEmergency={() => setView("emergency")}
          onCitizen={() => setView("citizen")}
          onPolice={() => setView("police")}
        />
      )}
      {view === "citizen" && (
        <Citizen onExit={() => setView("landing")} onEmergency={() => setView("emergency")} />
      )}
    </main>
  )
}
