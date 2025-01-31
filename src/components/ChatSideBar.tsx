import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="p-6 flex-1 overflow-hidden">
        <Link href="/">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-none">
            <PlusCircle className="w-5 h-5 mr-2 animate-pulse" />
            New Chat
          </Button>
        </Link>

        <div className="mt-6 space-y-3 overflow-y-auto h-[calc(100%-5rem)] scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <div
                className={cn(
                  "rounded-xl p-4 text-slate-300 flex items-center transition-all duration-200 backdrop-blur-sm",
                  {
                    "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg": chat.id === chatId,
                    "hover:bg-gray-800/50 hover:text-white hover:shadow-md": chat.id !== chatId,
                  }
                )}
              >
                <MessageCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium truncate">
                  {chat.pdfName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link
            href="/"
            className="hover:text-white transition-colors duration-200 font-medium"
          >
            Home
          </Link>
          <Link
            href="/"
            className="hover:text-white transition-colors duration-200 font-medium"
          >
            Source
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;