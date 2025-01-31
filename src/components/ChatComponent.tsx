"use client";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { Message, useChat } from "ai/react";
import { Button } from "./ui/button";
import { SendHorizonal } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId });
      return response.data;
    }
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    streamProtocol:"text",
    body: { chatId },
    initialMessages: data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    // Sidebar toggle logic
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const viewToggle = document.getElementById('view-toggle');

    const toggleSidebar = () => {
      sidebar?.classList.toggle('-translate-x-full');
      overlay?.classList.toggle('hidden');
    };

    const handleViewToggle = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        const view = target.dataset.view;
        const pdfView = document.getElementById('pdf-view');
        const chatView = document.getElementById('chat-view');
        
        // Update button styles
        viewToggle?.querySelectorAll('button').forEach(btn => {
          btn.classList.toggle('bg-blue-100', btn === target);
          btn.classList.toggle('text-blue-600', btn === target);
          btn.classList.toggle('text-gray-600', btn !== target);
        });

        // Toggle views
        if (view === 'pdf') {
          pdfView?.classList.remove('hidden');
          chatView?.classList.add('hidden');
        } else {
          pdfView?.classList.add('hidden');
          chatView?.classList.remove('hidden');
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth >= 768) return;
      
      const target = e.target as HTMLElement;
      if (!sidebar?.contains(target) && !mobileMenuButton?.contains(target)) {
        sidebar?.classList.add('-translate-x-full');
        overlay?.classList.add('hidden');
      }
    };

    mobileMenuButton?.addEventListener('click', toggleSidebar);
    overlay?.addEventListener('click', toggleSidebar);
    viewToggle?.addEventListener('click', handleViewToggle);
    document.addEventListener('click', handleClickOutside);

    return () => {
      mobileMenuButton?.removeEventListener('click', toggleSidebar);
      overlay?.removeEventListener('click', toggleSidebar);
      viewToggle?.removeEventListener('click', handleViewToggle);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white/95 backdrop-blur">
        <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
      </div>

      <div className="flex-1 overflow-auto p-4" id="message-container">
        <MessageList messages={messages} />
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 p-4 border-t bg-white/95 backdrop-blur">
        <div className="flex gap-2 items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button 
            type="submit" 
            className="rounded-full w-10 h-10 p-0 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-sm"
          >
            <SendHorizonal className="h-4 w-4 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;