import { useState } from "react";
import Link from "next/link";
import { books } from "@/lib/data";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [exactMatch, setExactMatch] = useState(null);
  const [isbnMatches, setIsbnMatches] = useState([]);

  const handleSearch = () => {
    const q = query.toLowerCase().trim();

    // Cherche une correspondance exacte avec un identifiant unique
    const match = books.find((book) => book.id.toLowerCase() === q);
    setExactMatch(match || null);

    // Si match trouvé, extraire l’ISBN (avant le "-")
    if (match) {
      const isbnPart = match.id.split("-")[0];
      const related = books.filter((b) => b.id.startsWith(isbnPart));
      setIsbnMatches(related);
    } else {
      // Sinon, chercher tous les livres contenant ce texte dans le titre
      const matches = books.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.title.toLowerCase().includes(q)
      );
      setIsbnMatches(matches);
    }
  };

  return (
    <div className="p-4">
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
    </div>
  );
}
