// lib/users.js

let users = [];

export function createUser(pseudo) {
  if (users.find(u => u.pseudo === pseudo)) return null;
  const newUser = { pseudo };
  users.push(newUser);
  return newUser;
}

export function getUser(pseudo) {
  return users.find(u => u.pseudo === pseudo) || null;
}
