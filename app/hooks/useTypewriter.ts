import { useState, useEffect, useRef } from 'react';

interface TypewriterOptions {
  text: string;
  typingSpeed?: number; // Speed in milliseconds per character
  startDelay?: number; // Delay before typing starts
  onComplete?: () => void; // Callback when typing is complete
}

export function useTypewriter({
  text,
  typingSpeed = 50,
  startDelay = 500,
  onComplete,
}: TypewriterOptions) {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const textRef = useRef<string>(text);
  const indexRef = useRef<number>(0);

  // Reset when the text changes completely
  useEffect(() => {
    textRef.current = text;
    indexRef.current = 0;
    setDisplayedText('');
    
    // Only start typing if there's text to type
    if (text) {
      setIsTyping(true);
    }
  }, [text]);

  // Handle the typing animation
  useEffect(() => {
    if (!isTyping) return;

    // Initial delay before starting to type
    const delayTimer = setTimeout(() => {
      // Start typing characters one by one
      const typingInterval = setInterval(() => {
        if (indexRef.current < textRef.current.length) {
          setDisplayedText(prev => {
            // Get next character from the full text
            const nextChar = textRef.current.charAt(indexRef.current);
            indexRef.current += 1;
            return prev + nextChar;
          });
        } else {
          // We've reached the end of the text
          clearInterval(typingInterval);
          setIsTyping(false);
          onComplete?.(); // Call the completion callback if provided
        }
      }, typingSpeed);

      return () => clearInterval(typingInterval);
    }, startDelay);

    return () => clearTimeout(delayTimer);
  }, [isTyping, typingSpeed, startDelay, onComplete]);

  return { displayedText, isTyping };
} 