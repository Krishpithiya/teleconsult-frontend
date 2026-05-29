"use client";

import { useState, useEffect } from "react";
import RoleGuard from "@/components/guards/RoleGuards";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/axios";
import { IDoctorProfile, IAvailableDay } from "@/types/index";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { doctorNav } from "@/lib/navItems";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedist",
  "Psychiatrist",
  "ENT Specialist",
  "Gynecologist",
  "Ophthalmologist",
  "Oncologist",
  "Urologist",
];

const DEFAULT_SLOTS = [
  { _id: "slot-1", startTime: "09:00", endTime: "09:30", isBooked: false },
  { _id: "slot-2", startTime: "09:30", endTime: "10:00", isBooked: false },
  { _id: "slot-3", startTime: "10:00", endTime: "10:30", isBooked: false },
  { _id: "slot-4", startTime: "10:30", endTime: "11:00", isBooked: false },
  { _id: "slot-5", startTime: "14:00", endTime: "14:30", isBooked: false },
  { _id: "slot-6", startTime: "14:30", endTime: "15:00", isBooked: false },
];

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<IDoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([""]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [availableDays, setAvailableDays] = useState<IAvailableDay[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/doctors/profile/me");
        const p = res.data.profile as IDoctorProfile;
        setProfile(p);
        setSpecialization(p.specialization || "");
        setExperience(String(p.experience || ""));
        setConsultationFee(String(p.consultationFee || ""));
        setBio(p.bio || "");
        setQualifications(p.qualifications?.length ? p.qualifications : [""]);
        setLanguages(p.languages?.length ? p.languages : ["English"]);
        setAvailableDays(p.availableDays || []);
      } catch {
        // No profile yet — start fresh
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Qualification helpers ──────────────────────────────────────────────
  const addQualification = () => setQualifications((q) => [...q, ""]);
  const removeQualification = (i: number) =>
    setQualifications((q) => q.filter((_, idx) => idx !== i));
  const updateQualification = (i: number, val: string) =>
    setQualifications((q) => q.map((v, idx) => (idx === i ? val : v)));

  // ── Language helpers ───────────────────────────────────────────────────
  const addLanguage = () => setLanguages((l) => [...l, ""]);
  const removeLanguage = (i: number) =>
    setLanguages((l) => l.filter((_, idx) => idx !== i));
  const updateLanguage = (i: number, val: string) =>
    setLanguages((l) => l.map((v, idx) => (idx === i ? val : v)));

  // ── Day toggle ─────────────────────────────────────────────────────────
  const toggleDay = (day: string) => {
    const exists = availableDays.find((d) => d.day === day);
    if (exists) {
      setAvailableDays((prev) => prev.filter((d) => d.day !== day));
    } else {
      setAvailableDays((prev) => [
        ...prev,
        { day, slots: DEFAULT_SLOTS.map((s) => ({ ...s })) },
      ]);
    }
  };

  // ── Add slot to a day ──────────────────────────────────────────────────
  const addSlot = (dayName: string) => {
    setAvailableDays((prev) =>
      prev.map((d) =>
        d.day === dayName
          ? {
              ...d,
              slots: [
                ...d.slots,
                {
                  _id: `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  startTime: "",
                  endTime: "",
                  isBooked: false,
                },
              ],
            }
          : d,
      ),
    );
  };

  const removeSlot = (dayName: string, slotIdx: number) => {
    setAvailableDays((prev) =>
      prev.map((d) =>
        d.day === dayName
          ? { ...d, slots: d.slots.filter((_, i) => i !== slotIdx) }
          : d,
      ),
    );
  };

  const updateSlot = (
    dayName: string,
    slotIdx: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setAvailableDays((prev) =>
      prev.map((d) =>
        d.day === dayName
          ? {
              ...d,
              slots: d.slots.map((s, i) =>
                i === slotIdx ? { ...s, [field]: value } : s,
              ),
            }
          : d,
      ),
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialization || !experience || !consultationFee) {
      toast.error("Specialization, experience and fee are required.");
      return;
    }

    setIsSaving(true);
    try {
      // Strip client-side _id from slots (Mongoose requires ObjectId or none)
      const cleanDays = availableDays.map((d) => ({
        day: d.day,
        slots: d.slots.map(({ startTime, endTime, isBooked }) => ({
          startTime,
          endTime,
          isBooked: isBooked ?? false,
        })),
      }));

      await api.post("/doctors/profile", {
        specialization,
        experience: parseInt(experience),
        consultationFee: parseFloat(consultationFee),
        bio,
        qualifications: qualifications.filter((q) => q.trim()),
        languages: languages.filter((l) => l.trim()),
        availableDays: cleanDays,
      });
      toast.success("Profile saved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["doctor"]}>
        <DashboardLayout navItems={doctorNav}>
          <div className="space-y-4 max-w-3xl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["doctor"]}>
      <DashboardLayout navItems={doctorNav}>
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl space-y-6 animate-fade-up"
        >
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#0D1B2A]">My Profile</h1>
              <p className="text-[#7A90A4] text-sm mt-1">
                Update your profile to attract more patients
              </p>
            </div>
            {profile?.isProfileComplete && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-sm font-medium">
                <CheckCircle2 size={15} />
                Profile complete
              </div>
            )}
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#3D5166] uppercase tracking-wider">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Specialization */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#3D5166]">
                  Specialization <span className="text-red-400">*</span>
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-[#D9E4EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 bg-white"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Experience (years)"
                type="number"
                placeholder="e.g. 8"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
                min="0"
                max="60"
              />

              <Input
                label="Consultation Fee (₹)"
                type="number"
                placeholder="e.g. 500"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                required
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3D5166] block mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short introduction about yourself..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 text-sm border border-[#D9E4EE] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all placeholder:text-[#7A90A4]"
              />
              <p className="text-xs text-[#7A90A4] mt-1 text-right">
                {bio.length}/500
              </p>
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#3D5166] uppercase tracking-wider">
                Qualifications
              </h2>
              <Button
                type="button"
                variant="outline"
                size="xs"
                leftIcon={<Plus size={12} />}
                onClick={addQualification}
              >
                Add
              </Button>
            </div>
            {qualifications.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="e.g. MBBS, MD - Cardiology"
                  value={q}
                  onChange={(e) => updateQualification(i, e.target.value)}
                />
                {qualifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQualification(i)}
                    className="text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#3D5166] uppercase tracking-wider">
                Languages Spoken
              </h2>
              <Button
                type="button"
                variant="outline"
                size="xs"
                leftIcon={<Plus size={12} />}
                onClick={addLanguage}
              >
                Add
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="e.g. English"
                    value={lang}
                    onChange={(e) => updateLanguage(i, e.target.value)}
                  />
                  {languages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLanguage(i)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#3D5166] uppercase tracking-wider">
              Availability Schedule
            </h2>

            {/* Day selector */}
            <div>
              <p className="text-xs text-[#7A90A4] mb-2">
                Select your available days:
              </p>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const active = availableDays.some((d) => d.day === day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium border transition-all
                        ${
                          active
                            ? "bg-[#1D6FA4] text-white border-sky-500"
                            : "bg-white text-[#3D5166] border-[#D9E4EE] hover:border-sky-300"
                        }
                      `}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots per day */}
            {availableDays.map((dayEntry) => (
              <div
                key={dayEntry.day}
                className="border border-[#E5ECF4] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    {dayEntry.day}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    leftIcon={<Plus size={12} />}
                    onClick={() => addSlot(dayEntry.day)}
                  >
                    Add Slot
                  </Button>
                </div>
                <div className="space-y-2">
                  {dayEntry.slots.map((slot, si) => (
                    <div key={si} className="flex gap-2 items-center">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateSlot(
                            dayEntry.day,
                            si,
                            "startTime",
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 text-sm border border-[#D9E4EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                      />
                      <span className="text-[#7A90A4] text-sm">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateSlot(
                            dayEntry.day,
                            si,
                            "endTime",
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 text-sm border border-[#D9E4EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                      />
                      {slot.isBooked ? (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg flex-shrink-0">
                          Booked
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeSlot(dayEntry.day, si)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="flex justify-end pb-10">
            <Button
              type="submit"
              size="lg"
              isLoading={isSaving}
              leftIcon={<Save size={16} />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </DashboardLayout>
    </RoleGuard>
  );
}
