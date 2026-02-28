import { Link } from "react-router-dom";
import { SocialIcons } from "@/components/ui/social-icons";

const FOOTER_LINKS = {
  Product: [
    { label: "Explore", to: "/explore" },
    { label: "Connect", to: "/connect" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Pricing", to: "/pricing" },
  ],
  Developers: [
    { label: "Docs", to: "/docs" },
    { label: "SDK Reference", to: "/docs" },
    { label: "API Reference", to: "/docs" },
    { label: "Changelog", to: "/docs" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Careers", to: "/careers" },
    { label: "Contact", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
    { label: "Cookies", to: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer role="contentinfo" className="relative bg-ink text-white dotted-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
        {/* Logo */}
        <div className="mb-12">
          <Link to="/" aria-label="STOA home" className="font-display text-display-md font-bold text-primary">
            STOA
          </Link>
        </div>

        {/* Link Columns */}
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-body text-body-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="font-body text-body-sm text-white/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="font-body text-caption text-white/40">
            &copy; {new Date().getFullYear()} Stoa. All rights reserved.
          </p>
          <SocialIcons />
        </div>
      </div>
    </footer>
  );
}
