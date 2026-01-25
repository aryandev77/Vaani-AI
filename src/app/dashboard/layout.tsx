'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import {
  Book,
  History,
  Info,
  Languages,
  Smile,
  Swords,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import { FullScreenLoader } from '@/components/full-screen-loader';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  const pageTitle = useMemo(() => {
    const pageTitles: { [key: string]: string } = {
      '/dashboard': 'Real-Time Translation',
      '/dashboard/learning': 'Learning Mode',
      '/dashboard/emotion': 'Emotion & Tone Preservation',
      '/dashboard/history': 'Conversation History',
      '/dashboard/about': 'About Vaani AI',
      '/dashboard/profile': 'Profile Settings',
      '/dashboard/billing': 'Billing',
      '/dashboard/settings': 'Settings',
      '/dashboard/game': 'Language Games',
    };
    return pageTitles[pathname] || 'Dashboard';
  }, [pathname]);

  if (user === undefined) {
    return <FullScreenLoader />;
  }

  if (user === null) {
    return null; // or a redirect component
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="p-2">
              <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Translate',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  isActive={pathname === '/dashboard'}
                >
                  <Link href="/dashboard">
                    <Languages />
                    <span>Translate</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Learning Mode',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  isActive={pathname === '/dashboard/learning'}
                >
                  <Link href="/dashboard/learning">
                    <Book />
                    <span>Learning Mode</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Emotion Tool',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  isActive={pathname === '/dashboard/emotion'}
                >
                  <Link href="/dashboard/emotion">
                    <Smile />
                    <span>Emotion Tool</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'Games',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  isActive={pathname === '/dashboard/game'}
                >
                  <Link href="/dashboard/game">
                    <Swords />
                    <span>Games</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'History',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  isActive={pathname === '/dashboard/history'}
                >
                  <Link href="/dashboard/history">
                    <History />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: 'About',
                    className: 'bg-primary text-primary-foreground',
                  }}
                  isActive={pathname === '/dashboard/about'}
                >
                  <Link href="/dashboard/about">
                    <Info />
                    <span>About</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold font-headline">
                  {pageTitle}
                </h1>
              </div>
              <UserNav />
            </header>
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
