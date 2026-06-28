import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract raw text from a PDF file."""
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()
    return full_text

def chunk_text(text: str) -> list[str]:
    """Split text into chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_text(text)
    return chunks

if __name__ == "__main__":
    # Quick test
    text = extract_text_from_pdf("test.pdf")
    chunks = chunk_text(text)
    print(f"Total chunks: {len(chunks)}")
    print(f"First chunk:\n{chunks[0]}")