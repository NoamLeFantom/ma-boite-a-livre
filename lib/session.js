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
  if (typeof window === "undefined") {
    console.log("getCurrentUser called on server");
    return null;
  }

  const stored = cookie.get("user");
  console.log("Parsed user cookie on client:", stored);
  return stored ? JSON.parse(stored) : null;
}

export function setCurrentUser(user) {
  if (typeof window !== "undefined") {
    console.log("Setting user cookie:", user);
    cookie.set("user", JSON.stringify(user), { expires: 7, path: "/" }); // Avoid double encoding
    console.log("User cookie set successfully");
  }
}
