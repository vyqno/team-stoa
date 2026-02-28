import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Terminal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const ConnectHub = () => {
  useEffect(() => { document.title = "Connect — Stoa"; }, []);

  return (
    <main className="min-h-screen bg-background pt-[72px] flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full text-center">
        <ScrollReveal>
          <h1 className="font-display text-display-sm md:text-display-md font-bold text-foreground mb-4">
            Choose Your Path
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="font-body text-body-lg text-muted-foreground mb-16 max-w-lg mx-auto">
            Whether you build or you use, Stoa meets you where you are.
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2">
          <TiltCard
            to="/connect/developer"
            bg="bg-ink"
            textColor="text-white"
            icon={Terminal}
            title="I'm a Developer"
            description="List your agent, set your price, earn per call."
            cta="Start Building →"
          />
          <TiltCard
            to="/connect/user"
            bg="bg-card"
            textColor="text-card-foreground"
            icon={Sparkles}
            title="I'm a User"
            description="Add AI agents to Claude, ChatGPT, or any MCP client in one click."
            cta="Get Started →"
          />
        </div>

        <motion.p
          className="text-center font-body text-caption text-muted-foreground mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </motion.p>
      </div>
    </main>
  );
};

function TiltCard({ to, bg, textColor, icon: Icon, title, description, cta }: {
  to: string; bg: string; textColor: string; icon: typeof Terminal;
  title: string; description: string; cta: string;
}) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <Link to={to}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${bg} ${textColor} rounded-3xl p-10 text-left transition-transform duration-200 ease-out border border-border`}
        style={{ transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02 }}
      >
        <Icon className="h-8 w-8 mb-6 text-primary" />
        <h3 className="font-display text-heading-lg font-bold mb-3">{title}</h3>
        <p className="font-body text-body-md opacity-70 mb-6">{description}</p>
        <span className="font-body text-body-sm font-medium text-primary">{cta}</span>
      </motion.div>
    </Link>
  );
}

export default ConnectHub;
