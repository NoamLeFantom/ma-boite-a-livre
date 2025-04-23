// lib/books.js

import { books } from "./data.js";
  
export function getLastInteractions(limit = 5) {
    const interactions = [];
  
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