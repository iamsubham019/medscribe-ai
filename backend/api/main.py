from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import shutil
import uuid

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag.ingestor import extract_text_from_pdf, chunk_text
from rag.vector_store import add_chunks_to_store, retrieve_relevant_chunks
from agents.summarizer import build_pipeline, ReportState

app = FastAPI(title="MedScribe AI", version="1.0.0")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://medscribe-ai-one.vercel.app",
        "https://medscribe-ai.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build pipeline once on startup
pipeline = build_pipeline()

# ── Upload & Summarize Endpoint ──────────────────────────────────
@app.post("/summarize")
async def summarize_report(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save uploaded file temporarily
    temp_path = f"temp_{uuid.uuid4().hex}.pdf"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Extract text from PDF
        raw_text = extract_text_from_pdf(temp_path)

        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        # Chunk and store in vector DB
        chunks = chunk_text(raw_text)
        doc_id = uuid.uuid4().hex
        add_chunks_to_store(chunks, doc_id)

        # Run through LangGraph pipeline
        initial_state = ReportState(
            raw_text=raw_text,
            relevant_chunks=[],
            technical_summary="",
            patient_summary="",
            hallucination_check="",
            final_output={}
        )
        result = pipeline.invoke(initial_state)

        return {
            "status": "success",
            "doc_id": doc_id,
            "technical_summary": result["technical_summary"],
            "patient_summary": result["patient_summary"],
            "hallucination_check": result["hallucination_check"]
        }

    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ── Query Endpoint (RAG-based Q&A) ──────────────────────────────
class QueryRequest(BaseModel):
    question: str
    n_results: int = 5

@app.post("/query")
async def query_report(request: QueryRequest):
    chunks = retrieve_relevant_chunks(request.question, request.n_results)
    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant content found.")
    return {
        "status": "success",
        "question": request.question,
        "relevant_chunks": chunks
    }

# ── Health Check ─────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "MedScribe AI is running 🚀"}