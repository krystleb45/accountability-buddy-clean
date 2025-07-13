import React, { useId } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, 'aria-invalid': ariaInvalid, type = 'text', ...props }, ref) => {
    const autoId = useId();
    const resolvedId = id || `input-${autoId}`;

    return (
      <input
        id={resolvedId}
        type={type}
        ref={ref}
        aria-invalid={ariaInvalid}
        className={clsx(
          'w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100',
          // validity styling (optional)
          ariaInvalid && 'border-red-500 focus:ring-red-200',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
