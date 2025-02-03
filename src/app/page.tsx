// app/page.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { LogIn, FileText, Users, Brain } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
// import { PDFProvider } from '@/components/PDFContext';

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => (
  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
    <Icon className="w-8 h-8 text-purple-600 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const features = [
  {
    icon: FileText,
    title: "Any PDF, Anytime",
    description:
      "Upload any PDF document and start chatting instantly with AI-powered insights",
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description:
      "Advanced AI technology understands context and provides accurate responses",
  },
  {
    icon: Users,
    title: "Growing Community",
    description:
      "Join over 50,000 users who trust our platform for their research needs",
  },
];

async function getFirstChatId() {
  try {
    const result = await db
      .select({ id: chats.id })
      .from(chats)
      .orderBy(chats.createdAt)
      .limit(1);

    return result?.[0]?.id || null;
  } catch (error) {
    console.error("Error fetching first chat:", error);
    return null;
  }
}

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const firstChatId = isAuth ? await getFirstChatId() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-auto px-2">
  <Link
    href="http://ninadbaruah.me/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs md:text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors duration-300 flex items-center justify-center gap-1 group"
  >
    Made with <span className="text-red-500 animate-pulse">💓</span> by{" "}
    <span className="relative inline-block">
      <span className="relative z-10">Ninad Baruah</span>
      <span className="absolute bottom-0 left-0 w-full h-px bg-current transition-all duration-300 group-hover:h-[2px]"></span>
    </span>
  </Link>
</div>
<div className="absolute top-4 right-4 z-20">
  {isAuth ? (
    <UserButton afterSignOutUrl="/" />
  ) : (
    <Link href="/sign-in">
      <Button variant="outline" className="shadow-sm">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    </Link>
  )}
</div>


      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-6 animate-fade-in">
            Chat With Any PDF
          </h1>
          <p className="text-xl text-slate-600 mb-8 animate-fade-in-up">
            Transform the way you interact with documents. Get instant answers,
            analyze research, and extract insights with our AI-powered chat
            interface.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            {isAuth ? (
              <div className="w-full max-w-md">
                {/* <PDFProvider> */}
                <FileUpload />
                {/* </PDFProvider> */}
              </div>
            ) : (
              <Link href="/sign-in">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Chatting Now
                  <LogIn className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

          {isAuth && (
            <div className="mt-12">
              {firstChatId ? (
                <Link href={`/chat/${firstChatId}?userId=${userId}`}>
                  <Button variant="outline" size="lg" className="shadow-sm">
                    Continue Last Chat
                  </Button>
                </Link>
              ) : (
                <Link href="/chats">
                  <Button variant="outline" size="lg" className="shadow-sm">
                    Go to My Chats
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
