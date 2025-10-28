// frontend/pages/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import TablePreview from "../components/TablePreview";

const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableInfo, setSelectedTableInfo] = useState(null);
  const [query, setQuery] = useState("SELECT * FROM Customers LIMIT 10;");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);

  // Load token and user from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("username");
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUser);
    } else {
      router.push("/login");
    }
  }, []);

  // Fetch tables and recent queries when token available
  useEffect(() => {
    if (!token) return;
    fetchTables(token);
    fetchRecent(token);
  }, [token]);

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // Fetch all tables
  const fetchTables = async (tok) => {
    try {
      const res = await axios.get(`${API_URL}/tables`, {
        headers: authHeaders(),
      });
      const data = res.data;
      if (Array.isArray(data.tables)) {
        setTables(
          data.tables.filter(
            (t) =>
              !["users", "user_queries"].includes(t.toLowerCase()) &&
              !t.startsWith("sqlite_")
          )
        );
      } else {
        setTables([]);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      if (err.response?.status === 401) router.push("/login");
    }
  };

  // Fetch recent queries
  const fetchRecent = async (tok) => {
    try {
      const res = await axios.get(`${API_URL}/queries/recent`, {
        headers: authHeaders(),
      });
      const data = res.data;
      setRecent(data.queries || []);
    } catch (err) {
      console.error("Error fetching recent queries:", err);
    }
  };

  // Run SQL query
  // Run SQL query
const runQuery = async () => {
  setLoading(true);
  setError(null);
  setResult(null);
  try {
    const res = await axios.post(
      `${API_URL}/query`,
      { sql: query },
      { headers: { ...authHeaders(), "Content-Type": "application/json" } }
    );
    const data = res.data;
    if (data.error) throw new Error(data.error);

    setResult(data);
    
    // ✅ Immediately refresh tables and recent queries after execution
    fetchTables(token);
    fetchRecent(token);
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.detail || err.message);
  } finally {
    setLoading(false);
  }
};


  // Load table schema and preview
  const loadTable = async (t) => {
    setSelectedTable(t);
    setSelectedTableInfo(null);
    try {
      const res = await axios.get(`${API_URL}/tables/${encodeURIComponent(t)}`, {
        headers: authHeaders(),
      });
      const data = res.data;
      setSelectedTableInfo(data);
    } catch (err) {
      console.error("Error fetching table info:", err);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        padding: 20,
        gap: 20,
        color: "#fff",
        backgroundColor: "#121212",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 280,
          background: "#1e1e1e",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Your Tables</h3>
          <button
            onClick={logout}
            style={{
              background: "red",
              border: "none",
              padding: "4px 10px",
              borderRadius: 6,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginTop: 8 }}>
          {tables.length > 0 ? (
            tables.map((t) => (
              <button
                key={t}
                onClick={() => loadTable(t)}
                style={{
                  background: selectedTable === t ? "#2563eb" : "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  margin: "4px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {t}
              </button>
            ))
          ) : (
            <p style={{ color: "#aaa" }}>No tables found</p>
          )}
        </div>

        <h4 style={{ marginTop: 16 }}>Recent Queries</h4>
        <div style={{ fontSize: 13, maxHeight: 250, overflowY: "auto" }}>
          {recent.length > 0 ? (
            recent.map((r) => (
              <div
                key={r.id}
                style={{
                  marginBottom: 8,
                  borderBottom: "1px dashed #333",
                  paddingBottom: 6,
                }}
              >
                <div style={{ fontSize: 11, color: "#999" }}>
                  {new Date(r.run_at).toLocaleString()}
                </div>
                <div>{r.query}</div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888" }}>No recent queries yet.</p>
          )}
        </div>

        {selectedTableInfo && (
          <div style={{ marginTop: 16 }}>
            <h4>Schema</h4>
            <pre
              style={{
                background: "#222",
                padding: 6,
                borderRadius: 6,
                fontSize: 12,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(selectedTableInfo.columns, null, 2)}
            </pre>
            <h4>Sample Rows</h4>
            <TablePreview
              columns={selectedTableInfo.columns.map((c) => c.name)}
              rows={selectedTableInfo.sample_rows}
            />
          </div>
        )}
      </aside>

      {/* Main Area */}
      <main style={{ flex: 1 }}>
        <h1>Welcome, {username || "User"}</h1>
        <h3>Run SQL Query</h3>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #333",
          }}
        />
        <div style={{ marginTop: 8 }}>
          <button
            onClick={runQuery}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            {loading ? "Running..." : "Run Query"}
          </button>
        </div>

        <section style={{ marginTop: 20 }}>
          <h3>Query Result</h3>
          {error && <div style={{ color: "red" }}>{error}</div>}
          {result && result.columns && result.columns.length > 0 && (
            <TablePreview columns={result.columns} rows={result.rows} />
          )}
          {result && result.message && <div>{result.message}</div>}
        </section>
      </main>
    </div>
  );
}
