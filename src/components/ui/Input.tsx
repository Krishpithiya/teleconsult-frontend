import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", ...rest }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-semibold" style={{ color: "#3D5166" }}>
          {label}
          {rest.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#7A90A4" }}>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full py-2.5 text-sm transition-all duration-150
            placeholder:text-[#9BADBF]
            focus:outline-none
            disabled:cursor-not-allowed
            ${leftIcon  ? "pl-10" : "pl-4"}
            ${rightIcon ? "pr-10" : "pr-4"}
            ${className}
          `}
          style={{
            color: "#0D1B2A",
            background: error ? "#FFF8F8" : "white",
            border: `1.5px solid ${error ? "#FCA5A5" : "#D9E4EE"}`,
            borderRadius: "10px",
            boxShadow: error ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 3px rgba(13,27,42,0.04)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "#EF4444" : "#1D6FA4";
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(220,38,38,0.1)"
              : "0 0 0 3px rgba(29,111,164,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#FCA5A5" : "#D9E4EE";
            e.target.style.boxShadow = error ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 3px rgba(13,27,42,0.04)";
          }}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#7A90A4" }}>
            {rightIcon}
          </div>
        )}
      </div>
      {error      && <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#DC2626" }}>⚠ {error}</p>}
      {helperText && !error && <p className="text-xs" style={{ color: "#7A90A4" }}>{helperText}</p>}
    </div>
  )
);
Input.displayName = "Input";
export default Input;
