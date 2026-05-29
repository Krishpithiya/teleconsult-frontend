// ─── User ──────────────────────────────────────────────────────────────────
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: IUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "doctor" | "patient";
  phone?: string;
}

// ─── Time Slot ────────────────────────────────────────────────────────────
export interface ITimeSlot {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface IAvailableDay {
  day: string;
  slots: ITimeSlot[];
}

// ─── Doctor Profile ───────────────────────────────────────────────────────
export interface IDoctorProfile {
  _id: string;
  user: IUser;
  specialization: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  bio: string;
  languages: string[];
  availableDays: IAvailableDay[];
  averageRating: number;
  totalReviews: number;
  isProfileComplete: boolean;
}

// ─── Appointment ──────────────────────────────────────────────────────────
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface IAppointment {
  _id: string;
  patient: IUser;
  doctor: IUser;
  doctorProfile: IDoctorProfile;
  appointmentDate: string;
  day: string;
  slot: {
    slotId: string;
    startTime: string;
    endTime: string;
  };
  status: AppointmentStatus;
  consultationFee: number;
  patientNote: string;
  doctorNote: string;
  cancelledBy: string | null;
  cancelReason: string;
  videoRoomId: string;
  prescription?: IPrescription;
  createdAt: string;
}

// ─── Prescription ─────────────────────────────────────────────────────────
export interface IPrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription {
  _id: string;
  appointment: string;
  patient: IUser;
  doctor: IUser;
  diagnosis: string;
  medicines: IPrescriptionMedicine[];
  advice: string;
  followUpDate?: string;
  createdAt: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  count?: number;
  data: T[];
}