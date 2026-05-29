"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Hide the public Navbar on dashboard and auth pages
// Dashboard pages use their own sidebar layout
// Login/Register have full-screen gradient backgrounds
const HIDDEN_PREFIXES = ["/dashboard", "/call"];
const HIDDEN_EXACT    = ["/login", "/register"];

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hidden =
    HIDDEN_EXACT.includes(pathname) ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hidden) return null;
  return <Navbar />;
}
