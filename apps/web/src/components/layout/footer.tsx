import { Zap } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>Stoa &mdash; AI Service Marketplace</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Built on Base</span>
            <span>&middot;</span>
            <Link href="/explore" className="hover:text-foreground transition-colors">
              Explore
            </Link>
            <span>&middot;</span>
            <Link href="/connect" className="hover:text-foreground transition-colors">
              Connect
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
