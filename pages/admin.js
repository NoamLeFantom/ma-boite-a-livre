import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getCurrentUser } from "@/lib/session"; // Assurez-vous que c'est une exportation nommée
import Header from "@/components/Header"; // Assurez-vous que c'est une exportation par défaut
import QRCodeGenerator from "@/components/QRCodeGenerator";
import styles from "@/styles/admin.module.scss";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    description :"",
    history: [], // S'attend à un tableau
    comments: [], // S'attend à un tableau
    literaryMovement: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showQR, setShowQR] = useState({});
  const [editBookId, setEditBookId] = useState(null);
  const [editBookData, setEditBookData] = useState({});

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.includes(searchQuery)
  );

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = getCurrentUser(); // Vérifie que getCurrentUser retourne un objet avec un rôle
      if (!currentUser || currentUser.role !== "admin") {
        alert("Accès refusé : Vous devez être administrateur.");
        router.push("/");
      } else {
        setUser(currentUser);
      }
    };

    fetchUser();
  }, [router]); // Dépendance à router pour s'assurer de la redirection si nécessaire

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books", { credentials: "include" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des livres :", error);
      }
    };

    fetchBooks();
  }, []); // Exécuté une seule fois au montage pour charger les livres

  const handleAddBook = async () => {
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // S'assure que history et comments sont bien des tableaux pour l'envoi
        body: JSON.stringify({
          ...newBook,
          history: Array.isArray(newBook.history) ? newBook.history : newBook.history.split(',').map(s => s.trim()),
          comments: Array.isArray(newBook.comments) ? newBook.comments : newBook.comments.split(',').map(s => s.trim())
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du livre");
      }

      const addedBook = await response.json();
      setBooks([...books, addedBook]);
      // Réinitialise le formulaire après l'ajout
      setNewBook({ title: "", author: "", isbn: "", history: [], comments: [], literaryMovement: "", description: "", });
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de l'ajout du livre : " + error.message);
    }
  };

  const handleDeleteBook = async (_id) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce livre ?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/books?id=${_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du livre");
      }

      // Filtre le livre supprimé de l'état local
      setBooks(books.filter((book) => book._id !== _id));
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de la suppression du livre : " + error.message);
    }
  };

  const handleShowQR = (id) => {
    setShowQR((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (book) => {
    setEditBookId(book._id);
    setEditBookData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      literaryMovement: book.literaryMovement || "",
      description: book.description || "" // <-- AJOUT
    });
  };

  const handleEditChange = (e) => {
    setEditBookData({ ...editBookData, [e.target.name]: e.target.value });
  };

  const handleSave = async (_id) => {
    const response = await fetch(`/api/books?id=${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editBookData),
    });
    if (response.ok) {
      setBooks(
        books.map((book) =>
          book._id === _id ? { ...book, ...editBookData } : book
        )
      );
      setEditBookId(null);
    } else {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleCancel = () => {
    setEditBookId(null);
    setEditBookData({});
  };

  const handleDownloadQR = (id, title) => {
    const canvas = document.getElementById(`qr-canvas-${id}`);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${title}_${id}.png`;
    a.click();
  };

  return (
    <div className="GlobalPage">
      <Header /> {/* Assurez-vous que le composant Header est correctement exporté */}
      <h1>Administration</h1>
      <h2>Gestion des livres</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3>Ajouter un livre</h3>
        <input
          type="text"
          placeholder="Titre"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Auteur"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
        />
        <input
          type="text"
          placeholder="ISBN"
          value={newBook.isbn}
          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mouvement littéraire"
          value={newBook.literaryMovement}
          onChange={(e) => setNewBook({ ...newBook, literaryMovement: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newBook.description}
          onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
        />
        {/* Input pour les commentaires, géré comme un tableau de chaînes */}
        {/* <textarea
          placeholder="Commentaires (séparés par des virgules)"
          value={newBook.comments.join(', ')}
          onChange={(e) => setNewBook({ ...newBook, comments: e.target.value.split(',').map(s => s.trim()) })}
        ></textarea> */}
        {/* Input pour l'historique, géré comme un tableau de chaînes */}
        {/* <textarea
          placeholder="Historique (séparé par des virgules)"
          value={newBook.history.join(', ')}
          onChange={(e) => setNewBook({ ...newBook, history: e.target.value.split(',').map(s => s.trim()) })}
        ></textarea> */}
        <button onClick={handleAddBook}>Ajouter</button>
      </div>

      ---

      <div>
        <h3>Rechercher un livre</h3>
        <input
          type="text"
          placeholder="Rechercher par titre, auteur ou ISBN"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      ---

      <div>
        <h3>Liste des livres</h3>
        <div className={styles.bookList}>
          {filteredBooks.map((book) => (
            // Utilisation de book._id comme clé unique pour React
            <div className={styles.bookItem} key={book._id}>
              {editBookId === book._id ? (
                <div className={styles.bookInfo}>
                  <input
                    name="title"
                    value={editBookData.title}
                    onChange={handleEditChange}
                    placeholder="Titre"
                  />
                  <input
                    name="author"
                    value={editBookData.author}
                    onChange={handleEditChange}
                    placeholder="Auteur"
                  />
                  <input
                    name="isbn"
                    value={editBookData.isbn}
                    onChange={handleEditChange}
                    placeholder="ISBN"
                  />
                  <input
                    name="literaryMovement"
                    value={editBookData.literaryMovement}
                    onChange={handleEditChange}
                    placeholder="Mouvement littéraire"
                  />
                  <input
                    name="description"
                    value={editBookData.description}
                    onChange={handleEditChange}
                    placeholder="Description"
                  />
                </div>
              ) : (
                <div className={styles.bookInfo}>
                  <strong>{book.title}</strong> (uniqueID: {book.id})<br />
                  Auteur : {book.author} <br />
                  ISBN : {book.isbn} <br />
                  Mouvement : {book.literaryMovement} <br />
                  Description : {book.description} <br />
                </div>
              )}
              <div className={styles.actions}>
                {editBookId === book._id ? (
                  <>
                    <button onClick={() => handleSave(book._id)}>Enregistrer</button>
                    <button onClick={handleCancel}>Annuler</button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(book)}>Éditer</button>
                )}
                <button onClick={() => handleDeleteBook(book._id)}>Supprimer</button>
                <button onClick={() => handleShowQR(book.id)}>
                  {showQR[book.id] ? "Cacher QR" : "QR Code"}
                </button>
                <QRCodeGenerator
                  url={`https://ma-boite-a-livre.vercel.app/book/${book.id}`}
                  visible={showQR[book.id]}
                  
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}