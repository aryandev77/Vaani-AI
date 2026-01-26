'use client';

import { useActionState, useRef, useEffect } from 'react';
import {
  SendHorizonal,
  User,
  LoaderCircle,
  Lightbulb,
  Languages,
  Mail,
  Globe,
} from 'lucide-react';

import { handleChat } from '@/lib/actions';
import type { ChatState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';
import { LogoIcon } from '@/components/logo-icon';

// New component for example prompts
const ExamplePromptCard = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <Card className="h-full text-left transition-colors group-hover:bg-muted">
    <div className="flex flex-row items-center gap-4 p-4">
      {icon}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  </Card>
);

export default function DashboardPage() {
  const user = useUser();
  const userAvatar = getPlaceholderImage('user-avatar');
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialState: ChatState = {
    history: [
      {
        role: 'model',
        content: [
          {
            text: "Hello! I'm Vaani, your personal language tutor. How can I help you today?",
          },
        ],
      },
    ],
  };
  const [state, dispatch, isPending] = useActionState(handleChat, initialState);

  useEffect(() => {
    // Only scroll if there are more than the initial messages, or if we are waiting for a response
    if (state.history.length > 1 || isPending) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.history, isPending]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {state.history.length <= 1 && !isPending ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 p-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <rect
                  width="28"
                  height="28"
                  rx="6"
                  fill="url(#logoGradient)"
                />
                <path
                  d="M 6 9 L 10 17 Q 14 21 18 17 L 22 9"
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <h1 className="text-2xl font-semibold">
                How can I help you today?
              </h1>
            </div>
            <div className="w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid">
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="Explain the idiom 'break a leg'"
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Lightbulb className="h-6 w-6 text-primary" />}
                    title="Explain an idiom"
                    subtitle="'Break a leg'"
                  />
                </button>
              </form>
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="How do I say 'Where is the nearest train station?' in Japanese?"
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Languages className="h-6 w-6 text-primary" />}
                    title="Translate a phrase"
                    subtitle="'Where is the nearest train station?' in Japanese"
                  />
                </button>
              </form>
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="Help me write a formal email to a professor asking for an extension on an assignment."
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Mail className="h-6 w-6 text-primary" />}
                    title="Help me write an email"
                    subtitle="To a professor, asking for an extension"
                  />
                </button>
              </form>
              <form action={dispatch}>
                <input
                  type="hidden"
                  name="query"
                  value="What's the cultural difference between a 'siesta' in Spain and a regular nap?"
                />
                <button
                  type="submit"
                  className="group h-full w-full text-left"
                  disabled={isPending}
                >
                  <ExamplePromptCard
                    icon={<Globe className="h-6 w-6 text-primary" />}
                    title="Explain cultural context"
                    subtitle="The difference between 'siesta' in Spain and a 'nap'"
                  />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="mx-auto max-w-3xl space-y-6">
              {/* We slice to not show the initial greeting when chat starts */}
              {state.history.slice(1).map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-transparent p-1">
                        <LogoIcon />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-xl rounded-lg p-3 text-sm shadow-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap">
                      {message.content[0].text}
                    </p>
                  </div>
                  {message.role === 'user' && user && (
                    <Avatar className="h-9 w-9">
                      {user.photoURL ? (
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
                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && (
                <div className="flex items-start justify-start gap-4">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-transparent p-1">
                      <LogoIcon />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-xl rounded-lg bg-muted p-3 text-sm shadow-sm">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-3xl p-4">
          <form
            ref={formRef}
            action={(formData) => {
              if (formData.get('query')) {
                dispatch(formData);
                formRef.current?.reset();
              }
            }}
            className="flex items-center gap-2"
          >
            <Input
              name="query"
              placeholder="Ask about languages, idioms, or translations..."
              autoComplete="off"
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isPending}>
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
