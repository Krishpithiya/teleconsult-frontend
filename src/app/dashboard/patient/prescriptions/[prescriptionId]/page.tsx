"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import api from "@/lib/axios";
import { IPrescription } from "@/types/index";
import {
  Download,
  ChevronLeft,
  Stethoscope,
  User,
  Calendar,
  Pill,
  FileText,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { patientNav } from "@/lib/navItems";

export default function PrescriptionDetailPage() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const router = useRouter();

  const [prescription, setPrescription] = useState<IPrescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/prescriptions/${prescriptionId}`);
        setPrescription(res.data.prescription);
      } catch {
        toast.error("Prescription not found.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [prescriptionId]);

  // ── PDF via browser print ────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const printContent = document.getElementById("prescription-print");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${prescription?.patient.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'DM Sans', sans-serif;
              color: #0f172a;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1, h2, h3 { font-family: 'Sora', sans-serif; }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 20px;
              border-bottom: 2px solid #0ea5e9;
              margin-bottom: 24px;
            }
            .brand { font-size: 22px; font-weight: 700; color: #0369a1; }
            .rx { font-size: 48px; font-weight: 700; color: #e2e8f0; }
            .section { margin-bottom: 20px; }
            .section-title {
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #94a3b8;
              margin-bottom: 8px;
            }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .info-item { background: #f8fafc; padding: 10px 14px; border-radius: 8px; }
            .info-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
            .info-value { font-size: 13px; font-weight: 600; }
            .diagnosis-box {
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 10px;
              padding: 14px 16px;
            }
            .med-table { width: 100%; border-collapse: collapse; }
            .med-table th {
              background: #0ea5e9;
              color: white;
              padding: 8px 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
            }
            .med-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            .med-table tr:nth-child(even) td { background: #f8fafc; }
            .advice-box {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 10px;
              padding: 14px 16px;
              font-size: 13px;
              line-height: 1.6;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #0f172a;
              padding-top: 6px;
              font-size: 12px;
              color: #475569;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["patient", "doctor"]}>
        <DashboardLayout navItems={patientNav}>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  if (!prescription) return null;

  const createdDate = new Date(prescription.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <RoleGuard allowedRoles={["patient", "doctor"]}>
      <DashboardLayout navItems={patientNav}>
        <div className="max-w-3xl mx-auto animate-fade-up">
          {/* Top actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-[#7A90A4] hover:text-[#3D5166] transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <Button
              onClick={handleDownloadPDF}
              leftIcon={<Download size={15} />}
              size="sm"
            >
              Download PDF
            </Button>
          </div>

          {/* Prescription card */}
          <div
            id="prescription-print"
            className="bg-white rounded-3xl border border-[#E5ECF4] overflow-hidden shadow-sm"
            ref={printRef}
          >
            {/* Header */}
            <div
              className="px-8 py-6 flex items-start justify-between"
              style={{ background: "linear-gradient(135deg,#0369A1,#0EA5E9)" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope size={18} className="text-white" />
                  <span
                    className="text-white font-bold text-lg"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    TeleConsult
                  </span>
                </div>
                <p className="text-sky-200 text-sm">Digital Prescription</p>
                <p className="text-sky-300 text-xs mt-1">{createdDate}</p>
              </div>
              <div
                className="text-white/20 text-6xl font-black"
                style={{ fontFamily: "'Sora',sans-serif" }}
              >
                Rx
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Doctor + Patient info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope size={14} className="text-[#1D6FA4]" />
                    <p className="text-xs font-semibold text-[#7A90A4] uppercase tracking-wide">
                      Doctor
                    </p>
                  </div>
                  <p
                    className="font-bold text-[#0D1B2A]"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    {prescription.doctor.name}
                  </p>
                  <p className="text-sm text-[#7A90A4]">
                    {prescription.doctor.email}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={14} className="text-[#1D6FA4]" />
                    <p className="text-xs font-semibold text-[#7A90A4] uppercase tracking-wide">
                      Patient
                    </p>
                  </div>
                  <p
                    className="font-bold text-[#0D1B2A]"
                    style={{ fontFamily: "'Sora',sans-serif" }}
                  >
                    {prescription.patient.name}
                  </p>
                  <p className="text-sm text-[#7A90A4]">
                    {prescription.patient.email}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <p className="text-xs font-semibold text-[#7A90A4] uppercase tracking-wide mb-2">
                  Diagnosis
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-slate-800 leading-relaxed">
                    {prescription.diagnosis}
                  </p>
                </div>
              </div>

              {/* Medicines */}
              {prescription.medicines.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill size={14} className="text-[#1D6FA4]" />
                    <p className="text-xs font-semibold text-[#7A90A4] uppercase tracking-wide">
                      Prescribed Medicines
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-[#E5ECF4]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          {[
                            "Medicine",
                            "Dosage",
                            "Frequency",
                            "Duration",
                            "Instructions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.medicines.map((med, i) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                          >
                            <td className="px-4 py-3 font-semibold text-[#0D1B2A]">
                              {med.name}
                            </td>
                            <td className="px-4 py-3 text-[#3D5166]">
                              {med.dosage}
                            </td>
                            <td className="px-4 py-3 text-[#3D5166]">
                              {med.frequency}
                            </td>
                            <td className="px-4 py-3 text-[#3D5166]">
                              {med.duration}
                            </td>
                            <td className="px-4 py-3 text-[#7A90A4] text-xs">
                              {med.instructions || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Advice */}
              {prescription.advice && (
                <div>
                  <p className="text-xs font-semibold text-[#7A90A4] uppercase tracking-wide mb-2">
                    Advice
                  </p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-[#3D5166] leading-relaxed text-sm">
                      {prescription.advice}
                    </p>
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {prescription.followUpDate && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <Calendar size={16} className="text-amber-500" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      Follow-up Appointment
                    </p>
                    <p className="text-sm text-amber-800 font-medium">
                      {new Date(prescription.followUpDate).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer signature */}
              <div className="border-t border-[#E5ECF4] pt-6 flex items-end justify-between">
                <div className="text-xs text-[#7A90A4] space-y-1">
                  <p>
                    Prescription ID:{" "}
                    <span className="font-mono">
                      {prescription._id.slice(-8).toUpperCase()}
                    </span>
                  </p>
                  <p>Generated: {createdDate}</p>
                  <p className="text-slate-300">
                    TeleConsult · Digital Healthcare Platform
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-t border-slate-400 pt-2">
                    <p className="text-xs font-semibold text-[#3D5166]">
                      {prescription.doctor.name}
                    </p>
                    <p className="text-xs text-[#7A90A4]">Doctor's Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
