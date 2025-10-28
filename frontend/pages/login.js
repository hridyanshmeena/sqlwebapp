import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setMsg("Logging in...");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", data.username);

      setMsg("Login successful! Redirecting...");
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  }

  return (
    <div style={styles.container}>
      <h2>Login</h2>
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
          Login
        </button>
      </form>
      <p>{msg}</p>

      {/* 👇 Add link to signup */}
      <p>
        Don’t have an account?{" "}
        <Link href="/signup" style={{ color: "#2563eb", textDecoration: "underline" }}>
          Sign up here
        </Link>
      </p>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "10%", color: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "auto" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" },
  button: { padding: 10, borderRadius: 6, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" }
};
