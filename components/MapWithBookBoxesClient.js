// components/MapWithBookBoxesClient.js

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix des icônes par défaut qui ne s’affichent pas sans ce tweak :
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const bookBoxes = [
  { id: 1, name: "Boîte République", lat: 48.8667, lon: 2.3633 },
  { id: 2, name: "Boîte Montmartre", lat: 48.8867, lon: 2.3433 },
  { id: 3, name: "Boîte Nation", lat: 48.8489, lon: 2.3958 },
];

export default function MapWithBookBoxesClient({ userPosition, onSelectBox }) {
  useEffect(() => {
    // assure que le CSS est bien chargé si pas déjà
    import("leaflet/dist/leaflet.css");
  }, []);

  return (
    <MapContainer
      center={userPosition || [48.8566, 2.3522]}
      zoom={13}
      style={{ height: "400px", width: "100%", borderRadius: "10px", marginTop: 20 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {bookBoxes.map((box) => (
        <Marker
          key={box.id}
          position={[box.lat, box.lon]}
          eventHandlers={{
            click: () => onSelectBox(box),
          }}
        >
          <Popup>{box.name}</Popup>
        </Marker>
      ))}

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lon]}>
          <Popup>Ta position</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
