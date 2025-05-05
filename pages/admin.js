import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getCurrentUser } from "@/lib/session";
import Header from "@/components/Header";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "", history: [], comments: [], literaryMovement: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.includes(searchQuery)
  );

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== "admin") {
        alert("Accès refusé : Vous devez être administrateur.");
        router.push("/");
      } else {
        setUser(currentUser);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books", { credentials: "include" });
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des livres :", error);
      }
    };

    fetchBooks();
  }, []);

  const handleAddBook = async () => {
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du livre");
      }

      const addedBook = await response.json();
      setBooks([...books, addedBook]);
      setNewBook({ title: "", author: "", isbn: "", history: [], comment: "", literaryMovement: "" });
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de l'ajout du livre.");
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du livre");
      }

      setBooks(books.filter((book) => book.id !== id));
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de la suppression du livre.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Header/>
      <h1>Administration</h1>
      <h2>Gestion des livres</h2>

      <div>
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
        <textarea
          placeholder="Commentaire"
          value={newBook.comment}
          onChange={(e) => setNewBook({ ...newBook, comment: e.target.value })}
        ></textarea>
        <textarea
          placeholder="Historique"
          value={newBook.history.join(', ')}
          onChange={(e) => setNewBook({ ...newBook, history: e.target.value.split(', ') })}
        ></textarea>
        <button onClick={handleAddBook}>Ajouter</button>
      </div>

      <div>
        <h3>Rechercher un livre</h3>
        <input
          type="text"
          placeholder="Rechercher par titre, auteur ou ISBN"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div>
        <h3>Liste des livres</h3>
        <ul>
          {filteredBooks.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> par {book.author} (ISBN: {book.isbn})
              <button onClick={() => handleDeleteBook(book.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}