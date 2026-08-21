// Mock data layer.
// Every function here returns a Promise, so swapping in real axios
// calls later (see src/api/) means only editing this file — every
// component already awaits these as if they were network calls.

export const CRIME_TYPES = ["Theft", "Assault", "Harassment", "Robbery", "Other"];

export const STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-700",
  Verified: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export const CRIME_MARKER_COLORS = {
  Theft: "#ef4444",
  Assault: "#f97316",
  Harassment: "#eab308",
  Robbery: "#16a34a",
  Other: "#3b82f6",
  Emergency: "#dc2626",
};

let reports = [
  {
    id: "CR-1024",
    type: "Theft",
    location: "MG Road, Bangalore",
    lat: 12.9756,
    lng: 77.6068,
    dateTime: "2026-08-20T19:30:00",
    status: "Pending",
    description: "Bag snatched near the metro exit.",
    anonymous: true,
    reporter: "You",
  },
  {
    id: "CR-1023",
    type: "Assault",
    location: "Koramangala, Bangalore",
    lat: 12.9352,
    lng: 77.6245,
    dateTime: "2026-08-20T18:20:00",
    status: "Verified",
    description: "Altercation outside a restaurant, one injured.",
    anonymous: false,
    reporter: "You",
  },
  {
    id: "CR-1022",
    type: "Harassment",
    location: "Indiranagar, Bangalore",
    lat: 12.9719,
    lng: 77.6412,
    dateTime: "2026-08-19T21:10:00",
    status: "Verified",
    description: "Repeated verbal harassment reported by a bystander.",
    anonymous: true,
    reporter: "You",
  },
  {
    id: "CR-1021",
    type: "Robbery",
    location: "HSR Layout, Bangalore",
    lat: 12.9121,
    lng: 77.6446,
    dateTime: "2026-08-19T20:15:00",
    status: "Pending",
    description: "Armed robbery at a convenience store.",
    anonymous: false,
    reporter: "You",
  },
  {
    id: "CR-1020",
    type: "Theft",
    location: "Jayanagar, Bangalore",
    lat: 12.9308,
    lng: 77.5838,
    dateTime: "2026-08-18T19:45:00",
    status: "Rejected",
    description: "Reported theft could not be verified from evidence.",
    anonymous: false,
    reporter: "You",
  },
];

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export async function fetchReports() {
  await delay();
  return [...reports].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
}

export async function fetchMyReports() {
  await delay();
  return reports.filter((r) => r.reporter === "You");
}

export async function fetchStats() {
  await delay(150);
  const total = reports.length;
  const verified = reports.filter((r) => r.status === "Verified").length;
  const pending = reports.filter((r) => r.status === "Pending").length;
  const rejected = reports.filter((r) => r.status === "Rejected").length;
  const resolved = verified + rejected;
  return { total, verified, pending, rejected, resolved };
}

let notifications = [
  { id: 1, title: "Report CR-1023 verified", body: "Your assault report near Koramangala has been verified by the police.", time: "2026-08-20T18:40:00", read: false },
  { id: 2, title: "New crime reported nearby", title2: "", body: "A theft was reported 800m from your saved location, MG Road.", time: "2026-08-20T19:35:00", read: false },
  { id: 3, title: "Report CR-1020 rejected", body: "Your theft report in Jayanagar was marked rejected — insufficient evidence.", time: "2026-08-18T20:10:00", read: true },
];

export async function fetchNotifications() {
  await delay(200);
  return [...notifications].sort((a, b) => new Date(b.time) - new Date(a.time));
}

export async function markNotificationRead(id) {
  await delay(100);
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  return notifications;
}

export async function createReport(report) {
  await delay(400);
  const id = `CR-${1025 + reports.length}`;
  const newReport = {
    id,
    status: "Pending",
    reporter: "You",
    lat: 12.9716,
    lng: 77.5946,
    ...report,
  };
  reports = [newReport, ...reports];
  return newReport;
}

export async function updateReportStatus(id, status) {
  await delay(200);
  reports = reports.map((r) => (r.id === id ? { ...r, status } : r));
  return reports.find((r) => r.id === id);
}
