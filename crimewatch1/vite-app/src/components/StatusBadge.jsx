import { STATUS_COLORS } from "../data/mockData";

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}
