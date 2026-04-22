import { Loader2 } from 'lucide-react';
import { LogoMark } from './Logo';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 24, className = '' }: SpinnerProps) {
  return <Loader2 size={size} className={`animate-spin text-[#0A3828] ${className}`} />;
}

export function PageLoader() {
  const logoSize = 56;
  const ringSize = logoSize + 22; // fully-circular ring sits around the logo

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F2]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative flex items-center justify-center"
          style={{ width: ringSize, height: ringSize }}
        >
          {/* Circular rotating ring */}
          <svg
            className="absolute inset-0 ta-spin"
            width={ringSize}
            height={ringSize}
            viewBox="0 0 50 50"
            aria-hidden="true"
          >
            <circle
              cx="25"
              cy="25"
              r="22"
              fill="none"
              stroke="#0A3828"
              strokeOpacity="0.12"
              strokeWidth="3"
            />
            <circle
              cx="25"
              cy="25"
              r="22"
              fill="none"
              stroke="#0A3828"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="34 138"
              transform="rotate(-90 25 25)"
            />
          </svg>
          <LogoMark size={logoSize} />
        </div>
        <p className="text-sm text-gray-500 font-medium">Transport Advisory</p>
      </div>

      <style>{`
        @keyframes ta-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ta-spin {
          animation: ta-spin 1s linear infinite;
          transform-origin: center center;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
