'use client';

import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function LoadingIndicator({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn('animate-pulse', className)}>
      <Logo />
    </div>
  );
}
