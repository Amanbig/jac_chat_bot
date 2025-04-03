'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

interface LineTypingEffectProps {
    content?: string;
    className?: string;
    speed?: number;
    initialDelay?: number;
    onComplete?: () => void;
    renderMarkdown?: boolean;
    staggerChildren?: number;
    cursor?: boolean;
    cursorChar?: string;
    linkClassName?: string;
}

export function LineTypingEffect({
    content = '',
    className,
    speed = 500,
    initialDelay = 0,
    onComplete,
    renderMarkdown = false,
    staggerChildren = 0.1,
    cursor = true,
    cursorChar = '|',
    linkClassName = 'text-blue-600 cursor-pointer hover:text-cyan-800 font-bold'
}: LineTypingEffectProps) {
    const [lines, setLines] = useState<string[]>([]);
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [isComplete, setIsComplete] = useState(false);

    const splitLines = useCallback((text: string) => {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }, []);

    // Memoize the processed lines to prevent unnecessary re-renders
    const processedLines = useMemo(() => splitLines(content), [content, splitLines]);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;
        let intervalId: NodeJS.Timeout;

        const startAnimation = async () => {
            if (!content) {
                setLines([]);
                setVisibleLines(0);
                setIsComplete(true);
                onComplete?.();
                return;
            }

            setLines(processedLines);
            setVisibleLines(0);
            setIsComplete(false);

            await new Promise(resolve => {
                timeoutId = setTimeout(resolve, initialDelay);
            });

            if (!mounted) return;

            intervalId = setInterval(() => {
                setVisibleLines(prev => {
                    if (prev < processedLines.length) {
                        return prev + 1;
                    }
                    clearInterval(intervalId);
                    setIsComplete(true);
                    onComplete?.();
                    return prev;
                });
            }, speed);
        };

        startAnimation();

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [content, speed, initialDelay, onComplete, processedLines]);

    const containerVariants = {
        hidden: { opacity: 1 }, // Changed from 0 to 1 to prevent initial flash
        visible: {
            opacity: 1,
            transition: {
                staggerChildren,
                delayChildren: initialDelay / 1000
            }
        }
    };

    const lineVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            marginBottom: 0
        },
        visible: {
            opacity: 1,
            height: 'auto',
            marginBottom: '0.5em',
            transition: {
                duration: 0.3,
                ease: 'easeInOut'
            }
        },
        exit: {
            opacity: 0,
            height: 0,
            marginBottom: 0,
            transition: {
                duration: 0.3,
                ease: 'easeInOut'
            }
        }
    };

    const cursorVariants = {
        blink: {
            opacity: [0, 1],
            transition: {
                duration: 0.5,
                repeat: Infinity,
                ease: 'linear'
            }
        }
    };

    return (
        <motion.div
            className={cn('line-typing-effect', className)}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {renderMarkdown ? (
                lines.slice(0, visibleLines).map((line, index) => (
                    <AnimatePresence key={`${line}-${index}`}>
                        <motion.div
                            variants={lineVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ node, ...props }) => <p {...props} />,
                                    code: ({ node, ...props }) => (
                                        <code
                                            {...props}
                                            className="bg-gray-100 px-1 py-0.5 rounded"
                                        />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul {...props} className="list-disc pl-5" />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol {...props} className="list-decimal pl-5" />
                                    ),
                                    a: ({ node, href, ...props }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={linkClassName}
                                            {...props}
                                        />
                                    ),
                                    table: ({ node, ...props }) => (
                                        <table className="border-collapse border border-gray-400" {...props} />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th className="border border-gray-300 p-2 bg-gray-100" {...props} />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td className="border border-gray-300 p-2" {...props} />
                                    ),
                                }}
                            >
                                {line}
                            </ReactMarkdown>
                        </motion.div>
                    </AnimatePresence>
                ))
            ) : (
                lines.slice(0, visibleLines).map((line, index) => (
                    <AnimatePresence key={`${line}-${index}`}>
                        <motion.div
                            variants={lineVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {line}
                        </motion.div>
                    </AnimatePresence>
                ))
            )}
            {cursor && !isComplete && (
                <motion.span
                    variants={cursorVariants}
                    animate="blink"
                    className="inline-block ml-1"
                >
                    {cursorChar}
                </motion.span>
            )}
        </motion.div>
    );
}