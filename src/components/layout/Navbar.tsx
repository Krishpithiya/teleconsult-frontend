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
  const closeMenu = () => setMenuOpen(false);
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/doctors", label: "Find Doctors" },
  ];

  return (
    <nav
      className="sticky top-0 z-[100] bg-white"
      style={{
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 8px rgba(13,148,136,0.06)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5 no-underline"
        >
          <div className="tc-icon-tile tc-icon-tile-md">
            <Stethoscope size={20}/>
          </div>
          <span className="text-[17px] font-extrabold tracking-tight sm:text-lg" style={{ color: "var(--brand)" }}>TeleConsult</span>
        </Link>

        {/* Desktop links */}
        <div className="ml-8 hidden flex-1 items-center gap-1 md:flex">
          {navLinks.map(l => (
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
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <>
              <Link href={`/dashboard/${user.role}`} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 14px",
                borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600,
                color: "var(--brand)", background: "var(--brand-light)", border: "1px solid var(--border)",
              }}>
                <span className="tc-icon-tile tc-icon-tile-sm"><LayoutDashboard size={15}/></span>
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
                  <span className="tc-icon-tile tc-icon-tile-sm"><LogOut size={14}/></span> Logout
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

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border md:hidden"
          style={{ borderColor: "var(--border)", color: "var(--brand)" }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="border-t bg-white px-4 py-3 shadow-lg md:hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-2 text-sm font-semibold no-underline"
                style={{
                  color: isActive(l.href) ? "var(--brand)" : "var(--text-secondary)",
                  background: isActive(l.href) ? "var(--brand-light)" : "transparent",
                }}
              >
                {l.label}
              </Link>
            ))}

            <div className="mt-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/dashboard/${user.role}`}
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold no-underline"
                    style={{
                      color: "var(--brand)",
                      background: "var(--brand-light)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span className="tc-icon-tile tc-icon-tile-sm"><LayoutDashboard size={15} /></span>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    <span className="tc-icon-tile tc-icon-tile-sm"><LogOut size={14} /></span> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-xl border bg-white px-3 py-2 text-center text-sm font-semibold no-underline"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-2 text-center text-sm font-semibold text-white no-underline"
                    style={{ background: "linear-gradient(135deg,#0d9488,#0284c7)" }}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
