"use client";

import { useState, useEffect, useCallback } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";
import { IAppointment, AppointmentStatus } from "@/types/index";
import {
  ShieldCheck,
  UserCheck,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { adminNav } from "@/lib/navItems";

interface Stats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: "10",
      };
      if (activeTab) params.status = activeTab;

      const res = await api.get("/admin/appointments", { params });
      setAppointments(res.data.appointments);
      setStats(res.data.stats);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      console.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const statCards = stats
    ? [
        {
          label: "Pending",
          value: stats.pending,
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          label: "Confirmed",
          value: stats.confirmed,
          icon: TrendingUp,
          color: "text-[#1D6FA4]",
          bg: "bg-sky-50",
        },
        {
          label: "Completed",
          value: stats.completed,
          icon: CheckCircle2,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Cancelled",
          value: stats.cancelled,
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-50",
        },
      ]
    : [];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout navItems={adminNav}>
        <div className="space-y-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">
              All Appointments
            </h1>
            <p className="text-[#7A90A4] text-sm mt-1">
              {total} total appointment{total !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-4 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#0D1B2A]">{value}</p>
                    <p className="text-xs text-[#7A90A4]">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    activeTab === tab.value
                      ? "bg-white text-[#0D1B2A] shadow-sm"
                      : "text-[#7A90A4] hover:text-[#3D5166]"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-16 text-center">
                <Calendar size={24} className="text-slate-300 mx-auto mb-3" />
                <p className="text-[#7A90A4] font-medium">
                  No appointments found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5ECF4] bg-slate-50">
                      {[
                        "Date & Time",
                        "Patient",
                        "Doctor",
                        "Specialization",
                        "Fee",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-[#7A90A4] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {appointments.map((appt) => (
                      <tr
                        key={appt._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-medium text-[#0D1B2A]">
                            {new Date(appt.appointmentDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </p>
                          <p className="text-xs text-[#7A90A4]">
                            {appt.slot.startTime} – {appt.slot.endTime}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#0D1B2A]">
                            {appt.patient.name}
                          </p>
                          <p className="text-xs text-[#7A90A4]">
                            {appt.patient.email}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#0D1B2A]">
                            {appt.doctor.name}
                          </p>
                          <p className="text-xs text-[#7A90A4]">
                            {appt.doctor.email}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-[#3D5166]">
                          {appt.doctorProfile?.specialization || "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          ₹{appt.consultationFee}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={appt.status as AppointmentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </Button>
              <span className="flex items-center text-sm text-[#7A90A4] px-3">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
