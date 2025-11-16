import type { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  Icon: LucideIcon;
  children: ReactNode;
}

export function SelectField({ Icon, children, ...rest }: SelectFieldProps) {
  return (
    <div className="relative flex-grow">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
        <Icon className="h-5 w-5 text-gray-400" />
      </span>
      <select
        {...rest}
        className="appearance-none rounded-md block w-full pl-10 pr-8 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm"
      >
        {children}
      </select>
      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </span>
    </div>
  );
}
