export function Stars({ n }: { n: number }) {
  const count = Math.min(3, Math.max(0, n));
  if (count === 0) return null;
  return (
    <span className="star-rank" aria-label={`${count} estrellas`}>
      {"★".repeat(count)}
    </span>
  );
}
