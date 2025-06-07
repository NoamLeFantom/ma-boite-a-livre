// pages/profile.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import cookie from "js-cookie";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/session";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setForm({ name: currentUser.username, email: currentUser.email });
    }
    setLoading(false);
  }, []);

  const handleUpdate = async () => {
    const res = await fetch("/api/current-user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess("Profil mis à jour !");
      setUser({ ...user, ...form });
    } else {
      alert(data.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;

    const res = await fetch("/api/current-user", { method: "DELETE" });
    if (res.ok) {
      alert("Compte supprimé.");
      window.location.href = "/";
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    if (confirmLogout) {
      cookie.remove("user");
      router.push("/");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <div><Header/><p>Vous devez être connecté pour voir cette page.</p></div>;

  return (
    <div>
      <Header />
      <div className="GlobalPage">
        <div
          style={{
            maxWidth: 500,
            margin: "40px auto",
            background: "var(--glass-bg)",
            boxShadow: "var(--glass-shadow)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1.5px solid var(--glass-border)",
            borderRadius: "18px",
            padding: "32px 24px"
          }}
        >
          <h1 style={{ marginBottom: 24 }}>Mon Profil</h1>
          {success && <p style={{ color: "green" }}>{success}</p>}
          <label style={{ marginBottom: 8 }}>
            Nom :
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                border: "1px solid var(--glass-border)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: "1rem",
                background: "rgba(255,255,255,0.5)",
                color: "var(--foreground)",
                marginLeft: 8
              }}
            />
          </label>
          <br />
          <label style={{ marginBottom: 8 }}>
            Email :
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                border: "1px solid var(--glass-border)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: "1rem",
                background: "rgba(255,255,255,0.5)",
                color: "var(--foreground)",
                marginLeft: 8
              }}
            />
          </label>
          <br />
          <button onClick={handleUpdate}>Mettre à jour</button>
          <br /><br />
          <button onClick={handleDelete} style={{ color: "red" }}>
            Supprimer mon compte
          </button>
          <button onClick={handleLogout} style={{ marginTop: 20 }}>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
