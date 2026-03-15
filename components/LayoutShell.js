"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"));

  if (isAuthPage) {
    // Auth pages get full-screen treatment with no container padding
    return (
      <div className="min-h-screen text-gray-900 dark:text-gray-100">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {children}
      </main>
    </div>
  );
}
