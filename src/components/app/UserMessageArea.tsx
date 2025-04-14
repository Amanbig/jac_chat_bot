import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Check, Copy, RotateCw } from "lucide-react";
import { LineTypingEffect } from "@/components/ui/line-typing-effect";
import "prismjs/themes/prism.css";
import { motion, AnimatePresence } from 'framer-motion';

interface Source {
    source: string;
    type: string;
    relevance: number;
    content_preview: string;
    page?: number;
    section: string;
}

type Message = {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    sources?: Source[];
};

interface MessageActionsProps {
    content: string;
    onRegenerate?: () => void;
}

interface SourcesProps {
    sources?: Source[];
}

function MessageActions({ content, onRegenerate }: MessageActionsProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    return (
        <div className="flex gap-2 m-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted transition-colors duration-200 relative group cursor-pointer"
                onClick={handleCopy}
                title="Copy message"
            >
                {
                    !isCopied ? <Copy className="w-5 h-5" />
                        : <Check className="w-5 h-5" />
                }

            </Button>
            {/* {onRegenerate && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted transition-colors duration-200 relative group cursor-pointer"
                    onClick={onRegenerate}
                    title="Regenerate response"
                >
                    <RotateCw className="h-4 w-4" />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Regenerate
                    </span>
                </Button>
            )} */}
        </div>
    );
}


function Sources({ sources }: SourcesProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!sources || sources.length === 0) return null;

    // Remove duplicate sources based on source name and page number
    const uniqueSources = sources.reduce((acc: Source[], current) => {
        const isDuplicate = acc.some(
            (item) => item.source === current.source && item.page === current.page
        );
        if (!isDuplicate) {
            acc.push(current);
        }
        return acc;
    }, []);

    const filteredSources = uniqueSources.filter((source) => source.relevance >= 0.5);

    return (
        <div className="mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-lg bg-secondary/50 p-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-secondary/70"
            >
                <div className="flex items-center gap-2">
                    <span>Sources</span>
                    <span className="text-xs text-muted-foreground">
                        ({filteredSources.length} found)
                    </span>
                </div>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="text-muted-foreground"
                >
                    ▼
                </motion.span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="mt-2 space-y-2 overflow-hidden"
                    >
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {filteredSources.map((source, index) => (
                                <motion.div
                                    key={`${source.source}-${source.page}-${index}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="rounded-lg border border-border bg-secondary/50 p-3 text-sm transition-colors duration-200 hover:bg-secondary/70"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`/pdfs/${source.source}${source.source.includes('.') ? '' : '.pdf'}${source.page ? '#page=' + source.page : ''}`}
                                                className="font-medium text-primary underline transition-colors duration-150 hover:text-primary/80"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`Open ${source.source}`}
                                            >
                                                {source.source}
                                            </a>
                                            {source.page && (
                                                <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                                    Page {source.page}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{source.type}</span>
                                            <span
                                                className={cn(
                                                    'rounded px-2 py-0.5 text-xs font-medium',
                                                    source.relevance > 0.7
                                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                        : source.relevance > 0.4
                                                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                            : 'bg-secondary text-muted-foreground'
                                                )}
                                                title="Source relevance score"
                                            >
                                                {(source.relevance * 100).toFixed(0)}% match
                                            </span>
                                        </div>
                                    </div>
                                    {source.content_preview && (
                                        <div className="mt-2 border-l-2 border-border pl-3 text-xs leading-relaxed text-muted-foreground">
                                            {source.content_preview}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface UserMessageAreaProps {
    messages: Message[];
    className?: string;
}

export default function UserMessageArea({ messages, className }: UserMessageAreaProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const lastScrollTop = useRef(0);
    const lastMessageCount = useRef(0);

    // Handle scroll detection
    useEffect(() => {
        const scrollContainer = scrollAreaRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            const currentScrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;
            const isAtBottom = Math.abs((currentScrollTop + clientHeight) - scrollHeight) < 50;

            if (currentScrollTop < lastScrollTop.current && !isAtBottom) {
                setIsUserScrolling(true);
            } else if (isAtBottom) {
                setIsUserScrolling(false);
            }

            lastScrollTop.current = currentScrollTop;
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (!scrollAreaRef.current || messages.length === 0) return;

        // Only auto-scroll if we have a new message or if user is at bottom
        if (messages.length > lastMessageCount.current && !isUserScrolling) {
            const scrollToBottom = () => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end'
                    });
                }
            };

            // Delay scrolling for assistant messages to account for typing animation
            const delay = messages[messages.length - 1].role === "assistant" ? 800 : 100;
            setTimeout(scrollToBottom, delay);
        }

        lastMessageCount.current = messages.length;
    }, [messages, isUserScrolling]);

    // Function to trim leading/trailing whitespace while preserving internal formatting
    const trimMessage = (content: string) => {
        return content.trim();
    };

    return (
        <div className="flex justify-center w-full">
            <div className="w-full">
                <ScrollArea
                    className={cn("h-[85vh] scrollbar-hide", className)}
                    ref={scrollAreaRef}
                >
                    <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-4 md:p-6">
                        {messages.map((message) => {
                            const trimmedContent = message.role === "user" ? trimMessage(message.content) : message.content;

                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex items-start gap-2 sm:gap-4 rounded-xl sm:rounded-3xl p-3 sm:p-4 md:p-6 w-full max-w-[98%] sm:max-w-[95%] md:max-w-[90%] mx-auto transition-all duration-200",
                                        message.role === "user" ? "bg-muted" : "bg-background border border-border"
                                    )}
                                >
                                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0">
                                        {message.role === "assistant" ? (
                                            <>
                                                <AvatarImage src="/main_avatar.png" alt="AI Assistant" className="object-cover" />
                                                <AvatarFallback>AI</AvatarFallback>
                                            </>
                                        ) : (
                                            <>
                                                <AvatarImage src="/user-avatar.png" alt="User" className="object-cover" />
                                                <AvatarFallback>U</AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-xs sm:text-sm font-medium mb-1 text-foreground">
                                            {message.role === "user" ? "You" : "JAC BOT"}
                                        </div>
                                        <div className={cn(
                                            "prose prose-sm max-w-none prose-invert dark:prose-invert"
                                        )}>
                                            {message.role === "assistant" ? (
                                                <>
                                                    <div className="prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border">
                                                        <LineTypingEffect
                                                            content={message.content || ''}
                                                            speed={300}
                                                            initialDelay={500}
                                                            renderMarkdown={true}
                                                            staggerChildren={0.2}
                                                            cursor={true}
                                                            cursorChar="▋"
                                                            className="prose-code:text-blue-400"
                                                        />
                                                    </div>
                                                    {/* <p className="text-sm p-2">Please refer to the following source for more information:{'   '}
                                                        <a
                                                            href={`/pdfs/jac_brochure_2025.pdf`}
                                                            className="font-medium text-blue-400 underline transition-colors duration-150 hover:text-blue-300"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title={`Open jac_brochure_2025`}
                                                        >
                                                            jac_brochure_2025
                                                        </a>
                                                    </p> */}
                                                    <p className="text-sm bg-muted border border-border rounded-md p-3 my-4 text-muted-foreground mx-auto">
                                                        <span className="font-medium">Disclaimer:</span> Information displayed may not reflect the most current data. For official and up-to-date information, please visit the
                                                        <a
                                                            href="https://jacchd.admissions.nic.in/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 underline mx-1 font-medium"
                                                        >
                                                            Joint Admission Committee Chandigarh portal
                                                        </a>
                                                        directly.
                                                    </p>
                                                    {message.sources && message.sources.length > 0 && (
                                                        <Sources sources={message.sources} />
                                                    )}
                                                    <MessageActions
                                                        content={message.content}
                                                        onRegenerate={message.role === "assistant" ? () => { } : undefined}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <div className="whitespace-pre-wrap break-words">
                                                        <ReactMarkdown components={{
                                                            pre: ({ children }) => <pre className="overflow-x-auto max-w-full p-4 my-4 bg-gray-900 rounded-lg border border-gray-700">{children}</pre>,
                                                            a: ({ children, href }) => {
                                                                if (typeof children === 'string' && children.startsWith('[') && children.endsWith(']')) {
                                                                    const sourceName = children.slice(1, -1);
                                                                    const source = message.sources?.find(s => s.source === sourceName);
                                                                    if (source) {
                                                                        const fileExt = sourceName.includes('.') ? '' : '.pdf';
                                                                        const pageInfo = source.page ? ` (Page ${source.page})` : '';
                                                                        return (
                                                                            <a
                                                                                href={`/public/${sourceName}${fileExt}`}
                                                                                className="text-blue-400 hover:text-blue-300 underline"
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                {sourceName}{pageInfo}
                                                                            </a>
                                                                        );
                                                                    }
                                                                }
                                                                return (
                                                                    <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                                                                        {children}
                                                                    </a>
                                                                );
                                                            }
                                                        }}>
                                                            {trimmedContent}
                                                        </ReactMarkdown>
                                                    </div>
                                                    <MessageActions content={message.content} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Invisible div to scroll to end */}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}