from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# Initialize Gemini
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# Define the state shared across agents
class ReportState(TypedDict):
    raw_text: str
    relevant_chunks: list[str]
    technical_summary: str
    patient_summary: str
    hallucination_check: str
    final_output: dict

# ── Agent 1: Extractor ──────────────────────────────────────────
def extractor_agent(state: ReportState) -> ReportState:
    prompt = f"""You are a medical information extractor.
Extract the following from the medical report:
- Diagnosis
- Key findings
- Medications prescribed
- Recommended follow-up

Medical Report:
{state['raw_text'][:3000]}

Respond in structured bullet points."""

    response = llm.invoke([HumanMessage(content=prompt)])
    state["relevant_chunks"] = [response.content]
    return state

# ── Agent 2: Technical Summarizer ───────────────────────────────
def technical_summary_agent(state: ReportState) -> ReportState:
    prompt = f"""You are a medical summarization expert.
Generate a concise technical summary suitable for a doctor based on:
{state['relevant_chunks']}

Keep it precise, clinical, and under 200 words."""

    response = llm.invoke([HumanMessage(content=prompt)])
    state["technical_summary"] = response.content
    return state

# ── Agent 3: Patient-Friendly Summarizer ────────────────────────
def patient_summary_agent(state: ReportState) -> ReportState:
    prompt = f"""You are a compassionate medical communicator.
Rewrite the following medical summary in simple, easy-to-understand language for a patient with no medical background:
{state['technical_summary']}

Use plain language, avoid jargon, and be reassuring. Keep it under 150 words."""

    response = llm.invoke([HumanMessage(content=prompt)])
    state["patient_summary"] = response.content
    return state

# ── Agent 4: Hallucination Checker ──────────────────────────────
def hallucination_check_agent(state: ReportState) -> ReportState:
    prompt = f"""You are a medical fact-checker.
Compare the summary below with the original report and check for any hallucinations or fabricated information.

Original Report (excerpt):
{state['raw_text'][:2000]}

Generated Summary:
{state['technical_summary']}

Respond with:
- PASS: if the summary is accurate
- FAIL: if there are hallucinations, with specific issues listed"""

    response = llm.invoke([HumanMessage(content=prompt)])
    state["hallucination_check"] = response.content
    return state

# ── Agent 5: Final Output Compiler ──────────────────────────────
def output_compiler_agent(state: ReportState) -> ReportState:
    state["final_output"] = {
        "technical_summary": state["technical_summary"],
        "patient_summary": state["patient_summary"],
        "hallucination_check": state["hallucination_check"]
    }
    return state

# ── Build LangGraph Pipeline ─────────────────────────────────────
def build_pipeline():
    graph = StateGraph(ReportState)

    graph.add_node("extractor", extractor_agent)
    graph.add_node("technical_summary", technical_summary_agent)
    graph.add_node("patient_summary", patient_summary_agent)
    graph.add_node("hallucination_check", hallucination_check_agent)
    graph.add_node("output_compiler", output_compiler_agent)

    graph.set_entry_point("extractor")
    graph.add_edge("extractor", "technical_summary")
    graph.add_edge("technical_summary", "patient_summary")
    graph.add_edge("patient_summary", "hallucination_check")
    graph.add_edge("hallucination_check", "output_compiler")
    graph.add_edge("output_compiler", END)

    return graph.compile()
if __name__ == "__main__":
    pipeline = build_pipeline()
    test_state = ReportState(
        raw_text="""Patient: John Doe, 45M. Diagnosis: Type 2 Diabetes Mellitus.
        Blood pressure: 145/90 mmHg. HbA1c: 8.2%.
        Prescribed: Metformin 500mg twice daily, Amlodipine 5mg once daily.
        Follow-up in 3 months. MRI brain: No abnormalities detected.""",
        relevant_chunks=[],
        technical_summary="",
        patient_summary="",
        hallucination_check="",
        final_output={}
    )
    result = pipeline.invoke(test_state)
    print("\n=== TECHNICAL SUMMARY ===")
    print(result["technical_summary"])
    print("\n=== PATIENT SUMMARY ===")
    print(result["patient_summary"])
    print("\n=== HALLUCINATION CHECK ===")
    print(result["hallucination_check"])