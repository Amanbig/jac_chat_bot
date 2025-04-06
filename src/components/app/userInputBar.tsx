"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Loader2, LucideArrowUp } from 'lucide-react';

interface UserInputBarProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  showNote?: boolean;
}

const UserInputBar: React.FC<UserInputBarProps> = ({ onSubmit, isLoading, showNote=true }) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea when content changes
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to the scrollHeight to fit the content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust height on input text change
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText);
      setInputText('');
      // Reset height after submission
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Enter key for submission and Shift+Enter for new line
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter creates a new line - default behavior, no need to prevent
      } else {
        // Regular Enter submits the form
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    }

    // Also keep the Ctrl/Cmd + Enter shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className='flex flex-col justify-center text-center items-center w-full'>
      <div className='w-full sm:w-[85%] md:w-[80%] lg:w-[70%] p-2 sm:p-3 border-2 border-gray-600 rounded-2xl sm:rounded-4xl shadow-2xl shadow-gray-700 transition-all duration-300 hover:border-gray-500 focus-within:border-amber-500'>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 p-2 sm:p-3 text-sm sm:text-base rounded focus:outline-none shadow-inner min-h-[40px] max-h-[200px] overflow-y-auto resize-none bg-transparent text-gray-100 placeholder-gray-400 transition-colors duration-200"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className={`p-2 sm:p-3 md:p-4 bg-white text-black rounded-full shadow-md flex-shrink-0 hover:bg-gray-200 transition-all duration-200 ${isLoading ? 'opacity-80' : ''}`}
            aria-label={isLoading ? "Loading" : "Send message"}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-black" />
            ) : (
              <LucideArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            )}
          </Button>
        </form>
      </div>
     {
      showNote &&
      <p className='text-xs sm:text-sm text-amber-500 pt-2 max-w-[90%] mx-auto'>JAC BOT can make mistakes. Please double-check responses and refer to website <a href="https://jacchd.admissions.nic.in/" target="_blank" rel="noopener noreferrer" className='text-cyan-600 cursor-pointer hover:text-cyan-800 underline'>https://jacchd.admissions.nic.in/</a></p>
     } 
    </div>
  );
};

export default UserInputBar;