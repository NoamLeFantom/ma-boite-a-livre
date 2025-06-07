import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import Header from "@/components/Header";

export async function getServerSideProps(context) {
  const user = getCurrentUser(context.req);

  return {
    props: {
      initialUser: user || null,
    },
  };
}

export default function Home({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [interactions, setInteractions] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookImages, setBookImages] = useState({});

  useEffect(() => {
    if (!initialUser) {
      setUser(getCurrentUser());
    }
  }, [initialUser]);

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
        setInteractions(data);
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


  return (
    <div style={{ padding: 0 }}>
      <Header />
      <div className="GlobalPage">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ marginBottom: "20px", fontSize: "larger" }}>Bienvenue sur Books <strong style={{ color: "#0070f3" }}>Travellers</strong></h1>
          <p style={{ marginBottom: "20px", textAlign: "center", fontSize: "1rem" }}>
            Une nouvelle histoire s'écrit !<br />
            Déjà <strong style={{ color: "#0070f3" }}>{books.length}</strong> livres qui voyagent !<br />
            Commence dès maintenant !
          </p>
          <Link href="/scan"><button>Scaner le QR code du livre</button></Link>
          {user ? (
            <>
              <p style={{ marginBottom: "20px" }}>Heureux de te voir <strong style={{ color: "#0070f3" }}>{user.username}</strong></p>
            </>
          ) : (
            <>
              <Link href="/signup"><button>Rejoindre l'aventure</button></Link>
            </>
          )}

        </div>
        <h2 style={{marginBottom:"15px"}}>Livres le plus commentés :</h2>
        <ul className="containerBookCard">
          {[...books]
            .sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
            .slice(0, 1) // top 5
            .map((book, index) => (
              <li key={index} className="bookCard">
                <Link style={{marginBottom:"10px"}} href={`/book/view/${book.id}`}><strong>{book.title}</strong></Link>

                <div className="bookCardDesc">
                  <img className="commentaire_img"
                    src={bookImages[book.isbn] || "/images/BooksTravellers.png"}
                    alt={`Couverture de ${book.title}`}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                  <p style={{marginBottom:"10px"}}>{book.comments?.length || 0} commentaire(s)</p>
                  {book.comments.length > 0 && (
                    <div>
                      {(() => {
                        const lastComment = book.comments[book.comments.length - 1];
                        const truncate = (text, maxLength) =>
                          text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

                        return (
                          <div>
                            <p style={{marginBottom:"5px"}}>
                              Commentaire le plus récent :</p>
                              <p>
                              <strong>{lastComment.pseudo}</strong><br/><span className="commentaire">{truncate(lastComment.message, 30)}</span><br/>
                              <span className="commentaire_data" style={{fontSize:"10px"}}>{lastComment.date}</span>
                            </p>
                            <Link href={`/book/view/${book.id}`}>
                              Voir le livre
                            </Link>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                </div>
              </li>
            ))}

        </ul>



        <h2 style={{marginBottom:"20px"}}>📖 Dernières interactions</h2>
        <ul className="containerBookCard">
          {interactions.map((entry, index) => {
            const lastInteraction = entry.history?.length
              ? [...entry.history].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              : null;

            return (
              <li key={index} className="bookCard">
                <img
                  className="commentaire_img"
                  src={
                    bookImages[entry.isbn]
                      ? bookImages[entry.isbn]
                      : "/images/BooksTravellers.png"
                  }
                  alt={`Couverture de ${entry.title}`}
                />
                <div>
                  <Link href={`/book/view/${entry.id}`}>
                    <strong>{entry.title}</strong>
                  </Link>
                  <p>{entry.isbn}</p>
                  {lastInteraction ? (
                    <>
                      — par <em>{lastInteraction.pseudo}</em> le{" "}
                      {new Date(lastInteraction.date).toLocaleDateString()}
                    </>
                  ) : (
                    "— Aucune interaction"
                  )}
                </div>
              </li>
            );
          })}

        </ul>
      </div>
    </div>
  );
}
