import { useState, useRef } from "react";

import axios from "axios";

const API_URL = "https://medscribe-ai-backend.onrender.com";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [activeTab, setActiveTab] = useState("patient");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setResult(null);
      setError(null);
      setQueryResult(null);
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setResult(null);
      setError(null);
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setQueryResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/summarize`, formData);
      setResult(response.data);
      setActiveTab("patient");
    } catch {
      setError("Something went wrong. Please try again.");
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
    } catch {
      setQueryResult(["No relevant content found."]);
    }
  };

  const isPass = result?.hallucination_check?.includes("PASS");

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>+</div>
          <span style={s.logoText}>MedScribe AI</span>
        </div>
        <p style={s.tagline}>Upload your medical report and we'll explain it in plain language</p>
      </header>

      <main style={s.main}>
        {/* Upload Card */}
        {!result && (
          <div style={s.uploadSection}>
            <div
              style={{ ...s.dropzone, ...(dragOver ? s.dropzoneActive : {}) }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div style={s.uploadIcon}>📄</div>
              {file ? (
                <>
                  <p style={s.fileName}>{file.name}</p>
                  <p style={s.fileHint}>Ready to analyze</p>
                </>
              ) : (
                <>
                  <p style={s.uploadTitle}>Drop your report here</p>
                  <p style={s.uploadHint}>or click to browse — PDF files only</p>
                </>
              )}
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button
              onClick={handleSummarize}
              disabled={!file || loading}
              style={{ ...s.primaryBtn, opacity: (!file || loading) ? 0.5 : 1 }}
            >
              {loading ? (
                <span style={s.loadingRow}>
                  <span style={s.spinner} /> Analyzing your report...
                </span>
              ) : "Analyze report"}
            </button>

            {loading && (
              <div style={s.loadingSteps}>
                <p style={s.loadingStep}>🔍 Reading your report...</p>
                <p style={s.loadingStep}>🧠 Creating summaries...</p>
                <p style={s.loadingStep}>✅ Checking accuracy...</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={s.results}>
            {/* Back button */}
            <button onClick={() => { setResult(null); setFile(null); setQueryResult(null); }} style={s.backBtn}>
              ← Analyze another report
            </button>

            {/* Accuracy badge */}
            <div style={{ ...s.badge, background: isPass ? "#dcfce7" : "#fef2f2", color: isPass ? "#15803d" : "#b91c1c" }}>
              {isPass ? "✓ Accuracy verified" : "⚠ Review manually"}
            </div>

            {/* Tabs */}
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(activeTab === "patient" ? s.tabActive : {}) }}
                onClick={() => setActiveTab("patient")}
              >
                👤 For you
              </button>
              <button
                style={{ ...s.tab, ...(activeTab === "doctor" ? s.tabActive : {}) }}
                onClick={() => setActiveTab("doctor")}
              >
                🩺 For your doctor
              </button>
              <button
                style={{ ...s.tab, ...(activeTab === "check" ? s.tabActive : {}) }}
                onClick={() => setActiveTab("check")}
              >
                ✅ Accuracy report
              </button>
            </div>

            {/* Tab Content */}
            <div style={s.tabContent}>
              {activeTab === "patient" && (
                <div>
                  <h2 style={s.contentTitle}>What your report says</h2>
                  <p style={s.contentText}>{result.patient_summary}</p>
                  <div style={s.disclaimer}>
                    <strong>Remember:</strong> This is an AI-generated summary. Always speak with your doctor for medical advice.
                  </div>
                </div>
              )}

              {activeTab === "doctor" && (
                <div>
                  <h2 style={s.contentTitle}>Clinical summary</h2>
                  <p style={s.contentText}>{result.technical_summary}</p>
                </div>
              )}

              {activeTab === "check" && (
                <div>
                  <h2 style={s.contentTitle}>Accuracy check</h2>
                  <div style={{
                    ...s.accuracyBadge,
                    background: isPass ? "#dcfce7" : "#fef2f2",
                    color: isPass ? "#15803d" : "#b91c1c",
                    borderColor: isPass ? "#86efac" : "#fca5a5"
                  }}>
                    {isPass ? "✓ All information verified" : "⚠ Some information may need review"}
                  </div>
                  <p style={s.contentText}>{result.hallucination_check}</p>
                </div>
              )}
            </div>

            {/* Q&A Section */}
            <div style={s.qaSection}>
              <h3 style={s.qaTitle}>Have a question about your report?</h3>
              <p style={s.qaHint}>Ask anything in plain language</p>
              <div style={s.qaRow}>
                <input
                  type="text"
                  placeholder="e.g. What medications was I prescribed?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                  style={s.qaInput}
                />
                <button onClick={handleQuery} style={s.qaBtn}>Ask</button>
              </div>

              {queryResult && (
                <div style={s.qaResults}>
                  {queryResult.map((chunk, i) => (
                    <div key={i} style={s.qaChunk}>
                      <p style={s.qaChunkText}>{chunk}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={s.footerText}>MedScribe AI · Built with LangGraph + Groq · Not a substitute for professional medical advice</p>
      </footer>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "24px 32px",
    textAlign: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    background: "#0ea5e9",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700",
  },
  logoText: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#0f172a",
  },
  tagline: {
    color: "#64748b",
    fontSize: "15px",
    margin: "0",
  },
  main: {
    flex: "1",
    maxWidth: "680px",
    width: "100%",
    margin: "0 auto",
    padding: "40px 24px",
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  dropzone: {
    background: "#ffffff",
    border: "2px dashed #cbd5e1",
    borderRadius: "16px",
    padding: "48px 32px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  dropzoneActive: {
    border: "2px dashed #0ea5e9",
    background: "#f0f9ff",
  },
  uploadIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  uploadTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  uploadHint: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0",
  },
  fileName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0ea5e9",
    margin: "0 0 4px 0",
  },
  fileHint: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0",
  },
  primaryBtn: {
    background: "#0ea5e9",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingSteps: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  loadingStep: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0",
  },
  error: {
    color: "#dc2626",
    fontSize: "14px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px 16px",
    margin: "0",
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    cursor: "pointer",
    padding: "0",
    textAlign: "left",
  },
  badge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  tabs: {
    display: "flex",
    gap: "8px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "6px",
  },
  tab: {
    flex: "1",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#f1f5f9",
    color: "#0f172a",
  },
  tabContent: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "28px",
  },
  contentTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 16px 0",
  },
  contentText: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "1.8",
    margin: "0",
    whiteSpace: "pre-wrap",
  },
  disclaimer: {
    marginTop: "20px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#92400e",
  },
  accuracyBadge: {
    border: "1px solid",
    borderRadius: "8px",
    padding: "12px 16px",
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "16px",
  },
  qaSection: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "28px",
  },
  qaTitle: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  qaHint: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0 0 16px 0",
  },
  qaRow: {
    display: "flex",
    gap: "8px",
  },
  qaInput: {
    flex: "1",
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    color: "#0f172a",
    background: "#f8fafc",
    outline: "none",
  },
  qaBtn: {
    background: "#0ea5e9",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  qaResults: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  qaChunk: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  qaChunkText: {
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: "0",
  },
  footer: {
    borderTop: "1px solid #e2e8f0",
    padding: "20px 32px",
    textAlign: "center",
    background: "#ffffff",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "0",
  },
};
