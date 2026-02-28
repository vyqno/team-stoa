"use client";

import dynamic from "next/dynamic";

const StoaRoot = dynamic(() => import("@/components/stoa-root"), {
  ssr: false,
});

export default function StoaPage() {
  return <StoaRoot />;
}