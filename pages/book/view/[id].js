// pages/book/[id].js

import { useRouter } from "next/router";
import { getBookById } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { useState } from "react";

import Header from "@/components/Header";

export default function BookPage() {
  const router = useRouter();
  const { id } = router.query;

  const book = getBookById(id);
  const user = getCurrentUser();


  if (!book) return <p>Livre introuvable.</p>;

  return (
    <div style={{ padding: 20 }}>
      <Header/>
      <h1>{book.title}</h1>
      <p><strong>Auteur:</strong> {book.author}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p><strong>Unique ID:</strong> {book.id}</p>

      <hr />

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
  );
}
