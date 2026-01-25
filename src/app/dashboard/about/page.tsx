'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AboutPage() {
  const defaultFounderAvatar = getPlaceholderImage('user-avatar');
  const user = useUser();
  const [isFounder, setIsFounder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem('isAdmin');
      if (adminStatus === 'true') {
        setIsFounder(true);
      }
      setLoading(false);
    }
  }, []);

  const founderName =
    isFounder && user?.displayName ? user.displayName : 'Aryan Pal';
  const founderAvatarUrl =
    isFounder && user?.photoURL
      ? user.photoURL
      : defaultFounderAvatar?.imageUrl;
  const founderAvatarFallback =
    (isFounder && user?.displayName
      ? user.displayName[0]
      : 'A'
    )?.toUpperCase() || 'A';

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
          <CardDescription>
            Breaking down language barriers with the power of AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Vaani AI is a revolutionary application designed to provide
            seamless, real-time voice translation enhanced with a deep
            understanding of cultural context. Our goal is to not just translate
            words, but to convey meaning, emotion, and nuance, fostering better
            communication and understanding across cultures.
          </p>
          <p className="text-muted-foreground">
            Whether you&apos;re in a business meeting, traveling abroad, or
            connecting with friends from different backgrounds, Vaani AI is your
            trusted partner for clear and culturally sensitive communication.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>The Founder</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {loading ? (
            <>
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-20 w-20">
                {founderAvatarUrl && (
                  <AvatarImage src={founderAvatarUrl} alt="Founder Avatar" />
                )}
                <AvatarFallback>{founderAvatarFallback}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{founderName}</p>
                <p className="text-sm text-muted-foreground">
                  Founder & Visionary behind Vaani AI.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
