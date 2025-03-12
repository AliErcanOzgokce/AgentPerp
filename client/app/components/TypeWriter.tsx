"use client"
import { useState, useEffect } from 'react';

interface TypeWriterProps {
  content: string;
  onComplete?: () => void;
  delay?: number;
}

export default function TypeWriter({ content, onComplete, delay = 6 }: TypeWriterProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        // Add next character
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);

        // Add random delay variation for more natural feel
        delay = Math.random() * 2 + 5; // 5-7ms
        
        // Add shorter pause for punctuation
        if (['.', '!', '?', '\n'].includes(content[currentIndex])) {
          delay = 100;
        } else if ([',', ';'].includes(content[currentIndex])) {
          delay = 40;
        }
      }, delay);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [content, currentIndex, delay, onComplete]);

  return (
    <pre className="whitespace-pre-wrap font-sans">{displayedContent}</pre>
  );
} 