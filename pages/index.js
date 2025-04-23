import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import { getLastInteractions } from "@/lib/books";


export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <Link href="/search">🔎 Rechercher un livre</Link>

      <h1>Bienvenue dans la BiblioLibre 📚</h1>

      {user ? (
        <>
          <p>Connecté en tant que : <strong>{user.pseudo}</strong></p>
          <button onClick={handleLogout}>Se déconnecter</button>
        </>
      ) : (
        <>
          <p>Tu n'es pas connecté.</p>
          <Link href="/login"><button>Se connecter</button></Link>
          <br /><br />
          <Link href="/signup"><button>Créer un compte</button></Link>
          <hr style={{ margin: "30px 0" }} />

          <h2>📖 Dernières interactions</h2>
          <ul>
            {getLastInteractions().map((entry, index) => (
              <li key={index}>
                <Link href={`/book/view/${entry.id}`}>
                  <strong>{entry.title}</strong>
                </Link>{" "}
                — par <em>{entry.pseudo}</em> le{" "}
                {entry.date.toLocaleDateString()}
              </li>
            ))}
          </ul>

        </>

      )}
    </div>
  );
}
