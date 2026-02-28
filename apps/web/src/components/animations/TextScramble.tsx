import { useEffect, useState, useRef, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";

interface TextScrambleProps {
  texts: string[];
  interval?: number;
  speed?: number;
  className?: string;
}

export function TextScramble({ texts, interval = 4000, speed = 30, className }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(texts[0] || "");
  const [currentIndex, setCurrentIndex] = useState(0);
  const frameRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const scramble = useCallback(
    (target: string) => {
      if (prefersReducedMotion) {
        setDisplayText(target);
        return;
      }

      let resolved = 0;
      const length = target.length;

      const tick = () => {
        let output = "";
        for (let i = 0; i < length; i++) {
          if (i < resolved) {
            output += target[i];
          } else {
            output += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplayText(output);
        resolved++;

        if (resolved <= length) {
          frameRef.current = window.setTimeout(tick, speed);
        }
      };

      tick();
    },
    [speed, prefersReducedMotion]
  );

  useEffect(() => {
    scramble(texts[currentIndex]);

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => {
      clearInterval(timer);
      clearTimeout(frameRef.current);
    };
  }, [currentIndex, texts, interval, scramble]);

  return <span className={className} aria-label={texts[currentIndex]}>{displayText}</span>;
}
