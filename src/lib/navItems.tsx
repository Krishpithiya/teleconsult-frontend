import {
  LayoutDashboard,
  CalendarDays,
  User,
  FileText,
  ShieldCheck,
  UserCheck,
  Users,
  Search,
  Clock,
} from "lucide-react";

export const doctorNav = [
  {
    href: "/dashboard/doctor",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
  },
  {
    href: "/dashboard/doctor/appointments",
    label: "Appointments",
    icon: <CalendarDays size={16} />,
  },
  {
    href: "/dashboard/doctor/profile",
    label: "My Profile",
    icon: <User size={16} />,
  },
  {
    href: "/dashboard/doctor/prescriptions",
    label: "Prescriptions",
    icon: <FileText size={16} />,
  },
];

export const patientNav = [
  {
    href: "/dashboard/patient",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
  },
  {
    href: "/dashboard/patient/appointments",
    label: "Appointments",
    icon: <CalendarDays size={16} />,
  },
  { href: "/doctors", label: "Find Doctors", icon: <Search size={16} /> },
  {
    href: "/dashboard/patient/prescriptions",
    label: "Prescriptions",
    icon: <FileText size={16} />,
  },
];

export const adminNav = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
  },
  {
    href: "/dashboard/admin/doctors",
    label: "Doctors",
    icon: <UserCheck size={16} />,
  },
  {
    href: "/dashboard/admin/appointments",
    label: "Appointments",
    icon: <CalendarDays size={16} />,
  },
  { href: "/dashboard/admin/users", label: "Users", icon: <Users size={16} /> },
];
