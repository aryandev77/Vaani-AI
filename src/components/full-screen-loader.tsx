import { LoadingIndicator } from '@/components/loading-indicator';

export function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <LoadingIndicator />
    </div>
  );
}
