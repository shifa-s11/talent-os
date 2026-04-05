
import { cn, scoreColor, scoreBg, scoreBar } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  bar?:  boolean;       // show mini progress bar below
  size?: "sm" | "md";
}

export function ScoreBadge({ score, bar = false, size = "md" }: ScoreBadgeProps) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "inline-flex items-center border rounded font-mono font-semibold tracking-tight",
          scoreBg(score),
          scoreColor(score),
          size === "sm"
            ? "text-[10px] px-1.5 py-0.5"
            : "text-xs px-2 py-0.5",
        )}
      >
        {score}%
      </span>

      {bar && (
        <div className="w-10 h-0.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              scoreBar(score),
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}