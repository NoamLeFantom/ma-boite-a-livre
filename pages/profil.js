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
          className="glass-modal"
        >
          <h1 style={{ marginBottom: 24 }}>Mon Profil</h1>
          {success && <p style={{ color: "green" }}>{success}</p>}
          <label style={{ marginBottom: 8 }}>
            Nom :
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="glass-input"
            />
          </label>
          <br />
          <label style={{ marginBottom: 8 }}>
            Email :
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="glass-input"
            />
          </label>
          <br />
          <button onClick={handleUpdate}className="glass-input">Mettre à jour</button>
          <br /><br />
          <button onClick={handleDelete} className="glass-input" style={{ color: "red" }}>
            Supprimer mon compte
          </button>
          <button onClick={handleLogout} className="glass-input" style={{ marginTop: 20 }}>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
