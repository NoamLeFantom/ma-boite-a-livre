import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function BookBoxMapSelector({ bookBoxes, onSelect, selectedBoxId }) {
  const [center, setCenter] = useState([48.8566, 2.3522]); // par défaut : Paris

  useEffect(() => {
    if (bookBoxes.length > 0) {
      setCenter([bookBoxes[0].lat, bookBoxes[0].lon]);
    }
  }, [bookBoxes]);

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div style={{ height: '400px', marginTop: '1rem' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bookBoxes.map((box) => (
          <Marker
            key={box.id}
            position={[box.lat, box.lon]}
            icon={icon}
            eventHandlers={{
              click: () => onSelect(box),
            }}
          >
            <Popup>
              {box.tags?.name || 'Boîte à livres'}<br />
              {selectedBoxId === box.id ? "✅ Sélectionnée" : "Cliquez pour sélectionner"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
