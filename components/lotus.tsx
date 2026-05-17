import { cn } from "@/lib/utils";

// Símbolo lótus minimalista — marca compartilhada com o app Sopro.
export function Lotus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("text-sage-700", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M8 48c4 3 10 3 16 0 6 3 12 3 16 0 6 3 12 3 16 0" opacity="0.55" />
        <path d="M32 12c4 8 4 16 0 24-4-8-4-16 0-24z" />
        <path d="M32 14c8 4 12 12 12 22-8-2-12-10-12-22z" opacity="0.8" />
        <path d="M32 14c-8 4-12 12-12 22 8-2 12-10 12-22z" opacity="0.8" />
        <path d="M44 36c6-2 12 0 16 6-6 2-12 0-16-6z" opacity="0.6" />
        <path d="M20 36c-6-2-12 0-16 6 6 2 12 0 16-6z" opacity="0.6" />
      </g>
    </svg>
  );
}
