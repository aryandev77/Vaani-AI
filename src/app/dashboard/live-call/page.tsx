'use client';

import Link from 'next/link';
import { PhoneCall, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LiveCallPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PhoneCall className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">
            Unlock Live Call Translation
          </CardTitle>
          <CardDescription>
            This is a premium feature. Translate voice and video calls in real-time with cultural context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <ul className="text-left text-sm text-muted-foreground list-disc pl-5 space-y-2">
                <li>Translate conversations during voice calls instantly.</li>
                <li>Get real-time translation for video calls, with correct accent and tone.</li>
                <li>Receive contextual insights to understand cultural nuances as you talk.</li>
                <li>Communicate seamlessly with anyone, anywhere, in any language.</li>
            </ul>
          <Button size="lg" asChild className="mt-4 w-full">
            <Link href="/dashboard/billing">
              <Sparkles className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
