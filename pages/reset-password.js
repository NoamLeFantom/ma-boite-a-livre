import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token } = router.query;
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });

        const data = await response.json();
        if (response.ok) {
            setMessage("Mot de passe réinitialisé avec succès.");
        } else {
            setMessage(data.error || "Une erreur est survenue.");
        }
    };

    return (
        <div style={{ padding: 0 }}>
            <Header />
            <div class="GlobalPage">
                <h1>Définir un nouveau mot de passe</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Réinitialiser</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}