import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [exactMatch, setExactMatch] = useState(null);
  const [isbnMatches, setIsbnMatches] = useState([]);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/search");
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setBooks(data);
      setExactMatch(null);
      setIsbnMatches(data);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <div className="p-4">
      <Header />
      <h1 className="text-xl font-bold mb-2">🔎 Rechercher un livre</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Ex : isbn-0002 ou Candide"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Rechercher
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-500">Livres chargés : {books.length}</p>
      </div>

      {exactMatch && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold">📘 Livre exact trouvé</h2>
          <Link href={`/book/${exactMatch.id}`}>
            <div className="border p-2 rounded mt-2 cursor-pointer">
              <strong>{exactMatch.title}</strong> — ID : {exactMatch.id}
            </div>
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold">
          📚 {exactMatch ? "Autres exemplaires du même livre" : "Résultats"}
        </h2>

        {isbnMatches.length === 0 && query && (
          <p className="text-gray-500">Aucun résultat trouvé.</p>
        )}

        <ul className="mt-2 space-y-2">
          {isbnMatches.map((book) => (
            <li key={book.id} className="border p-2 rounded">
              <Link href={`/book/${book.id}`}>
                <strong>{book.title}</strong> — ID : {book.id}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <a href="/scan">scan qr code</a>
    </div>
  );
}
