import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xl font-bold text-primary',
        className
      )}
    >
      <Image src="/logo.svg" alt="Vaani AI" width={28} height={28} />
      <span className="font-headline">Vaani AI</span>
    </div>
  );
}
