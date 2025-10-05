import * as React from "react"
import { Check } from "lucide-react"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onCheckedChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          className={`peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-blue-600 checked:border-blue-600 ${className}`}
          onChange={handleChange}
          {...props}
        />
        <Check className="absolute top-0 left-0 h-4 w-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100" size={16} />
      </div>
    );
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
