import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  Icon: LucideIcon;
  type?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
}

export function InputField({
  Icon,
  type = 'text',
  isPassword,
  showPassword,
  togglePasswordVisibility,
  ...rest
}: InputFieldProps) {
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative flex-grow">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </span>
      <input
        {...rest}
        type={inputType}
        className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#d4982c] focus:border-[#d4982c] sm:text-sm"
      />
      {isPassword && togglePasswordVisibility && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 z-10"
        >
          {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
        </button>
      )}
    </div>
  );
}
