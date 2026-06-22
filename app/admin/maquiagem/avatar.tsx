/** Avatar com iniciais — componente puro (server ou client). */
export function Avatar({
  name,
  seed,
  size = 44,
}: {
  name: string | null;
  seed: string;
  size?: number;
}) {
  const initials =
    (name ?? "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";

  const palette = [
    "bg-sage-100 text-sage-700",
    "bg-terra-soft/30 text-terra",
    "bg-sand-deep/40 text-ink",
    "bg-sage-200 text-sage-900",
  ];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cls = palette[h % palette.length];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium shrink-0 ${cls}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
