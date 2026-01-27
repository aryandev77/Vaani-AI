'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useUser,
  useFirestore,
} from '@/firebase';
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import {
  ArrowRight,
  Edit,
  Languages,
  Repeat,
  Flame,
  UserX,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LoadingIndicator } from '@/components/loading-indicator';

// Define types for profile and translation data
interface UserProfile {
  name?: string;
  email?: string;
  spokenLanguages?: string;
  culturalPreferences?: string;
  // other fields from your user entity...
}

interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  date: Timestamp;
}

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1 rounded-lg bg-background/50 p-4 text-center backdrop-blur-sm">
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default function ProfilePage() {
  const user = useUser();
  const firestore = useFirestore();
  const userAvatarPlaceholder = getPlaceholderImage('user-avatar');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      // Fetch detailed user profile
      const profileDocRef = doc(firestore, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(
        profileDocRef,
        docSnap => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
          setLoading(false);
        },
        error => {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        }
      );

      // Fetch recent translations
      const translationsQuery = query(
        collection(firestore, 'users', user.uid, 'translations'),
        orderBy('date', 'desc'),
        limit(3)
      );
      const unsubscribeTranslations = onSnapshot(translationsQuery, snapshot => {
        const newTranslations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Translation, 'id'>),
        }));
        setTranslations(newTranslations);
      }, error => {
        console.error('Error fetching recent translations:', error);
      });

      return () => {
        unsubscribeProfile();
        unsubscribeTranslations();
      };
    } else if (user === null) {
      // User is logged out
      setLoading(false);
    }
  }, [user, firestore]);

  const spokenLanguages =
    profile?.spokenLanguages?.split(',').map(lang => lang.trim()).filter(Boolean) ||
    [];

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Image */}
      <div className="relative h-48 w-full rounded-t-lg md:h-64">
        <Image
          src={user.photoURL || userAvatarPlaceholder?.imageUrl || ''}
          alt="Profile background"
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          data-ai-hint="profile background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute right-4 top-4">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/settings">
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative flex flex-col items-center px-4 pb-6 sm:px-6 md:-mt-24 md:items-start md:px-8">
        <div className="flex -translate-y-16 flex-col items-center md:flex-row md:gap-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
            <AvatarImage
              src={user.photoURL || userAvatarPlaceholder?.imageUrl}
              alt={user.displayName || 'User'}
            />
            <AvatarFallback className="text-4xl">
              {user.displayName?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4 text-center md:mt-16 md:text-left">
            <h1 className="text-3xl font-bold font-headline">
              {user.displayName}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-4 sm:px-6 md:px-8">
        {/* Bio */}
        {profile?.culturalPreferences && (
          <Card className="border-0 bg-transparent shadow-none md:border md:bg-card md:shadow-sm">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground md:text-left">
                {profile.culturalPreferences}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<Repeat />}
            value={translations.length}
            label="Translations"
          />
          <StatCard icon={<Flame />} value="21" label="Day Streak" />
          <StatCard
            icon={<Languages />}
            value={spokenLanguages.length || 0}
            label="Languages"
          />
        </div>

        {/* Spoken Languages */}
        {spokenLanguages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {spokenLanguages.map(lang => (
                <Badge key={lang} variant="secondary" className="text-sm">
                  {lang}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your last few translations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {translations.length > 0 ? (
              translations.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="max-w-[70%]">
                    <p className="truncate font-medium">{t.sourceText}</p>
                    <p className="truncate text-muted-foreground">
                      {t.translatedText}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-xs text-muted-foreground">
                    {t.date
                      ? formatDistanceToNow(t.date.toDate(), {
                          addSuffix: true,
                        })
                      : ''}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent translations found.
              </p>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/history">
                View all activity <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
