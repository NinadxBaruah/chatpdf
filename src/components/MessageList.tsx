import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import React, { useEffect, useRef } from "react";
import TypingIndicator from "./TypingIndicator";

type Props = {
  messages: Message[];
  isLoading: boolean;
};

const MessageList = ({ messages, isLoading }: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-center p-4">
        <div className="space-y-2">
          <div className="text-lg">Start a conversation</div>
          <div className="text-sm">Ask questions about your document</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex animate-in fade-in slide-in-from-bottom-2", {
            "justify-end": message.role === "user",
            "justify-start": message.role === "assistant",
          })}
        >
          <div
            className={cn(
              "rounded-2xl px-4 py-3 max-w-[80%] text-sm",
              message.role === "user"
                ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
                : "bg-gray-100 text-gray-800"
            )}
          >
            <p className="leading-relaxed break-words">{message.content}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex animate-in fade-in slide-in-from-bottom-2 justify-start">
          <div className="rounded-2xl px-4 py-3 max-w-[80%] text-sm bg-gray-100 text-gray-800">
            <TypingIndicator />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;