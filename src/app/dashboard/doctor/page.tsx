"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { doctorNav } from "@/lib/navItems";

interface AppointmentStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AppointmentStats>({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pending, confirmed, completed, cancelled] = await Promise.all([
          api.get("/appointments/doctor/my", {
            params: { status: "pending", limit: "1" },
          }),
          api.get("/appointments/doctor/my", {
            params: { status: "confirmed", limit: "1" },
          }),
          api.get("/appointments/doctor/my", {
            params: { status: "completed", limit: "1" },
          }),
          api.get("/appointments/doctor/my", {
            params: { status: "cancelled", limit: "1" },
          }),
        ]);
        setStats({
          pending: pending.data.total ?? 0,
          confirmed: confirmed.data.total ?? 0,
          completed: completed.data.total ?? 0,
          cancelled: cancelled.data.total ?? 0,
        });
      } catch {
        // silently fail — stats are non-critical
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const STATS = [
    {
      label: "Pending",
      value: stats.pending,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: Clock,
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      color: "#1D6FA4",
      bg: "#E8F4FD",
      border: "#BAE6FD",
      icon: CheckCircle2,
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "#059669",
      bg: "#D1FAE5",
      border: "#A7F3D0",
      icon: CheckCircle2,
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      color: "#DC2626",
      bg: "#FEE2E2",
      border: "#FCA5A5",
      icon: XCircle,
    },
  ];

  return (
    <RoleGuard allowedRoles={["doctor"]}>
      <DashboardLayout navItems={doctorNav}>
        <div className="space-y-8 animate-fade-up max-w-4xl">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "#0D1B2A", letterSpacing: "-0.03em" }}
              >
                Welcome, {user?.name} 👨‍⚕️
              </h1>
              <p className="text-sm mt-1" style={{ color: "#7A90A4" }}>
                Manage appointments and your patients
              </p>
            </div>
            <Badge variant={user?.isVerified ? "verified" : "pending-verify"} />
          </div>

          {/* Verification alert */}
          {!user?.isVerified && (
            <div
              className="flex items-start gap-4 p-5 rounded-2xl border"
              style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FEF3C7" }}
              >
                <AlertCircle size={17} style={{ color: "#D97706" }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#92400E" }}>
                  Verification Pending
                </p>
                <p
                  className="text-sm mt-0.5 leading-relaxed"
                  style={{ color: "#B45309" }}
                >
                  Your account is under review. You&apos;ll be notified once
                  approved by our medical board.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 transition-all duration-200 hover:shadow-lg"
                style={{
                  border: "1px solid #E5ECF4",
                  boxShadow: "0 2px 8px rgba(13,27,42,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bg }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                {isLoadingStats ? (
                  <div className="skeleton h-7 w-10 rounded-lg mb-1" />
                ) : (
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "#0D1B2A", letterSpacing: "-0.04em" }}
                  >
                    {value}
                  </p>
                )}
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: "#7A90A4" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#7A90A4" }}
            >
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/doctor/appointments"
                className="group relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg,#065F46,#059669)",
                }}
              >
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/8" />
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Appointments</p>
                  <p className="text-emerald-200/80 text-sm mt-0.5">
                    Confirm or manage bookings
                  </p>
                </div>
                <ArrowRight
                  size={17}
                  className="text-emerald-300/60 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0"
                />
              </Link>

              <Link
                href="/dashboard/doctor/profile"
                className="group bg-white rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  border: "1px solid #E5ECF4",
                  boxShadow: "0 2px 8px rgba(13,27,42,0.04)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#D1FAE5" }}
                >
                  <User size={20} style={{ color: "#059669" }} />
                </div>
                <div>
                  <p
                    className="font-bold text-base"
                    style={{ color: "#0D1B2A" }}
                  >
                    My Profile
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "#7A90A4" }}>
                    Update availability & fees
                  </p>
                </div>
                <ArrowRight
                  size={17}
                  className="ml-auto group-hover:translate-x-1 transition-all flex-shrink-0"
                  style={{ color: "#C5D5E4" }}
                />
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
