// MessageList.tsx
import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import React from "react";

type Props = {
  messages: Message[];
};

const MessageList = ({ messages }: Props) => {

  console.log("messages from list",messages)
  if (messages.length == 0) return (
    <div className="flex-1 flex items-center justify-center text-gray-400 text-center p-4">
      <div className="space-y-2">
        <div className="text-lg">Start a conversation</div>
        <div className="text-sm">Ask questions about your document</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 px-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex animate-in fade-in", {
            "justify-end": message.role === "user",
            "justify-start": message.role === "assistant",
          })}
        >
          <div
            className={cn(
              "rounded-2xl p-4 max-w-[85%] text-sm transition-colors",
              message.role === "user"
                ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
                : "bg-gray-100 text-gray-800"
            )}
          >
            <p className="leading-relaxed">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;