"use client";

import { useState, useEffect, useCallback } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";
import { IAppointment, AppointmentStatus } from "@/types/index";
import { Calendar, Clock, Video, FileText, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { patientNav } from "@/lib/navItems";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

// ─── Cancel Modal ─────────────────────────────────────────────────────────
function CancelModal({
  isOpen,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-up">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <div>
            <h3
              className="font-bold text-[#0D1B2A]"
              style={{ fontFamily: "'Sora',sans-serif" }}
            >
              Cancel Appointment
            </h3>
            <p className="text-sm text-[#7A90A4] mt-0.5">
              Please provide a reason (optional)
            </p>
          </div>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Schedule conflict, feeling better..."
          rows={3}
          autoFocus
          className="w-full px-4 py-3 text-sm border border-[#D9E4EE] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all placeholder:text-[#7A90A4] mb-4"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Keep Appointment
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm(reason);
              onClose();
            }}
          >
            Yes, Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Card ─────────────────────────────────────────────────────
const AppointmentCard = ({
  appt,
  onCancel,
}: {
  appt: IAppointment;
  onCancel: (id: string) => void;
}) => {
  const router = useRouter();
  const date = new Date(appt.appointmentDate);

  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4"
      style={{
        border: "1px solid #E5ECF4",
        boxShadow: "0 2px 8px rgba(13,27,42,0.04)",
      }}
    >
      {/* Date block */}
      <div className="flex-shrink-0 w-16 h-16 bg-sky-50 rounded-2xl flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-[#1D6FA4] uppercase">
          {date.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-2xl font-bold text-[#0F4C75]">
          {date.getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="font-semibold text-[#0D1B2A]">{appt.doctor.name}</h3>
            <p className="text-[#1D6FA4] text-sm">
              {appt.doctorProfile?.specialization}
            </p>
          </div>
          <Badge variant={appt.status as AppointmentStatus} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#7A90A4]">
          <span className="flex items-center gap-1">
            <Clock size={11} /> {appt.slot.startTime} – {appt.slot.endTime}
          </span>
          <span className="font-medium text-[#3D5166]">
            ₹{appt.consultationFee}
          </span>
        </div>

        {appt.patientNote && (
          <p className="text-xs text-[#7A90A4] mt-2 line-clamp-1">
            Note: {appt.patientNote}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-row sm:flex-col gap-2 justify-end">
        {appt.status === "confirmed" && (
          <Button
            size="xs"
            leftIcon={<Video size={13} />}
            onClick={() => router.push(`/call/${appt._id}`)}
          >
            Join Call
          </Button>
        )}
        {appt.status === "completed" && appt.prescription && (
          <Button
            size="xs"
            variant="outline"
            leftIcon={<FileText size={13} />}
            onClick={() =>
              router.push(
                `/dashboard/patient/prescriptions/${appt.prescription?._id}`,
              )
            }
          >
            Prescription
          </Button>
        )}
        {["pending", "confirmed"].includes(appt.status) && (
          <Button
            size="xs"
            variant="ghost"
            leftIcon={<X size={13} />}
            onClick={() => onCancel(appt._id)}
            className="text-red-500 hover:bg-red-50"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    appointmentId: string;
  }>({
    open: false,
    appointmentId: "",
  });

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "8" };
      if (activeTab) params.status = activeTab;
      const res = await api.get("/appointments/my", { params });
      setAppointments(res.data.appointments);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleCancel = async (id: string, reason: string) => {
    try {
      await api.patch(`/appointments/${id}/cancel`, { cancelReason: reason });
      toast.success("Appointment cancelled.");
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel.");
    }
  };

  const openCancelModal = (id: string) => {
    setCancelModal({ open: true, appointmentId: id });
  };

  return (
    <RoleGuard allowedRoles={["patient"]}>
      <DashboardLayout navItems={patientNav}>
        <div className="space-y-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">
              My Appointments
            </h1>
            <p className="text-[#7A90A4] text-sm mt-1">
              {total} appointment{total !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Status tabs */}
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

          {/* List */}
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))
            ) : appointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Calendar size={24} className="text-slate-300" />
                </div>
                <p className="text-[#7A90A4] font-medium">
                  No appointments found
                </p>
              </div>
            ) : (
              appointments.map((appt) => (
                <AppointmentCard
                  key={appt._id}
                  appt={appt}
                  onCancel={openCancelModal}
                />
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

        {/* Cancel Modal */}
        <CancelModal
          isOpen={cancelModal.open}
          onConfirm={(reason) =>
            handleCancel(cancelModal.appointmentId, reason)
          }
          onClose={() => setCancelModal((m) => ({ ...m, open: false }))}
        />
      </DashboardLayout>
    </RoleGuard>
  );
}
