import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [exactMatch, setExactMatch] = useState(null);
  const [isbnMatches, setIsbnMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setExactMatch(null);
    setIsbnMatches([]);

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(trimmedQuery)}`);
      const results = await response.json();

      if (!Array.isArray(results)) {
        console.error("Résultat inattendu :", results);
        return;
      }

      // Match exact sur l'ID
      const match = results.find((book) => book.id?.toLowerCase() === trimmedQuery.toLowerCase());
      setExactMatch(match || null);

      if (match) {
        // Autres exemplaires du même livre (par racine ISBN)
        const isbnPart = match.id.split("-")[0];
        const related = results.filter((b) => b.id.startsWith(isbnPart));
        setIsbnMatches(related);
      } else {
        setIsbnMatches(results); // Affiche tous les résultats trouvés
      }

    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
    } finally {
      setLoading(false);
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
          {loading ? "Recherche..." : "Rechercher"}
        </button>
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

        {isbnMatches.length === 0 && query && !loading && (
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

      <div className="mt-6">
        <a href="/scan" className="text-blue-600 underline">📷 Scanner un QR Code</a>
      </div>
    </div>
  );
}
