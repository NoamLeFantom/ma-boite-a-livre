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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <Header />
      <div className="GlobalPage">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{marginBottom:"20px"}}>Bienvenue sur Books Travellers</h1>
          {user ? (
            <>
              <p>Heureux de te voir <strong>{user.username}</strong></p>
            </>
          ) : (
            <>
              <Link href="/signup"><button>Rejoindre l'aventure</button></Link>
            </>
          )}
        </div>

        <h2>📖 Dernières interactions</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {interactions.map((entry, index) => (
            <li key={index} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <img
                src={
                  bookImages[entry.isbn]
                    ? bookImages[entry.isbn]
                    : "/images/BooksTravellers.png"
                }
                alt={`Couverture de ${entry.title}`}
                style={{
                  width: "50px",
                  height: "75px",
                  objectFit: "cover",
                  marginRight: "10px",
                  backgroundColor: "#eee",
                }}
              />
              <div>
                <Link href={`/book/view/${entry.id}`}>
                  <strong>{entry.title}</strong>
                </Link>
                <p>{entry.isbn}</p>
                — par <em>{entry.pseudo}</em> le{" "}
                {entry.date ? new Date(entry.date).toLocaleDateString() : "Date inconnue"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
