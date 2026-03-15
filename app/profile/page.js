"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";

export default function ProfileRedirectPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "student") {
        router.replace(`/dashboard/student/${currentUser.id}`);
      } else {
        router.replace("/dashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [currentUser, router]);

  return (
    <div className="flex justify-center p-20">
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
      </div>
    </div>
  );
}
