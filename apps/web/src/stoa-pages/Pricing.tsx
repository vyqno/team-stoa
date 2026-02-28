import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try Stoa with no commitment.",
    features: ["100 API calls/month", "3 agents", "Community support", "Basic analytics"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For individuals and small teams.",
    features: ["10,000 API calls/month", "Unlimited agents", "Priority support", "Advanced analytics", "Custom webhooks", "SDK access"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations at scale.",
    features: ["Unlimited API calls", "Unlimited agents", "Dedicated support", "Custom SLA", "On-premise option", "SSO & RBAC", "Audit logs"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => {
  useEffect(() => {
    document.title = "Pricing — Stoa";
  }, []);

  return (
    <main className="bg-background pt-[72px]">
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-5xl text-center mb-16">
          <ScrollReveal>
            <h1 className="font-display text-display-md md:text-display-lg font-bold text-foreground mb-4">
              Simple, transparent pricing.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="font-body text-body-lg text-muted-foreground max-w-xl mx-auto">
              Pay only for what you use. No hidden fees, no lock-in.
            </p>
          </ScrollReveal>
        </div>

        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.1}>
              <div
                className={`rounded-2xl border p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block mb-4 rounded-pill bg-primary px-3 py-1 font-body text-caption font-semibold text-primary-foreground self-start">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-heading-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="font-display text-display-sm font-bold text-foreground">{plan.price}</span>
                  <span className="font-body text-body-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="font-body text-body-md text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 font-body text-body-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/connect">
                  <Button variant={plan.highlighted ? "default" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Pricing;
