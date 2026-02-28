import { useScroll, useTransform, motion } from 'framer-motion';
import React, { useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface SectionProps {
  scrollYProgress: ReturnType<typeof useTransform> | any;
  reducedMotion?: boolean;
}

const CAROUSEL_IMAGES = [
  '/images/scene1.png',
  '/images/scene5.png',
  '/images/scene2.png',
  '/images/scene3.png',
  '/images/scene4.png',
];

const IMAGE_ALT_TEXTS = [
  'AI agent analyzing medical data',
  'Natural language processing workflow',
  'Computer vision detection interface',
  'AI security monitoring dashboard',
  'Agricultural AI analysis system',
];

const Section1: React.FC<SectionProps> = ({ scrollYProgress, reducedMotion }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5]);

  const style = reducedMotion ? {} : { scale, rotate };

  return (
    <motion.div
      style={style}
      className="sticky top-0 h-screen flex flex-col items-center justify-center bg-background"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" aria-hidden="true" />
      <div className="relative z-10 text-center px-6">
        <h2 className="font-display text-display-md md:text-display-lg font-bold text-foreground mb-4">
          AI Agents That
          <br />
          Just Work
        </h2>
        <p className="font-body text-body-lg text-muted-foreground max-w-lg mx-auto">
          Scroll to explore the marketplace
        </p>
      </div>
    </motion.div>
  );
};

const Section2: React.FC<SectionProps> = ({ scrollYProgress, reducedMotion }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);

  const style = reducedMotion ? {} : { scale, rotate };

  return (
    <motion.div
      style={style}
      className="relative h-screen flex flex-col items-center justify-center bg-ink overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" aria-hidden="true" />
      <div className="relative z-10 text-center px-6 w-full">
        <h2 className="font-display text-display-sm md:text-display-md font-bold text-white mb-12">
          Built for the Future of AI
        </h2>

        {/* Auto-scrolling carousel */}
        <div className="overflow-hidden w-full" aria-label="AI agent showcase carousel" role="region">
          <div className={cn("flex gap-4", !reducedMotion && "animate-carousel-scroll")}>
            {[...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES].map((src, i) => (
              <div key={i} className="flex-shrink-0 rounded-xl overflow-hidden w-[280px] md:w-[360px] aspect-video bg-background">
                <img
                  src={src}
                  alt={IMAGE_ALT_TEXTS[i % CAROUSEL_IMAGES.length]}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface HeroScrollAnimationProps {
  className?: string;
}

const HeroScrollAnimation = forwardRef<HTMLDivElement, HeroScrollAnimationProps>(
  ({ className }, ref) => {
    const container = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: container,
      offset: ['start start', 'end end'],
    });
    const prefersReducedMotion = useReducedMotion();

    return (
      <div ref={container} className={cn('relative h-[200vh]', className)}>
        <Section1 scrollYProgress={scrollYProgress} reducedMotion={prefersReducedMotion} />
        <Section2 scrollYProgress={scrollYProgress} reducedMotion={prefersReducedMotion} />
      </div>
    );
  }
);

HeroScrollAnimation.displayName = 'HeroScrollAnimation';

export default HeroScrollAnimation;
