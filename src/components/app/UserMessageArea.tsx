import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Copy, RotateCw } from "lucide-react";
import { LineTypingEffect } from "@/components/ui/line-typing-effect";
import "prismjs/themes/prism.css";
import Link from "next/link";

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
                className="h-8 w-8 hover:bg-gray-700 transition-colors duration-200 relative group cursor-pointer"
                onClick={handleCopy}
                title="Copy message"
            >
                <Copy className={cn("h-4 w-4", isCopied && "text-green-500")} />
                <span className={cn(
                    "absolute -bottom+58 left-1/2 transform -translate-x-1/2 text-white text-xs px-1 py-1 rounded transition-all duration-200",
                    isCopied ? "bg-green-600 opacity-100" : "bg-gray-800 opacity-0 group-hover:opacity-100"
                )}>
                    {isCopied ? "Copied!" : "Copy"}
                </span>
            </Button>
            {onRegenerate && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-700 transition-colors duration-200 relative group cursor-pointer"
                    onClick={onRegenerate}
                    title="Regenerate response"
                >
                    <RotateCw className="h-4 w-4" />
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Regenerate
                    </span>
                </Button>
            )}
        </div>
    );
}

function Sources({ sources }: SourcesProps) {
    if (!sources || sources.length === 0) return null;

    // Remove duplicate sources based on source name and page number
    const uniqueSources = sources.reduce((acc: Source[], current) => {
        const isDuplicate = acc.some(item =>
            item.source === current.source &&
            item.page === current.page
        );
        if (!isDuplicate) {
            acc.push(current);
        }
        return acc;
    }, []);

    return (
        <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-gray-200 flex items-center gap-2">
                <span>Sources</span>
                <span className="text-xs text-gray-400">({uniqueSources.length} found)</span>
            </div>
            <div className="space-y-2">
                {uniqueSources.map((source, index) => (
                    <div
                        key={`${source.source}-${source.page}-${index}`}
                        className="bg-gray-800/50 hover:bg-gray-800/70 rounded-lg p-3 text-sm border border-gray-700 transition-colors duration-200"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/pdfs/${source.source}${source.source.includes('.') ? '' : '.pdf'}${source.page ? '#page=' + source.page : ''}`}
                                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Open ${source.source}`}
                                >
                                    {source.source}
                                </Link>
                                {source.page && (
                                    <span className="text-gray-400 text-xs px-2 py-0.5 bg-gray-700/50 rounded">
                                        Page {source.page}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{source.type}</span>
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded text-xs",
                                        source.relevance > 0.7 ? "bg-green-500/20 text-green-400" :
                                            source.relevance > 0.4 ? "bg-yellow-500/20 text-yellow-400" :
                                                "bg-gray-500/20 text-gray-400"
                                    )}
                                    title="Source relevance score"
                                >
                                    {(source.relevance * 100).toFixed(0)}% match
                                </span>
                            </div>
                        </div>
                        {source.content_preview && (
                            <div className="text-gray-300 text-xs leading-relaxed border-l-2 border-gray-700 pl-3 mt-2">
                                {source.content_preview}
                            </div>
                        )}
                    </div>
                ))}
            </div>
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
                    <div className="flex flex-col gap-6 p-6">
                        {messages.map((message) => {
                            const trimmedContent = message.role === "user" ? trimMessage(message.content) : message.content;

                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex items-start gap-4 rounded-3xl p-6 w-full max-w-[95%]",
                                        message.role === "user" ? "bg-muted" : "bg-black"
                                    )}
                                >
                                    <Avatar className="h-8 w-8 shrink-0 border border-gray-200">
                                        {message.role === "assistant" ? (
                                            <>
                                                <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
                                                <AvatarFallback>AI</AvatarFallback>
                                            </>
                                        ) : (
                                            <>
                                                <AvatarImage src="/user-avatar.png" alt="User" />
                                                <AvatarFallback>U</AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-sm font-medium mb-1">
                                            {message.role === "user" ? "You" : "JAC BOT"}
                                        </div>
                                        <div className={cn(
                                            "prose prose-sm max-w-none",
                                            message.role === "user" ? "prose-invert" : "dark:prose-invert"
                                        )}>
                                            {message.role === "assistant" ? (
                                                <>
                                                    <div className="prose-pre:bg-black/80 prose-pre:border prose-pre:border-gray-800">
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
                                                            code: ({ inline, className, children }) => {
                                                                if (inline) {
                                                                    return <code className="text-blue-400 bg-black/30 px-1 py-0.5 rounded">{children}</code>;
                                                                }
                                                                return <code className="block text-blue-400 bg-black/30 p-1 rounded">{children}</code>;
                                                            },
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