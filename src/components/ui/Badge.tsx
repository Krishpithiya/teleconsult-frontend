import { AppointmentStatus } from "@/types/index";

type BadgeVariant = AppointmentStatus | "verified" | "pending-verify";

const config: Record<
  BadgeVariant,
  { label: string; bg: string; color: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "#FEF9C3",
    color: "#92400E",
    dot: "#F59E0B",
  },
  confirmed: {
    label: "Confirmed",
    bg: "#DBEAFE",
    color: "#1E40AF",
    dot: "#3B82F6",
  },
  completed: {
    label: "Completed",
    bg: "#D1FAE5",
    color: "#065F46",
    dot: "#10B981",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#FEE2E2",
    color: "#7F1D1D",
    dot: "#EF4444",
  },
  verified: {
    label: "Verified",
    bg: "#D1FAE5",
    color: "#065F46",
    dot: "#10B981",
  },
  "pending-verify": {
    label: "Pending Review",
    bg: "#FEF9C3",
    color: "#92400E",
    dot: "#F59E0B",
  },
};

interface BadgeProps {
  variant: BadgeVariant;
}

const Badge = ({ variant }: BadgeProps) => {
  const c = config[variant] ?? config.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: c.dot }}
      />
      {c.label}
    </span>
  );
};

export default Badge;
