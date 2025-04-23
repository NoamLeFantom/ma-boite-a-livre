import { useState } from 'react';
import { useRouter } from 'next/router';
import MapWithBookBoxes from '@/components/MapWithBookBoxes';
import { getBookById } from '@/lib/data';
import { getCurrentUser } from '@/lib/session';
import Header from '@/components/Header';

export default function BookPage() {
  const router = useRouter();
  const { id } = router.query;
  const book = getBookById(id);
  const user = getCurrentUser();
  const pseudo = user?.pseudo || "inconnu";

  const [userPosition, setUserPosition] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);

  const handleLocationSuccess = (position) => {
    setUserPosition({
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    });
  };

  const handleLocationError = (error) => {
    console.error("Erreur de géolocalisation:", error);
  };

  const handleSelectBox = (box) => {
    setSelectedBox(box);
  };

  const handleValidateSelection = (box) => {
    alert(`Vous avez sélectionné la boîte à livre : ${box.name}`);
    // Logic to proceed with the selection (e.g., update database or navigate)
  };

  if (!book) return <p>Livre introuvable.</p>;

  // Demander la géolocalisation de l'utilisateur
  if (typeof window !== 'undefined' && !userPosition) {
    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
  }

  return (
    <div style={{ padding: 20 }}>
      <Header />
      <h1>{book.title}</h1>
      <p><strong>Auteur:</strong> {book.author}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Unique ID:</strong> {book.id}</p>

      <hr />

      <h2>Carte des boîtes à livres</h2>
      <MapWithBookBoxes
        userPosition={userPosition}
        onSelectBox={handleSelectBox}
        onValidateSelection={handleValidateSelection}
      />
    </div>
  );
}
