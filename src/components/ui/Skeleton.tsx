// src/components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

/* ── Single shimmer block ── */
function Bone({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("shimmer rounded", className)} style={style} />;
}

/* ── Kanban card skeleton ── */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[#1a2236] border border-white/[0.05] rounded-xl p-3.5 space-y-3",
        className,
      )}
    >
      {/* avatar + name */}
      <div className="flex items-center gap-2.5">
        <Bone className="w-7 h-7 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Bone className="h-3 w-28" />
          <Bone className="h-2.5 w-20" />
        </div>
        <Bone className="h-5 w-10 rounded" />
      </div>
      {/* score bar */}
      <Bone className="h-0.5 w-full rounded-full" />
      {/* tags */}
      <div className="flex gap-1.5">
        <Bone className="h-5 w-12 rounded-full" />
        <Bone className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

/* ── Table row skeleton ── */
export function SkeletonRow() {
  const widths = [120, 160, 80, 60, 90, 80, 60];
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="px-4 py-3 w-10">
        <Bone className="w-4 h-4 rounded" />
      </td>
      {widths.map((w, i) => (
        <td key={i} className="px-4 py-3">
          <Bone className="h-3 rounded" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Kanban column skeleton ── */
export function SkeletonColumn() {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col gap-2.5">
      {/* column header */}
      <div className="flex items-center gap-2 mb-1">
        <Bone className="w-2 h-2 rounded-full" />
        <Bone className="h-4 w-24 rounded" />
        <Bone className="h-5 w-6 rounded-full" />
      </div>
      {/* cards */}
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
