"use client";

import { useState, useEffect, useCallback } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/axios";
import {
  UserCheck,
  ShieldCheck,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  User,
  Stethoscope,
  Clock,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminNav } from "@/lib/navItems";

interface DoctorEntry {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
  };
  profile: {
    specialization: string;
    experience: number;
    consultationFee: number;
    isProfileComplete: boolean;
  } | null;
}

const FILTER_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "false" },
  { label: "Verified", value: "true" },
];

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: "10",
      };
      if (filter !== "") params.isVerified = filter;
      if (search) params.search = search;

      const res = await api.get("/admin/doctors", { params });
      setDoctors(res.data.doctors);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load doctors.");
    } finally {
      setIsLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const handleVerify = async (userId: string, verify: boolean) => {
    setActionId(userId);
    try {
      await api.patch(`/admin/doctors/${userId}/verify`, {
        isVerified: verify,
      });
      toast.success(verify ? "Doctor verified!" : "Verification revoked.");
      fetchDoctors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout navItems={adminNav}>
        <div className="space-y-6 animate-fade-up">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Doctor Management
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {total} doctor{total !== 1 ? "s" : ""} registered
              </p>
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
            className="max-w-sm"
          />

          {/* Filter tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`
                  px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    filter === tab.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Doctor cards */}
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))
            ) : doctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <UserCheck size={28} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No doctors found</p>
              </div>
            ) : (
              doctors.map(({ user, profile }) => (
                <div
                  key={user._id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row gap-4"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D6FA4] to-[#22C9C9] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {user.name?.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {user.name}
                        </h3>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <Badge
                        variant={
                          user.isVerified ? "verified" : "pending-verify"
                        }
                      />
                    </div>

                    {/* Profile details */}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {profile ? (
                        <>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Stethoscope size={11} className="text-slate-400" />
                            {profile.specialization}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={11} className="text-slate-400" />
                            {profile.experience} yrs exp
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Wallet size={11} className="text-slate-400" />₹
                            {profile.consultationFee}
                          </span>
                          {!profile.isProfileComplete && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              Profile incomplete
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          No profile created yet
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Registered:{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col gap-2 justify-end items-end">
                    {!user.isVerified ? (
                      <Button
                        size="xs"
                        leftIcon={<CheckCircle2 size={13} />}
                        isLoading={actionId === user._id}
                        onClick={() => handleVerify(user._id, true)}
                      >
                        Verify
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<XCircle size={13} />}
                        isLoading={actionId === user._id}
                        onClick={() => handleVerify(user._id, false)}
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))
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
              <span className="flex items-center text-sm text-slate-500 px-3">
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
