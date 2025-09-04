import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"


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
        <div className="BlocContent">
          <h1 className="BlocContentText" style={{ marginBottom: "20px", textAlign:"left"}}>Trouve le livre qui te fera <strong style={{ color: "#0070f3" }}>Voyager</strong> proche de chez toi !</h1>
          </div>
          <div><p style={{ marginBottom: "10px", textAlign: "center", fontSize: "1rem" }}>
            Une nouvelle histoire s'écrit !</p>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"center", alignItems:"center",maxWidth:"280px", gap:"15px"}}><span style={{fontSize:"5rem"}}><strong style={{ color: "#0070f3" }}>{books.length}</strong></span><span style={{fontSize:"xx-large", textAlign:"left"}}>livres qui voyagent déjà !</span></div>
</div>
          
          <p>Une enquête est en cours, répondez au questionnaire</p>
          <Link href="https://sphinx-campus.com/tiny/a/gcgqy3y9" passHref target="_blank" rel="noopener noreferrer"><button>Répondre au questionnaire</button></Link>
        
        <h2 style={{ marginBottom: "15px" }}>Livres le plus commentés :</h2>
        <ul className="containerBookCard">
          {[...books]
            .sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
            .slice(0, 1) // top 5
            .map((book, index) => (
              <li key={index} className="bookCard">
                <Link style={{ marginBottom: "10px" }} href={`/book/view/${book.id}`}><strong>{book.title}</strong></Link>

                <div className="bookCardDesc">
                  <img className="commentaire_img"
                    src={bookImages[book.isbn] || "/images/BooksTravellers.png"}
                    alt={`Couverture de ${book.title}`}
                  />
                  <div cl style={{ display: "flex", flexDirection: "column" }}>
                    <p style={{ marginBottom: "10px" }}>{book.comments?.length || 0} commentaire(s)</p>
                    {book.comments.length > 0 && (
                      <div>
                        {(() => {
                          const lastComment = book.comments[book.comments.length - 1];
                          const truncate = (text, maxLength) =>
                            text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

                          return (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <div className="history-item">
                                <p>Dernier commentaire :</p>
                                <p style={{ fontWeight: 600, color: "var(--primary)" }}>{lastComment.pseudo}</p>
                                <p style={{ fontSize: "0.95em", opacity: 0.7, marginBottom: 4 }}>{lastComment.date}</p>
                                <p style={{ fontSize: "1.05em" }}>{truncate(lastComment.message, 30)}</p>
                              </div>
                              <Link style={{ alignSelf: "self-end" }} href={`/book/view/${book.id}`}>
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

<Link href="/scan"><button>Scaner le QR code du livre</button></Link>
          {user ? (
            <>
              <p style={{ marginBottom: "20px" }}>Heureux de te voir <strong style={{ color: "#0070f3" }}>{user.username}</strong></p>
            </>
          ) : (
            <>
              Commence dès maintenant !
              <Link href="/signup"><button>Rejoindre l'aventure</button></Link>
            </>
          )}

        <h2 style={{ marginBottom: "20px" }}>Dernières interactions</h2>
        <ul className="containerBookCard">
          {interactions.map((entry, index) => {
            const lastInteraction = entry.history?.length
              ? [...entry.history].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              : null;

            return (
              <li key={index} className="bookCard">
                <Link style={{ marginBottom: "10px" }} href={`/book/view/${entry.id}`}>
                  <strong>{entry.title}</strong>
                </Link>
                <div className="bookCardDesc">
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
                </div>
              </li>
            );
          })}

        </ul>
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
