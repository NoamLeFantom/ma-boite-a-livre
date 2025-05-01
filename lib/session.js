import { useState } from "react";
import { useRouter } from "next/router";
import { createUser } from "@/lib/users";
import cookie from "js-cookie";
import { parse } from "cookie";

export default function SignupPage() {
  const [pseudo, setPseudo] = useState("");
  const router = useRouter();

  const handleSignup = () => {
    const user = createUser(pseudo);
    if (!user) {
      alert("Pseudo déjà pris");
      return;
    }
    setCurrentUser(user);
    router.push("/");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Créer un compte</h1>
      <input
        type="text"
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />
      <button onClick={handleSignup}>S'inscrire</button>
    </div>
  );
}

export function getCurrentUser(req = null) {
  console.log("Reading user cookie:", req ? req.headers.cookie : document.cookie);
  if (typeof window === "undefined" && req) {
    const cookies = parse(req.headers.cookie || "");
    const stored = cookies.user;
    console.log("Parsed user cookie on server:", stored);
    return stored ? JSON.parse(stored) : null;
  }

  if (typeof window !== "undefined") {
    const stored = cookie.get("user");
    console.log("Parsed user cookie on client:", stored);
    return stored ? JSON.parse(stored) : null;
  }

  return null;
}

export function setCurrentUser(user) {
  if (typeof window !== "undefined") {
    cookie.set("user", JSON.stringify(user), { expires: 7 }); // Store for 7 days
  }
}
