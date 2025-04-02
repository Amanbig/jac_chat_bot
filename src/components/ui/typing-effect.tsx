'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkRehype from 'remark-rehype';

interface TypingEffectProps {
    content?: string; // Optional content prop
    className?: string;
    speed?: number;
    onComplete?: () => void;
    renderMarkdown?: boolean;
}

export function TypingEffect({
    content = '', // Default to empty string
    className,
    speed = 30,
    onComplete,
    renderMarkdown = false
}: TypingEffectProps) {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // If content is empty or not provided, complete immediately
        if (!content) {
            setDisplayedContent('');
            setIsComplete(true);
            onComplete?.();
            return;
        }

        let currentIndex = 0;
        setDisplayedContent(''); // Reset to empty string
        setIsComplete(false);

        const interval = setInterval(() => {
            if (currentIndex < content.length) {
                setDisplayedContent((prev) => {
                    const nextChar = content[currentIndex] || '';
                    return prev + nextChar;
                });
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [content, speed, onComplete]);

    return (
        <div
            className={cn(
                'typing-effect opacity-0 animate-fade-in',
                !isComplete && 'typing',
                isComplete && 'opacity-100',
                className
            )}
        >
            {renderMarkdown ? (
                <ReactMarkdown
                    remarkPlugins={[remarkRehype]}
                    components={{
                        p: ({ node, ...props }) => <p {...props} key={Math.random().toString(36)} />,
                        code: ({ node, ...props }) => <code {...props} key={Math.random().toString(36)} />
                    }}
                >
                    {displayedContent || ''} 
                </ReactMarkdown>
            ) : (
                displayedContent
            )}
        </div>
    );
}