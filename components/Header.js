import { useState } from "react";
import styles from "@/styles/Header.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Ma Boîte à Livre</div>
      <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ""}`}>
        <a href="/" className={styles.navLink}>Accueil</a>
        <a href="/search" className={styles.navLink}>Rechercher</a>
        <a href="/login" className={styles.navLink}>Connexion</a>
      </nav>
      <button className={styles.burger} onClick={toggleMenu}>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
      </button>
    </header>
  );
}
