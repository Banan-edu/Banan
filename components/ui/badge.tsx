import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
