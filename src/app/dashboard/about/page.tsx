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
  const founderAvatar = getPlaceholderImage('user-avatar');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">
          About Vaani AI
        </h1>
      </div>
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
          {founderAvatar && (
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={founderAvatar.imageUrl}
                alt="Founder Avatar"
                data-ai-hint={founderAvatar.imageHint}
              />
              <AvatarFallback>AP</AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className="text-lg font-semibold">Aryan Pal</p>
            <p className="text-sm text-muted-foreground">
              Founder & Visionary behind Vaani AI.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
