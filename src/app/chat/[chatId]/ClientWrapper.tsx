"use client";
import { useState } from "react";
import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";

export default function ClientWrapper({ chats, chatId, pdfUrl }: {
  chats: any[],
  chatId: number,
  pdfUrl: string
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-2 border-b flex items-center bg-white/90 backdrop-blur">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-2 font-medium text-gray-800">Chat History</span>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300
        bg-white border-r md:translate-x-0 h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block
      `}>
        <ChatSideBar chats={chats} chatId={chatId} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-white shadow-sm">
          <PDFViewer pdf_url={pdfUrl} />
        </div>

        {/* Chat Component */}
        <div className="w-full md:w-96 flex flex-col border-l bg-white/90 backdrop-blur">
          <ChatComponent chatId={chatId} />
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}