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
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F2]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <LogoMark size={56} />
          <div className="absolute inset-0 rounded-2xl border-2 border-[#0A3828]/20 border-t-[#0A3828] animate-spin" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Transport Advisory</p>
      </div>
    </div>
  );
}
