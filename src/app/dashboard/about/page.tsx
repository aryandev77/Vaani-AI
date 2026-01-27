'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';

export default function AboutPage() {
  const founderAvatar = getPlaceholderImage('founder-avatar');

  const founderName = 'Aryan Pal';
  const founderAvatarUrl = founderAvatar?.imageUrl;
  const founderAvatarFallback = 'A';

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
        <CardContent className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <Avatar className="h-24 w-24">
            {founderAvatarUrl && (
              <AvatarImage src={founderAvatarUrl} alt="Founder Avatar" />
            )}
            <AvatarFallback className="text-3xl">
              {founderAvatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{founderName}</p>
            <p className="text-muted-foreground">
              Aryan Pal, the visionary founder of Vaani AI, conceptualized this
              platform with the goal of bridging global communication gaps.
              Driven by a passion for technology and cross-cultural connection,
              Aryan leads the mission to create a world where language is no
              longer a barrier, but a bridge to understanding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
