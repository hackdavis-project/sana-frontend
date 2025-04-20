import { ReactNode } from "react";

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <div className="relative min-h-screen">{children}</div>;
}
