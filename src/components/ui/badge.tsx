import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variants = {
    default: "bg-violet-500/20 text-violet-200 border-violet-500/30",
    success: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-200 border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/10", className)} />;
}
