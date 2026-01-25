'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const userAvatar = getPlaceholderImage('user-avatar');

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">
          Profile Settings
        </h1>
      </div>
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
              {userAvatar && (
                <AvatarImage
                  src={userAvatar.imageUrl}
                  alt="User Avatar"
                  data-ai-hint={userAvatar.imageHint}
                />
              )}
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button>Change Photo</Button>
              <p className="text-sm text-muted-foreground">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>
          <Separator />
          <form className="space-y-6">
            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" defaultValue="User" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="user@example.com" />
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
              Manage your password settings.
            </p>
             <form className="mt-6 space-y-6">
                <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                </div>
                <div className="flex justify-start">
                    <Button type="submit">Update Password</Button>
                </div>
            </form>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
