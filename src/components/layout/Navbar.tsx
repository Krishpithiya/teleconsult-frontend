"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Stethoscope, Menu, X, LogOut, User, LayoutDashboard, Search } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid var(--border)",
      boxShadow: "0 1px 8px rgba(13,148,136,0.06)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0d9488,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={20} color="#fff"/>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--brand)", letterSpacing: "-0.02em" }}>TeleConsult</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 32, flex: 1 }}>
          {[
            { href: "/", label: "Home" },
            { href: "/doctors", label: "Find Doctors" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: "6px 14px", borderRadius: 8, textDecoration: "none",
              fontSize: 14, fontWeight: isActive(l.href) ? 600 : 500,
              color: isActive(l.href) ? "var(--brand)" : "var(--text-secondary)",
              background: isActive(l.href) ? "var(--brand-light)" : "transparent",
              transition: "all 0.15s",
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAuthenticated && user ? (
            <>
              <Link href={`/dashboard/${user.role}`} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 14px",
                borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600,
                color: "var(--brand)", background: "var(--brand-light)", border: "1px solid var(--border)",
              }}>
                <LayoutDashboard size={15}/>
                Dashboard
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg,#0d9488,#0284c7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 14,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={logout} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
                  borderRadius: 8, border: "1px solid var(--border)", background: "#fff",
                  color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: 500,
                }}>
                  <LogOut size={14}/> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                padding: "8px 16px", borderRadius: 8, textDecoration: "none",
                fontSize: 14, fontWeight: 600, color: "var(--text-secondary)",
                border: "1px solid var(--border)", background: "#fff",
              }}>Sign in</Link>
              <Link href="/register" style={{
                padding: "8px 16px", borderRadius: 8, textDecoration: "none",
                fontSize: 14, fontWeight: 600, color: "#fff",
                background: "linear-gradient(135deg,#0d9488,#0284c7)",
                boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
              }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
