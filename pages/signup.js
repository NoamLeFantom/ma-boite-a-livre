import { useState } from "react";
import { useRouter } from "next/router";
import { createUser } from "@/lib/users";

export default function SignupPage() {
  const [pseudo, setPseudo] = useState("");
  const router = useRouter();

  const handleSignup = () => {
    const user = createUser(pseudo);
    if (!user) {
      alert("Pseudo déjà pris");
      return;
    }
    localStorage.setItem("user", JSON.stringify(user));
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
      <button onClick={handleSignup}>S&#39inscrire</button>
    </div>
  );
}
