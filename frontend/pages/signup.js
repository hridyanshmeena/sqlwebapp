import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setMsg("Signing up...");
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_BASE}/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");
      setMsg("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  }

  return (
    <div style={styles.container}>
      <h2>Signup</h2>
      <form onSubmit={submit} style={styles.form}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          style={styles.input}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Signup
        </button>
      </form>
      <p>{msg}</p>

      {/* ✅ Button-like Login link */}
      <Link href="/login" style={styles.linkButton}>
        Go to Login
      </Link>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "10%", color: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "auto" },
  input: { padding: 10, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" },
  button: { padding: 10, borderRadius: 6, background: "#16a34a", color: "#fff", border: "none", cursor: "pointer" },
  linkButton: {
    display: "inline-block",
    marginTop: 10,
    padding: "8px 16px",
    background: "#2563eb",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: "bold",
  },
};
