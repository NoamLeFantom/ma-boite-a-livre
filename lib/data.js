// lib/data.js

export let books = [
    {
      id: "9782070612758-0001",
      title: "Le Petit Prince",
      author: "Antoine de Saint-Exupéry",
      isbn: "9782070612758",
      history: [
        { location: "Paris", action: "déposé", date: "2024-01-12", pseudo: "Alice" },
        { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
      ],
      comments: [
        { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" },
        { pseudo: "Bob", message: "Merci pour ce partage 🙏", date: "2024-01-20" }
      ]
    },
    {
      id: "9782070612758-0002",
      title: "Le Petit Prince",
      author: "Antoine de Saint-Exupéry",
      isbn: "9782070612758",
      history: [
        { location: "Paris", action: "déposé", date: "2024-01-12", pseudo: "Alice" },
        { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
      ],
      comments: [
        { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" },
        { pseudo: "Bob", message: "Merci pour ce partage 🙏", date: "2024-01-20" }
      ]
    },
    {
        id: "9780394533056-0001",
        title: "L'Étranger",
        isbn: "9780394533056",
        author: "Albert Camus",
        history: [
          { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
        ],
        comments: [
          { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" }
        ]
      },
      {
        id: "9780394533056-0002",
        title: "L'Étranger",
        isbn: "9780394533056",
        author: "Albert Camus",
        history: [
          { location: "Lyon", action: "pris", date: "2024-01-20", pseudo: "Bob" }
        ],
        comments: [
          { pseudo: "Alice", message: "Super lecture!", date: "2024-01-12" }
        ]
      },
    {
      id: "9780451524935-0001",
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      history: [],
      comments: []
    },
    {
      id: "9780451524935-0002",
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      history: [],
      comments: []
    }
  ];
  
  // 📚 Fonctions de manipulation
  
  export function getBookById(id) {
    return books.find((book) => book.id === id) || null;
  }
  
  export function addInteraction(id, { action, location, pseudo }) {
    const book = getBookById(id);
    if (!book) return false;
  
    book.history.push({
      action,
      location,
      pseudo: pseudo || "inconnu",
      date: new Date().toISOString().split("T")[0]
    });
  
    return true;
  }
  
  export function addComment(id, { pseudo, message }) {
    const book = getBookById(id);
    if (!book) return false;
  
    book.comments.push({
      pseudo: pseudo || "inconnu",
      message,
      date: new Date().toISOString().split("T")[0]
    });
  
    return true;
  }
  
  export function getAllBooks() {
    return books;
  }
  