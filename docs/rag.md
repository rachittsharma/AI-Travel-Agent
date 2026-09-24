# RAG Knowledge Engine Documentation

The RAG (Retrieval-Augmented Generation) system powers destination recommendation grounding for the AI Travel Agent.

## Document Structure
Destination guides are stored in markdown format inside `rag/documents/`:
- `goa.md`
- `manali.md`
- `jaipur.md`
- `kerala.md`
- `mumbai_delhi.md`

## Ingestion & Retrieval Pipeline
1. **Document Loading**: Reads `.md` files dynamically from `rag/documents/`.
2. **Chunking**: Splits documents into section chunks based on markdown `## ` headings.
3. **Metadata Enrichment**: Attaches `destination`, `section`, `source`, and `text` properties.
4. **Scoring & Vector Search**: Queries chunks matching destination name and keywords.
5. **LLM Context Injection**: Passes top-k chunks into Gemini 2.5 Flash prompt for grounded response generation.
