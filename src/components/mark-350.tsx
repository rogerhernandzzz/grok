export function Mark350({ className = "" }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 36 24" width="48" height="28" className={className} aria-hidden="true">
      <text
        x="18"
        y="18"
        textAnchor="middle"
        fill="currentColor"
        fontSize="14"
        fontWeight="400"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        350
      </text>
    </svg>
  );
}
