// pages/book/[id].js
import { useRouter } from "next/router";
import { getBookById, addInteraction, addComment, fetchBookBoxes, geocodeCity } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import axios from "axios";

import Link from "next/link";
import Image from "next/image";


import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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

  const [books, setBooks] = useState([]);
  const [bookImages, setBookImages] = useState({});

  useEffect(() => {
    if (!initialUser) {
      setUser(getCurrentUser());
    }
  }, [initialUser]);


  const [comment, setComment] = useState("");


  useEffect(() => {
    async function fetchInteractions() {
      try {
        const response = await fetch("/api/books", {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setBooks(data); // car tu récupères les livres ici
      } catch (error) {
        console.error("Error fetching interactions:", error);
      }
    }

    fetchInteractions();
  }, []);

  useEffect(() => {
    const fetchBookImages = async () => {
      const images = {};

      await Promise.all(
        books.map(async (book) => {
          if (!book.isbn || typeof book.isbn !== "string") return;

          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`
            );
            const data = await response.json();
            const thumbnail =
              data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || null;

            images[book.isbn] = thumbnail;
          } catch (error) {
            console.error(
              `Erreur lors de la récupération de l'image pour ISBN ${book.isbn}:`,
              error
            );
            images[book.isbn] = null;
          }
        })
      );

      setBookImages(images);
    };

    if (books.length > 0) {
      fetchBookImages();
    }
  }, [books]);

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


  if (!book) return <p>Livre introuvable.</p>;

  return (
    <div>
      <Header />
      <div className="GlobalPage">
        <h1>{book.title}</h1>
        <p><strong>Auteur:</strong> {book.author}</p>
        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Unique ID:</strong> {book.id}</p>
        <div className="bookPage">
          <Image
          className=""
          style={{width:"100%", height:"auto",maxWidth:"280px"}}
          src={bookImages[book.isbn] || "/images/BooksTravellers.png"}
          alt={`Couverture de ${book.title}`}
          width={150}
          height={200}
        />
        <p>{book.description}</p>
        </div>
        <h2>Historique</h2>
        {book.history.length === 0 ? (
          <div className="history-block" style={{ color: "#888" }}>
            Aucune interaction.
          </div>
        ) : (
          <ul className="history-block">
            {book.history.map((h, i) => (
              <li className="history-item" key={i}>
                <span style={{ fontWeight: 600, color: "var(--primary)" }}>{h.pseudo}</span>
                <span style={{ fontSize: "0.95em", opacity: 0.7 }}>{h.date}</span>
                <span style={{ fontSize: "1.05em" }}>
                  a {h.action} le livre à <span style={{ fontWeight: 500 }}>{h.location}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <h2>Commentaires</h2>
        <div className="history-block" style={{ padding: 0, marginBottom: 24 }}>
          {book.comments.length === 0 ? (
            <p style={{ padding: "16px", color: "#888" }}>Aucun commentaire pour ce livre.</p>
          ) : (
            <ul className="comment-list">
              {book.comments.map((c, i) => (
                <li className="history-item" key={i}>
                  <div style={{ fontWeight: 600, color: "var(--primary)" }}>{c.pseudo}</div>
                  <div style={{ fontSize: "0.95em", opacity: 0.7, marginBottom: 4 }}>{c.date}</div>
                  <div style={{ fontSize: "1.05em" }}>{c.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <h2>Laisser un commentaire</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddComment();
          }}
          className="history-block"
          style={{display: "flex", flexDirection: "column"}}
        >
          <textarea
            className="bookCard"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Écris ton commentaire ici..."
            rows={4}
            style={{ marginBottom: 8, width:"-webkit-fill-available"}}
          />
          <button type="submit" style={{ alignSelf: "flex-end", marginBottom: 0 }}>
            Ajouter un commentaire
          </button>
        </form>


      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  )
};
