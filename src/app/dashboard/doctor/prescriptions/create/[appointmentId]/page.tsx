"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/axios";
import { IAppointment } from "@/types/index";
import { Plus, Trash2, Calendar, User, FileText, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { doctorNav } from "@/lib/navItems";

interface Medicine {
  name:         string;
  dosage:       string;
  frequency:    string;
  duration:     string;
  instructions: string;
}

const EMPTY_MEDICINE: Medicine = {
  name: "", dosage: "", frequency: "", duration: "", instructions: "",
};

const FREQUENCY_OPTIONS = [
  "Once a day", "Twice a day", "Three times a day",
  "Every 6 hours", "Every 8 hours", "At bedtime", "As needed",
];

export default function CreatePrescriptionPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const router = useRouter();

  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [diagnosis,   setDiagnosis]   = useState("");
  const [medicines,   setMedicines]   = useState<Medicine[]>([{ ...EMPTY_MEDICINE }]);
  const [advice,      setAdvice]      = useState("");
  const [followUpDate,setFollowUpDate]= useState("");
  const [isLoading,   setIsLoading]   = useState(false);
  const [isFetching,  setIsFetching]  = useState(true);

  useEffect(() => {
    const fetchAppt = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.appointment);
        if (res.data.appointment.prescription) {
          toast("Prescription already exists for this appointment.");
          router.push(`/dashboard/doctor/prescriptions`);
        }
      } catch {
        toast.error("Appointment not found.");
        router.back();
      } finally {
        setIsFetching(false);
      }
    };
    fetchAppt();
  }, [appointmentId]);

  const addMedicine = () =>
    setMedicines(prev => [...prev, { ...EMPTY_MEDICINE }]);

  const removeMedicine = (index: number) =>
    setMedicines(prev => prev.filter((_, i) => i !== index));

  const updateMedicine = (index: number, field: keyof Medicine, value: string) =>
    setMedicines(prev =>
      prev.map((m, i) => i === index ? { ...m, [field]: value } : m)
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Diagnosis is required.");
      return;
    }
    const validMeds = medicines.filter(m => m.name.trim());
    setIsLoading(true);
    try {
      await api.post("/prescriptions", {
        appointmentId,
        diagnosis:    diagnosis.trim(),
        medicines:    validMeds,
        advice:       advice.trim(),
        followUpDate: followUpDate || undefined,
      });
      toast.success("Prescription created successfully!");
      router.push("/dashboard/doctor/prescriptions");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create prescription.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <RoleGuard allowedRoles={["doctor"]}>
        <DashboardLayout navItems={doctorNav}>
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["doctor"]}>
      <DashboardLayout navItems={doctorNav}>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]" style={{ fontFamily: "'Sora',sans-serif" }}>
              Create Prescription
            </h1>
            {appointment && (
              <p className="text-[#7A90A4] text-sm mt-1">
                For {appointment.patient.name} ·{" "}
                {new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {appointment && (
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1D6FA4] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {appointment.patient.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#0D1B2A]">{appointment.patient.name}</p>
                  <p className="text-sm text-[#7A90A4]">{appointment.patient.email}</p>
                  {appointment.patientNote && (
                    <p className="text-xs text-[#7A90A4] mt-1">Patient note: {appointment.patientNote}</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 space-y-3">
              <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Diagnosis</h2>
              <textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes..."
                rows={3}
                required
                className="w-full px-4 py-3 text-sm border border-[#D9E4EE] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all placeholder:text-[#7A90A4]"
              />
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Medicines</h2>
                <Button type="button" variant="outline" size="xs" leftIcon={<Plus size={13} />} onClick={addMedicine}>
                  Add Medicine
                </Button>
              </div>

              {medicines.map((med, index) => (
                <div key={index} className="border border-[#E5ECF4] rounded-xl p-4 space-y-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#7A90A4] uppercase tracking-wide">
                      Medicine {index + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Medicine name" placeholder="e.g. Paracetamol" value={med.name}
                      onChange={e => updateMedicine(index, "name", e.target.value)} />
                    <Input label="Dosage" placeholder="e.g. 500mg" value={med.dosage}
                      onChange={e => updateMedicine(index, "dosage", e.target.value)} />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[#3D5166]">Frequency</label>
                      <select
                        value={med.frequency}
                        onChange={e => updateMedicine(index, "frequency", e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-[#D9E4EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-white"
                      >
                        <option value="">Select frequency</option>
                        {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <Input label="Duration" placeholder="e.g. 7 days" value={med.duration}
                      onChange={e => updateMedicine(index, "duration", e.target.value)} />
                    <div className="col-span-2">
                      <Input label="Special instructions" placeholder="e.g. Take after meals" value={med.instructions}
                        onChange={e => updateMedicine(index, "instructions", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Advice & Follow-up</h2>
              <div>
                <label className="text-sm font-medium text-[#3D5166] block mb-1.5">General advice</label>
                <textarea
                  value={advice}
                  onChange={e => setAdvice(e.target.value)}
                  placeholder="Dietary advice, lifestyle changes, precautions..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-3 text-sm border border-[#D9E4EE] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all placeholder:text-[#7A90A4]"
                />
              </div>
              <Input
                label="Follow-up date (optional)"
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex gap-3 justify-end pb-8">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" isLoading={isLoading} leftIcon={<FileText size={15} />}>
                Create Prescription
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
