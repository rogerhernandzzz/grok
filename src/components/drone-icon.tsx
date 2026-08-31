export function DroneIcon({ className, strokeWidth = 1.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="4.2" cy="6.1" rx="3.6" ry="1.15" />
      <ellipse cx="4.2" cy="8.55" rx="3.6" ry="1.15" />
      <ellipse cx="19.8" cy="6.1" rx="3.6" ry="1.15" />
      <ellipse cx="19.8" cy="8.55" rx="3.6" ry="1.15" />
      <path d="M7.4 7.2h9.2c.2 1.8-1.4 4.4-4.6 4.4S7.2 9 7.4 7.2z" />
      <circle cx="12" cy="9.1" r="1.15" fill="var(--color-bg, #07080a)" />
      <path fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" d="M8.6 14.6a5.2 5.2 0 0 0 6.8 0" />
      <path fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" d="M7.2 16.7a7.6 7.6 0 0 0 9.6 0" />
      <path fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" d="M5.8 18.8a9.9 9.9 0 0 0 12.4 0" />
    </svg>
  );
}
