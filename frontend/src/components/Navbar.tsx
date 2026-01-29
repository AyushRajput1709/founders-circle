"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/deals", label: "Deals" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.user?.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };

    checkAdmin();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Founders Circle
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-300">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="rounded-full border border-yellow-500/50 px-4 py-2 text-sm text-yellow-400 transition hover:border-yellow-500 hover:bg-yellow-500/10 font-semibold"
            >
              Admin Panel
            </Link>
          )}
          <Link
            href="/register"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/50 hover:bg-white/10"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
