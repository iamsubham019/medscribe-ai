import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

# Initialize ChromaDB client (local persistent storage)
client = chromadb.PersistentClient(path="./chroma_db")

embedding_fn = DefaultEmbeddingFunction()

def get_or_create_collection(collection_name: str = "medical_reports"):
    """Get or create a ChromaDB collection."""
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_fn
    )
    return collection

def add_chunks_to_store(chunks: list[str], doc_id: str):
    """Add text chunks to ChromaDB."""
    collection = get_or_create_collection()
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    collection.add(
        documents=chunks,
        ids=ids
    )
    print(f"✅ Added {len(chunks)} chunks to vector store.")

def retrieve_relevant_chunks(query: str, n_results: int = 5) -> list[str]:
    """Retrieve top-n relevant chunks for a query."""
    collection = get_or_create_collection()
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results["documents"][0]

if __name__ == "__main__":
    # Quick test
    sample_chunks = [
        "Patient has high blood pressure and diabetes.",
        "MRI scan shows no abnormalities in the brain.",
        "Prescribed metformin 500mg twice daily."
    ]
    add_chunks_to_store(sample_chunks, doc_id="test_report")
    results = retrieve_relevant_chunks("blood pressure medication")
    print("Retrieved chunks:")
    for r in results:
        print(f"- {r}")