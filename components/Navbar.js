"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import ThemeToggle from "./ThemeToggle";
import { LogOut, LayoutDashboard, List, User, Trophy, Info, ShieldCheck } from "lucide-react";

function NavLink({ href, label, icon: Icon, active }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${active
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
          : "text-gray-700 hover:bg-black/5 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/8 dark:hover:text-white"
        }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const hiddenPaths = ["/login", "/register", "/forgot-password"];
  if (!currentUser || hiddenPaths.includes(pathname)) return null;

  const role = currentUser.role;
  const links = [];

  if (role === "admin") {
    links.push({ href: "/admin", label: "Dashboard", icon: LayoutDashboard });
    links.push({ href: "/admin/requests", label: "Requests", icon: ShieldCheck });
    links.push({ href: "/leaderboard", label: "Leaderboard", icon: Trophy });
    links.push({ href: "/about", label: "About", icon: Info });
  } else if (role === "teacher") {
    links.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
    links.push({ href: "/leaderboard", label: "Leaderboard", icon: Trophy });
    links.push({ href: "/about", label: "About", icon: Info });
  } else {
    links.push({ href: "/questions", label: "Questions", icon: List });
    links.push({ href: `/dashboard/student/${currentUser.id}`, label: "Profile", icon: User });
    links.push({ href: "/leaderboard", label: "Leaderboard", icon: Trophy });
    links.push({ href: "/about", label: "About", icon: Info });
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-xl dark:border-white/8 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link
          href={role === "admin" ? "/admin" : role === "teacher" ? "/dashboard" : "/questions"}
          className="flex items-center gap-2 font-bold tracking-tight text-gray-900 dark:text-white"
        >
          <span className="text-xl">⚡</span>
          <span className="text-sm sm:text-base">LC Tracker</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={pathname === link.href || pathname.startsWith(link.href + "/")}
            />
          ))}
        </div>

        {/* Right side: theme + logout */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-300 capitalize">
            {currentUser.name.split(" ")[0]} · {role}
          </span>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
