import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon, CompassIcon } from "lucide-react";

export function NotFoundPage() {
  return (
    <Empty className="min-h-screen bg-background">
      <EmptyHeader>
        <EmptyTitle className="font-display text-[clamp(6rem,20vw,14rem)] font-bold text-foreground leading-none">
          404
        </EmptyTitle>
        <EmptyDescription className="text-body-lg max-w-md">
          The page you're looking for might have been{" "}
          <br />
          moved or doesn't exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/">
            <Button variant="default" size="lg">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" size="lg">
              <CompassIcon className="mr-2 h-4 w-4" />{" "}
              Explore
            </Button>
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  );
}
