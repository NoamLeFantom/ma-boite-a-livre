import { useState } from "react";
import { useRouter } from "next/router";
import { getUser } from "@/lib/users";
import Header from "@/components/Header";


export default function LoginPage() {
  const [pseudo, setPseudo] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    const user = getUser(pseudo);
    if (!user) {
      alert("Utilisateur introuvable");
      return;
    }
    localStorage.setItem("user", JSON.stringify(user));
    router.push("/");
  };

  return (
    <div style={{ padding: 20 }}>
      <Header/>
      <h1>Connexion</h1>
      <input
        type="text"
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />
      <button onClick={handleLogin}>Se connecter</button>
    </div>
  );
}
