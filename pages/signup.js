import { useState } from "react";
import { useRouter } from "next/router";
import { setCurrentUser } from "@/lib/session";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Books Travelling": process.env.NEXT_PUBLIC_API_SECRET_KEY,
        },
        credentials: 'include',
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to sign up");
      }

      const user = await response.json();
      if (!user) {
        alert("Pseudo déjà pris");
        return;
      }
      setCurrentUser(user); // Automatically log in the user after signup
      console.log("User signed up and logged in:", user);

      router.push("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Créer un compte</h1>
      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="username">Nom d'utilisateur :</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}
