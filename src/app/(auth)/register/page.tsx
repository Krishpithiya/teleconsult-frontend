"use client";

import { useState, useEffect, Suspense} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope, ArrowRight, CheckCircle } from "lucide-react";

type Role = "patient" | "doctor";

function RegisterContent() {
  const { register, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [role, setRole]         = useState<Role>("patient");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<Record<string,string>>({});

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "doctor") setRole("doctor");
  }, [searchParams]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!name || name.length < 2)    e.name = "Name must be at least 2 characters";
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email required";
    if (!password || password.length < 6) e.password = "Password must be at least 6 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try { await register({ name, email, password, role, phone }); }
    catch {}
  };

  const inputStyle = (err?: string): React.CSSProperties => ({
    width:"100%", padding:"12px 14px 12px 42px", borderRadius:10,
    border:`1.5px solid ${err ? "var(--danger)" : "var(--border-strong)"}`,
    fontSize:15, background:"#fff", outline:"none",
  });

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"linear-gradient(135deg,#f0fdfa 0%,#e0f2fe 50%,#f0fdf4 100%)" }}>
      {/* Left panel */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
        alignItems:"center", padding:"60px 48px",
        background:"linear-gradient(135deg,#0f766e 0%,#0369a1 100%)", color:"#fff",
      }}>
        <div style={{ maxWidth:380, textAlign:"center" }}>
          <div style={{ width:72, height:72, borderRadius:20, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 32px" }}>
            <Stethoscope size={36} color="#fff"/>
          </div>
          <h1 style={{ fontSize:"2rem", fontWeight:800, marginBottom:16, color:"#fff" }}>Join TeleConsult</h1>
          <p style={{ color:"rgba(255,255,255,0.85)", lineHeight:1.7, marginBottom:40 }}>
            Whether you&apos;re a patient seeking care or a doctor ready to help — we&apos;ve got you covered.
          </p>
          {[
            "Free to register as a patient",
            "Doctors verified by our team",
            "Secure and private consultations",
            "Instant appointment confirmation",
          ].map(item => (
            <div key={item} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, textAlign:"left" }}>
              <CheckCircle size={18} style={{ flexShrink:0, color:"rgba(255,255,255,0.9)" }}/>
              <span style={{ fontSize:14, color:"rgba(255,255,255,0.9)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px 24px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:440 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"var(--brand)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Stethoscope size={22} color="#fff"/>
            </div>
            <span style={{ fontWeight:800, fontSize:20, color:"var(--brand)" }}>TeleConsult</span>
          </div>

          <h2 style={{ fontSize:"1.75rem", fontWeight:800, marginBottom:6 }}>Create account</h2>
          <p style={{ color:"var(--text-muted)", marginBottom:28 }}>
            Already have one?{" "}
            <Link href="/login" style={{ color:"var(--brand)", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
          </p>

          {/* Role toggle */}
          <div style={{ display:"flex", gap:12, marginBottom:24, background:"#f1f5f9", borderRadius:12, padding:4 }}>
            {(["patient","doctor"] as Role[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)} style={{
                flex:1, padding:"10px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:600, fontSize:14,
                background: role===r ? "var(--brand)" : "transparent",
                color: role===r ? "#fff" : "var(--text-secondary)",
                transition:"all 0.2s",
              }}>
                {r === "patient" ? "🏥 Patient" : "👨‍⚕️ Doctor"}
              </button>
            ))}
          </div>

          {role === "doctor" && (
            <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:10, padding:"12px 14px", marginBottom:20 }}>
              <p style={{ fontSize:13, color:"#92400e" }}>⚠️ Doctor accounts require admin verification before you can see patients.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {/* Name */}
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:7, fontSize:14 }}>Full Name</label>
              <div style={{ position:"relative" }}>
                <User size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Dr. Rahul Sharma" style={inputStyle(errors.name)}
                  onFocus={e => e.target.style.borderColor = "var(--brand)"}
                  onBlur={e => e.target.style.borderColor = errors.name ? "var(--danger)" : "var(--border-strong)"}
                />
              </div>
              {errors.name && <p style={{ color:"var(--danger)", fontSize:12, marginTop:5 }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:7, fontSize:14 }}>Email address</label>
              <div style={{ position:"relative" }}>
                <Mail size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputStyle(errors.email)}
                  onFocus={e => e.target.style.borderColor = "var(--brand)"}
                  onBlur={e => e.target.style.borderColor = errors.email ? "var(--danger)" : "var(--border-strong)"}
                />
              </div>
              {errors.email && <p style={{ color:"var(--danger)", fontSize:12, marginTop:5 }}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:7, fontSize:14 }}>Phone (optional)</label>
              <div style={{ position:"relative" }}>
                <Phone size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210" style={inputStyle()}
                  onFocus={e => e.target.style.borderColor = "var(--brand)"}
                  onBlur={e => e.target.style.borderColor = "var(--border-strong)"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:7, fontSize:14 }}>Password</label>
              <div style={{ position:"relative" }}>
                <Lock size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" style={{ ...inputStyle(errors.password), paddingRight:42 }}
                  onFocus={e => e.target.style.borderColor = "var(--brand)"}
                  onBlur={e => e.target.style.borderColor = errors.password ? "var(--danger)" : "var(--border-strong)"}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex" }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p style={{ color:"var(--danger)", fontSize:12, marginTop:5 }}>{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:7, fontSize:14 }}>Confirm Password</label>
              <div style={{ position:"relative" }}>
                <Lock size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password" style={inputStyle(errors.confirm)}
                  onFocus={e => e.target.style.borderColor = "var(--brand)"}
                  onBlur={e => e.target.style.borderColor = errors.confirm ? "var(--danger)" : "var(--border-strong)"}
                />
              </div>
              {errors.confirm && <p style={{ color:"var(--danger)", fontSize:12, marginTop:5 }}>{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={isLoading} style={{
              width:"100%", padding:"13px", borderRadius:10, marginTop:4,
              background: isLoading ? "#99f6e4" : "linear-gradient(135deg,#0d9488,#0284c7)",
              color:"#fff", fontWeight:700, fontSize:15, border:"none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 16px rgba(13,148,136,0.3)",
            }}>
              {isLoading ? "Creating account..." : (<>Create Account <ArrowRight size={17}/></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}