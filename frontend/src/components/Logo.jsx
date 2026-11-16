export default function Logo({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true" focusable="false">
      <polyline
        points="6,28 6,8 18,21 30,8 30,28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="square"
      />
      <path
        d="M18 2.5 L19.5 6.5 L23.5 8 L19.5 9.5 L18 13.5 L16.5 9.5 L12.5 8 L16.5 6.5 Z"
        fill="#00E676"
      />
    </svg>
  );
}
