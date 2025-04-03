"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Loader2, LucideArrowUp } from 'lucide-react';

interface UserInputBarProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

const UserInputBar: React.FC<UserInputBarProps> = ({ onSubmit, isLoading }) => {
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
    <div className='flex justify-center text-center'>
      <div className='w-[70%] p-3 border-2 border-gray-600 rounded-4xl shadow-2xl shadow-gray-700'>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 p-2 rounded focus:outline-none shadow-inner min-h-[40px] max-h-[200px] overflow-y-auto resize-none"
          />
          <Button
            type="submit"
            className="p-4 bg-white text-black rounded-full shadow-md flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            ) : (
              <LucideArrowUp className="w-6 h-6 text-black" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserInputBar;