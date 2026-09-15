interface BrandMarkProps {
  readonly className?: string;
  readonly size?: number;
}

export default function BrandMark({ className = '', size = 24 }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.8" />
      <polygon points="12,1.5 22.5,12 12,22.5 1.5,12" stroke="currentColor" strokeWidth="0.8" />
      <rect x="4.2" y="4.2" width="15.6" height="15.6" stroke="currentColor" strokeWidth="0.6" />
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      <line x1="1" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      <line x1="4.2" y1="4.2" x2="19.8" y2="19.8" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.4" />
      <line x1="19.8" y1="4.2" x2="4.2" y2="19.8" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
