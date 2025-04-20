"use client";

import { ReactNode } from "react";
import PWARegister from "./pwa-register";

export function PWAProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PWARegister />
    </>
  );
}

export default PWAProvider;
