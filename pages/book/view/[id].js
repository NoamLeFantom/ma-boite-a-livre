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
  const user = getCurrentUser(context.req);

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
      initialUser: user || null,
    },
  };
}

export default function BookPage({ book, initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const pseudo = user?.username || "inconnu";

  useEffect(() => {
    if (!initialUser) {
      setUser(getCurrentUser());
    }
  }, [initialUser]);

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
    console.log("Pseudo sent for interaction:", pseudo);
    if (!pendingAction || !selectedBookBox) return;

    try {
      const response = await fetch("/api/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
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
    console.log("Pseudo sent for comment:", pseudo);
    if (!comment.trim()) {
      alert("Ton commentaire est vide.");
      return;
    }

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
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
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLoading(true);

    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      if (permissionStatus.state === 'denied') {
        alert("La géolocalisation est désactivée. Veuillez l'activer dans les paramètres de votre navigateur.");
        setIsLoading(false);
        return;
      }

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
          alert("Erreur de géolocalisation : " + error.message);
        }
      );
    });
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
      const enhancedBookBoxes = await Promise.all(bookBoxes.map(enhanceBookBoxWithAddress));
      setNearbyBookBoxes(enhancedBookBoxes);
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
    <div style={{ padding: 0 }}>
      <Header />
      <div className="GlobalPage">
      <h1>{book.title}</h1>
      <p><strong>Auteur:</strong> {book.author}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Unique ID:</strong> {book.id}</p>

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
    </div>
    </div>
  )
};
