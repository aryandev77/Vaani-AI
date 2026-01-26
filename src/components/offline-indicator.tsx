'use client';

import { WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-destructive bg-destructive/90 p-4 text-destructive-foreground shadow-lg"
        >
          <WifiOff className="h-6 w-6 animate-pulse" />
          <div>
            <h3 className="font-semibold">You are offline</h3>
            <p className="text-sm">Please check your internet connection.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
