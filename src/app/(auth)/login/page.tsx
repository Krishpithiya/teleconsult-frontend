"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, Stethoscope, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!email)    e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try { await login({ email, password }); }
    catch {}
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", background:"linear-gradient(135deg,#f0fdfa 0%,#e0f2fe 50%,#f0fdf4 100%)",
    }}>
      {/* Left panel */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
        padding:"60px 48px", background:"linear-gradient(135deg,#0d9488 0%,#0284c7 100%)",
        color:"#fff", minHeight:"100vh",
      }} className="hidden-mobile">
        <div style={{ maxWidth:380, textAlign:"center" }}>
          <div style={{
            width:72, height:72, borderRadius:20, background:"rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 32px",
          }}>
            <Stethoscope size={36} color="#fff"/>
          </div>
          <h1 style={{ fontSize:"2rem", fontWeight:800, marginBottom:16, color:"#fff" }}>
            Welcome Back to TeleConsult
          </h1>
          <p style={{ color:"rgba(255,255,255,0.85)", lineHeight:1.7, marginBottom:40 }}>
            Access your dashboard, manage appointments, and connect with patients or doctors — all in one place.
          </p>
          {[
            "Secure HD video consultations",
            "Digital prescriptions instantly",
            "24/7 appointment booking",
            "Verified medical professionals",
          ].map(item => (
            <div key={item} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, textAlign:"left" }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Shield size={12} color="#fff"/>
              </div>
              <span style={{ fontSize:14, color:"rgba(255,255,255,0.9)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
        padding:"40px 24px", minHeight:"100vh",
      }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          {/* Logo for mobile */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"var(--brand)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Stethoscope size={22} color="#fff"/>
            </div>
            <span style={{ fontWeight:800, fontSize:20, color:"var(--brand)" }}>TeleConsult</span>
          </div>

          <h2 style={{ fontSize:"1.75rem", fontWeight:800, marginBottom:6 }}>Sign in</h2>
          <p style={{ color:"var(--text-muted)", marginBottom:32 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color:"var(--brand)", fontWeight:600, textDecoration:"none" }}>Create one</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Email */}
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:8, fontSize:14 }}>Email address</label>
              <div style={{ position:"relative" }}>
                <Mail size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width:"100%", padding:"12px 14px 12px 42px", borderRadius:10,
                    border:`1.5px solid ${errors.email ? "var(--danger)" : "var(--border-strong)"}`,
                    fontSize:15, background:"#fff", outline:"none",
                    transition:"border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--brand)"}
                  onBlur={e => e.target.style.borderColor = errors.email ? "var(--danger)" : "var(--border-strong)"}
                />
              </div>
              {errors.email && <p style={{ color:"var(--danger)", fontSize:12, marginTop:6 }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <label style={{ fontWeight:600, fontSize:14 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize:13, color:"var(--brand)", textDecoration:"none", fontWeight:500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position:"relative" }}>
                <Lock size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                <input
                  type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  style={{
                    width:"100%", padding:"12px 42px 12px 42px", borderRadius:10,
                    border:`1.5px solid ${errors.password ? "var(--danger)" : "var(--border-strong)"}`,
                    fontSize:15, background:"#fff", outline:"none",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--brand)"}
                  onBlur={e => e.target.style.borderColor = errors.password ? "var(--danger)" : "var(--border-strong)"}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex" }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p style={{ color:"var(--danger)", fontSize:12, marginTop:6 }}>{errors.password}</p>}
            </div>

            <button type="submit" disabled={isLoading} style={{
              width:"100%", padding:"13px", borderRadius:10,
              background: isLoading ? "#99f6e4" : "linear-gradient(135deg,#0d9488,#0284c7)",
              color:"#fff", fontWeight:700, fontSize:15, border:"none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 16px rgba(13,148,136,0.3)",
            }}>
              {isLoading ? "Signing in..." : (<>Sign in <ArrowRight size={17}/></>)}
            </button>
          </form>

          <p style={{ textAlign:"center", marginTop:24, fontSize:13, color:"var(--text-muted)" }}>
            By signing in you agree to our{" "}
            <span style={{ color:"var(--brand)", cursor:"pointer" }}>Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
}
