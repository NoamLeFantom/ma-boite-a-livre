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
    <div>
      <Header />
      <div className="GlobalPage">
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            background: "var(--glass-bg)",
            boxShadow: "var(--glass-shadow)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1.5px solid var(--glass-border)",
            borderRadius: "18px",
            padding: "32px 24px",
            marginTop: "40px"
          }}
        >
          <h1 style={{ fontWeight: "bold", marginBottom: 20 }}>🔎 Rechercher un livre</h1>
          <div style={{ marginBottom: 24, display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Ex : isbn-0002 ou Candide"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                border: "1px solid var(--glass-border)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: "1rem",
                background: "rgba(255,255,255,0.5)",
                color: "var(--foreground)"
              }}
            />
            <button onClick={handleSearch}>
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>

          {exactMatch && (
            <div style={{
              background: "var(--glass-hover-bg)",
              border: "1.5px solid var(--primary)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24
            }}>
              <h2 style={{ fontWeight: 600 }}>📘 Livre exact trouvé</h2>
              <Link href={`/book/${exactMatch.id}`}>
                <div style={{ cursor: "pointer", marginTop: 8 }}>
                  <strong>{exactMatch.title}</strong> — ID : {exactMatch.id}
                </div>
              </Link>
            </div>
          )}

          <div>
            <h2 style={{ fontWeight: 600 }}>
              📚 {exactMatch ? "Autres exemplaires du même livre" : "Résultats"}
            </h2>

            {isbnMatches.length === 0 && query && !loading && (
              <p style={{ color: "#888", marginTop: 8 }}>Aucun résultat trouvé.</p>
            )}

            <ul style={{ marginTop: 12, listStyle: "none", padding: 0 }}>
              {isbnMatches.map((book) => (
                <li
                  key={book.id}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 10,
                    marginBottom: 10,
                    padding: "10px 14px"
                  }}
                >
                  <Link href={`/book/${book.id}`}>
                    <strong>{book.title}</strong> — ID : {book.id}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 32 }}>
            <Link href="/scan" style={{ color: "var(--primary)", textDecoration: "underline" }}>
              📷 Scanner un QR Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
