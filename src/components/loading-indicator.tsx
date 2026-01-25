'use client';

import { cn } from '@/lib/utils';

export function LoadingIndicator({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="6" fill="url(#logoGradient)" />
        <path
          className="v-path"
          d="M6 9 L14 20 L22 9"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
