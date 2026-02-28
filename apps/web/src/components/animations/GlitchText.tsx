import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className }: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setGlitching(true);
      timeoutRef.current = setTimeout(() => setGlitching(false), 200);
    }, 3000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <span className={cn("relative inline-block", className)} aria-label={text} role="text">
      <span className="relative z-10">{text}</span>
      {glitching && !prefersReducedMotion && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 text-destructive z-0"
            style={{ clipPath: "inset(20% 0 40% 0)", transform: "translate(-2px, 1px)" }}
          >
            {text}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 text-info z-0"
            style={{ clipPath: "inset(60% 0 10% 0)", transform: "translate(2px, -1px)" }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}
