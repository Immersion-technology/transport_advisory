interface LogoProps {
  size?: number;
  className?: string;
  /** Inverts colors for use on dark backgrounds */
  variant?: 'default' | 'mono-white' | 'mono-dark';
}

/**
 * LogoMark — the icon-only version of the Transport Advisory logo.
 * A shield (compliance) with a road-forward chevron and checkmark (verified transport).
 */
export function LogoMark({ size = 40, className = '', variant = 'default' }: LogoProps) {
  const bgGradientId = `ta-logo-grad-${variant}`;

  if (variant === 'mono-white') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#FFFFFF" opacity="0.15" />
        <path
          d="M 32 12 L 48 18 L 48 32 C 48 42 41 50 32 54 C 23 50 16 42 16 32 L 16 18 Z"
          fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" opacity="0.35"
        />
        <path
          d="M 22 32 L 29 39 L 44 23"
          stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      </svg>
    );
  }

  if (variant === 'mono-dark') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#0A3828" opacity="0.08" />
        <path
          d="M 32 12 L 48 18 L 48 32 C 48 42 41 50 32 54 C 23 50 16 42 16 32 L 16 18 Z"
          fill="none" stroke="#0A3828" strokeWidth="2.2" strokeLinejoin="round" opacity="0.35"
        />
        <path
          d="M 22 32 L 29 39 L 44 23"
          stroke="#0A3828" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={bgGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A3828" />
          <stop offset="1" stopColor="#166534" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill={`url(#${bgGradientId})`} />

      {/* Shield outline — faint, representing compliance/trust */}
      <path
        d="M 32 12 L 48 18 L 48 32 C 48 42 41 50 32 54 C 23 50 16 42 16 32 L 16 18 Z"
        fill="none" stroke="#6EE7B7" strokeWidth="2.2" strokeLinejoin="round" opacity="0.35"
      />

      {/* Bold checkmark — verification */}
      <path
        d="M 22 32 L 29 39 L 44 23"
        stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />

      {/* Small accent dot — forward movement / transport */}
      <circle cx="32" cy="58" r="1.25" fill="#6EE7B7" />
    </svg>
  );
}

/**
 * LogoFull — icon + wordmark. Use for login, header, marketing areas.
 */
export function LogoFull({
  size = 40,
  className = '',
  variant = 'default',
}: LogoProps) {
  const primaryColor = variant === 'mono-white' ? '#FFFFFF' : '#0A3828';
  const subColor = variant === 'mono-white' ? 'rgba(255,255,255,0.6)' : '#9CA3AF';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} variant={variant} />
      <div className="flex flex-col leading-none">
        <span
          className="font-extrabold tracking-tight"
          style={{ color: primaryColor, fontSize: size * 0.42, letterSpacing: '-0.02em' }}
        >
          Transport Advisory
        </span>
        <span
          className="font-medium mt-0.5"
          style={{ color: subColor, fontSize: size * 0.26, letterSpacing: '0.02em' }}
        >
          Vehicle Compliance
        </span>
      </div>
    </div>
  );
}

export default LogoMark;
