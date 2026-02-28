import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Zap, Globe, Lock, Heart } from "lucide-react";

const VALUES = [
  { icon: Zap, title: "Speed Over Friction", description: "Five lines of code to call any agent. One click to connect to Claude. We obsess over removing friction." },
  { icon: Globe, title: "Open by Default", description: "No lock-in, no walled gardens. Any developer can list an agent, any user can call it. The marketplace is open to all." },
  { icon: Lock, title: "Trust Through Transparency", description: "Every agent is reviewed, every transaction is on-chain, every price is visible upfront. No hidden fees, no surprises." },
  { icon: Heart, title: "Builders First", description: "Developers keep 95% of revenue. We succeed when our builders succeed. The platform exists to serve the ecosystem." },
];

const About = () => {
  useEffect(() => {
    document.title = "About — Stoa";
  }, []);

  return (
    <main className="bg-background pt-[72px]">
      {/* Hero */}
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h1 className="font-display text-display-md md:text-display-lg font-bold text-foreground mb-6">
              Building the future of AI commerce.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="font-body text-body-lg text-muted-foreground mb-8">
              Stoa is the open marketplace where AI agents are discovered, shared, and monetized.
              We believe AI should be accessible to everyone — not locked behind subscriptions or
              complex infrastructure.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="font-body text-body-lg text-muted-foreground mb-16">
              Our mission is to make every AI model a first-class API citizen, enabling developers
              to earn from their work and users to access powerful AI tools with zero friction.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-card py-20 md:py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="font-display text-display-sm font-bold text-foreground mb-4 text-center">
              What we believe
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="font-body text-body-lg text-muted-foreground mb-16 text-center max-w-xl mx-auto">
              These principles guide every product decision we make.
            </p>
          </ScrollReveal>
          <div className="grid gap-8 sm:grid-cols-2">
            {VALUES.map((value, i) => (
              <ScrollReveal key={value.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-border bg-background p-8 h-full">
                  <value.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-body text-heading-md font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="font-body text-body-md text-muted-foreground">{value.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink py-20 md:py-32 px-6">
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3 text-center">
          {[
            { value: "47", label: "AI Agents Live" },
            { value: "12,400+", label: "API Calls Processed" },
            { value: "230", label: "Developers Onboarded" },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div>
                <p className="font-display text-display-md font-bold text-primary">{stat.value}</p>
                <p className="font-body text-body-md text-white/60 mt-2">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="font-display text-display-sm font-bold text-foreground mb-6">
              Join us in building what's next.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="font-body text-body-lg text-muted-foreground mb-10">
              Whether you're a developer, a researcher, or just curious — there's a place for you on Stoa.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/connect"><Button variant="default" size="lg">Get Started</Button></Link>
              <Link to="/careers"><Button variant="outline" size="lg">View Open Roles</Button></Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default About;
