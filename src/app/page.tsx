"use client"

import { useState, useEffect, useRef } from 'react';
import UserInputBar from "@/components/app/userInputBar";
import UserMessageArea from "@/components/app/UserMessageArea";
import { Message } from '@/types/message';
import { motion } from 'framer-motion';
import { askQuestion, createSession } from '@/lib/api';
import { Toaster, toast } from 'sonner';
import { LineTypingEffect } from '@/components/ui/line-typing-effect';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [typingComplete, setTypingComplete] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const id = await createSession();
        setSessionId(id);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        toast.error('Failed to initialize session. Please refresh the page.');
      }
    };

    initSession();
  }, []);

  const handleSubmit = async (content: string) => {
    if (!sessionId) {
      toast.error('No active session. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setTypingComplete(false);
    const newMessage = {
      id: `msg_${messages.length + 1}`,
      role: "user" as const,
      content,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);

    try {
      const response = await askQuestion(sessionId, content);
      const assistantMessage = {
        id: `msg_${messages.length + 2}`,
        role: "assistant" as const,
        content: response.response,
        timestamp: new Date(),
        sources: response.sources,
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error('Failed to get a response. Please try again.');
      setTypingComplete(true); // Reset typing state on error
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-2 sm:px-4 relative">
      {/* Add Sonner Toaster component */}
      <Toaster position="top-center" richColors />

      {messages.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 pt-2 sm:pt-4">
            <div className="w-full space-y-2 sm:space-y-4">
              <UserMessageArea
                messages={messages}
                onTypingComplete={() => {
                  setTypingComplete(true);
                  if (!isLoading) return; // Avoid setting loading state if already false
                  setIsLoading(false);
                }}
              />
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 bg-background/80 backdrop-blur-sm border-t border-border">
            <div className="max-w-7xl mx-auto text-center">
              <UserInputBar onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen h-full py-2 sm:py-4 space-y-2 sm:space-y-3 px-2 relative overflow-auto">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-transparent opacity-30 pointer-events-none" />

          {/* Main welcome message with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-4xl md:text-5xl text-foreground font-light text-center leading-tight max-w-4xl mt-2"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-300">Welcome to NDMC Bot</span>
          </motion.div>

          {/* Animated subtitle with typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg sm:text-xl text-muted-foreground text-center max-w-2xl"
          >
            <LineTypingEffect
              content="How may I help you today?"
              speed={50}
              initialDelay={500}
              className="text-center"
            />
          </motion.div>

          {/* Bot avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="relative"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-500/50 shadow-lg shadow-amber-500/20">
              <img
                src="/main_avatar.png"
                alt="NDMC Bot"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-4xl w-full"
          >
            {[
                { icon: "🎓", title: "Admission Guidance", description: "Get information about NDMC school admissions" },
                { icon: "📝", title: "Document Help", description: "Learn about documents and deadlines for NDMC admissions" },
                { icon: "🏫", title: "School Information", description: "Explore NDMC schools and available classes" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
                className="bg-secondary/40 backdrop-blur-sm p-2 sm:p-3 rounded-xl border border-border hover:border-amber-500/50 transition-all duration-300 hover:shadow-md hover:shadow-amber-500/10"
              >
                <div className="text-xl mb-1">{feature.icon}</div>
                <h3 className="text-amber-400 font-medium text-sm mb-0.5">{feature.title}</h3>
                <p className="text-muted-foreground text-xs">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Sample questions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <h3 className="text-center text-secondary-foreground text-sm mb-2">Try asking:</h3>
            <div className="flex flex-wrap justify-center gap-1.5">
              {[
                  "What is the NDMC school admission process?",
                  "Which schools are managed by NDMC?",
                  "What documents are required for NDMC school admission?"
              ].map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + (index * 0.1), duration: 0.3 }}
                  onClick={() => handleSubmit(question)}
                  className="bg-secondary/60 hover:bg-secondary/80 text-secondary-foreground hover:text-foreground px-2 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 border border-border hover:border-amber-500/50"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Input bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="w-full mx-auto mt-2"
          >
            <UserInputBar onSubmit={handleSubmit} isLoading={isLoading} showNote={false} />
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="text-sm text-muted-foreground text-center max-w-3xl mx-auto px-2 w-full mt-1"
          >
              This bot provides information about New Delhi Municipal Council (NDMC) Chandigarh. For official information, please visit <a href="https://www.ndmc.gov.in/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 underline">ndmc.gov.in</a>
          </motion.div>
        </div>
      )}
    </div>
  );
}