import { ButtonHTMLAttributes } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "white";
  size?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<
  string,
  { className: string; style: React.CSSProperties }
> = {
  primary: {
    className: "text-white font-semibold hover:opacity-90",
    style: {
      background: "linear-gradient(135deg, #4F46E5, #6366F1)",
      boxShadow: "0 2px 8px rgba(79,70,229,0.30)",
    },
  },
  secondary: {
    className: "text-white font-semibold hover:opacity-90",
    style: { background: "#1A1F3C" },
  },
  danger: {
    className: "text-white font-semibold hover:opacity-90",
    style: {
      background: "#EF4444",
      boxShadow: "0 2px 8px rgba(239,68,68,0.25)",
    },
  },
  outline: {
    className: "font-semibold hover:bg-slate-50 transition-colors",
    style: {
      border: "1.5px solid #E2E8F0",
      color: "#374151",
      background: "white",
    },
  },
  ghost: {
    className: "font-medium hover:bg-slate-100 transition-colors",
    style: { color: "#6B7280", background: "transparent" },
  },
  white: {
    className: "font-semibold hover:opacity-90",
    style: {
      background: "white",
      color: "#4F46E5",
      border: "1px solid rgba(255,255,255,0.50)",
    },
  },
};

const sizes: Record<string, string> = {
  xs: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  sm: "px-4 py-2   text-sm rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3   text-[15px] rounded-xl gap-2",
};

const Button = ({
  children,
  isLoading = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const v = variants[variant] ?? variants.primary;
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-150 ease-out select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.97]
        ${v.className}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={{ ...v.style, ...style }}
      {...rest}
    >
      {isLoading ? (
        <Spinner
          size="sm"
          color={
            variant === "outline" || variant === "ghost"
              ? "border-indigo-500"
              : "border-white"
          }
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
