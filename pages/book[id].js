// pages/book/[id].js

import { useRouter } from "next/router";
import { getCurrentUser } from "@/lib/session";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { getBookById } from "@/lib/data";

export async function getServerSideProps(context) {
  const { id } = context.params;
  const book = await getBookById(id);

  if (!book) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      book,
    },
  };
}

// More realistic mock data for book boxes
const BOOK_BOXES = [
    {
        id: "1",
        name: "Boîte à livres - Parc Central",
        description: "Située près de l'entrée principale du parc",
        address: "123 Avenue du Parc, 75001 Paris",
        latitude: 48.8566,
        longitude: 2.3522
    },
    {
        id: "2",
        name: "Boîte à livres - Place du Marché",
        description: "À côté du kiosque à journaux",
        address: "45 Place du Marché, 75002 Paris",
        latitude: 48.8606,
        longitude: 2.3376
    },
    {
        id: "3",
        name: "Boîte à livres - Bibliothèque Municipale",
        description: "Devant l'entrée de la bibliothèque",
        address: "78 Rue des Livres, 75003 Paris",
        latitude: 48.8496,
        longitude: 2.3395
    },
    {
        id: "4",
        name: "Boîte à livres - Jardin Public",
        description: "Près de l'aire de jeux pour enfants",
        address: "15 Rue du Jardin, 75004 Paris",
        latitude: 48.8550,
        longitude: 2.3450
    },
    {
        id: "5",
        name: "Boîte à livres - Café Littéraire",
        description: "À l'extérieur du café",
        address: "32 Boulevard des Arts, 75005 Paris",
        latitude: 48.8580,
        longitude: 2.3400
    },
    {
        id: "6",
        name: "Boîte à livres - Gare Centrale",
        description: "Hall principal de la gare",
        address: "1 Place de la Gare, 69001 Lyon",
        latitude: 45.7600,
        longitude: 4.8590
    },
    {
        id: "7",
        name: "Boîte à livres - Place Bellecour",
        description: "Coin nord-est de la place",
        address: "Place Bellecour, 69002 Lyon",
        latitude: 45.7580,
        longitude: 4.8320
    },
    {
        id: "8",
        name: "Boîte à livres - Vieux Lyon",
        description: "Près de la fontaine historique",
        address: "25 Rue Saint-Jean, 69005 Lyon",
        latitude: 45.7620,
        longitude: 4.8270
    }
];

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

    if (!book) return <p>Livre introuvable.</p>;

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Search for book boxes by location name
    const searchBookBoxes = () => {
        if (!location.trim()) {
            alert("Veuillez entrer un lieu pour rechercher des boîtes à livres.");
            return;
        }

        // Simple mock implementation - in a real app, you would call an API
        const mockNearbyBoxes = [
            {
                id: "1",
                name: `Boîte à livres près de ${location}`,
                description: "Boîte communautaire",
                address: `${location}, Centre-ville`,
                distance: 0.5
            },
            {
                id: "2",
                name: `Boîte à livres - Bibliothèque de ${location}`,
                description: "Située devant la bibliothèque municipale",
                address: `${location}, Rue des Livres`,
                distance: 1.2
            }
        ];

        setNearbyBookBoxes(mockNearbyBoxes);
        setShowBookBoxes(true);
    };

    const getNearbyBookBoxes = (latitude, longitude) => {
        // Calculate distance for each book box and sort by proximity
        const bookBoxesWithDistance = BOOK_BOXES.map(box => {
            const distance = calculateDistance(latitude, longitude, box.latitude, box.longitude);
            return {
                ...box,
                distance
            };
        });

        // Sort by distance
        return bookBoxesWithDistance.sort((a, b) => a.distance - b.distance);
    };

    const handlePrepareInteraction = (action) => {
        if (!location) {
            return alert("Spécifie un lieu.");
        }
        setPendingAction(action);
    };

    const handleConfirmInteraction = () => {
        if (!pendingAction || !location) return;

        addInteraction(book.id, {
            action: pendingAction,
            location,
            pseudo
        });

        setLocation("");
        setPendingAction(null);
        router.replace(router.asPath); // force refresh
    };

    const handleCancelInteraction = () => {
        setPendingAction(null);
    };

    const handleAddComment = () => {
        if (!comment) return alert("Ton commentaire est vide.");
        addComment(book.id, { pseudo, message: comment });
        setComment("");
        router.replace(router.asPath);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            return alert("La géolocalisation n'est pas supportée par ton navigateur.");
        }

        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Store coordinates for later use
                setUserCoords({ latitude, longitude });

                // Set location string
                const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                setLocation(locationString);

                // Get nearby book boxes
                const nearby = getNearbyBookBoxes(latitude, longitude);
                setNearbyBookBoxes(nearby);
                setShowBookBoxes(true);
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Tu as refusé l'accès à ta position.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Les informations de position ne sont pas disponibles.");
                        break;
                    case error.TIMEOUT:
                        alert("La demande de géolocalisation a expiré.");
                        break;
                    default:
                        alert("Une erreur inconnue s'est produite.");
                        break;
                }
            }
        );
    };

    const selectBookBox = (bookBox) => {
        setLocation(bookBox.address);
        setShowBookBoxes(false);
    };

    const viewBookBoxDetails = (bookBox) => {
        setSelectedBookBox(bookBox);
        setShowBookBoxDetails(true);
    };

    const closeBookBoxDetails = () => {
        setShowBookBoxDetails(false);
        setSelectedBookBox(null);
    };

    // Generate a Google Maps URL for the book box
    const getMapUrl = (bookBox) => {
        return `https://www.google.com/maps/search/?api=1&query=${bookBox.latitude},${bookBox.longitude}`;
    };

    // Generate an OpenStreetMap URL for the book box
    const getOsmUrl = (bookBox) => {
        return `https://www.openstreetmap.org/?mlat=${bookBox.latitude}&mlon=${bookBox.longitude}#map=18/${bookBox.latitude}/${bookBox.longitude}`;
    };

    return (
        <div style={{ padding: 20 }}>
            <Header />
            <h1>{book.title}</h1>
            <p><strong>Auteur:</strong> {book.author}</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Unique ID:</strong> {book.id}</p>

            <hr />

            <h2>Actions</h2>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Lieu (ex: Paris, Lyon, etc.)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ marginRight: '10px', width: '250px' }}
                />
                <button
                    onClick={searchBookBoxes}
                    style={{ marginRight: '10px' }}
                >
                    🔍 Rechercher
                </button>
                <button
                    onClick={searchBookBoxes}
                    disabled={isLoading || !location.trim()}
                    style={{ marginRight: '10px' }}
                >
                    🔍 Rechercher
                </button>
                <button
                    onClick={handleGetLocation}
                    disabled={isLoading}
                    style={{ marginRight: '10px' }}
                >
                    {isLoading ? 'Localisation...' : '📍 Utiliser ma position'}
                </button>
            </div>

            {showBookBoxes && nearbyBookBoxes.length > 0 && (
                <div style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                    <h3>Boîtes à livres trouvées:</h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {nearbyBookBoxes.map(box => (
                            <li key={box.id} style={{
                                marginBottom: '8px',
                                padding: '12px',
                                border: '1px solid #eee',
                                borderRadius: '4px',
                                backgroundColor: '#f9f9f9'
                            }}>
                                <strong>{box.name}</strong>
                                {box.distance && <span> - {box.distance.toFixed(2)} km</span>}
                                <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{box.description}</p>
                                <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#555' }}>{box.address}</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                        onClick={() => selectBookBox(box)}
                                        style={{
                                            fontSize: '0.85em',
                                            padding: '5px 10px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        ✅ Sélectionner
                                    </button>
                                    <button
                                        onClick={() => viewBookBoxDetails(box)}
                                        style={{
                                            fontSize: '0.85em',
                                            padding: '5px 10px',
                                            backgroundColor: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        🗺️ Voir sur la carte
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: '10px' }}>
                        <a
                            href="https://umap.openstreetmap.fr/en/map/boites-a-livres_237163"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.9em', color: '#0066cc' }}
                        >
                            Voir toutes les boîtes sur la carte complète
                        </a>
                    </div>
                </div>
            )}

            {/* Book Box Details Modal */}
            {showBookBoxDetails && selectedBookBox && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginTop: 0 }}>{selectedBookBox.name}</h3>
                        <p><strong>Description:</strong> {selectedBookBox.description}</p>
                        <p><strong>Adresse:</strong> {selectedBookBox.address}</p>
                        <p><strong>Coordonnées:</strong> {selectedBookBox.latitude}, {selectedBookBox.longitude}</p>

                        <div style={{ marginTop: '15px' }}>
                            <h4>Voir sur la carte:</h4>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <a
                                    href={getMapUrl(selectedBookBox)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-block',
                                        padding: '8px 12px',
                                        backgrouzndColor: '#4285F4',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '4px'
                                    }}>
                                    Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {!pendingAction ? (
                <div>
                    <button
                        onClick={() => handlePrepareInteraction("pris")}
                        style={{ marginRight: '10px' }}
                        disabled={!location}
                    >
                        📖 Pris
                    </button>
                    <button
                        onClick={() => handlePrepareInteraction("déposé")}
                        disabled={!location}
                    >
                        📚 Déposé
                    </button>
                </div>
            ) : (
                <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px',
                    border: '1px solid #dee2e6'
                }}>
                    <p>
                        <strong>Confirmer l'action :</strong> {pendingAction === "pris" ? "Prendre" : "Déposer"} le livre à {location}
                    </p>
                    <button
                        onClick={handleConfirmInteraction}
                        style={{ marginRight: '10px' }}
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
        </div>
    )
};
