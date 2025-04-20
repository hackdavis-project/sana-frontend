import type React from "react";
import "./globals.css";
import { Merriweather } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import PWAProvider from "./components/pwa-provider";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Sana" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sana" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        {/* Add links for apple-touch-icon if you have them */}
        {/* <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" /> */}
        {/* <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" /> */}
        {/* <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" /> */}
        {/* <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" /> */}

        <title>Sana - Supportive Journaling</title>
        <meta
          name="description"
          content="A supportive journaling app for survivors."
        />
      </head>
      <body className={merriweather.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PWAProvider>{children}</PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata = {
  generator: "v0.dev",
};
