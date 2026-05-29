"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Calendar,
  Search,
  FileText,
  Video,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { patientNav } from "@/lib/navItems";

interface PatientStats {
  upcoming: number;
  completed: number;
  cancelled: number;
  videoCalls: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PatientStats>({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    videoCalls: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pending, confirmed, completed, cancelled] = await Promise.all([
          api.get("/appointments/my", {
            params: { status: "pending", limit: "1" },
          }),
          api.get("/appointments/my", {
            params: { status: "confirmed", limit: "1" },
          }),
          api.get("/appointments/my", {
            params: { status: "completed", limit: "1" },
          }),
          api.get("/appointments/my", {
            params: { status: "cancelled", limit: "1" },
          }),
        ]);
        const upcomingCount =
          (pending.data.total ?? 0) + (confirmed.data.total ?? 0);
        const completedCount = completed.data.total ?? 0;
        setStats({
          upcoming: upcomingCount,
          completed: completedCount,
          cancelled: cancelled.data.total ?? 0,
          videoCalls: completedCount,
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
      label: "Upcoming",
      value: stats.upcoming,
      icon: Calendar,
      color: "#1D6FA4",
      bg: "#E8F4FD",
      border: "#C5D5E4",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "#059669",
      bg: "#D1FAE5",
      border: "#A7F3D0",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "#DC2626",
      bg: "#FEE2E2",
      border: "#FCA5A5",
    },
    {
      label: "Video calls",
      value: stats.videoCalls,
      icon: Video,
      color: "#7C3AED",
      bg: "#EDE9FE",
      border: "#C4B5FD",
    },
  ];

  return (
    <RoleGuard allowedRoles={["patient"]}>
      <DashboardLayout navItems={patientNav}>
        <div className="space-y-8 animate-fade-up max-w-4xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "#0D1B2A", letterSpacing: "-0.03em" }}
              >
                {getGreeting()}, {user?.name?.split(" ")[0]} 
              </h1>
              <p className="text-sm mt-1" style={{ color: "#7A90A4" }}>
                Here's your health activity overview
              </p>
            </div>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#1D6FA4,#0F4C75)",
                boxShadow: "0 4px 14px rgba(29,111,164,0.25)",
              }}
            >
              <Search size={14} /> Find a Doctor
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 transition-all duration-200 hover:shadow-lg cursor-default"
                style={{
                  border: `1px solid ${border}20`,
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
                href="/doctors"
                className="group relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg,#0A3353,#1D6FA4)",
                }}
              >
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/8" />
                <div className="absolute right-8 bottom-[-20px] w-24 h-24 rounded-full bg-white/5" />
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 relative border border-white/20">
                  <Search size={20} className="text-white" />
                </div>
                <div className="relative">
                  <p className="font-bold text-white text-base">
                    Find a Doctor
                  </p>
                  <p className="text-sky-200/80 text-sm mt-0.5">
                    Search by name or specialty
                  </p>
                </div>
                <ArrowRight
                  size={17}
                  className="text-sky-300/60 ml-auto relative group-hover:translate-x-1 transition-transform flex-shrink-0"
                />
              </Link>

              <Link
                href="/dashboard/patient/appointments"
                className="group bg-white rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  border: "1px solid #E5ECF4",
                  boxShadow: "0 2px 8px rgba(13,27,42,0.04)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#E8F4FD" }}
                >
                  <Calendar size={20} style={{ color: "#1D6FA4" }} />
                </div>
                <div>
                  <p
                    className="font-bold text-base"
                    style={{ color: "#0D1B2A" }}
                  >
                    My Appointments
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "#7A90A4" }}>
                    View and manage bookings
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

          {/* Recent appointments empty state */}
          <div>
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#7A90A4" }}
            >
              Recent Appointments
            </h2>
            <div
              className="bg-white rounded-2xl p-12 text-center"
              style={{
                border: "1px solid #E5ECF4",
                boxShadow: "0 2px 8px rgba(13,27,42,0.04)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#F7F9FC" }}
              >
                <Calendar size={26} style={{ color: "#C5D5E4" }} />
              </div>
              <p className="font-semibold" style={{ color: "#3D5166" }}>
                No appointments yet
              </p>
              <p className="text-sm mt-1 mb-5" style={{ color: "#7A90A4" }}>
                Book your first consultation to get started
              </p>
              <Link
                href="/doctors"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: "#1D6FA4" }}
              >
                Find a doctor <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
