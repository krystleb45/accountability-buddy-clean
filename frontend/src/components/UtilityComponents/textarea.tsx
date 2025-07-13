// File: components/ui/textarea.tsx

import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={
        `w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-500 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-600 ` +
        className
      }
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
