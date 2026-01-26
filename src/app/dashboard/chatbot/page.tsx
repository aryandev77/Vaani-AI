'use client';

import { useActionState, useRef, useEffect } from 'react';
import { SendHorizonal, Bot, User, LoaderCircle } from 'lucide-react';

import { handleChat } from '@/lib/actions';
import type { ChatState } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';

export default function ChatbotPage() {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.history, isPending]);

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="mx-auto max-w-3xl space-y-6">
          {state.history.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback>
                    <Bot />
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
                <p className="whitespace-pre-wrap">{message.content[0].text}</p>
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
                <AvatarFallback>
                  <Bot />
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
      <div className="border-t">
        <div className="mx-auto max-w-3xl p-4">
          <form
            ref={formRef}
            action={formData => {
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
