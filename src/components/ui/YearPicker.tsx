import { forwardRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

interface YearPickerProps {
  label?: string;
  value?: number | string;
  onChange: (year: number) => void;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  /** Default year shown when the field is empty. Defaults to 2020. */
  defaultYear?: number;
}

/**
 * Year picker rendered as a native `<select>` for true picker UI on every
 * device — iOS shows the rolling wheel, Android shows the modal scroller,
 * desktop shows the dropdown. Years are listed newest-first because that's
 * what users typically pick (modern vehicle).
 *
 * Always emits a 4-digit numeric year. If no value is supplied, the field
 * pre-selects `defaultYear` (default 2020) so submission always has a value.
 */
const YearPicker = forwardRef<HTMLSelectElement, YearPickerProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      required,
      min = 1980,
      max = new Date().getFullYear() + 1,
      hint,
      defaultYear = 2020,
    },
    ref,
  ) => {
    // Build the option list once per (min, max) pair. Newest first.
    const years = useMemo(() => {
      const out: number[] = [];
      for (let y = max; y >= min; y--) out.push(y);
      return out;
    }, [min, max]);

    const current = Number(value) || defaultYear;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            className={`
              w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm appearance-none cursor-pointer
              bg-white border transition-all duration-150 outline-none tabular-nums
              ${error
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-[#0A3828] focus:ring-2 focus:ring-[#0A3828]/10'
              }
            `}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  },
);

YearPicker.displayName = 'YearPicker';
export default YearPicker;
