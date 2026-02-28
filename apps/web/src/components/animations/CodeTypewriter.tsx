import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface CodeLine {
  text: string;
  type?: "keyword" | "string" | "comment" | "default";
}

interface CodeTypewriterProps {
  lines: CodeLine[];
  speed?: number;
  lineDelay?: number;
  className?: string;
}

export function CodeTypewriter({ lines, speed = 40, lineDelay = 500, className }: CodeTypewriterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Show all lines immediately if reduced motion
  const showAll = prefersReducedMotion && isInView;

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    if (currentLine >= lines.length) return;

    const line = lines[currentLine];

    if (currentChar < line.text.length) {
      const timer = setTimeout(() => setCurrentChar((c) => c + 1), speed);
      return () => clearTimeout(timer);
    } else if (currentLine < lines.length - 1) {
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, lineDelay);
      return () => clearTimeout(timer);
    }
  }, [isInView, currentLine, currentChar, lines, speed, lineDelay, prefersReducedMotion]);

  // Blink cursor — only when animation is active
  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  const getColorClass = (type?: string) => {
    switch (type) {
      case "keyword": return "text-primary";
      case "string": return "text-warm-gray-light";
      case "comment": return "text-muted-foreground";
      default: return "text-white";
    }
  };

  return (
    <div ref={ref} className={cn("font-mono text-body-sm", className)} aria-label="Code example">
      {lines.map((line, lineIdx) => {
        if (!showAll && lineIdx > currentLine) return null;

        const text = showAll
          ? line.text
          : lineIdx < currentLine
            ? line.text
            : line.text.slice(0, currentChar);

        return (
          <div key={lineIdx} className="min-h-[1.5em]">
            <span className={getColorClass(line.type)}>{text}</span>
            {!showAll && lineIdx === currentLine && (
              <span className={cn("inline-block w-[2px] h-[1em] bg-primary ml-px align-middle", !showCursor && "opacity-0")} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
