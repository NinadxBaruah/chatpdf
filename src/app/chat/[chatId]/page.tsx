import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params }: Props) => {
  const { chatId } = await params;
  const { userId } = await auth();

  if (!userId) return redirect("/sign-in");

  // const _chats = await db
  //   .select()
  //   .from(chats)
  //   .where(eq(chats.id, parseInt(chatId)));

  const _allChats = await db.select().from(chats)

  console.log("_allChats",_allChats)
  if (!_allChats || !_allChats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _allChats.find(chat => chat.id === parseInt(chatId));

  return (
    <div className="h-screen w-full flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden p-2 border-b flex items-center justify-between bg-white/95 backdrop-blur">
        <div className="flex items-center">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            id="mobile-menu-button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-2 font-medium text-gray-800">Chat History</span>
        </div>
        <div className="flex gap-2" id="view-toggle">
          <button className="px-3 py-1 rounded-full text-gray-600" data-view="pdf">
            PDF
          </button>
          <button className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 " data-view="chat">
            Chat
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div id="sidebar" className="fixed md:relative inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 bg-white border-r md:translate-x-0 h-screen -translate-x-full">
        <ChatSideBar chats={_allChats} chatId={parseInt(chatId)}/>
      </div>

      {/* Overlay */}
      <div id="sidebar-overlay" className="fixed inset-0 z-20 bg-black/50 md:hidden hidden" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-white shadow-sm md:block hidden" id="pdf-view">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ''}/>
        </div>

        {/* Chat Component */}
        <div className="w-full md:w-96 flex flex-col border-l bg-white/95 backdrop-blur" id="chat-view">
          <ChatComponent chatId={parseInt(chatId)}/>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;