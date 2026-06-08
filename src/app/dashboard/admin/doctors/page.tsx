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
  Search,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Clock,
  Wallet,
  Mail,
  Phone,
  Calendar,
  Languages,
  Award,
  X,
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
    bio?: string;
    qualifications?: string[];
    languages?: string[];
    availableDays?: {
      day: string;
      slots: {
        _id?: string;
        startTime: string;
        endTime: string;
        isBooked?: boolean;
      }[];
    }[];
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
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorEntry | null>(null);

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
              <div className="mobile-soft-pad bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <span className="tc-icon-tile tc-icon-tile-lg mx-auto mb-3"><UserCheck size={28} /></span>
                <p className="text-slate-500 font-medium">No doctors found</p>
              </div>
            ) : (
              doctors.map(({ user, profile }) => (
                <div
                  key={user._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDoctor({ user, profile })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDoctor({ user, profile });
                    }
                  }}
                  className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row gap-4 cursor-pointer transition-all hover:border-sky-100 hover:shadow-lg"
                >
                  {/* Avatar */}
                  <div className="tc-icon-tile tc-icon-tile-lg">
                    <span className="font-bold text-lg">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(user._id, true);
                        }}
                      >
                        Verify
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<XCircle size={13} />}
                        isLoading={actionId === user._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(user._id, false);
                        }}
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

          {selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
                onClick={() => setSelectedDoctor(null)}
              />
              <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
                  <div className="flex items-center gap-4">
                    <div className="tc-icon-tile tc-icon-tile-xl">
                      <span className="text-2xl font-bold">
                        {selectedDoctor.user.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedDoctor.user.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {selectedDoctor.profile?.specialization || "No specialization added"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          variant={
                            selectedDoctor.user.isVerified
                              ? "verified"
                              : "pending-verify"
                          }
                        />
                        {!selectedDoctor.profile?.isProfileComplete && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                            Profile incomplete
                          </span>
                        )}
                        {!selectedDoctor.user.isActive && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                    aria-label="Close doctor details"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Mail size={14} /> Email
                      </div>
                      <p className="break-words text-sm font-medium text-slate-800">
                        {selectedDoctor.user.email}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Phone size={14} /> Phone
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDoctor.user.phone || "Not added"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Calendar size={14} /> Registered
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {new Date(selectedDoctor.user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Clock size={14} /> Experience
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedDoctor.profile ? `${selectedDoctor.profile.experience || 0} years` : "Not added"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Wallet size={14} /> Fee
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedDoctor.profile ? `₹${selectedDoctor.profile.consultationFee || 0}` : "Not added"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Languages size={14} /> Languages
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedDoctor.profile?.languages?.length
                          ? selectedDoctor.profile.languages.join(", ")
                          : "Not added"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Award size={14} /> Qualifications
                    </div>
                    {selectedDoctor.profile?.qualifications?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedDoctor.profile.qualifications.map((q) => (
                          <span
                            key={q}
                            className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {q}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No qualifications added.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Bio
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {selectedDoctor.profile?.bio || "No bio added."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Availability
                    </p>
                    {selectedDoctor.profile?.availableDays?.length ? (
                      <div className="space-y-3">
                        {selectedDoctor.profile.availableDays.map((day) => (
                          <div key={day.day} className="rounded-xl bg-slate-50 p-3">
                            <p className="mb-2 text-sm font-semibold text-slate-800">
                              {day.day}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {day.slots?.length ? (
                                day.slots.map((slot, index) => (
                                  <span
                                    key={slot._id || `${day.day}-${index}`}
                                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100"
                                  >
                                    {slot.startTime} - {slot.endTime}
                                    {slot.isBooked ? " booked" : ""}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">No slots</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No availability added.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
