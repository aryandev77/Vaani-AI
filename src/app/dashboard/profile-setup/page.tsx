'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const profileSetupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  gender: z.string().optional(),
  dob: z.date().optional(),
  nationality: z.string().optional(),
  spokenLanguages: z.string().optional(),
  culturalPreferences: z.string().optional(),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export default function ProfileSetupPage() {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      name: '',
      gender: '',
      nationality: '',
      spokenLanguages: '',
      culturalPreferences: '',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      const fetchProfile = async () => {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          form.reset({
            name: data.name || user.displayName || '',
            gender: data.gender || '',
            dob: data.dob ? (data.dob as Timestamp).toDate() : undefined,
            nationality: data.nationality || '',
            spokenLanguages: data.spokenLanguages || '',
            culturalPreferences: data.culturalPreferences || '',
          });
        } else {
            form.reset({ name: user.displayName || '' });
        }
        setIsLoading(false);
      };
      fetchProfile();
    }
  }, [user, firestore, form]);


  const onSubmit = async (data: ProfileSetupFormValues) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not logged in.',
      });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { ...data, profileComplete: true }, { merge: true });
      toast({
        title: 'Profile Updated!',
        description: 'Your detailed profile has been saved.',
      });
      router.push('/dashboard/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not save your profile.',
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Set Up Your Detailed Profile</CardTitle>
            <CardDescription>
              This information helps us provide you with more accurate and culturally aware translations.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? (
                                format(field.value, 'PPP')
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cultural & Language Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., American, Indian" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="spokenLanguages"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Spoken Languages</FormLabel>
                     <FormControl>
                        <Textarea
                            placeholder="e.g., English, Spanish, Hindi"
                            {...field}
                        />
                    </FormControl>
                    <FormDescription>
                        List the languages you speak, separated by commas.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="culturalPreferences"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cultural Preferences & Notes</FormLabel>
                     <FormControl>
                        <Textarea
                            placeholder="Any cultural nuances, preferences, or context you'd like the AI to be aware of? (e.g., 'I prefer formal address', 'I often use British slang')"
                             className="min-h-[100px]"
                            {...field}
                        />
                    </FormControl>
                     <FormDescription>
                        This helps the AI tailor its responses to you.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
            </Button>
        </div>
      </form>
    </Form>
  );
}
