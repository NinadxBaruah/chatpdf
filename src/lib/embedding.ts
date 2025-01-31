// // lib/embeddings.ts
// import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// export const getEmbeddings = async (text: string): Promise<number[]> => {
//   const embeddings = new HuggingFaceInferenceEmbeddings({
//     apiKey: process.env.HUGGINGFACE_API_KEY!,
//     // model: "sentence-transformers/all-MiniLM-L6-v2",
//     model:'Alibaba-NLP/gte-Qwen2-1.5B-instruct',
    
//   });
  
//   try {
//     const embedding = await embeddings.embedQuery(text);
//     return embedding;
//   } catch (error) {
//     console.error("Embedding generation failed:", error);
//     throw new Error("Failed to generate text embeddings");
//   }
// };

// lib/embeddings.js
// lib/embeddings.ts
// import { OllamaEmbeddings } from "@langchain/ollama";

// export const getEmbeddings = async (text: string): Promise<number[]> => {
//   const embeddings = new OllamaEmbeddings({
//     model: "snowflake-arctic-embed:335m", // Model name you pulled
//     baseUrl: "http://localhost:11434", // Local Ollama server
//   });

//   try {
//     const embedding = await embeddings.embedQuery(text);
//     return embedding;
//   } catch (error) {
//     console.error("Embedding generation failed:", error);
//     throw new Error("Failed to generate text embeddings");
//   }
// };

import {OpenAIEmbeddings} from "@langchain/openai"


export const getEmbeddings = async (text: string): Promise<number[]> =>{
  const embeddings = new OpenAIEmbeddings({
    model : "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  })
  
  return await embeddings.embedQuery(text);
}