import React, { useState, useRef, memo } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame
} from "framer-motion";
import { MousePointerClick, Info, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const GridPattern = memo(({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => {
  return (
    <svg className="w-full h-full" aria-hidden="true">
      <defs>
        <motion.pattern
          id="grid-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
});
GridPattern.displayName = 'GridPattern';

const InfiniteGrid = () => {
  const [count, setCount] = useState(0);
  const [gridSize, setGridSize] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    if (prefersReducedMotion) return;
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + 0.5) % gridSize);
    gridOffsetY.set((currentY + 0.5) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full h-[calc(100vh-72px)] flex flex-col items-center justify-center overflow-hidden bg-background"
      )}
    >
      {/* Layer 1: Subtle background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.05]" aria-hidden="true">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>

      {/* Layer 2: Highlighted grid (mouse mask) */}
      <motion.div
        className="absolute inset-0 z-0 opacity-40"
        style={{ maskImage, WebkitMaskImage: maskImage }}
        aria-hidden="true"
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </motion.div>

      {/* Decorative Blur Spheres */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-warning/40 dark:bg-warning/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-info/40 dark:bg-info/20 blur-[120px]" />
      </div>

      {/* Grid Density Control */}
      <div className="absolute bottom-10 right-10 z-30 pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl space-y-3 min-w-[200px]">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            <label htmlFor="grid-density">Grid Density</label>
          </div>
          <input
            id="grid-density"
            type="range"
            min="20"
            max="100"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            aria-label={`Grid density: ${gridSize}px`}
            aria-valuemin={20}
            aria-valuemax={100}
            aria-valuenow={gridSize}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
            <span>Dense</span>
            <span>Sparse ({gridSize}px)</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto space-y-6 pointer-events-none">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground drop-shadow-sm">
            The Infinite Grid
          </h1>
          <p className="text-lg md:text-xl font-semibold text-muted-foreground">
            Move your cursor to reveal the active grid layer. <br />
            The pattern scrolls infinitely in the background.
          </p>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <motion.button
            onClick={() => setCount(count + 1)}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-md shadow-md border-2 border-transparent transition-colors"
          >
            <MousePointerClick className="w-4 h-4" aria-hidden="true" />
            Interact ({count})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-md border-2 border-transparent transition-colors"
          >
            <Info className="w-4 h-4" aria-hidden="true" />
            Learn More
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export { InfiniteGrid, GridPattern };
export default InfiniteGrid;
