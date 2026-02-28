import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "Contact — Stoa";
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email";
    if (!message.trim()) errs.message = "Message is required";
    else if (message.trim().length < 10) errs.message = "Message must be at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  return (
    <main className="bg-background pt-[72px]">
      <section className="py-20 md:py-32 px-6">
        <div className="mx-auto max-w-lg">
          <ScrollReveal>
            <h1 className="font-display text-display-md font-bold text-foreground mb-4 text-center">
              Get in touch.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="font-body text-body-lg text-muted-foreground mb-12 text-center">
              Have a question or want to partner with us? Drop us a line.
            </p>
          </ScrollReveal>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="flex items-center justify-center"
                >
                  <CheckCircle2 className="h-16 w-16 text-primary" strokeWidth={1.5} />
                </motion.div>
                <h2 className="font-display text-heading-lg font-bold text-foreground">Message sent!</h2>
                <p className="font-body text-body-md text-muted-foreground">
                  Thanks for reaching out, {name.split(" ")[0]}. We'll get back to you within 24 hours.
                </p>
                <Button variant="outline" onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ScrollReveal delay={0.2}>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="font-body text-caption text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="font-body text-caption text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help?"
                        rows={5}
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); setErrors((prev) => ({ ...prev, message: "" })); }}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && <p className="font-body text-caption text-destructive">{errors.message}</p>}
                    </div>
                    <Button variant="default" className="w-full" disabled={sending}>
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </ScrollReveal>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
};

export default Contact;
