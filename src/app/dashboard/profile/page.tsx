'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LoadingIndicator } from '@/components/loading-indicator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  children,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-between gap-1 rounded-lg bg-background/50 p-4 text-center backdrop-blur-sm">
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
    {children}
  </div>
);

export default function ProfilePage() {
  const user = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const userAvatarPlaceholder = getPlaceholderImage('user-avatar');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Mock State for Subscription & Streak ---
  const [dayStreak, setDayStreak] = useState(21);
  const [isSubscribed, setIsSubscribed] = useState(false); // Toggle this to see different states
  const [remainingRestores, setRemainingRestores] = useState(3);
  const [isFounder, setIsFounder] = useState(false);
  // --- End Mock State ---

  useEffect(() => {
    if (user && firestore) {
      const profileDocRef = doc(firestore, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(profileDocRef, docSnap => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
        setLoading(false);
      });

      const translationsQuery = query(
        collection(firestore, 'users', user.uid, 'translations'),
        orderBy('date', 'desc'),
        limit(3)
      );
      const unsubscribeTranslations = onSnapshot(translationsQuery, snapshot => {
        setTranslations(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Translation, 'id'>),
          }))
        );
      });
      
      if (typeof window !== 'undefined') {
        const adminStatus = localStorage.getItem('isAdmin');
        if (adminStatus === 'true') {
          setIsFounder(true);
        }
      }

      return () => {
        unsubscribeProfile();
        unsubscribeTranslations();
      };
    } else if (user === null) {
      setLoading(false);
    }
  }, [user, firestore]);
  
  const handleRestoreStreak = () => {
    // This is where you would put the real logic to update Firestore
    if (isSubscribed || isFounder) {
      setDayStreak(prev => prev + 1); // Or whatever logic to restore
      toast({ title: 'Streak Restored!', description: 'Your streak is safe thanks to your special status.' });
    } else if (remainingRestores > 0) {
      setRemainingRestores(prev => prev - 1);
      setDayStreak(prev => prev + 1);
      toast({ title: 'Streak Restored!', description: `You have ${remainingRestores - 1} free restores left this month.` });
    } else {
      // This case is handled by the dialog leading to payment/subscription
      toast({ variant: 'destructive', title: 'No restores left!', description: 'Please purchase a restore or subscribe.' });
    }
  };

  const spokenLanguages =
    profile?.spokenLanguages?.split(',').map(lang => lang.trim()).filter(Boolean) ||
    [];

  if (loading) {
    return <LoadingIndicator className="h-full" />;
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

  const canRestore = isSubscribed || isFounder || remainingRestores > 0;
  const noRestoresLeft = !isSubscribed && !isFounder && remainingRestores === 0;

  return (
    <div className="w-full">
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
        {profile?.culturalPreferences && (
          <Card className="border-0 bg-transparent shadow-none md:border md:bg-card md:shadow-sm">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground md:text-left">
                {profile.culturalPreferences}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<Repeat />}
            value={translations.length}
            label="Translations"
          />
          <StatCard icon={<Flame />} value={dayStreak} label="Day Streak">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button
                    variant={noRestoresLeft ? 'destructive' : 'outline'}
                    size="sm"
                    className={cn('mt-2', noRestoresLeft && 'animate-pulse')}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
              </AlertDialogTrigger>
              {canRestore ? (
                 <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restore Your Streak?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isSubscribed || isFounder
                          ? "As a founder, you have unlimited restores. Your streak will be saved!"
                          : `This will use one of your ${remainingRestores} free restores for this month.`
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRestoreStreak}>Confirm Restore</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              ) : (
                <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2"><Zap className="text-destructive" /> You're out of restores!</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have used all your free streak restores for this month. Purchase an extra one-time restore for $9 or subscribe for unlimited restores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                         <Link href="/dashboard/billing">
                            <Sparkles className="mr-2 h-4 w-4" /> View Plans
                         </Link>
                      </AlertDialogAction>
                      <AlertDialogAction>Pay $9.00</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              )}
            </AlertDialog>
             {!(isSubscribed || isFounder) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {remainingRestores} free restores left
              </p>
            )}
          </StatCard>
          <StatCard
            icon={<Languages />}
            value={spokenLanguages.length || 0}
            label="Languages"
          />
        </div>

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
                      ? formatDistanceToNow(t.date.toDate(), { addSuffix: true })
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
