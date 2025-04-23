import { useState } from 'react';

export default function BookLocationFinder({ onSelectLocation }) {
  const [loading, setLoading] = useState(false);
  const [bookBoxes, setBookBoxes] = useState([]);
  const [error, setError] = useState(null);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchNearbyBookBoxes(latitude, longitude);
          onSelectLocation({ lat: latitude, lon: longitude }); // pour enregistrer la localisation
        },
        (err) => {
          setLoading(false);
          setError("Impossible d'obtenir la localisation.");
          console.error(err);
        }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  const fetchNearbyBookBoxes = async (lat, lon) => {
    const radius = 3000;
    const query = `
      [out:json];
      (
        node["amenity"="public_bookcase"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      const data = await response.json();
      setBookBoxes(data.elements);
    } catch (err) {
      setError("Erreur lors de la récupération des boîtes à livres.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={getUserLocation}>
        📍 Utiliser ma localisation
      </button>

      {loading && <p>Recherche en cours...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {bookBoxes.length > 0 && (
        <ul>
          <h4>📚 Boîtes à livres proches :</h4>
          {bookBoxes.map((box) => (
            <li key={box.id}>
              {box.tags?.name || 'Boîte à livres'} – {box.lat.toFixed(4)}, {box.lon.toFixed(4)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
