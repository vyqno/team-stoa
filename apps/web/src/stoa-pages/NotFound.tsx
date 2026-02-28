import { useEffect } from "react";
import { NotFoundPage } from "@/components/ui/not-found-2";

const NotFound = () => {
  useEffect(() => {
    document.title = "404 — Stoa";
  }, []);

  return <NotFoundPage />;
};

export default NotFound;
