// SVGs de marca (Lucide removeu os logos de marca por questões de licença).
// Estes desenhos são glifos minimalistas inspirados nos ícones — não usam o
// logotipo oficial. Cor herda de `currentColor`.

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M21 11.5a8.5 8.5 0 11-3.6 6.93L3 21l1.6-4.7A8.5 8.5 0 0121 11.5z" />
      <path
        d="M8.5 9.8c0 3.5 2.7 6.2 6.2 6.2.4 0 .7-.3.7-.7v-1c0-.3-.2-.5-.5-.6l-1.4-.4c-.2-.1-.5 0-.7.2l-.3.4c-1-.3-1.9-1.1-2.2-2.2l.4-.3c.2-.2.3-.5.2-.7l-.4-1.4c-.1-.3-.3-.5-.6-.5h-1c-.4 0-.7.3-.7.7z"
        strokeWidth="0"
        fill="currentColor"
      />
    </svg>
  );
}
