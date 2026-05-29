"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Calendar,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { adminNav } from "@/lib/navItems";

interface PlatformStats {
  users: {
    total: number;
    doctors: number;
    verified: number;
    pending: number;
    patients: number;
  };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

// ── Stat card — defined OUTSIDE component to avoid "created during render" error
function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  href,
  loading,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  href?: string;
  loading?: boolean;
}) {
  const inner = (
    <div
      className="bg-white rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md"
      style={{
        border: "1px solid #E8ECF4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1.5" style={{ color: "#6B7280" }}>
          {label}
        </p>
        {loading ? (
          <div className="skeleton h-7 w-12 rounded-lg" />
        ) : (
          <p
            className="text-2xl font-bold"
            style={{ color: "#1A1F3C", letterSpacing: "-0.03em" }}
          >
            {value ?? "—"}
          </p>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={22} style={{ color: iconColor }} strokeWidth={1.8} />
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout navItems={adminNav}>
        <div className="space-y-6 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#1A1F3C" }}>
                Admin Dashboard
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#9CA3AF" }}>
                Welcome back, {user?.name}
              </p>
            </div>
            <Link
              href="/dashboard/admin/doctors?isVerified=false"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                boxShadow: "0 4px 12px rgba(79,70,229,0.30)",
              }}
            >
              <UserCheck size={15} />
              Pending Verifications
              {stats?.users.pending ? (
                <span className="bg-white/25 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {stats.users.pending}
                </span>
              ) : null}
            </Link>
          </div>

          {/* ── User stats ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#9CA3AF" }}
            >
              Users
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={stats?.users.total ?? "—"}
                icon={Users}
                iconColor="#4F46E5"
                iconBg="#EEF2FF"
                href="/dashboard/admin/users"
                loading={loading}
              />
              <StatCard
                label="Total Doctors"
                value={stats?.users.doctors ?? "—"}
                icon={UserCheck}
                iconColor="#0EA5E9"
                iconBg="#E0F2FE"
                href="/dashboard/admin/doctors"
                loading={loading}
              />
              <StatCard
                label="Verified Doctors"
                value={stats?.users.verified ?? "—"}
                icon={CheckCircle2}
                iconColor="#10B981"
                iconBg="#D1FAE5"
                href="/dashboard/admin/doctors?isVerified=true"
                loading={loading}
              />
              <StatCard
                label="Pending Verification"
                value={stats?.users.pending ?? "—"}
                icon={AlertTriangle}
                iconColor="#F59E0B"
                iconBg="#FEF3C7"
                href="/dashboard/admin/doctors?isVerified=false"
                loading={loading}
              />
            </div>
          </div>

          {/* ── Appointment stats ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#9CA3AF" }}
            >
              Appointments
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total"
                value={stats?.appointments.total ?? "—"}
                icon={Calendar}
                iconColor="#4F46E5"
                iconBg="#EEF2FF"
                href="/dashboard/admin/appointments"
                loading={loading}
              />
              <StatCard
                label="Pending"
                value={stats?.appointments.pending ?? "—"}
                icon={Clock}
                iconColor="#F59E0B"
                iconBg="#FEF3C7"
                href="/dashboard/admin/appointments?status=pending"
                loading={loading}
              />
              <StatCard
                label="Completed"
                value={stats?.appointments.completed ?? "—"}
                icon={CheckCircle2}
                iconColor="#10B981"
                iconBg="#D1FAE5"
                loading={loading}
              />
              <StatCard
                label="Cancelled"
                value={stats?.appointments.cancelled ?? "—"}
                icon={XCircle}
                iconColor="#EF4444"
                iconBg="#FEE2E2"
                loading={loading}
              />
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#9CA3AF" }}
            >
              Quick Actions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/admin/doctors?isVerified=false"
                className="group relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#4338CA 0%,#6366F1 100%)",
                }}
              >
                <div
                  className="absolute -right-6 -top-6 w-32 h-32 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <UserCheck size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-base">
                    Doctor Verifications
                  </p>
                  <p className="text-indigo-200/80 text-sm mt-0.5">
                    {loading
                      ? "..."
                      : `${stats?.users.pending ?? 0} doctor${(stats?.users.pending ?? 0) !== 1 ? "s" : ""} waiting`}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-white/50 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0"
                />
              </Link>

              <Link
                href="/dashboard/admin/appointments"
                className="group bg-white rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 hover:shadow-md"
                style={{ border: "1px solid #E8ECF4" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#EEF2FF" }}
                >
                  <TrendingUp size={20} style={{ color: "#4F46E5" }} />
                </div>
                <div>
                  <p
                    className="font-semibold text-base"
                    style={{ color: "#1A1F3C" }}
                  >
                    All Appointments
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "#9CA3AF" }}>
                    Monitor platform activity
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="ml-auto group-hover:translate-x-1 transition-all flex-shrink-0"
                  style={{ color: "#D1D5DB" }}
                />
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
