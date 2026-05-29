"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star, Clock, Wallet, Globe, Award, Calendar,
  CheckCircle2, ChevronLeft, AlertCircle
} from "lucide-react";
import api from "@/lib/axios";
import { IDoctorProfile, ITimeSlot } from "@/types/index";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const getDatesForDay = (dayName: string, weeksAhead = 3): Date[] => {
  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const target = dayMap[dayName];
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= weeksAhead * 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === target) dates.push(d);
  }
  return dates.slice(0, 4);
};

export default function DoctorProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [profile,      setProfile]      = useState<IDoctorProfile | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [selectedDay,  setSelectedDay]  = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
  const [patientNote,  setPatientNote]  = useState("");
  const [booking,      setBooking]      = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/doctors/${userId}`);
        setProfile(res.data.profile);
      } catch {
        toast.error("Doctor not found");
        router.push("/doctors");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // When day selected, generate available dates
  useEffect(() => {
    if (selectedDay) {
      setAvailableDates(getDatesForDay(selectedDay));
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  }, [selectedDay]);

  const currentDaySlots = profile?.availableDays.find(d => d.day === selectedDay)?.slots || [];
  const availableSlots  = currentDaySlots.filter(s => !s.isBooked);

  const handleBook = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (user?.role !== "patient") { toast.error("Only patients can book appointments."); return; }
    if (!selectedDate || !selectedSlot) { toast.error("Please select a date and time slot."); return; }

    setBooking(true);
    try {
      await api.post("/appointments/book", {
        doctorId: userId,
        appointmentDate: selectedDate.toISOString(),
        slotId: selectedSlot._id,
        patientNote,
      });
      toast.success("Appointment booked! Awaiting doctor confirmation.");
      router.push("/dashboard/patient/appointments");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[#7A90A4] hover:text-[#3D5166] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Back to doctors
      </button>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Profile card ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            {profile.user.avatar ? (
              <img src={profile.user.avatar} alt={profile.user.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1D6FA4] to-[#22C9C9] flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">{profile.user.name?.charAt(0)}</span>
              </div>
            )}
            <h1 className="text-xl font-bold text-[#0D1B2A]" >
              {profile.user.name}
            </h1>
            <p className="text-[#1D6FA4] font-medium text-sm mt-1">{profile.specialization}</p>
            <div className="mt-2 flex justify-center">
              <Badge variant="verified" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-[#E5ECF4]">
              <div className="text-center">
                <p className="text-lg font-bold text-[#0D1B2A]" >
                  {profile.experience}+
                </p>
                <p className="text-xs text-[#7A90A4]">Years</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#0D1B2A]" >
                  {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-[#7A90A4]">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#0D1B2A]" >
                  {profile.totalReviews}
                </p>
                <p className="text-xs text-[#7A90A4]">Reviews</p>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                <Wallet size={15} className="text-[#1D6FA4]" />
              </div>
              <div>
                <p className="text-xs text-[#7A90A4]">Consultation Fee</p>
                <p className="text-sm font-semibold text-slate-800">₹{profile.consultationFee}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                <Clock size={15} className="text-[#1D6FA4]" />
              </div>
              <div>
                <p className="text-xs text-[#7A90A4]">Experience</p>
                <p className="text-sm font-semibold text-slate-800">{profile.experience} years</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center">
                <Globe size={15} className="text-[#1D6FA4]" />
              </div>
              <div>
                <p className="text-xs text-[#7A90A4]">Languages</p>
                <p className="text-sm font-semibold text-slate-800">{profile.languages.join(", ")}</p>
              </div>
            </div>
            {profile.qualifications.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award size={15} className="text-[#1D6FA4]" />
                </div>
                <div>
                  <p className="text-xs text-[#7A90A4]">Qualifications</p>
                  {profile.qualifications.map((q) => (
                    <p key={q} className="text-sm font-semibold text-slate-800">{q}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-white rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#3D5166] mb-2">About</h3>
              <p className="text-sm text-[#7A90A4] leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* ── Right: Booking panel ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#0D1B2A] mb-5" >
              Book Appointment
            </h2>

            {/* Step 1: Select day */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#3D5166] mb-3">
                <span className="w-5 h-5 bg-[#1D6FA4] text-white rounded-full text-xs inline-flex items-center justify-center mr-2">1</span>
                Select day
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.availableDays.map(({ day }) => {
                  const hasSlots = profile.availableDays.find(d => d.day === day)?.slots.some(s => !s.isBooked);
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      disabled={!hasSlots}
                      className={`
                        px-4 py-2 rounded-xl text-sm font-medium border transition-all
                        disabled:opacity-40 disabled:cursor-not-allowed
                        ${selectedDay === day
                          ? "bg-[#1D6FA4] text-white border-sky-500"
                          : "bg-white text-[#3D5166] border-[#D9E4EE] hover:border-sky-300 hover:text-[#1D6FA4]"
                        }
                      `}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
                {profile.availableDays.length === 0 && (
                  <p className="text-sm text-[#7A90A4]">No availability set yet</p>
                )}
              </div>
            </div>

            {/* Step 2: Select date */}
            {selectedDay && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#3D5166] mb-3">
                  <span className="w-5 h-5 bg-[#1D6FA4] text-white rounded-full text-xs inline-flex items-center justify-center mr-2">2</span>
                  Select date
                </p>
                <div className="flex gap-2 flex-wrap">
                  {availableDates.map((date) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        className={`
                          flex flex-col items-center p-3 rounded-xl border min-w-[68px] transition-all
                          ${isSelected
                            ? "bg-[#1D6FA4] text-white border-sky-500"
                            : "bg-white text-[#3D5166] border-[#D9E4EE] hover:border-sky-300"
                          }
                        `}
                      >
                        <span className="text-xs font-medium">
                          {date.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold" >
                          {date.getDate()}
                        </span>
                        <span className={`text-xs ${isSelected ? "text-sky-100" : "text-[#7A90A4]"}`}>
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Select time slot */}
            {selectedDate && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#3D5166] mb-3">
                  <span className="w-5 h-5 bg-[#1D6FA4] text-white rounded-full text-xs inline-flex items-center justify-center mr-2">3</span>
                  Select time slot
                  <span className="text-[#7A90A4] text-xs ml-2 font-normal">
                    ({availableSlots.length} available)
                  </span>
                </p>
                {availableSlots.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <AlertCircle size={15} className="text-[#7A90A4]" />
                    <p className="text-sm text-[#7A90A4]">No slots available for this day</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                          ${selectedSlot?._id === slot._id
                            ? "bg-[#1D6FA4] text-white border-sky-500"
                            : "bg-white text-[#3D5166] border-[#D9E4EE] hover:border-sky-300 hover:text-[#1D6FA4]"
                          }
                        `}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Patient note */}
            {selectedSlot && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#3D5166] mb-3">
                  <span className="w-5 h-5 bg-[#1D6FA4] text-white rounded-full text-xs inline-flex items-center justify-center mr-2">4</span>
                  Describe your concern
                  <span className="text-[#7A90A4] text-xs ml-2 font-normal">(optional)</span>
                </p>
                <textarea
                  value={patientNote}
                  onChange={(e) => setPatientNote(e.target.value)}
                  placeholder="e.g. I have chest pain for 3 days..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 text-sm border border-[#D9E4EE] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all placeholder:text-[#7A90A4]"
                />
                <p className="text-xs text-[#7A90A4] mt-1 text-right">{patientNote.length}/300</p>
              </div>
            )}

            {/* Booking summary + confirm */}
            {selectedSlot && selectedDate && (
              <div className="border-t border-[#E5ECF4] pt-5">
                <div className="flex items-center justify-between p-4 bg-sky-50 rounded-xl mb-4">
                  <div className="space-y-1">
                    <p className="text-xs text-[#7A90A4]">Appointment summary</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedDate.toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </p>
                    <p className="text-sm text-[#1D6FA4] font-medium">
                      {selectedSlot.startTime} – {selectedSlot.endTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#7A90A4]">Consultation fee</p>
                    <p className="text-xl font-bold text-[#0D1B2A]" >
                      ₹{profile.consultationFee}
                    </p>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <Button
                    fullWidth size="lg"
                    onClick={() => router.push("/login")}
                    rightIcon={<ChevronLeft size={16} className="rotate-180" />}
                  >
                    Login to Book
                  </Button>
                ) : (
                  <Button
                    fullWidth size="lg"
                    isLoading={booking}
                    onClick={handleBook}
                    leftIcon={<CheckCircle2 size={16} />}
                  >
                    Confirm Appointment
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}