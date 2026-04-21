import { useRef, useEffect, forwardRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface YearPickerProps {
  label?: string;
  value?: number | string;
  onChange: (year: number) => void;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  hint?: string;
}

const YearPicker = forwardRef<HTMLInputElement, YearPickerProps>(
  ({ label, value, onChange, error, required, min = 1990, max = new Date().getFullYear() + 1, hint }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = (ref as any) || inputRef;

    const year = Number(value) || 2020;
    const clamp = (n: number) => Math.min(max, Math.max(min, n));

    const increment = () => onChange(clamp(year + 1));
    const decrement = () => onChange(clamp(year - 1));

    // Mouse wheel to change year
    useEffect(() => {
      const el: HTMLInputElement | null = (combinedRef as any)?.current;
      if (!el) return;
      const handler = (e: WheelEvent) => {
        if (document.activeElement !== el) return;
        e.preventDefault();
        if (e.deltaY < 0) onChange(clamp((Number(el.value) || year) + 1));
        else onChange(clamp((Number(el.value) || year) - 1));
      };
      el.addEventListener('wheel', handler, { passive: false });
      return () => el.removeEventListener('wheel', handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div
          className={`
            flex items-center rounded-xl bg-white border transition-all duration-150
            ${error ? 'border-red-300' : 'border-gray-200 focus-within:border-[#0A3828] focus-within:ring-2 focus-within:ring-[#0A3828]/10'}
          `}
        >
          <input
            ref={combinedRef}
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={value ?? 2020}
            onChange={(e) => {
              // Only allow digits, max 4
              const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (raw === '') { onChange(min); return; }
              onChange(Number(raw));
            }}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (!n || n < min || n > max) onChange(clamp(n || 2020));
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') { e.preventDefault(); increment(); }
              if (e.key === 'ArrowDown') { e.preventDefault(); decrement(); }
            }}
            placeholder="2020"
            className="flex-1 px-3.5 py-2.5 text-sm bg-transparent outline-none tabular-nums"
          />
          <div className="flex flex-col border-l border-gray-100 h-full">
            <button
              type="button"
              onClick={increment}
              tabIndex={-1}
              className="px-2 py-0.5 text-gray-400 hover:text-[#0A3828] hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <ChevronUp size={12} />
            </button>
            <button
              type="button"
              onClick={decrement}
              tabIndex={-1}
              className="px-2 py-0.5 text-gray-400 hover:text-[#0A3828] hover:bg-gray-50 transition-colors"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

YearPicker.displayName = 'YearPicker';
export default YearPicker;
