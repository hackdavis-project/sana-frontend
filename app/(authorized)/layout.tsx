"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthorizedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Get all cookies and log them
      const allCookies = Cookies.get();
      console.log("All available cookies:", allCookies);

      // Use user_id as authentication token instead of auth_token
      const userId = Cookies.get("user_id");
      console.log("User ID cookie:", userId);

      // Check if any authentication cookie exists
      const userEmail = Cookies.get("user_email");
      const userName = Cookies.get("user_name");

      console.log("Authentication cookies:");
      console.log("- user_id:", userId);
      console.log("- user_email:", userEmail);
      console.log("- user_name:", userName);

      // Consider the user authenticated if they have a user_id
      if (!userId) {
        console.log("No user_id found, redirecting to login");
        router.push("/login");
      } else {
        console.log("User ID found, setting authenticated to true");
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="flex flex-col h-[100svh] bg-gray-100 relative">
      {isAuthenticated ? (
        <div className="flex-1 relative">{children}</div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p>Checking authentication...</p>
        </div>
      )}
    </div>
  );
}
