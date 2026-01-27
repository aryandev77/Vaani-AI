'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function UpdateNotifier() {
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const onUpdate = () => {
        toast({
          title: 'Update Available',
          description:
            'A new version of Vaani AI has been downloaded. Reload to apply the changes.',
          duration: Infinity, // Keep toast visible until user interacts
          action: (
            <ToastAction
              altText="Reload"
              onClick={() => window.location.reload()}
            >
              Reload
            </ToastAction>
          ),
        });
      };

      // When `skipWaiting` is true (as it is in our config), the new service worker activates immediately,
      // and the `controllerchange` event fires. This is the perfect moment to notify the user.
      navigator.serviceWorker.addEventListener('controllerchange', onUpdate);

      // Clean up the event listener when the component unmounts
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', onUpdate);
      };
    }
  }, [toast]);

  return null; // This component does not render any UI itself.
}
