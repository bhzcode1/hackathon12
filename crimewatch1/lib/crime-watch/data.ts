export type IncidentType = "crime" | "medical" | "fire" | "theft" | "other"

export type IncidentStatus = "submitted" | "verified" | "action-taken"

export interface Incident {
  id: string
  type: IncidentType
  title: string
  // Normalized position on the map preview (0-100 %)
  x: number
  y: number
  time: string
  status: IncidentStatus
  priority: "high" | "medium" | "low"
  aiCategory?: string
  aiConfidence?: number
  hasPhoto?: boolean
  hasVoice?: boolean
  address?: string
}

export const incidentTypeMeta: Record<
  IncidentType,
  { label: string; color: string; ring: string }
> = {
  crime: { label: "Crime in progress", color: "bg-[oklch(0.58_0.24_27)]", ring: "ring-[oklch(0.58_0.24_27)]" },
  medical: { label: "Medical", color: "bg-[oklch(0.55_0.12_300)]", ring: "ring-[oklch(0.55_0.12_300)]" },
  fire: { label: "Fire", color: "bg-[oklch(0.7_0.17_55)]", ring: "ring-[oklch(0.7_0.17_55)]" },
  theft: { label: "Theft", color: "bg-[oklch(0.6_0.15_255)]", ring: "ring-[oklch(0.6_0.15_255)]" },
  other: { label: "Other", color: "bg-[oklch(0.6_0.02_260)]", ring: "ring-[oklch(0.6_0.02_260)]" },
}

export const publicIncidents: Incident[] = [
  { id: "IR-4821", type: "crime", title: "Assault reported", x: 28, y: 34, time: "2 min ago", status: "verified", priority: "high", address: "5th & Market St" },
  { id: "IR-4820", type: "theft", title: "Vehicle break-in", x: 62, y: 48, time: "11 min ago", status: "submitted", priority: "medium", address: "Elm Ave" },
  { id: "IR-4818", type: "fire", title: "Structure fire", x: 44, y: 66, time: "24 min ago", status: "action-taken", priority: "high", address: "Warehouse 12" },
  { id: "IR-4815", type: "medical", title: "Medical emergency", x: 75, y: 28, time: "38 min ago", status: "verified", priority: "high", address: "Central Park" },
  { id: "IR-4809", type: "theft", title: "Pickpocketing", x: 18, y: 72, time: "1 hr ago", status: "verified", priority: "low", address: "Transit Hub" },
  { id: "IR-4802", type: "other", title: "Suspicious activity", x: 55, y: 20, time: "2 hr ago", status: "submitted", priority: "low", address: "Riverside Walk" },
  { id: "IR-4798", type: "crime", title: "Vandalism", x: 82, y: 62, time: "3 hr ago", status: "action-taken", priority: "medium", address: "School District" },
]

export const myReports: Incident[] = [
  { id: "IR-4831", type: "theft", title: "Bike stolen from rack", x: 40, y: 40, time: "20 min ago", status: "verified", priority: "medium", hasPhoto: true, address: "Union Square" },
  { id: "IR-4790", type: "other", title: "Broken street light", x: 60, y: 55, time: "Yesterday", status: "action-taken", priority: "low", address: "Oak Street" },
  { id: "IR-4772", type: "crime", title: "Noise / disturbance", x: 30, y: 60, time: "3 days ago", status: "action-taken", priority: "low", address: "Downtown" },
]

export const verifyQueue: Incident[] = [
  { id: "IR-4820", type: "theft", title: "Vehicle break-in", x: 62, y: 48, time: "11 min ago", status: "submitted", priority: "medium", aiCategory: "Property crime", aiConfidence: 92, hasPhoto: true, address: "Elm Ave" },
  { id: "IR-4802", type: "other", title: "Suspicious activity", x: 55, y: 20, time: "2 hr ago", status: "submitted", priority: "low", aiCategory: "Unclassified", aiConfidence: 54, hasVoice: true, address: "Riverside Walk" },
  { id: "IR-4833", type: "crime", title: "Group altercation", x: 48, y: 30, time: "just now", status: "submitted", priority: "high", aiCategory: "Violent crime", aiConfidence: 88, hasPhoto: true, hasVoice: true, address: "Nightlife Blvd" },
  { id: "IR-4829", type: "fire", title: "Smoke from building", x: 70, y: 70, time: "5 min ago", status: "submitted", priority: "high", aiCategory: "Fire hazard", aiConfidence: 79, hasPhoto: true, address: "Industrial Rd" },
]

export const crimeTrend = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 9 },
  { day: "Thu", count: 22 },
  { day: "Fri", count: 31 },
  { day: "Sat", count: 38 },
  { day: "Sun", count: 27 },
]

export const topHotspots = [
  { name: "Downtown Core", reports: 48, change: "+12%" },
  { name: "Transit Hub", reports: 34, change: "+4%" },
  { name: "Nightlife Blvd", reports: 29, change: "+21%" },
  { name: "Riverside Walk", reports: 17, change: "-6%" },
  { name: "School District", reports: 11, change: "-2%" },
]

export function generateReferenceId() {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `CW-${n}`
}
