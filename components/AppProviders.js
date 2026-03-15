"use client";

import { useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "./AuthContext";
import LayoutShell from "./LayoutShell";
import { ThemeProvider } from "./ThemeProvider";

export default function AppProviders({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeProvider>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </ThemeProvider>
    </NextThemesProvider>
  );
}