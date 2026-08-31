import type { ButtonHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
}) {
  const look =
    variant === "outline"
      ? "border border-border bg-transparent text-fg hover:border-accent hover:text-accent"
      : variant === "ghost"
        ? "bg-transparent text-muted hover:text-fg"
        : "bg-fg text-bg hover:bg-accent hover:text-accent-fg";
  const pad = size === "sm" ? "h-8 px-2.5 text-[11px]" : "h-9 px-3 text-[11px]";
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm font-mono tracking-widest uppercase disabled:opacity-50 ${look} ${pad} ${className}`}
      {...props}
    />
  );
}
