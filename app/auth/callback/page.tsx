"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { NightingaleSDK } from "@/app/(authorized)/backend/NightingaleSDK";

// Initialize Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (typeof window === "undefined") return;

      try {
        // Initialize SDK with base URL from environment variable
        const sdk = new NightingaleSDK({
          baseUrl:
            process.env.NEXT_PUBLIC_BASE_URL || "https://www.the-journal.app",
        });

        // Get the full callback URL from the browser
        const callbackUrl = window.location.href;

        // Process the OAuth callback
        const authData = await sdk.auth.handleOAuthCallback(callbackUrl);

        // Store the token in localStorage
        localStorage.setItem("auth-token", authData.access_token);

        // Redirect to the main app
        router.push("/");
      } catch (err) {
        console.error("Authentication failed:", err);
        setError("Authentication failed. Please try again.");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 items-center justify-center p-4 ${montserrat.className}`}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold text-center mb-4 text-red-600">
              Authentication Error
            </h1>
            <p className="text-gray-600 text-center">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-center mb-4">
              Logging you in...
            </h1>
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
