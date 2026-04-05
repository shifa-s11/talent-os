
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
};

interface AvatarProps {
  initials:  string;
  gradient:  string;
  size?:     "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ initials, gradient, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-br flex items-center justify-center",
        "font-bold text-white flex-shrink-0 select-none",
        gradient,
        SIZE[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}