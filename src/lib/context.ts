import {Pinecone} from "@pinecone-database/pinecone"
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embedding";


const initializePinecone = async () =>{
    const pinecone = new Pinecone({
        apiKey : process.env.PINECONE_API_KEY!
    })

    return pinecone;
}

export async function getVectorSearchInNameSpace(
  embeddings: number[],
  fileKey: string
) {
    const pinecone = await initializePinecone();

    const index =  pinecone.Index('chatpdf')

    try {
        const nameSpace = convertToAscii(fileKey);
        const queryResult = await index.namespace(nameSpace).query({
            topK : 100,
            vector: embeddings,
            includeMetadata: true,
        })

        return queryResult.matches || [];
    } catch (error) {
        console.error("error embedding the query", error)
    }
}

export async function getCotext(query: string, fileKey: string) {

    const queryEmbeddings = await getEmbeddings(query);

    // console.log("queryEmbd------>" ,   queryEmbeddings)

    const matches = await getVectorSearchInNameSpace(queryEmbeddings , fileKey);

    console.log("Matched emb---->" ,   matches)

    const docsToShow = matches?.filter( (match) => match.score && match.score > 0.2);

    type Metadata = {
        text : string ,
        pageNumber : number
    }

    const docs = docsToShow?.map(match => (match.metadata as Metadata).text);

    return docs?.join('\n').substring(0, 3000);
}
