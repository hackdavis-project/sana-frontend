import { ReactNode } from "react";

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return <div className="relative min-h-screen">{children}</div>;
}
