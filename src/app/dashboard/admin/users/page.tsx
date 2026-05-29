"use client";

declare module "lucide-react";

import { useState, useEffect, useCallback } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import api from "@/lib/axios";
import { IUser } from "@/types/index";
import {
  ShieldCheck,
  UserCheck,
  Calendar,
  Users,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminNav } from "@/lib/navItems";

const ROLE_TABS = [
  { label: "All", value: "" },
  { label: "Patients", value: "patient" },
  { label: "Doctors", value: "doctor" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: "12",
      };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res = await api.get("/admin/users", { params });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const handleToggleActive = async (userId: string, currentState: boolean) => {
    setActionId(userId);
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      toast.success(currentState ? "User deactivated." : "User activated.");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed.");
    } finally {
      setActionId(null);
    }
  };

  const roleColor: Record<string, string> = {
    patient: "bg-emerald-100 text-emerald-700",
    doctor: "bg-sky-100 text-[#0F4C75]",
    admin: "bg-purple-100 text-purple-700",
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout navItems={adminNav}>
        <div className="space-y-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">
              User Management
            </h1>
            <p className="text-[#7A90A4] text-sm mt-1">
              {total} user{total !== 1 ? "s" : ""} on the platform
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              className="max-w-sm"
            />
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit h-fit">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setRoleFilter(tab.value)}
                  className={`
                    px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${
                      roleFilter === tab.value
                        ? "bg-white text-[#0D1B2A] shadow-sm"
                        : "text-[#7A90A4] hover:text-[#3D5166]"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* User grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))
            ) : users.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl p-16 text-center">
                <Users size={24} className="text-slate-300 mx-auto mb-3" />
                <p className="text-[#7A90A4] font-medium">No users found</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className={`
                      bg-white rounded-2xl border p-4 flex items-center gap-3 transition-all
                      ${!user.isActive ? "opacity-60 border-[#E5ECF4]" : "border-[#E5ECF4]"}
                    `}
                >
                  {/* Avatar */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      flex-shrink-0 font-bold text-white text-base
                      ${
                        user.isActive
                          ? "bg-gradient-to-br from-[#1D6FA4] to-[#22C9C9]"
                          : "bg-slate-300"
                      }
                    `}
                  >
                    {user.name?.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#0D1B2A] text-sm truncate">
                        {user.name}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColor[user.role] || "bg-slate-100 text-[#3D5166]"}`}
                      >
                        {user.role}
                      </span>
                      {!user.isActive && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7A90A4] truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  {/* Toggle */}
                  {user.role !== "admin" && (
                    <button
                      onClick={() =>
                        handleToggleActive(user._id, user.isActive)
                      }
                      disabled={actionId === user._id}
                      className="flex-shrink-0 transition-colors"
                      title={
                        user.isActive ? "Deactivate user" : "Activate user"
                      }
                    >
                      {user.isActive ? (
                        <ToggleRight
                          size={28}
                          className="text-[#1D6FA4] hover:text-[#1D6FA4]"
                        />
                      ) : (
                        <ToggleLeft
                          size={28}
                          className="text-slate-300 hover:text-[#7A90A4]"
                        />
                      )}
                    </button>
                  )}
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
