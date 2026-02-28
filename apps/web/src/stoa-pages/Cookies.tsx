import { useEffect } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const Cookies = () => {
  useEffect(() => {
    document.title = "Cookie Policy — Stoa";
  }, []);

  return (
    <main className="bg-background pt-[72px]">
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-3xl prose prose-neutral">
          <ScrollReveal>
            <h1 className="font-display text-display-md font-bold text-foreground mb-2">Cookie Policy</h1>
            <p className="font-body text-body-sm text-muted-foreground mb-8">Last updated: February 27, 2026</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="space-y-6 font-body text-body-md text-muted-foreground">
              <p>Stoa uses cookies and similar technologies to provide, protect, and improve our services.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Essential Cookies</h2>
              <p>These cookies are necessary for the platform to function and cannot be disabled. They include session management and security tokens.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Analytics Cookies</h2>
              <p>We use analytics cookies to understand how visitors interact with Stoa. This helps us improve our platform experience.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Managing Cookies</h2>
              <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default Cookies;
