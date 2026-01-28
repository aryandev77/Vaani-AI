'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  KeyRound,
  UserX,
  BookUser,
  Sun,
  Moon,
  Laptop,
  Trash2,
  User,
  Palette,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { useAuth, useUser, useStorage } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { LoadingIndicator } from '@/components/loading-indicator';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const user = useUser();
  const auth = useAuth();
  const storage = useStorage();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
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
  const [loadingUser, setLoadingUser] = useState(true);

  const ADMIN_SECRET_CODE = 'VAANI_FOUNDER_777';

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setLoadingUser(false);
    }
    if (user === null) {
      setLoadingUser(false);
    }
  }, [user]);

  useEffect(() => {
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
      snapshot => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      error => {
        console.error('Upload failed:', error);
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: 'Could not upload your profile picture.',
        });
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async downloadURL => {
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
        description: 'You now have access to special administrative features.',
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

  const handleDeleteAccount = async () => {
    if (!user) return;

    // Note: Deleting user data from Firestore is not handled here.
    // That would require a Cloud Function for security and completeness.
    try {
      await deleteUser(user);
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description:
          'This operation is sensitive and requires recent login. Please log out and log back in before trying again.',
      });
    }
  };

  if (loadingUser) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <div className="rounded-full border border-dashed p-4">
          <UserX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold">Please Log In</h2>
        <p className="text-muted-foreground">
          You need to be logged in to manage your settings.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="account" className="mx-auto max-w-2xl">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="account">
          <User className="mr-2" />
          Account
        </TabsTrigger>
        <TabsTrigger value="appearance">
          <Palette className="mr-2" />
          Appearance
        </TabsTrigger>
        <TabsTrigger value="security">
          <KeyRound className="mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="privacy">
          <Shield className="mr-2" />
          Privacy
        </TabsTrigger>
        <TabsTrigger value="danger">
          <Trash2 className="mr-2 text-destructive/80" />
          Danger Zone
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
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
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button type="submit">Save Changes</Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/profile-setup">
                    <BookUser className="mr-2 h-4 w-4" />
                    Edit Detailed Profile
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={theme}
              onValueChange={setTheme}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="light">
                  <Sun className="mr-2" />
                  Light
                </TabsTrigger>
                <TabsTrigger value="dark">
                  <Moon className="mr-2" />
                  Dark
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Laptop className="mr-2" />
                  System
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your account security settings to keep your account safe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form className="space-y-6" onSubmit={handlePasswordUpdate}>
              <h3 className="text-lg font-medium border-b pb-2">
                Change Password
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-start">
                <Button type="submit">Update Password</Button>
              </div>
            </form>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Two-Factor Authentication (2FA)
              </h3>
              <div className="flex items-start gap-4 rounded-lg border bg-muted/50 p-4">
                <Smartphone className="mt-1 h-6 w-6 shrink-0 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Status: Not Configured</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account. When
                    enabled, you'll be asked for a security code from your
                    authenticator app.
                  </p>
                  <Button variant="outline" className="mt-3" disabled>
                    Configure 2FA (Coming Soon)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Founder Access</CardTitle>
            <CardDescription>
              Unlock special administrative features for founders.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      Enter the secret code to unlock special features.
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
                      onChange={e => setSecretCode(e.target.value)}
                      placeholder="Enter secret code..."
                      autoComplete="one-time-code"
                      onKeyDown={e => e.key === 'Enter' && handleAdminUnlock()}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAdminUnlock}>Unlock Features</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="privacy" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Manage how your data is used and see our policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Data Usage</h3>
              <p className="text-sm text-muted-foreground">
                We use your data to improve the AI models and provide a
                personalized experience. This includes saved translations,
                feedback, and profile information. We are committed to
                protecting your privacy.
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">
                For a detailed explanation of what data we collect and how we
                use it, please read our full privacy policy.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/privacy">
                  <BookUser className="mr-2 h-4 w-4" />
                  View Privacy Policy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="danger" className="mt-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              These actions are irreversible. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(
                      buttonVariants({ variant: 'destructive' }),
                      'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    )}
                    onClick={handleDeleteAccount}
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
