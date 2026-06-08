"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { doctorNav, patientNav, adminNav } from "@/lib/navItems";
import { LogOut, ChevronRight, Stethoscope } from "lucide-react";

// Accept navItems as optional prop (ignored — auto-detected from user role)
interface Props {
  children: React.ReactNode;
  navItems?: unknown;
}

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems =
    user?.role === "admin"   ? adminNav :
    user?.role === "doctor"  ? doctorNav :
    patientNav;

  const roleGradient: Record<string, string> = {
    admin:   "linear-gradient(135deg,#7c3aed,#0d9488)",
    doctor:  "linear-gradient(135deg,#0d9488,#0284c7)",
    patient: "linear-gradient(135deg,#0284c7,#0d9488)",
  };

  const roleLabel: Record<string, string> = {
    admin: "#a78bfa", doctor: "#2dd4bf", patient: "#38bdf8",
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ── Sidebar ── */}
      <aside
        className="sticky top-0 z-40 flex w-full shrink-0 flex-col overflow-hidden text-white md:h-screen md:w-60 md:overflow-y-auto"
        style={{ background:"#0f172a" }}
      >
        {/* User card */}
        <div className="px-4 py-3 md:px-4 md:pb-4 md:pt-5" style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <div style={{
              width:42, height:42, borderRadius:"50%", flexShrink:0,
              background: roleGradient[user?.role || "patient"],
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:800, fontSize:17, color:"#fff",
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden", minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {user?.name}
              </div>
              <div style={{
                fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1,
                color: roleLabel[user?.role || "patient"],
              }}>
                {user?.role}
              </div>
            </div>
          </div>

          {user?.role === "doctor" && !(user as any)?.isVerified && (
            <div style={{ background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, padding:"7px 10px", marginTop:4 }}>
              <p style={{ fontSize:11, color:"#fbbf24", lineHeight:1.5 }}>⏳ Awaiting admin verification</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex gap-2 overflow-x-auto px-3 py-2 md:block md:flex-1 md:overflow-visible md:px-2.5 md:py-3">
          {navItems.map((item) => {
            const depth = item.href.split("/").length;
            const isActive = depth <= 3
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"9px 12px", borderRadius:10, marginBottom:2,
                textDecoration:"none", fontSize:14,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? "var(--brand)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                transition:"all 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; } }}>
                <span className="tc-icon-tile tc-nav-icon">{item.icon}</span>
                <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.label}</span>
                {isActive && <ChevronRight size={13} style={{ opacity:0.7, flexShrink:0 }}/>}
              </Link>
            );
          })}
        </nav>

        {/* Logo + Logout */}
        <div className="hidden md:block" style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 4px", marginBottom:10 }}>
            <span className="tc-icon-tile tc-icon-tile-sm"><Stethoscope size={14}/></span>
            <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>TELECONSULT</span>
          </div>
          <button onClick={logout} style={{
            width:"100%", display:"flex", alignItems:"center", gap:10,
            padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer",
            background:"transparent", color:"rgba(255,255,255,0.45)", fontSize:14,
            transition:"all 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}>
            <span className="tc-icon-tile tc-icon-tile-sm"><LogOut size={15}/></span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 md:p-8" style={{ overflowX:"hidden", background:"var(--bg-base)" }}>
        {children}
      </main>
    </div>
  );
}
