import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CRIME_MARKER_COLORS } from "../data/mockData";

const BANGALORE_CENTER = [12.9716, 77.5946];

export default function CrimeMap({ reports }) {
  return (
    <MapContainer
      center={BANGALORE_CENTER}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.lat, r.lng]}
          radius={11}
          pathOptions={{
            color: "white",
            weight: 2,
            fillColor: CRIME_MARKER_COLORS[r.type] ?? "#3b82f6",
            fillOpacity: 0.95,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{r.type}</p>
              <p className="text-slate-500">
                {new Date(r.dateTime).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-slate-500">{r.location}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
