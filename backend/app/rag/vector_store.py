import os
import glob
import logging
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class RAGKnowledgeEngine:
    def __init__(self, doc_dir: str = "rag/documents"):
        self.doc_dir = doc_dir
        self.chunks: List[Dict[str, Any]] = []
        self.is_initialized = False

    def initialize_knowledge_base(self):
        try:
            doc_files = glob.glob(os.path.join(self.doc_dir, "*.md"))
            if not doc_files:
                logger.warning(f"No markdown documents found in {self.doc_dir}")
                return

            self.chunks = []
            for file_path in doc_files:
                filename = os.path.basename(file_path)
                dest_name = filename.replace(".md", "").capitalize()
                
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Split document into section chunks by ## headings
                sections = content.split("\n## ")
                for i, sec in enumerate(sections):
                    if not sec.strip():
                        continue
                    lines = sec.strip().split("\n")
                    header = lines[0].replace("#", "").strip()
                    body = "\n".join(lines[1:]).strip()
                    
                    self.chunks.append({
                        "destination": dest_name,
                        "section": header,
                        "content": sec,
                        "source": filename,
                        "text": f"{dest_name} - {header}: {body}"
                    })

            self.is_initialized = True
            logger.info(f"Loaded {len(self.chunks)} RAG chunks from {len(doc_files)} destination documents.")
        except Exception as e:
            logger.error(f"Failed to load RAG knowledge base: {e}")

    def query(self, destination: str, query_text: str = "", top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.is_initialized:
            self.initialize_knowledge_base()

        dest_clean = destination.strip().lower()
        query_words = query_text.lower().split()

        scored_chunks = []
        for chunk in self.chunks:
            score = 0
            chunk_dest = chunk["destination"].lower()
            
            # Destination match bonus
            if dest_clean in chunk_dest or chunk_dest in dest_clean:
                score += 10
            
            # Text relevance score
            chunk_lower = chunk["text"].lower()
            for w in query_words:
                if len(w) > 3 and w in chunk_lower:
                    score += 2

            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        results = [item[1] for item in scored_chunks[:top_k]]
        
        # Fallback if no specific match
        if not results and self.chunks:
            results = [self.chunks[0]]

        return results

rag_engine = RAGKnowledgeEngine()
rag_engine.initialize_knowledge_base()
