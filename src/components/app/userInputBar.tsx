"use client"

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, LucideArrowUp } from 'lucide-react';

interface UserInputBarProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

const UserInputBar: React.FC<UserInputBarProps> = ({ onSubmit,isLoading }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText);
      setInputText('');
    }
  };

  return (
    <div className='flex justify-center text-center'>
    <div className='w-[70%] p-3 border-2 border-gray-600 rounded-4xl shadow-2xl shadow-gray-700'>
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 rounded focus:outline-none shadow-inner"
      />
      <Button 
        type="submit"
        className="p-4 bg-white text-black rounded-full shadow-md"
      >
                      {isLoading ? (
                          
                              <Loader2 className="w-6 h-6 animate-spin text-black" />
                          
                      )
                      : (
                          <LucideArrowUp className="w-6 h-6 text-black" />
                      )
                    }
      </Button>
    </form>
      </div>
      </div>
  );
};

export default UserInputBar;
