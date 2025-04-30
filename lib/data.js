// lib/data.js

import axios from 'axios';

// Vérifie si le code s'exécute côté serveur avant d'importer clientPromise
if (typeof window === 'undefined') {
  var clientPromise = require('./mongodb').default;
}

const ADDRESS_API_URL = 'https://api-adresse.data.gouv.fr/search/';

/**
 * Fetches coordinates for a given city name using the French government address API.
 * @param {string} cityName - The name of the city to geocode.
 * @returns {Promise<{latitude: number, longitude} | null>} - The coordinates of the city or null if not found.
 */
export async function geocodeCity(cityName) {
  try {
    const response = await axios.get(ADDRESS_API_URL, {
      params: {
        q: cityName,
        limit: 1
      },
    });

    const features = response.data?.features;
    if (features && features.length > 0) {
      const { geometry } = features[0];
      return {
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0]
      };
    }

    console.error('No results found for city:', cityName);
    return null;
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}

/**
 * Fetches book box data from the Overpass API.
 * @param {number} latitude - Latitude for the query.
 * @param {number} longitude - Longitude for the query.
 * @returns {Promise<Array>} A promise that resolves to an array of book box objects.
 */
export async function fetchBookBoxes(latitude, longitude) {
  try {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json];
      node["amenity"="public_bookcase"](around:5000,${latitude},${longitude});
      out body;
    `;

    const response = await axios.post(overpassUrl, query, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const features = response.data?.elements;
    if (!Array.isArray(features)) {
      console.error('Invalid data format: `elements` is not an array');
      return [];
    }

    const bookBoxes = features.map(feature => ({
      id: feature.id,
      name: feature.tags?.name || 'Unknown',
      description: feature.tags?.description || 'No description available',
      address: feature.tags?.address || 'No address available',
      latitude: feature.lat,
      longitude: feature.lon
    }));

    return bookBoxes;
  } catch (error) {
    console.error('Error fetching book boxes:', error);
    return [];
  }
}

export async function getBookById(id) {
  const client = await clientPromise;
  const db = client.db("BookTraveller");
  return await db.collection("BookData").findOne({ id });
}

export async function addInteraction(id, { action, location, pseudo }) {
  console.log("Attempting to connect to MongoDB...");
  const db = await getDb(); // Utilise directement l'objet retourné par getDb

  const result = await db.collection("BookData").updateOne(
    { id },
    {
      $push: {
        history: {
          action,
          location,
          pseudo: pseudo || "inconnu",
          date: new Date().toISOString().split("T")[0],
        },
      },
    }
  );
  return result.modifiedCount > 0;
}

export async function addComment(id, { pseudo, message }) {
  console.log("Attempting to connect to MongoDB in addComment...");
  const client = await clientPromise;
  console.log("MongoDB client resolved in addComment:", client);

  const db = client.db("BookTraveller");
  console.log("Connected to database in addComment");

  const result = await db.collection("BookData").updateOne(
    { id },
    {
      $push: {
        comments: {
          pseudo: pseudo || "inconnu",
          message,
          date: new Date().toISOString().split("T")[0],
        },
      },
    }
  );
  return result.modifiedCount > 0;
}

export async function getAllBooks() {
  if (typeof window !== 'undefined') {
    throw new Error("getAllBooks ne peut pas être appelé côté client.");
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    return await db.collection("books").find({}).toArray();
  } catch (error) {
    console.error("Failed to fetch books:", error);
    return [];
  }
}
