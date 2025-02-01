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
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
    
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
    
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation and the provided context is from a pdf.
      If the context does not provide the answer to a question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question."
      AI assistant will not apologize for previous responses but will indicate new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
    
      PREVIOUS QUESTION MEMORY BLOCK START
      Here are the previous questions the user has asked:
      ${messages
        .filter((message: Message) => message.role === "user")
        .map((item: Message) => "- " + item.content)
        .join("\n")}
      PREVIOUS QUESTION MEMORY BLOCK END
    
      AI assistant will always remember and refer to past user questions for context.
      If the user asks about their previous questions, AI assistant will summarize or list them accurately.
      If a question is related to past questions, AI assistant will provide a response considering the previous discussion.
      `,
    };

    try {
      // console.log(prompt)
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
