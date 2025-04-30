// lib/books.js

import { getAllBooks } from "./data.js";

export async function getLastInteractions(limit = 5) {
    const interactions = [];

    const books = await getAllBooks(); // Récupère les livres depuis la base de données

    books.forEach((book) => {
        if (Array.isArray(book.history)) {
            book.history.forEach((entry) => {
                if (entry.date) {
                    interactions.push({
                        title: book.title,
                        id: book.id, // utile pour le lien
                        pseudo: entry.pseudo || "unknown",
                        date: new Date(entry.date),
                    });
                }
            });
        }
    });

    interactions.sort((a, b) => b.date - a.date);
    return interactions.slice(0, limit);
}