# 🏥 MedScribe AI
### Intelligent Medical Report Summarization using Agentic AI

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.138-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/LangGraph-1.2.6-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=for-the-badge&logo=groq&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge"/>
</p>

<p align="center">
  <a href="https://medscribe-ai-one.vercel.app"><strong>🌐 Live Demo</strong></a> •
  <a href="https://medscribe-ai-backend.onrender.com/docs"><strong>📡 API Docs</strong></a> •
  <a href="https://github.com/iamsubham019/medscribe-ai"><strong>💻 GitHub</strong></a>
</p>

---

## 📌 Overview

**MedScribe AI** is a full-stack Agentic AI system that automatically processes and summarizes medical PDF reports using a multi-agent LangGraph pipeline powered by the Groq LLM (LLaMA 3.3 70B). 

The system goes beyond simple summarization — it produces:
- A **clinical technical summary** for healthcare professionals
- A **patient-friendly explanation** in plain language
- A **hallucination detection report** to verify AI accuracy
- A **RAG-based Q&A interface** to query the report

Built as a research-grade project, MedScribe AI demonstrates the integration of Agentic AI, Retrieval-Augmented Generation (RAG), and modern full-stack development practices in the healthcare domain.

---

## 🌐 Live Links

| Service | URL |
|---|---|
| 🖥️ Frontend (Vercel) | https://medscribe-ai-one.vercel.app |
| ⚙️ Backend API (Render) | https://medscribe-ai-backend.onrender.com |
| 📖 Swagger API Docs | https://medscribe-ai-backend.onrender.com/docs |
| 💻 GitHub Repository | https://github.com/iamsubham019/medscribe-ai |

> ⚠️ **Note:** The backend runs on Render's free tier and may take 50+ seconds to wake up on first request.

---

## ✨ Key Features

- 📄 **PDF Upload & Processing** — Upload any medical report in PDF format
- 🤖 **Multi-Agent Pipeline** — 5 specialized AI agents working in sequence via LangGraph
- 🩺 **Technical Summary** — Precise clinical summary for doctors and healthcare professionals
- 👤 **Patient-Friendly Summary** — Simple, jargon-free explanation for patients
- ✅ **Hallucination Detection** — AI verifies its own output against the source document
- 💬 **RAG-based Q&A** — Ask natural language questions about the uploaded report
- 🗄️ **Vector Store** — ChromaDB stores document embeddings for semantic retrieval
- 🚀 **Fully Deployed** — Live on Vercel (frontend) + Render (backend)

---

## 🧠 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER INTERFACE                      │
│              React + Vite (Vercel)                      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST API
┌──────────────────────────▼──────────────────────────────┐
│                    FASTAPI BACKEND                      │
│                  (Render - Python)                      │
├──────────────────────────────────────────────────────────
│                                                         │
│   PDF Upload                                            │
│       │                                                 │
│       ▼                                                 │
│   PyMuPDF Extractor ──► Text Chunker ──► ChromaDB       │
│                                              │          │
│                                              ▼          │
│                                         RAG Retrieval   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │           LANGGRAPH AGENT PIPELINE              │   │
│   │                                                 │   │
│   │  [1] Extractor Agent                            │   │
│   │         │                                       │   │
│   │         ▼                                       │   │
│   │  [2] Technical Summary Agent                    │   │
│   │         │                                       │   │
│   │         ▼                                       │   │
│   │  [3] Patient Summary Agent                      │   │
│   │         │                                       │   │
│   │         ▼                                       │   │
│   │  [4] Hallucination Check Agent                  │   │
│   │         │                                       │   │
│   │         ▼                                       │   │
│   │  [5] Output Compiler Agent                      │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│                   Groq LLM API                          │
│               (LLaMA 3.3 70B Versatile)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent Pipeline (LangGraph)

MedScribe AI uses a sequential multi-agent architecture built with LangGraph:

| Agent | Role |
|---|---|
| **1. Extractor Agent** | Extracts diagnosis, findings, medications, and follow-up from raw PDF text |
| **2. Technical Summary Agent** | Generates a concise clinical summary for doctors (≤200 words) |
| **3. Patient Summary Agent** | Rewrites the summary in simple, jargon-free language for patients (≤150 words) |
| **4. Hallucination Check Agent** | Compares summary against source text and outputs PASS/FAIL with reasoning |
| **5. Output Compiler Agent** | Compiles all outputs into a structured JSON response |

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| LLM | Groq (LLaMA 3.3 70B) | Language model for all agents |
| Agentic Orchestration | LangGraph 1.2.6 | Multi-agent pipeline management |
| RAG Framework | LangChain 1.3.11 | Document processing and retrieval |
| Vector Store | ChromaDB | Semantic search over report chunks |
| PDF Processing | PyMuPDF | Text extraction from PDF files |
| Backend | FastAPI 0.138 | REST API server |
| Frontend | React + Vite | User interface |
| Deployment (Backend) | Render | Cloud backend hosting |
| Deployment (Frontend) | Vercel | Cloud frontend hosting |
| Version Control | GitHub | Source code management |

---

## 📁 Project Structure

```
medscribe-ai/
├── backend/
│   ├── agents/
│   │   └── summarizer.py        # LangGraph multi-agent pipeline
│   ├── api/
│   │   └── main.py              # FastAPI endpoints
│   ├── rag/
│   │   ├── ingestor.py          # PDF extraction and chunking
│   │   └── vector_store.py      # ChromaDB vector store
│   ├── .env                     # API keys (not committed)
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── render.yaml                  # Render deployment config
└── README.md
```

---

## 🚀 Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/iamsubham019/medscribe-ai.git
cd medscribe-ai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:
```bash
uvicorn api.main:app --reload
```
Backend runs at: `http://127.0.0.1:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/summarize` | Upload PDF and get AI summaries |
| `POST` | `/query` | RAG-based Q&A on uploaded report |

### Example: Summarize Report
```bash
curl -X POST "https://medscribe-ai-backend.onrender.com/summarize" \
  -F "file=@medical_report.pdf"
```

### Example Response
```json
{
  "status": "success",
  "doc_id": "abc123",
  "technical_summary": "Patient presents with Stage II CHF...",
  "patient_summary": "You have a condition where your heart...",
  "hallucination_check": "PASS - All information accurately reflects..."
}
```

---

## 🖼️ Screenshots

### Upload & Summarize
> Upload any medical PDF and get instant AI-powered summaries

### Technical Summary (For Doctors)
> Precise clinical summary with diagnosis, findings, and treatment plan

### Patient-Friendly Summary
> Simple, compassionate explanation for patients with no medical background

### Hallucination Check
> AI verifies its own accuracy against the source document

---

## 🔮 Future Improvements

- [ ] Multi-language support for patient summaries
- [ ] Support for DICOM medical imaging files
- [ ] Integration with hospital EHR systems
- [ ] Fine-tuned medical LLM for improved accuracy
- [ ] User authentication and report history
- [ ] Export summaries as PDF

---

## 👨‍💻 Author

**Subham Pal**
- GitHub: [@iamsubham019](https://github.com/iamsubham019)
- Project: [medscribe-ai](https://github.com/iamsubham019/medscribe-ai)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ using LangGraph, Groq, FastAPI and React</p>
