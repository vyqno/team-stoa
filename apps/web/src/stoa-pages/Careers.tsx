import { useEffect } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ROLES = [
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Remote", email: "careers@stoa.ai" },
  { title: "ML Platform Engineer", team: "Engineering", location: "Remote", email: "careers@stoa.ai" },
  { title: "Product Designer", team: "Design", location: "Remote", email: "careers@stoa.ai" },
  { title: "Developer Advocate", team: "Growth", location: "Remote", email: "careers@stoa.ai" },
];

const Careers = () => {
  useEffect(() => {
    document.title = "Careers — Stoa";
  }, []);

  const handleApply = (role: typeof ROLES[number]) => {
    window.open(`mailto:${role.email}?subject=Application: ${encodeURIComponent(role.title)}&body=${encodeURIComponent(`Hi Stoa team,\n\nI'm interested in the ${role.title} position.\n\n[Please attach your resume and include a brief introduction]\n\nBest regards`)}`, "_blank");
    toast({ title: "Application started", description: `Opening email for ${role.title}` });
  };

  return (
    <main className="bg-background pt-[72px]">
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <h1 className="font-display text-display-md font-bold text-foreground mb-4">
              Join the team.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="font-body text-body-lg text-muted-foreground mb-12">
              Help us build the future of AI commerce. We're remote-first and always looking for curious minds.
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {ROLES.map((role, i) => (
              <ScrollReveal key={role.title} delay={i * 0.1}>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-colors">
                  <div>
                    <h3 className="font-body text-heading-md font-semibold text-foreground">{role.title}</h3>
                    <p className="font-body text-body-sm text-muted-foreground">{role.team} · {role.location}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleApply(role)}>Apply</Button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Careers;
