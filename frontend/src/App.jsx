import { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("");
  const [queryResult, setQueryResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/summarize`, formData);
      setResult(response.data);
    } catch (err) {
      setError("Failed to summarize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/query`, {
        question,
        n_results: 3,
      });
      setQueryResult(response.data.relevant_chunks);
    } catch (err) {
      setQueryResult(["No relevant content found."]);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏥 MedScribe AI</h1>
        <p style={styles.subtitle}>
          Intelligent Medical Report Summarization using Agentic AI
        </p>
      </div>

      {/* Upload Section */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📄 Upload Medical Report</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        {file && (
          <p style={styles.fileName}>Selected: {file.name}</p>
        )}
        <button
          onClick={handleSummarize}
          disabled={!file || loading}
          style={{
            ...styles.button,
            opacity: !file || loading ? 0.6 : 1,
          }}
        >
          {loading ? "⏳ Analyzing..." : "🔍 Summarize Report"}
        </button>
      </div>

      {/* Error */}
      {error && <div style={styles.error}>{error}</div>}

      {/* Results Section */}
      {result && (
        <div>
          {/* Technical Summary */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🩺 Technical Summary (For Doctors)</h2>
            <p style={styles.text}>{result.technical_summary}</p>
          </div>

          {/* Patient Summary */}
          <div style={{ ...styles.card, borderLeft: "4px solid #22c55e" }}>
            <h2 style={styles.cardTitle}>👤 Patient-Friendly Summary</h2>
            <p style={styles.text}>{result.patient_summary}</p>
          </div>

          {/* Hallucination Check */}
          <div
            style={{
              ...styles.card,
              borderLeft: `4px solid ${
                result.hallucination_check.includes("PASS") ? "#22c55e" : "#ef4444"
              }`,
            }}
          >
            <h2 style={styles.cardTitle}>✅ Hallucination Check</h2>
            <p style={styles.text}>{result.hallucination_check}</p>
          </div>

          {/* Query Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💬 Ask a Question about the Report</h2>
            <input
              type="text"
              placeholder="e.g. What medications were prescribed?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleQuery} style={styles.button}>
              🔎 Search
            </button>
            {queryResult && (
              <div style={styles.queryResults}>
                {queryResult.map((chunk, i) => (
                  <p key={i} style={styles.chunk}>
                    {chunk}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "#f1f5f9",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#38bdf8",
    margin: "0",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: "8px",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    borderLeft: "4px solid #38bdf8",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#e2e8f0",
  },
  fileInput: {
    display: "block",
    marginBottom: "12px",
    color: "#94a3b8",
  },
  fileName: {
    color: "#38bdf8",
    fontSize: "0.9rem",
    marginBottom: "12px",
  },
  button: {
    backgroundColor: "#38bdf8",
    color: "#0f172a",
    border: "none",
    padding: "10px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "1rem",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    marginBottom: "12px",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  },
  text: {
    color: "#cbd5e1",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
  },
  error: {
    backgroundColor: "#450a0a",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  queryResults: {
    marginTop: "12px",
  },
  chunk: {
    backgroundColor: "#0f172a",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "8px",
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
};