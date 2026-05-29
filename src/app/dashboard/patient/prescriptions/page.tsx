"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";
import { IPrescription } from "@/types/index";
import {
  FileText,
  Download,
  Calendar,
  ChevronRight,
  Clock,
  Pill,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { patientNav } from "@/lib/navItems";

export default function PatientPrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/prescriptions/my");
        setPrescriptions(res.data.prescriptions);
        setTotal(res.data.total);
      } catch {
        toast.error("Failed to load prescriptions.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <RoleGuard allowedRoles={["patient"]}>
      <DashboardLayout navItems={patientNav}>
        <div className="space-y-6 animate-fade-up">
          <div>
            <h1
              className="text-2xl font-bold text-[#0D1B2A]"
              style={{ fontFamily: "'Sora',sans-serif" }}
            >
              My Prescriptions
            </h1>
            <p className="text-[#7A90A4] text-sm mt-1">
              {total} prescription{total !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))
            ) : prescriptions.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-slate-300" />
                </div>
                <p className="text-[#7A90A4] font-medium">
                  No prescriptions yet
                </p>
                <p className="text-[#7A90A4] text-sm mt-1">
                  Prescriptions will appear here after consultations
                </p>
              </div>
            ) : (
              prescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="bg-white rounded-2xl p-5 flex items-center gap-4 card-hover cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/patient/prescriptions/${rx._id}`)
                  }
                >
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Pill size={20} className="text-[#1D6FA4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-[#0D1B2A]"
                      style={{ fontFamily: "'Sora',sans-serif" }}
                    >
                      {rx.diagnosis}
                    </p>
                    <p className="text-sm text-[#1D6FA4]">
                      Dr. {rx.doctor.name}
                    </p>
                    <p className="text-xs text-[#7A90A4] mt-0.5">
                      {new Date(rx.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {rx.medicines.length > 0 && (
                        <span className="ml-2">
                          · {rx.medicines.length} medicine
                          {rx.medicines.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      leftIcon={<Download size={12} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/dashboard/patient/prescriptions/${rx._id}`,
                        );
                      }}
                    >
                      PDF
                    </Button>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
