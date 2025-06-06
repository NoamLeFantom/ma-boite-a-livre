import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/session";
import styles from "@/styles/Header.module.scss";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="/" className={styles.logoLink}>
          <img src="/images/BooksTravellers.png" alt="Logo du site" className={styles.logo} />
        </a>
        <h1 style={{ fontSize: "1rem",zIndex:10 }}>Books Travellers</h1>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ""}`}>
          <div className={styles.navList}>
            <a href="/" className={styles.navLink}>Accueil</a>
            <a href="/search" className={styles.navLink}>Rechercher</a>
            {user ? (
              <>
                <a href="/profile" className={styles.navLink}>Profil</a>
                <button onClick={handleLogout} className={styles.navLink} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <a href="/login" className={styles.navLink}>Connexion</a>
            )}
          </div>
        </nav>
        <button className={styles.burger} onClick={toggleMenu}>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>
      </div>
    </header>
  );
}
