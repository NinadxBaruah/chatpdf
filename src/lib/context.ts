import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embedding";
import { db } from "./db";
import { chats, DrizzleChat } from "./db/schema";
import { eq } from "drizzle-orm";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const initializePinecone = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  return pinecone;
};
interface PineconeMetadata {
  text: string;
  pageNumber: number;
}
interface sparseType {
  indices: number[]; 
  values: number[];  
}
interface PineconeVector {
  id: string;
  values: number[];
  sparseValues?: sparseType; 
  metadata: PineconeMetadata;
}

type PineconeResponse = {
  [key: string]: PineconeVector;
}

export async function getVectorSearchInNameSpace(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = await initializePinecone();

  const index = pinecone.Index("chatpdf");

  try {
    const nameSpace = convertToAscii(fileKey);
    const queryResult = await index.namespace(nameSpace).query({
      topK: 100,
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.error("error embedding the query", error);
  }
}

async function getVectorIdsForNamespace(namespace: string): Promise<string[]> {
  const hash_ids: DrizzleChat[] = await db
    .select()
    .from(chats)
    .where(eq(chats.fileKey, namespace));

  if (hash_ids.length === 0) return [];
  return hash_ids[0].vectorIds;
}

export async function getAllPinceconeEmbeddings(fileKey: string) : Promise<PineconeResponse> {
  const pinecone = await initializePinecone();

  const index = pinecone.Index("chatpdf");

  try {
    const listRespose = await getVectorIdsForNamespace(fileKey);

    if (!listRespose || listRespose.length === 0) {
      console.log("No vector IDs found for namespace:", fileKey);
      return {};
    }

    // Fetch the embeddings and metadata in batches.
    const batchSize = 1000;
    let allVectors = {};

    for (let i = 0; i < listRespose.length; i += batchSize) {
      // const batchIds = listRespose.slice(i, i + batchSize);
      const fetchResponse = await index.namespace(fileKey).fetch(listRespose);
      // The fetchResponse should have a "vectors" object mapping vector IDs to their data.
      allVectors = { ...allVectors, ...fetchResponse.records };
    }
    // const fetchResponse = await index.namespace(fileKey).fetch(listRespose)
    // console.log(allVectors)
    return allVectors;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function getCotext(query: string, fileKey: string) {

  const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const model = google("gemini-1.5-flash-8b");


  // const openAi = createOpenAI({
  //   apiKey: process.env.OPENAI_API_KEY,
  // });

  // const model2 = openAi("gpt-4o-mini");

  const ai_response = await generateText({
    model: model,
    system: "You are a helpfull assistant",
    prompt: `Analyze the user's query below. Respond with **only** "true" or "false" (no punctuation, explanations, or formatting) based on the following criteria:

- The user is asking to **summarize** the PDF (e.g., "summarize this", "key points", "overview").
- The user is asking for a **conclusion** (e.g., "what’s the conclusion", "main takeaways").
- The user is requesting a **general definition/description** of the PDF’s content (e.g., "what is this about?", "explain the document").
- The query is broad and requires synthesizing **multiple sections** of the PDF.

**Query:** "${query}"`,
  });

  interface PineconeRecord {
    metadata?: PineconeMetadata;
    // Other fields from your vector record can be added here (e.g. id, values, etc.)
  }
  
  if (ai_response.text.trim().toLowerCase() == "true") {
    const datas : PineconeResponse  = (await getAllPinceconeEmbeddings(fileKey)) ?? {} as Record<string, PineconeRecord>;
    const texts = Object.values(datas)
      .map((obj) => obj.metadata?.text)
      .filter((txt) => txt != undefined);

    // console.log(texts)
    return texts;
  }

  const queryEmbeddings = await getEmbeddings(query);

  // console.log("queryEmbd------>" ,   queryEmbeddings)

  const matches = await getVectorSearchInNameSpace(queryEmbeddings, fileKey);

  // console.log("Matched emb---->" ,   matches)

  const docsToShow = matches?.filter(
    (match) => match.score && match.score > 0.2
  );

  // console.log("------------->",datas)

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = docsToShow?.map((match) => (match.metadata as Metadata).text);

  // const listRespose = await getVectorIdsForNamespace(fileKey);
  // console.log("------->",listRespose)

  return docs?.join("\n").substring(0, 3000);
}
