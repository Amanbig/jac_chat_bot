"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Loader2, LucideArrowUp } from "lucide-react";

interface UserInputBarProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  showNote?: boolean;
}

const UserInputBar: React.FC<UserInputBarProps> = ({ onSubmit, isLoading, showNote = true }) => {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea when content changes
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText);
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter creates a new line
      } else {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col justify-center text-center items-center w-full">
      <div className="w-full sm:w-[85%] md:w-[80%] lg:w-[70%] p-2 sm:p-3 border border-border rounded-2xl sm:rounded-4xl shadow-lg transition-all duration-300 hover:border-amber-500/50 focus-within:border-amber-500 bg-secondary/40 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 p-2 sm:p-3 text-sm sm:text-base rounded focus:outline-none min-h-[40px] max-h-[200px] overflow-y-auto resize-none bg-transparent text-foreground placeholder-muted-foreground transition-colors duration-200"
          />
          <div className="flex items-end gap-2">
            <p className="hidden md:flex text-xs text-muted-foreground items-center gap-1 self-end">
              <span className="px-1.5 py-0.5 bg-muted/30 rounded text-xs">Shift+⏎</span> for new line
            </p>
            <Button
              type="submit"
              disabled={isLoading}
              className={`p-2 sm:p-3 md:p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-md flex-shrink-0 transition-all duration-200 ${isLoading ? "opacity-80" : ""}`}
              aria-label={isLoading ? "Loading" : "Send message"}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                <LucideArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </Button>
          </div>
        </form>
      </div>
      {showNote && (
        <p className="text-xs sm:text-sm text-muted-foreground pt-2 max-w-[90%] mx-auto">
          NDMC BOT can make mistakes. Please double-check responses and refer to website{" "}
          <a
            href="https://www.ndmc.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-600 underline"
          >
            https://www.ndmc.gov.in/
          </a>
        </p>
      )}
    </div>
  );
};

export default UserInputBar;