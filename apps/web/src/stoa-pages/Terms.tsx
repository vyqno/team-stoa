import { useEffect } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const Terms = () => {
  useEffect(() => {
    document.title = "Terms of Service — Stoa";
  }, []);

  return (
    <main className="bg-background pt-[72px]">
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-3xl prose prose-neutral">
          <ScrollReveal>
            <h1 className="font-display text-display-md font-bold text-foreground mb-2">Terms of Service</h1>
            <p className="font-body text-body-sm text-muted-foreground mb-8">Last updated: February 27, 2026</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="space-y-6 font-body text-body-md text-muted-foreground">
              <p>By using Stoa, you agree to these terms. Please read them carefully.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Use of Services</h2>
              <p>Stoa provides an AI agent marketplace. You may use our services to discover, deploy, and monetize AI agents subject to these terms.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Developer Responsibilities</h2>
              <p>Developers listing agents on Stoa are responsible for ensuring their agents comply with applicable laws, do not infringe on intellectual property rights, and perform as described.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Payments</h2>
              <p>All transactions are processed via the x402 protocol. Stoa charges a platform fee on each transaction. Refunds are handled on a case-by-case basis.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Limitation of Liability</h2>
              <p>Stoa is provided "as is." We are not liable for any damages arising from the use of agents listed on our marketplace.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default Terms;
