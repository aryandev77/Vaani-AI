'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  KeyRound,
  UserX,
  Users,
  Languages,
  MessageSquare,
} from 'lucide-react';

import { useAuth, useUser, useStorage } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { LoadingIndicator } from '@/components/loading-indicator';

export default function ProfilePage() {
  const user = useUser();
  const auth = useAuth();
  const storage = useStorage();
  const { toast } = useToast();
  const userAvatar = getPlaceholderImage('user-avatar');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // You can change the secret code for founder mode here
  const ADMIN_SECRET_CODE = 'VIBGYOR7';

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    // Check for admin status in localStorage when the component mounts
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem('isAdmin');
      if (adminStatus === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateProfile(user, { displayName });
      toast({ title: 'Profile updated successfully!' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message,
      });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email || !currentPassword || !newPassword) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill out all password fields.',
      });
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating password',
        description: error.message,
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;

    setUploading(true);
    const filePath = `profile-pictures/${user.uid}/${file.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: 'Could not upload your profile picture.',
        });
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          if (!user) return;
          await updateProfile(user, { photoURL: downloadURL });
          toast({ title: 'Profile picture updated!' });
          setUploading(false);
        });
      }
    );
  };

  const handleAdminUnlock = () => {
    if (secretCode === ADMIN_SECRET_CODE) {
      localStorage.setItem('isAdmin', 'true');
      setIsAdmin(true);
      setIsDialogOpen(false);
      toast({
        title: 'Founder Features Unlocked!',
        description:
          'You now have access to special administrative features.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect Secret Code',
        description: 'The code you entered is not valid. Please try again.',
      });
    }
    setSecretCode('');
  };

  if (user === undefined) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <div className="rounded-full border border-dashed p-4">
          <UserX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold">Please Log In</h2>
        <p className="text-muted-foreground">
          You need to be logged in to view and edit your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Manage your account details and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt="User Avatar" />
              ) : (
                userAvatar && (
                  <AvatarImage
                    src={userAvatar.imageUrl}
                    alt="User Avatar"
                    data-ai-hint={userAvatar.imageHint}
                  />
                )
              )}
              <AvatarFallback>
                {displayName?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Change Photo'}
              </Button>
              {uploading ? (
                <div className="flex w-32 items-center gap-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <span className="text-sm text-muted-foreground">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  JPG, GIF or PNG. 1MB max.
                </p>
              )}
            </div>
          </div>
          <Separator />
          <form className="space-y-6" onSubmit={handleProfileUpdate}>
            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
            </div>
            <div className="flex justify-start">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
          <Separator />
          <div>
            <h3 className="text-lg font-medium">Password</h3>
            <p className="text-sm text-muted-foreground">
              Manage your password settings. Requires your current password.
            </p>
            <form className="mt-6 space-y-6" onSubmit={handlePasswordUpdate}>
              <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-start">
                <Button type="submit">Update Password</Button>
              </div>
            </form>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Founder Access</h3>
            <p className="text-sm text-muted-foreground">
              Unlock special administrative features for founders.
            </p>
            <div className="pt-4">
              {isAdmin ? (
                <div className="flex items-center gap-3 rounded-lg border border-green-800 bg-green-900/30 p-4">
                  <KeyRound className="h-6 w-6 shrink-0 text-green-400" />
                  <div>
                    <h4 className="font-semibold text-green-300">
                      Founder Mode Active
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You can now see special features across the app.
                    </p>
                  </div>
                </div>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <KeyRound className="mr-2 h-4 w-4" />
                      Unlock Founder Features
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Founder Access</DialogTitle>
                      <DialogDescription>
                        Enter the secret code to unlock special features. This is
                        for founders only.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="secret-code" className="sr-only">
                        Secret Code
                      </Label>
                      <Input
                        id="secret-code"
                        type="password"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        placeholder="Enter secret code..."
                        autoComplete="one-time-code"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminUnlock()}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAdminUnlock}>
                        Unlock Features
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Profile</CardTitle>
          <CardDescription>
            Enhance your translation experience by providing more details about
            your linguistic and cultural background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This information helps Vaani AI provide more accurate and culturally
            relevant translations and insights tailored specifically to you.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/dashboard/profile-setup">
              Set Up Detailed Profile
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Founder Dashboard</CardTitle>
            <CardDescription>
              High-level metrics for your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-muted-foreground">
                  +15 since last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Translations Made
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+1,234</div>
                <p className="text-xs text-muted-foreground">
                  +82 in the last hour
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Languages
                </CardTitle>
                <Languages className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Chinese was added recently
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
