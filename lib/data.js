// lib/data.js

import axios from 'axios';

const ADDRESS_API_URL = 'https://api-adresse.data.gouv.fr/search/';

/**
 * Fetches coordinates for a given city name using the French government address API.
 * @param {string} cityName - The name of the city to geocode.
 * @returns {Promise<{latitude: number, longitude: number} | null>} - The coordinates of the city or null if not found.
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

export let books = [
    {
      id: "9782070612758-0001",
      title: "Le Petit Prince",
      author: "Antoine de Saint-Exupéry",
      isbn: "9782070612758",
      history: [
        { location: "Paris", action: "déposé", date: "2024-01-12", pseudo: "Alice" },
        { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
      ],
      comments: [
        { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" },
        { pseudo: "Bob", message: "Merci pour ce partage 🙏", date: "2024-01-20" }
      ]
    },
    {
      id: "9782070612758-0002",
      title: "Le Petit Prince",
      author: "Antoine de Saint-Exupéry",
      isbn: "9782070612758",
      history: [
        { location: "Paris", action: "déposé", date: "2024-01-12", pseudo: "Alice" },
        { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
      ],
      comments: [
        { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" },
        { pseudo: "Bob", message: "Merci pour ce partage 🙏", date: "2024-01-20" }
      ]
    },
    {
        id: "9780394533056-0001",
        title: "L'Étranger",
        isbn: "9780394533056",
        author: "Albert Camus",
        history: [
          { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
        ],
        comments: [
          { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" }
        ]
      },
      {
        id: "9780394533056-0002",
        title: "L'Étranger",
        isbn: "9780394533056",
        author: "Albert Camus",
        history: [
          { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
        ],
        comments: [
          { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" }
        ]
      },
    {
      id: "9780451524935-0001",
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      history: [],
      comments: []
    },
    {
      id: "9780451524935-0002",
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      history: [],
      comments: []
    }
  ];
  
  // 📚 Fonctions de manipulation
  
  export function getBookById(id) {
    return books.find((book) => book.id === id) || null;
  }
  
  export function addInteraction(id, { action, location, pseudo }) {
    const book = getBookById(id);
    if (!book) return false;
  
    book.history.push({
      action,
      location,
      pseudo: pseudo || "inconnu",
      date: new Date().toISOString().split("T")[0]
    });
  
    return true;
  }
  
  export function addComment(id, { pseudo, message }) {
    const book = getBookById(id);
    if (!book) return false;
  
    book.comments.push({
      pseudo: pseudo || "inconnu",
      message,
      date: new Date().toISOString().split("T")[0]
    });
  
    return true;
  }
  
  export function getAllBooks() {
    return books;
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
