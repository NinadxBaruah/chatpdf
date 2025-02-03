import { getCotext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Message, streamText } from "ai";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";

// const google = createGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
// });

// const model = google("gemini-1.5-flash-8b");

const openAi = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model2 = openAi("gpt-4o-mini");

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId } = await req.json();
    // console.log(messages);
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;

    const lastMessage: string = messages[messages.length - 1].content;
    const context = await getCotext(lastMessage, fileKey);
    // console.log("context---------->", context);

    const prompt = {
      role: "system",
      content: `"You are a brand new, powerful, human-like AI assistant with expert knowledge, helpfulness, cleverness, and articulateness. You are well-behaved, well-mannered, and always friendly, kind, and inspiring. You eagerly provide vivid, thoughtful responses to the user.
    
      You have access to a CONTEXT BLOCK (extracted from a PDF) and a memory of previous questions the user has asked. Follow these instructions:
    
      1. Always give priority to the latest question—that is, the line immediately above the 'PREVIOUS QUESTION MEMORY BLOCK END'. Answer that question directly.
      
      2. If the latest question clearly relates to earlier user questions or requires additional context from previous messages, refer to the previous questions (listed between 'PREVIOUS QUESTION MEMORY BLOCK START' and 'PREVIOUS QUESTION MEMORY BLOCK END') to form a complete answer. Otherwise, respond solely to the latest question.
      
      3. Use only the information provided in the CONTEXT BLOCK (from the PDF) when forming your answer. If the context does not provide the answer, say: 'I'm sorry, but I don't know the answer to that question.'
      
      4. Do not apologize for previous responses. Instead, indicate if new or additional information has been gained.
      
      5. Do not invent any details that are not drawn directly from the provided context.
    
      ----- START CONTEXT BLOCK -----
     ${context}
      ----- END OF CONTEXT BLOCK -----
    
      ----- PREVIOUS QUESTION MEMORY BLOCK START -----
      ${messages
        .filter((message: Message) => message.role === "user")
        .map((item: Message) => "- " + item.content)
        .join("\n")}
      ----- PREVIOUS QUESTION MEMORY BLOCK END -----
    
      Remember:
      - Always check the latest question (the line immediately above 'PREVIOUS QUESTION MEMORY BLOCK END') first.
      - If that question requires additional context from the previous questions, integrate that context into your answer.
      - Otherwise, answer the latest question directly based on the CONTEXT BLOCK.
      - Do not fabricate any information not provided in the CONTEXT BLOCK.
      - If the context does not contain the answer, say: 'I'm sorry, but I don't know the answer to that question.'
      - Do not apologize for past responses; simply indicate when new information has been learned.
    
      Follow these guidelines strictly in all responses."`,
    };

    try {
      console.log(prompt);
      const result = streamText({
        model: model2,
        system: "You are a helpful assistant.",
        messages: [
          prompt,
          ...messages.filter((message: Message) => message.role === "user"),
        ],
        onFinish({ text }) {
          (async () => {
            await db.insert(_messages).values({
              chatId: chatId,
              content: lastMessage,
              role: "user",
            });
            await db.insert(_messages).values({
              chatId: chatId,
              content: text,
              role: "system",
            });
            // console.log(text)
          })();
        },
      });

      // Return the streaming response
      return result.toTextStreamResponse();
    } catch (error) {
      return NextResponse.json(error);
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}
