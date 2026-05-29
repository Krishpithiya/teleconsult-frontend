interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const Spinner = ({ size = "md", color = "border-blue-600" }: SpinnerProps) => {
  return (
    <div
      className={`
        ${sizeMap[size]}
        ${color}
        animate-spin rounded-full
        border-4 border-solid border-t-transparent
      `}
    />
  );
};

export default Spinner;