"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  Video, Calendar, Shield, Star, ArrowRight, Heart,
  Stethoscope, Clock, CheckCircle, Users, Award, Phone
} from "lucide-react";

const features = [
  { icon: <Video size={24}/>, title: "HD Video Consultations", desc: "Crystal-clear video calls with end-to-end encryption for private, secure consultations." },
  { icon: <Calendar size={24}/>, title: "Easy Appointment Booking", desc: "Browse doctor availability and book appointments in seconds, 24/7." },
  { icon: <Shield size={24}/>, title: "Verified Doctors", desc: "Every doctor is manually verified by our admin team before seeing patients." },
  { icon: <Heart size={24}/>, title: "Digital Prescriptions", desc: "Receive digital prescriptions instantly after your consultation." },
];

const stats = [
  { value: "500+", label: "Verified Doctors", icon: <Stethoscope size={20}/> },
  { value: "10K+", label: "Happy Patients", icon: <Users size={20}/> },
  { value: "4.9★", label: "Average Rating", icon: <Star size={20}/> },
  { value: "24/7", label: "Available", icon: <Clock size={20}/> },
];

const specialties = [
  "Cardiologist","Dermatologist","Neurologist","Orthopedist",
  "Pediatrician","Psychiatrist","General Physician","Gynecologist",
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ background: "var(--bg-base)" }}>
      {/* ─── Hero ─── */}
      <section style={{
        background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #f0fdf4 100%)",
        padding: "80px 24px 100px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position:"absolute", top:-80, right:-80, width:400, height:400,
          background:"radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)",
          borderRadius:"50%", pointerEvents:"none",
        }}/>
        <div style={{
          position:"absolute", bottom:-60, left:-60, width:300, height:300,
          background:"radial-gradient(circle, rgba(2,132,199,0.1) 0%, transparent 70%)",
          borderRadius:"50%", pointerEvents:"none",
        }}/>

        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:24 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(13,148,136,0.1)", border:"1px solid rgba(13,148,136,0.2)",
            borderRadius:99, padding:"6px 16px", fontSize:13, fontWeight:600, color:"var(--brand)",
          }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--brand)", animation:"pulse-dot 2s infinite" }}/>
            Trusted by 10,000+ patients across India
          </div>

          <h1 style={{ fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:800, lineHeight:1.15, color:"var(--text-primary)", maxWidth:700 }}>
            Healthcare at Your{" "}
            <span style={{ background:"linear-gradient(135deg,#0d9488,#0284c7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Fingertips
            </span>
          </h1>

          <p style={{ fontSize:"1.125rem", color:"var(--text-secondary)", maxWidth:560, lineHeight:1.7 }}>
            Connect with verified specialists instantly. Book appointments, get HD video consultations,
            and receive digital prescriptions — all from the comfort of your home.
          </p>

          <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
            {isAuthenticated ? (
              <Link href={`/dashboard/${user?.role}`} style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"linear-gradient(135deg,#0d9488,#0284c7)",
                color:"#fff", padding:"14px 28px", borderRadius:12,
                fontWeight:700, fontSize:15, textDecoration:"none",
                boxShadow:"0 8px 24px rgba(13,148,136,0.35)",
                transition:"transform 0.15s,box-shadow 0.15s",
              }}>
                Go to Dashboard <ArrowRight size={18}/>
              </Link>
            ) : (
              <>
                <Link href="/register" style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  background:"linear-gradient(135deg,#0d9488,#0284c7)",
                  color:"#fff", padding:"14px 28px", borderRadius:12,
                  fontWeight:700, fontSize:15, textDecoration:"none",
                  boxShadow:"0 8px 24px rgba(13,148,136,0.35)",
                }}>
                  Get Started Free <ArrowRight size={18}/>
                </Link>
                <Link href="/doctors" style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  background:"#fff", color:"var(--brand)",
                  border:"2px solid var(--brand)", padding:"12px 24px",
                  borderRadius:12, fontWeight:600, fontSize:15, textDecoration:"none",
                }}>
                  <Stethoscope size={18}/> Browse Doctors
                </Link>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center", marginTop:16 }}>
            {["HIPAA Compliant","256-bit Encryption","ISO Certified","24/7 Support"].map(b => (
              <div key={b} style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--text-secondary)" }}>
                <CheckCircle size={15} style={{ color:"var(--brand)" }}/> {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ padding:"0 24px", marginTop:-40 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16,
            background:"#fff", borderRadius:20, padding:8,
            boxShadow:"0 20px 60px rgba(13,148,136,0.12)", border:"1px solid var(--border)",
          }}>
            {stats.map(s => (
              <div key={s.label} style={{ padding:"28px 20px", textAlign:"center" }}>
                <div style={{
                  width:48, height:48, borderRadius:12, background:"var(--brand-light)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 12px", color:"var(--brand)",
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize:"1.75rem", fontWeight:800, color:"var(--brand)", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding:"80px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--brand)", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>
              Why TeleConsult?
            </div>
            <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", marginBottom:16 }}>
              Everything you need for modern healthcare
            </h2>
            <p style={{ color:"var(--text-secondary)", maxWidth:540, margin:"0 auto" }}>
              A complete telemedicine platform designed for patients, doctors, and healthcare administrators.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 }}>
            {features.map(f => (
              <div key={f.title} className="card card-hover" style={{ padding:28 }}>
                <div style={{
                  width:52, height:52, borderRadius:14, background:"var(--brand-light)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginBottom:20, color:"var(--brand)",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize:17, marginBottom:10 }}>{f.title}</h3>
                <p style={{ color:"var(--text-secondary)", lineHeight:1.65, fontSize:14 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Specialties ─── */}
      <section style={{ padding:"60px 24px", background:"#fff" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:"clamp(1.4rem,2.5vw,2rem)", marginBottom:8 }}>Browse by Specialization</h2>
          <p style={{ color:"var(--text-secondary)", marginBottom:36 }}>Find the right specialist for your health needs</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center" }}>
            {specialties.map(sp => (
              <Link key={sp} href={`/doctors?specialization=${sp}`} style={{
                padding:"10px 20px", borderRadius:99,
                background:"var(--brand-light)", color:"var(--brand-dark)",
                fontSize:14, fontWeight:600, textDecoration:"none", border:"1px solid var(--border)",
                transition:"all 0.15s",
              }}>
                {sp}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section style={{ padding:"80px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:"clamp(1.4rem,2.5vw,2rem)", marginBottom:8 }}>How it works</h2>
          <p style={{ color:"var(--text-secondary)", marginBottom:56 }}>Get a consultation in 3 simple steps</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:32 }}>
            {[
              { n:"1", icon:<Users size={28}/>, title:"Create Account", desc:"Sign up as a patient or doctor in under 2 minutes." },
              { n:"2", icon:<Calendar size={28}/>, title:"Book Appointment", desc:"Browse doctors, view their schedule, and pick a time slot." },
              { n:"3", icon:<Video size={28}/>, title:"Consult Online", desc:"Join the secure video call and get your prescription digitally." },
            ].map(step => (
              <div key={step.n} style={{ position:"relative", padding:"40px 28px", textAlign:"center" }}>
                <div style={{
                  position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                  width:40, height:40, borderRadius:"50%",
                  background:"linear-gradient(135deg,#0d9488,#0284c7)",
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:800, fontSize:16, boxShadow:"0 4px 12px rgba(13,148,136,0.4)",
                }}>
                  {step.n}
                </div>
                <div style={{ color:"var(--brand)", marginBottom:16, marginTop:8 }}>{step.icon}</div>
                <h3 style={{ fontSize:17, marginBottom:10 }}>{step.title}</h3>
                <p style={{ color:"var(--text-secondary)", fontSize:14, lineHeight:1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      {!isAuthenticated && (
        <section style={{ padding:"60px 24px" }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <div style={{
              background:"linear-gradient(135deg,#0d9488,#0284c7)",
              borderRadius:24, padding:"52px 40px", textAlign:"center",
              boxShadow:"0 20px 60px rgba(13,148,136,0.3)",
            }}>
              <h2 style={{ color:"#fff", fontSize:"clamp(1.5rem,3vw,2.2rem)", marginBottom:12 }}>
                Start Your Health Journey Today
              </h2>
              <p style={{ color:"rgba(255,255,255,0.85)", marginBottom:32, fontSize:15 }}>
                Join thousands of patients who trust TeleConsult for their healthcare needs.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <Link href="/register" style={{
                  background:"#fff", color:"var(--brand)", padding:"13px 28px",
                  borderRadius:12, fontWeight:700, fontSize:15, textDecoration:"none",
                }}>
                  Register as Patient
                </Link>
                <Link href="/register?role=doctor" style={{
                  background:"rgba(255,255,255,0.15)", color:"#fff",
                  border:"2px solid rgba(255,255,255,0.4)",
                  padding:"11px 24px", borderRadius:12, fontWeight:600, fontSize:15, textDecoration:"none",
                }}>
                  Join as Doctor
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer style={{
        background:"var(--sidebar-bg)", color:"rgba(255,255,255,0.7)",
        padding:"40px 24px 28px", textAlign:"center", marginTop:40,
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"var(--brand)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Stethoscope size={18} color="#fff"/>
          </div>
          <span style={{ fontWeight:700, fontSize:18, color:"#fff" }}>TeleConsult</span>
        </div>
        <p style={{ fontSize:13 }}>© {new Date().getFullYear()} TeleConsult. All rights reserved.</p>
        <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:12, fontSize:13 }}>
          <Link href="/doctors" style={{ color:"rgba(255,255,255,0.6)", textDecoration:"none" }}>Find Doctors</Link>
          <Link href="/login"   style={{ color:"rgba(255,255,255,0.6)", textDecoration:"none" }}>Login</Link>
          <Link href="/register" style={{ color:"rgba(255,255,255,0.6)", textDecoration:"none" }}>Register</Link>
        </div>
      </footer>
    </div>
  );
}
