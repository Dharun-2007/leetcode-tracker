import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "../components/AppProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LeetCode Student Progress Tracker",
  description:
    "A production-grade platform for tracking student LeetCode and Blind75 progress with admin workflows, teacher dashboards, and analytics.",
  keywords: ["LeetCode", "Blind75", "Student Progress", "Coding Tracker"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
