"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiClient } from "@/app/api/client";
import type { CurrentUser } from "@/app/api/client";
import { AuthLoadingSkeleton } from "@/components/ui/AuthLoadingSkeleton";

export default function AuthorizedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        if (response.success) {
          setUser(response.data);
          console.log('User info fetched:', response.data);
          setIsAuthenticated(true);
        } else {
          console.error('Failed to fetch user info:', response.message);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="flex flex-col h-[100svh] bg-gray-100 relative">
      {isAuthenticated ? (
        <div className="flex-1 relative">{children}</div>
      ) : (
        <AuthLoadingSkeleton />
      )}
    </div>
  );
}
