import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationMarker({ markerPos, setMarkerPos }) {
  useMapEvents({
    click(e) {
      setMarkerPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return markerPos ? <Marker position={markerPos} /> : null;
}

export default function MapPicker({ markerPos, setMarkerPos, height = 300 }) {
  return (
    <MapContainer
      center={markerPos || [39.8283, -98.5795]} // Center of US
      zoom={5}
      style={{ height, width: "100%", marginBottom: 16 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker markerPos={markerPos} setMarkerPos={setMarkerPos} />
    </MapContainer>
  );
}
