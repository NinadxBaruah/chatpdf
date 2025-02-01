import fs from "fs";
import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { getEmbeddings } from "./embedding";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { db } from "./db";
import { chats } from "./db/schema";
import { eq, sql } from "drizzle-orm";
// import {Document }  from "@pinecone-database/doc-splitter"
const initializePinecone = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

interface Vector {
  id: string;
  values: number[];
  metadata: {
    text: string;
    pageNumber: number;
  };
}
export async function loadS3IntoPinecone(file_key: string) {
  console.log(`donwload file from s3 to system`);
  // 1. First download the file from S3 using the file_key
  const file_name = await downloadFromS3(file_key);

  if (!file_name) {
    throw new Error("could not download from S3");
  }

  // 2. Now load the document and split it into diff pages
  const loader = new PDFLoader(file_name, {
    splitPages: true,
  });

  const pages = (await loader.load()) as PDFPage[];

  // 3. Now preparing the documents for vectorizing the data (break it into chunk size)
  const documents = (await Promise.all(pages.map(prepareDocs))).flat();

  // 4. Now vectorize the documents
  const vectors = await Promise.all(
    documents.map((item) => embedDocument(file_key, item))
  );

  // 5. upload the vectors to pinecone

  const client = await initializePinecone();

  const pineconeIndex = client.Index("chatpdf");

  console.log("inserting verctors in pinecone");

  const nameSpace = convertToAscii(file_key);

  // 6. Batch upsert with smaller chunks
  const BATCH_SIZE = 10;
  const vectorBatches = chunkArray(vectors, BATCH_SIZE);

  // 7. Process batches with progress tracking
  let successfulUpserts = 0;
  for (let i = 0; i < vectorBatches.length; i++) {
    try {
      await pineconeIndex.namespace(nameSpace).upsert(vectorBatches[i]);
      successfulUpserts++;
      console.log(
        `Successfully upserted batch ${i + 1}/${vectorBatches.length}`
      );
    } catch (error) {
      console.error(`Failed batch ${i + 1}:`, error);
    }
  }

  // 8. Delete the file from the local system after processing
  fs.unlink(file_name, (err) => {
    if (err) {
      console.error(`Error deleting file ${file_name}:`, err);
    } else {
      console.log(`File ${file_name} deleted successfully.`);
    }
  });
  return {
    success: successfulUpserts === vectorBatches.length,
    batchesAttempted: vectorBatches.length,
    batchesSucceeded: successfulUpserts,
    totalVectors: vectors.length,
  };
}

// Chunk array helper remains the same
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  return Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)
  );
};

// Updated embedDocument function
async function embedDocument(fileKey: string, doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    const newFileKey = convertToAscii(fileKey);

    // Check if the record exists
    const existingChat = await db
      .select()
      .from(chats)
      .where(eq(chats.fileKey, newFileKey));

    if (existingChat.length > 0) {
      // Correct update using array_append directly
      const res = await db
        .update(chats)
        .set({
          vectorIds : sql`array_append(${chats.vectorIds}, ${hash})` 
        })
        .where(eq(chats.fileKey, newFileKey))
        .returning();

      console.log("Update result:", res);
    }

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (error) {
    console.log(`error while embedding the document`, error);
    throw error;
  }
}
export const truncateStringByBytes = (str: string, bytes: number) => {
  // need to create a encoder object to later encode byte
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8", { fatal: true });

  // now converting the string to byte array
  const encoded = encoder.encode(str);

  // need to slice the extra bytes

  const sliced = encoded.slice(0, bytes);

  try {
    return decoder.decode(sliced);
  } catch (error) {
    console.log(error);
    return decoder.decode(sliced.slice(0, -1));
  }
};

async function prepareDocs(page: PDFPage) {
  const { metadata } = page;
  let { pageContent } = page;
  // Clean content
  pageContent = pageContent.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

  // Truncate content
  const truncatedContent = truncateStringByBytes(pageContent, 36000);

  // Create LangChain Document
  const document = new Document({
    pageContent: truncatedContent,
    metadata: {
      pageNumber: metadata.loc.pageNumber,
      text: truncatedContent,
    },
  });

  // Configure text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", ". ", "! ", "? ", ", ", " "],
  });

  // Split documents
  return splitter.splitDocuments([document]);
}
