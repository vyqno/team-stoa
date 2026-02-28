import React, { useState } from 'react';
import { Cpu, MessageSquare, Stethoscope, Code2, Plug } from 'lucide-react';
import { cn } from '@/lib/utils';

const capabilities = [
  {
    id: 1,
    icon: Stethoscope,
    title: 'Medical Diagnostics',
    description:
      'Deploy diagnostic agents like chest X-ray analysis, dermatology screening, and pathology review — all accessible via a single API call.',
  },
  {
    id: 2,
    icon: MessageSquare,
    title: 'Sentiment & NLP',
    description:
      'Plug into pre-trained sentiment analyzers, text classifiers, and summarization agents. Pay per call, no training required.',
  },
  {
    id: 3,
    icon: Code2,
    title: 'Code Review Agents',
    description:
      'Automated code review, vulnerability scanning, and refactoring suggestions. Integrate into your CI/CD pipeline in minutes.',
  },
  {
    id: 4,
    icon: Plug,
    title: 'One-Click MCP',
    description:
      'Connect any Stoa agent to Claude Desktop or ChatGPT with a single click. No terminal, no config files, no API keys needed.',
  },
  {
    id: 5,
    icon: Cpu,
    title: 'Pay-Per-Call Infra',
    description:
      'Micropayments via x402 on Base. No subscriptions, no minimums — fund your wallet with USDC and call any agent instantly.',
  },
];

export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((index + 1) % capabilities.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((index - 1 + capabilities.length) % capabilities.length);
    }
  };

  return (
    <section className="py-12" aria-labelledby="capabilities-heading">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <h2 id="capabilities-heading" className="font-display text-display-sm font-bold text-foreground mb-3">
            What you can build with Stoa
          </h2>
          <p className="font-body text-body-lg text-muted-foreground max-w-xl">
            From medical AI to code review — discover what's possible when every
            agent is one API call away.
          </p>
        </div>

        <div className="flex flex-col gap-3" role="list">
          {capabilities.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                role="listitem"
                tabIndex={0}
                aria-expanded={isActive}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'group cursor-pointer rounded-xl border transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isActive
                    ? 'border-primary/30 bg-primary/[0.04] shadow-sm'
                    : 'border-border bg-card hover:border-primary/20'
                )}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <h3
                    className={cn(
                      'font-body text-body-md font-semibold transition-colors duration-300',
                      isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {item.title}
                  </h3>

                  <div
                    className={cn(
                      'ml-auto h-1.5 w-1.5 rounded-full transition-all duration-300',
                      isActive ? 'bg-primary scale-125' : 'bg-border'
                    )}
                    aria-hidden="true"
                  />
                </div>

                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-out',
                    isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <p className="px-5 pb-5 pl-[4.75rem] font-body text-body-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <a
            href="/explore"
            className="inline-flex items-center justify-center rounded-pill bg-primary text-primary-foreground px-8 py-3 font-body text-body-sm font-medium hover:scale-[1.02] hover:shadow-glow transition-all duration-200"
          >
            Explore All Agents
          </a>
        </div>
      </div>
    </section>
  );
}
