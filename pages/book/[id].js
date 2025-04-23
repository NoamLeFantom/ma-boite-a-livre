// pages/book/[id].js

import { useRouter } from "next/router";
import { getBookById, addInteraction, addComment } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { useState } from "react";

export default function BookPage() {
  const router = useRouter();
  const { id } = router.query;

  const book = getBookById(id);
  const user = getCurrentUser();
  const pseudo = user?.pseudo || "inconnu";

  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");

  if (!book) return <p>Livre introuvable.</p>;

  const handleInteraction = (action) => {
    if (!location) return alert("Spécifie un lieu.");
    addInteraction(id, { action, location, pseudo });
    setLocation("");
    router.replace(router.asPath); // force refresh
  };

  const handleAddComment = () => {
    if (!comment) return alert("Ton commentaire est vide.");
    addComment(id, { pseudo, message: comment });
    setComment("");
    router.replace(router.asPath);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>{book.title}</h1>
      <p><strong>Auteur:</strong> {book.author}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Unique ID:</strong> {book.id}</p>

      <hr />

      <h2>Actions</h2>
      <input
        type="text"
        placeholder="Lieu (ex: Paris)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button onClick={() => handleInteraction("pris")}>📖 Pris</button>
      <button onClick={() => handleInteraction("déposé")}>📚 Déposé</button>

      <hr />

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

      <hr />

      <h2>Commentaires</h2>
      <textarea
        placeholder="Ton message"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        cols={40}
      />
      <br />
      <button onClick={handleAddComment}>💬 Ajouter un commentaire</button>

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
  );
}
