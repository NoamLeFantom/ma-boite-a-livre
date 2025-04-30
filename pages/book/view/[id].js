// pages/book/[id].js

import { getBookById } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

import Header from "@/components/Header";

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

export default function BookPage({ book }) {
  const user = getCurrentUser();

  return (
    <div style={{ padding: 20 }}>
      <Header />
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
