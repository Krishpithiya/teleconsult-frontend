"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Stethoscope, Mail, ArrowRight, ArrowLeft, Lock,
  Eye, EyeOff, CheckCircle, ShieldCheck,
} from "lucide-react";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [userId, setUserId]       = useState("");
  const [newPwd, setNewPwd]       = useState("");
  const [confirmPwd, setConfirm]  = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [showCPwd, setShowCPwd]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  /* ── Step 1: verify email ── */
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password/check", { email });
      setUserId(res.data.userId);
      setStep("reset");
      toast.success("Email verified! Now set your new password.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Email not found.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: set new password ── */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (newPwd.length < 6) errs.newPwd = "Password must be at least 6 characters";
    if (newPwd !== confirmPwd) errs.confirmPwd = "Passwords do not match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { userId, newPassword: newPwd });
      setStep("done");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "12px 14px 12px 42px", borderRadius: 10,
    fontSize: 15, background: "#fff", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#f0fdfa 0%,#e0f2fe 50%,#f0fdf4 100%)",
      padding: "40px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={22} color="#fff"/>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "var(--brand)" }}>TeleConsult</span>
        </div>

        {/* Progress indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          {(["email", "reset", "done"] as Step[]).map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < 2 ? 1 : "none" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: step === s ? "var(--brand)" : (
                  (s === "email" && (step === "reset" || step === "done")) ||
                  (s === "reset" && step === "done")
                ) ? "var(--success)" : "#e2e8f0",
                color: step === s || (s === "email" && (step === "reset" || step === "done")) || (s === "reset" && step === "done") ? "#fff" : "var(--text-muted)",
              }}>
                {((s === "email" && (step === "reset" || step === "done")) || (s === "reset" && step === "done"))
                  ? <CheckCircle size={13}/>
                  : i + 1}
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: (s === "email" && (step === "reset" || step === "done")) ? "var(--success)" : "#e2e8f0", borderRadius: 2 }}/>}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Email ── */}
        {step === "email" && (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Forgot Password?</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                Enter your registered email address and we&apos;ll verify it so you can set a new password.
              </p>
            </div>

            <form onSubmit={handleCheckEmail} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}/>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ ...inputBase, border: `1.5px solid ${errors.email ? "var(--danger)" : "var(--border-strong)"}` }}
                    onFocus={e => e.target.style.borderColor = "var(--brand)"}
                    onBlur={e => e.target.style.borderColor = errors.email ? "var(--danger)" : "var(--border-strong)"}
                  />
                </div>
                {errors.email && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{errors.email}</p>}
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: 10,
                background: loading ? "#99f6e4" : "linear-gradient(135deg,#0d9488,#0284c7)",
                color: "#fff", fontWeight: 700, fontSize: 15, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(13,148,136,0.3)",
              }}>
                {loading ? "Checking..." : (<>Verify Email <ArrowRight size={17}/></>)}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>
                <ArrowLeft size={14}/> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* ── STEP 2: New Password ── */}
        {step === "reset" && (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--brand-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "var(--brand)" }}>
                <ShieldCheck size={24}/>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Create New Password</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                Email <strong style={{ color: "var(--brand)" }}>{email}</strong> verified. Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* New Password */}
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}/>
                  <input
                    type={showPwd ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                    placeholder="Min. 6 characters"
                    style={{ ...inputBase, paddingRight: 44, border: `1.5px solid ${errors.newPwd ? "var(--danger)" : "var(--border-strong)"}` }}
                    onFocus={e => e.target.style.borderColor = "var(--brand)"}
                    onBlur={e => e.target.style.borderColor = errors.newPwd ? "var(--danger)" : "var(--border-strong)"}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.newPwd && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{errors.newPwd}</p>}

                {/* Strength indicator */}
                {newPwd && (
                  <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: newPwd.length >= n * 2
                          ? n <= 1 ? "#ef4444" : n <= 2 ? "#f59e0b" : n <= 3 ? "#10b981" : "#0d9488"
                          : "#e2e8f0",
                        transition: "background 0.2s",
                      }}/>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}/>
                  <input
                    type={showCPwd ? "text" : "password"} value={confirmPwd} onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    style={{ ...inputBase, paddingRight: 44, border: `1.5px solid ${errors.confirmPwd ? "var(--danger)" : "var(--border-strong)"}` }}
                    onFocus={e => e.target.style.borderColor = "var(--brand)"}
                    onBlur={e => e.target.style.borderColor = errors.confirmPwd ? "var(--danger)" : "var(--border-strong)"}
                  />
                  <button type="button" onClick={() => setShowCPwd(!showCPwd)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    {showCPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.confirmPwd && <p style={{ color: "var(--danger)", fontSize: 12, marginTop: 6 }}>{errors.confirmPwd}</p>}
                {confirmPwd && newPwd === confirmPwd && (
                  <p style={{ color: "var(--success)", fontSize: 12, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={12}/> Passwords match
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: 10,
                background: loading ? "#99f6e4" : "linear-gradient(135deg,#0d9488,#0284c7)",
                color: "#fff", fontWeight: 700, fontSize: 15, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(13,148,136,0.3)",
              }}>
                {loading ? "Resetting..." : (<>Reset Password <ArrowRight size={17}/></>)}
              </button>

              <button type="button" onClick={() => setStep("email")} style={{
                background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <ArrowLeft size={14}/> Use different email
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === "done" && (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--success-light)", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 20px", color: "var(--success)",
            }}>
              <CheckCircle size={36}/>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 10 }}>Password Reset!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Your password has been reset successfully.<br/>
              You can now sign in with your new password.
            </p>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg,#0d9488,#0284c7)",
              color: "#fff", padding: "13px 28px", borderRadius: 10,
              fontWeight: 700, fontSize: 15, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(13,148,136,0.3)",
            }}>
              Go to Sign In <ArrowRight size={17}/>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
