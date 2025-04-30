// pages/book/[id].js


import { useRouter } from "next/router";
import { getBookById, addInteraction, addComment, fetchBookBoxes, geocodeCity } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import axios from "axios";

export async function getServerSideProps(context) {
  const { id } = context.params;
  const book = await getBookById(id);

  if (!book) {
    return {
      notFound: true,
    };
  }

  if (book._id) {
    book._id = book._id.toString();
  }

  return {
    props: {
      book,
    },
  };
}

export default function BookPage({ book }) {
  const router = useRouter();
  const user = getCurrentUser();
  const pseudo = user?.pseudo || "inconnu";

  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyBookBoxes, setNearbyBookBoxes] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [showBookBoxes, setShowBookBoxes] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedBookBox, setSelectedBookBox] = useState(null);
  const [showBookBoxDetails, setShowBookBoxDetails] = useState(false);
  const [suggestedCities, setSuggestedCities] = useState([]);

  useEffect(() => {
    fetchBookBoxes().then(setNearbyBookBoxes).catch(console.error);
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  const deg2rad = useCallback((deg) => deg * (Math.PI / 180), []);

  const getNearbyBookBoxes = useCallback((latitude, longitude) => {
    const bookBoxesWithDistance = BOOK_BOXES.map(box => {
      const distance = calculateDistance(latitude, longitude, box.latitude, box.longitude);
      return { ...box, distance };
    });

    return bookBoxesWithDistance.sort((a, b) => a.distance - b.distance);
  }, [calculateDistance]);

  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await axios.get("https://api-adresse.data.gouv.fr/reverse/", {
        params: {
          lat: latitude,
          lon: longitude,
        },
      });

      const features = response.data?.features;
      if (features && features.length > 0) {
        return features[0].properties.label;
      }

      return "Adresse non disponible";
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse :", error);
      return "Erreur lors de la récupération de l'adresse";
    }
  };

  const enhanceBookBoxWithAddress = async (bookBox) => {
    if (!bookBox.latitude || !bookBox.longitude) return bookBox;

    const address = await fetchAddressFromCoordinates(bookBox.latitude, bookBox.longitude);
    return { ...bookBox, address };
  };

  const handlePrepareInteraction = useCallback((action) => {
    if (!selectedBookBox) {
      alert("Veuillez sélectionner une boîte à livres.");
      return;
    }
    setPendingAction(action);
  }, [selectedBookBox]);

  const handleConfirmInteraction = useCallback(async () => {
    if (!pendingAction || !selectedBookBox) return;

    try {
      const response = await fetch("/api/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: book.id,
          action: pendingAction,
          location: selectedBookBox.address,
          pseudo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to confirm interaction");
      }

      setLocation("");
      setPendingAction(null);
      setSelectedBookBox(null);
      router.replace(router.asPath);
    } catch (error) {
      console.error("Error confirming interaction:", error);
      alert("Une erreur s'est produite lors de la confirmation de l'interaction.");
    }
  }, [pendingAction, selectedBookBox, book.id, pseudo, router]);

  const handleAddComment = useCallback(async () => {
    if (!comment.trim()) {
      alert("Ton commentaire est vide.");
      return;
    }

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: book.id,
          pseudo,
          message: comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add comment");
      }

      setComment("");
      router.replace(router.asPath);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Une erreur s'est produite lors de l'ajout du commentaire.");
    }
  }, [comment, book.id, pseudo, router]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par ton navigateur.");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setUserCoords({ latitude, longitude });
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

        try {
          const nearby = await fetchBookBoxes(latitude, longitude);
          const enhancedNearby = await Promise.all(nearby.map(enhanceBookBoxWithAddress));
          setNearbyBookBoxes(enhancedNearby);
          setShowBookBoxes(true);
        } catch (error) {
          console.error("Erreur lors de la récupération des boîtes à livres :", error);
          alert("Une erreur s'est produite lors de la récupération des boîtes à livres.");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        alert("Erreur de géolocalisation: " + error.message);
      }
    );
  }, []);

  const selectBookBox = useCallback((bookBox) => {
    setLocation(bookBox.address);
    setSelectedBookBox(bookBox);
    setShowBookBoxes(false);
  }, []);

  const viewBookBoxDetails = useCallback((bookBox) => {
    setSelectedBookBox(bookBox);
    setShowBookBoxDetails(true);
  }, []);

  const closeBookBoxDetails = useCallback(() => {
    setShowBookBoxDetails(false);
    setSelectedBookBox(null);
  }, []);

  const getMapUrl = useCallback((bookBox) => {
    return `https://www.google.com/maps/search/?api=1&query=${bookBox.latitude},${bookBox.longitude}`;
  }, []);

  const getOsmUrl = useCallback((bookBox) => {
    return `https://www.openstreetmap.org/?mlat=${bookBox.latitude}&mlon=${bookBox.longitude}#map=18/${bookBox.latitude}/${bookBox.longitude}`;
  }, []);

  const searchBookBoxes = async () => {
    if (!location.trim()) {
      alert("Veuillez entrer un lieu pour rechercher des boîtes à livres.");
      return;
    }

    try {
      const coords = await geocodeCity(location);
      if (!coords) {
        alert("Aucun résultat trouvé pour la ville spécifiée.");
        return;
      }

      const { latitude, longitude } = coords;
      const bookBoxes = await fetchBookBoxes(latitude, longitude);
      setNearbyBookBoxes(bookBoxes);
      setShowBookBoxes(true);
    } catch (error) {
      console.error("Error searching book boxes:", error);
      alert("Une erreur s'est produite lors de la recherche des boîtes à livres.");
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setLocation(query);

    if (query.trim().length < 3) {
      setSuggestedCities([]);
      return;
    }

    try {
      const response = await axios.get("https://api-adresse.data.gouv.fr/search/", {
        params: {
          q: query,
          limit: 5,
        },
      });

      const features = response.data?.features || [];
      const cities = features.map((feature) => ({
        name: feature.properties.name,
        city: feature.properties.city,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      }));

      setSuggestedCities(cities);
    } catch (error) {
      console.error("Erreur lors de la recherche des villes :", error);
      setSuggestedCities([]);
    }
  };

  const handleCitySelect = (city) => {
    setLocation(`${city.name}, ${city.city}`);
    setSuggestedCities([]);
  };

  if (!book) return <p>Livre introuvable.</p>;

  return (
    <div style={{ padding: 20 }}>
      <Header />
      <h1>{book.title}</h1>
      <p><strong>Auteur:</strong> {book.author}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Unique ID:</strong> {book.id}</p>

      <hr />

      <h2>Actions</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Nom de la ville (ex: Paris, Lyon, etc.)"
          value={location}
          onChange={handleSearchChange}
          style={{ marginRight: "10px", width: "250px" }}
        />
        {suggestedCities.length > 0 && (
          <ul style={{ listStyleType: "none", padding: 0, marginTop: "5px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fff" }}>
            {suggestedCities.map((city, index) => (
              <li
                key={index}
                onClick={() => handleCitySelect(city)}
                style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
              >
                {city.name}, {city.city}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={searchBookBoxes}
          style={{ marginRight: "10px", padding: "5px 10px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
        >
          🔍 Rechercher
        </button>
        <button
          onClick={handleGetLocation}
          disabled={isLoading}
          style={{ padding: "5px 10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "4px" }}
        >
          {isLoading ? "Localisation..." : "📍 Utiliser ma position"}
        </button>
      </div>

      {showBookBoxes && nearbyBookBoxes.length > 0 && (
        <div style={{ marginBottom: "15px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
          <h3>Boîtes à livres trouvées:</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {nearbyBookBoxes.map(box => (
              <li key={box.id} style={{
                marginBottom: "8px",
                padding: "12px",
                border: "1px solid #eee",
                borderRadius: "4px",
                backgroundColor: selectedBookBox?.id === box.id ? "#d1e7dd" : "#f9f9f9"
              }}>
                <strong>{box.name}</strong>
                {box.distance && <span> - {box.distance.toFixed(2)} km</span>}
                <p style={{ margin: "5px 0", fontSize: "0.9em" }}>{box.description}</p>
                <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#555" }}>{box.address}</p>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    onClick={() => selectBookBox(box)}
                    style={{
                      fontSize: "0.85em",
                      padding: "5px 10px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px"
                    }}
                  >
                    ✅ Sélectionner
                  </button>
                  <button
                    onClick={() => viewBookBoxDetails(box)}
                    style={{
                      fontSize: "0.85em",
                      padding: "5px 10px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px"
                    }}
                  >
                    🗺️ Voir sur la carte
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Book Box Details Modal */}
      {showBookBoxDetails && selectedBookBox && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h3 style={{ marginTop: 0 }}>{selectedBookBox.name}</h3>
            <p><strong>Description:</strong> {selectedBookBox.description}</p>
            <p><strong>Adresse:</strong> {selectedBookBox.address}</p>
            <p><strong>Coordonnées:</strong> {selectedBookBox.latitude}, {selectedBookBox.longitude}</p>

            <div style={{ marginTop: "15px" }}>
              <h4>Voir sur la carte:</h4>
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <a
                  href={getMapUrl(selectedBookBox)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    backgroundColor: "#4285F4",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px"
                  }}>
                  Google Maps
                </a>
                <a
                  href={getOsmUrl(selectedBookBox)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    backgroundColor: "#0066cc",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px"
                  }}>
                  OpenStreetMap
                </a>
                <button
                  onClick={closeBookBoxDetails}
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!pendingAction ? (
        <div>
          <button
            onClick={() => handlePrepareInteraction("pris")}
            style={{ marginRight: "10px" }}
            disabled={!selectedBookBox}
          >
            📖 Pris
          </button>
          <button
            onClick={() => handlePrepareInteraction("déposé")}
            disabled={!selectedBookBox}
          >
            📚 Déposé
          </button>
        </div>
      ) : (
        <div style={{
          marginTop: "15px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "5px",
          border: "1px solid #dee2e6"
        }}>
          <p>
            <strong>Confirmer l'action :</strong> {pendingAction === "pris" ? "Prendre" : "Déposer"} le livre à {selectedBookBox.address}
          </p>
          <button
            onClick={handleConfirmInteraction}
            style={{ marginRight: "10px" }}
          >
            ✅ Confirmer
          </button>
          <button
            onClick={() => setPendingAction(null)}
          >
            ❌ Annuler
          </button>
        </div>
      )}
      <h2>Historique</h2>
      {book.history.length === 0 ? (
        <p>Aucune interaction.</p>
      ) : (
        <ul>
          {book.history.map((h, i) => (
            <li key={i}>
              {h.date} – {h.pseudo} a {h.action} le livre à {h.location}
            </li>
          ))}
        </ul>
      )}

      <h2>Commentaires</h2>
      <br />

      {book.comments.length > 0 && (
        <ul>
          {book.comments.map((c, i) => (
            <li key={i}>
              <strong>{c.pseudo}</strong> ({c.date}) : {c.message}
            </li>
          ))}
        </ul>
      )}

      <h2>Laisser un commentaire</h2>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Écris ton commentaire ici..."
        style={{ width: "100%", height: "100px", marginBottom: "10px" }}
      ></textarea>
      <button
        onClick={handleAddComment}
        style={{ padding: "10px 20px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px" }}
      >
        Ajouter un commentaire
      </button>
    </div>
  )
};
