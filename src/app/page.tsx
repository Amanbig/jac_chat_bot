"use client"

import { useState, useEffect } from 'react';
import UserInputBar from "@/components/app/userInputBar";
import UserMessageArea from "@/components/app/UserMessageArea";
import { Message } from '@/types/message';
import { motion } from 'framer-motion';
import { askQuestion, createSession } from '@/lib/api';
import { Toaster, toast } from 'sonner';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-7xl mx-auto px-4 relative">
      {/* Add Sonner Toaster component */}
      <Toaster position="top-center" richColors theme='dark' />

      {messages.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="w-full space-y-4">
              <UserMessageArea messages={messages} />
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto text-center">
              <UserInputBar onSubmit={handleSubmit} isLoading={isLoading} />
              <p className='text-sm text-amber-500 pt-2'>JAC BOT can make mistakes. Please double-check responses and refer to website <a className='text-cyan-600 cursor-pointer hover:text-cyan-800'>https://jacchd.admissions.nic.in/</a></p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-7xl text-white font-light text-center leading-tight"
          >
            How may I help you today?
          </motion.div>
          <div className='h-20'>

          </div>
          <div className="w-full">
            <UserInputBar onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}