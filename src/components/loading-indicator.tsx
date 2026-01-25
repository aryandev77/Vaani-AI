'use client';

import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function LoadingIndicator({
  className,
  showText = false,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4', className)}
    >
      <div className="animate-pulse">
        <Logo />
      </div>
      {showText && <p className="text-muted-foreground">Loading...</p>}
    </div>
  );
}
