"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

// Component for decorative shapes
const DecorativeShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Circle */}
      <div className="absolute top-[10%] left-[15%] w-24 h-24 rounded-full bg-amber-200 opacity-60" />

      {/* Triangle */}
      <div
        className="absolute top-[20%] right-[20%]"
        style={{
          width: 0,
          height: 0,
          borderLeft: "30px solid transparent",
          borderRight: "30px solid transparent",
          borderBottom: "50px solid rgba(246, 173, 85, 0.5)",
          transform: "rotate(15deg)",
        }}
      />

      {/* Square */}
      <div className="absolute bottom-[25%] left-[10%] w-16 h-16 bg-blue-200 opacity-50 rounded-sm transform rotate-45" />

      {/* Rectangle */}
      <div className="absolute bottom-[20%] right-[15%] w-32 h-16 bg-purple-200 opacity-40 rounded-md transform -rotate-12" />

      {/* Small circles */}
      <div className="absolute top-[60%] left-[25%] w-8 h-8 rounded-full bg-green-200 opacity-50" />
      <div className="absolute top-[30%] left-[60%] w-12 h-12 rounded-full bg-pink-200 opacity-40" />
      <div className="absolute bottom-[10%] left-[40%] w-10 h-10 rounded-full bg-yellow-200 opacity-50" />

      {/* Donut shape */}
      <div className="absolute top-[70%] right-[30%] w-20 h-20 rounded-full border-4 border-teal-200 opacity-60" />

      {/* Curved SVG shape */}
      <svg
        className="absolute bottom-[40%] right-[5%] w-32 h-32 opacity-40"
        viewBox="0 0 100 100"
      >
        <path
          d="M10,50 Q50,10 90,50 T10,50"
          fill="none"
          stroke="rgba(176, 132, 235, 0.8)"
          strokeWidth="4"
        />
      </svg>

      {/* Plus sign */}
      <div className="absolute top-[15%] left-[45%]">
        <div className="w-16 h-4 bg-red-200 opacity-50 rounded-full"></div>
        <div className="w-4 h-16 bg-red-200 opacity-50 rounded-full absolute top-[-6px] left-6"></div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  // Handle Google login
  const handleGoogleLogin = () => {
    // Redirect user to Google OAuth URL
    console.log(
      "OAuth URL from env:",
      process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL
    );
    const googleOAuthUrl =
      process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL ||
      "https://sana-api.miromiro.dev/api/auth/google/login";
    window.location.href = googleOAuthUrl;
  };

  return (
    <main
      className={`flex flex-col h-[100svh] bg-gray-100 items-center justify-center p-4 relative overflow-hidden`}
    >
      {/* Decorative shapes */}
      <DecorativeShapes />

      {/* Login Modal */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col items-center z-10">
        <h1 className="text-3xl font-semibold text-center mb-2">Sana</h1>
        <p className="text-gray-600 text-center mb-8">
          A safe space for your healing journey
        </p>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 w-full bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-4"
        >
          <svg
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-amber-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-amber-400 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div className="mt-8 text-center z-10">
        <p className="text-sm text-gray-600">
          Having trouble signing in?{" "}
          <a href="#" className="text-amber-400 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </main>
  );
}
