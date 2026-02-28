import { useEffect } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy — Stoa";
  }, []);

  return (
    <main className="bg-background pt-[72px]">
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-3xl prose prose-neutral">
          <ScrollReveal>
            <h1 className="font-display text-display-md font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="font-body text-body-sm text-muted-foreground mb-8">Last updated: February 27, 2026</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="space-y-6 font-body text-body-md text-muted-foreground">
              <p>At Stoa, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Information We Collect</h2>
              <p>We collect information you provide directly, such as your name, email, and payment details when you create an account or use our services.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">How We Use Your Information</h2>
              <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you about updates and offers.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Data Security</h2>
              <p>We implement industry-standard security measures to protect your data. All API calls and payments are encrypted end-to-end.</p>
              <h2 className="font-display text-heading-md font-bold text-foreground">Contact Us</h2>
              <p>If you have questions about this policy, please contact us at privacy@stoa.ai.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
