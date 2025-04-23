import { useEffect, useState } from 'react';
import { TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import dynamic from 'next/dynamic';

// Charger la carte dynamiquement sans SSR (rendu côté serveur désactivé)
const MapContainer = dynamic(
  () => import('./MapWithBookBoxesClient'),
  { ssr: false } // Désactive le SSR pour la carte
);

// Icône personnalisée pour les marqueurs
const bookBoxIcon = new L.Icon({
  iconUrl: '/book-box-icon.png', // Assure-toi d'avoir cette icône dans ton dossier public
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14); // Centrer la carte sur la position de l'utilisateur
    }
  }, [position, map]);

  return null;
}

export default function MapWithBookBoxes({ userPosition, onSelectBox, onValidateSelection }) {
  const [bookBoxes, setBookBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null); // Pour suivre la boîte sélectionnée par l'utilisateur

  // Effectuer la recherche des boîtes à livres à proximité de la position de l'utilisateur
  useEffect(() => {
    if (!userPosition) return;

    const fetchBookBoxes = async () => {
      const { lat, lon } = userPosition;
      const radius = 1000; // rayon de recherche en mètres
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="public_bookcase"](around:${radius},${lat},${lon});
        );
        out body;
      `;
      const url = 'https://overpass-api.de/api/interpreter';

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: query,
        });
        const data = await response.json();
        const boxes = data.elements.map((el) => ({
          id: el.id,
          lat: el.lat,
          lon: el.lon,
          name: el.tags?.name || 'Boîte à livres',
        }));
        setBookBoxes(boxes);
      } catch (error) {
        console.error('Erreur lors de la récupération des boîtes à livres:', error);
      }
    };

    fetchBookBoxes();
  }, [userPosition]);

  if (!userPosition) return <p>Chargement de la carte...</p>;

  const handleBoxSelection = (box) => {
    setSelectedBox(box); // Met à jour la boîte sélectionnée par l'utilisateur
    onSelectBox(box); // Appelle la fonction de callback pour propager la sélection
  };

  const handleValidateSelection = () => {
    if (!selectedBox) {
      alert('Veuillez sélectionner une boîte à livre.');
      return;
    }
    onValidateSelection(selectedBox); // Confirme la sélection
    alert(`Boîte à livres sélectionnée: ${selectedBox.name}`);
  };

  return (
    <div>
      <MapContainer center={[userPosition.lat, userPosition.lon]} zoom={14} style={{ height: '400px', width: '100%' }}>
        <FlyToLocation position={[userPosition.lat, userPosition.lon]} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {bookBoxes.map((box) => (
          <Marker
            key={box.id}
            position={[box.lat, box.lon]}
            icon={bookBoxIcon}
            eventHandlers={{
              click: () => handleBoxSelection(box),
            }}
          >
            <Popup>{box.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Afficher un bouton pour valider la sélection */}
      {selectedBox && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleValidateSelection}>Valider la boîte sélectionnée</button>
        </div>
      )}
    </div>
  );
}
