// pages/profile.js
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/session";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

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

  if (loading) return <p>Chargement...</p>;
  if (!user) return <div><Header/><p>Vous devez être connecté pour voir cette page.</p></div>;

  return (
    <div style={{ padding: 20 }}>
      <Header />
      <h1>Mon Profil</h1>
      {success && <p style={{ color: "green" }}>{success}</p>}
      <label>
        Nom:
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <br />
      <label>
        Email:
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <br />
      <button onClick={handleUpdate}>Mettre à jour</button>
      <br /><br />
      <button onClick={handleDelete} style={{ color: "red" }}>
        Supprimer mon compte
      </button>
    </div>
  );
}
