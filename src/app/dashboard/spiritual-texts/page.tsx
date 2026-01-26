'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { Bot, LoaderCircle, SendHorizonal, User } from 'lucide-react';

import { handleScriptureChat } from '@/lib/actions';
import type { ScriptureChatState, ChatHistoryItem } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { scriptureLibrary, type Scripture, type ScriptureChapter } from '@/lib/scriptures';


export default function SpiritualTextsPage() {
  const user = useUser();
  const userAvatar = getPlaceholderImage('user-avatar');
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedBook, setSelectedBook] = useState<Scripture>(scriptureLibrary[0]);
  const [selectedChapter, setSelectedChapter] = useState<ScriptureChapter>(scriptureLibrary[0].chapters[0]);

  const initialState: ScriptureChatState = {
    history: [
      {
        role: 'model',
        content: [
          {
            text: "Welcome to the Scripture Study section. Select a book and chapter to begin. I am here to help you understand the text. Feel free to ask me anything.",
          },
        ],
      },
    ],
  };
  const [state, dispatch, isPending] = useActionState(
    handleScriptureChat,
    initialState
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.history, isPending]);

  const handleBookChange = (bookId: string) => {
    const book = scriptureLibrary.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(book.chapters[0]);
    }
  };

  const handleChapterChange = (chapterId: string) => {
    const chapter = selectedBook.chapters.find(c => c.id === chapterId);
    if (chapter) {
      setSelectedChapter(chapter);
    }
  };

  return (
    <div className="grid h-full max-h-[85vh] grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Library & Reader</CardTitle>
          <CardDescription>
            Select a text to study and interact with the AI tutor.
          </CardDescription>
           <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <Label htmlFor="book-select">Book</Label>
                <Select value={selectedBook.id} onValueChange={handleBookChange}>
                  <SelectTrigger id="book-select">
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {scriptureLibrary.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="chapter-select">Chapter</Label>
                <Select value={selectedChapter.id} onValueChange={handleChapterChange}>
                  <SelectTrigger id="chapter-select">
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBook.chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {`Chapter ${chapter.id.replace('ch', '')}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
           </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full pr-4">
            <h3 className="mb-2 text-lg font-semibold">{selectedChapter.title}</h3>
            <p className="whitespace-pre-wrap font-code">{selectedChapter.content}</p>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex h-full flex-col rounded-lg border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Scripture Tutor</CardTitle>
          <CardDescription>
            Ask questions about the text you are reading on the left.
          </CardDescription>
        </CardHeader>
        <div className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full p-4">
            <div className="space-y-6">
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
        </div>

        <div className="border-t p-4">
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
            <input
              type="hidden"
              name="scriptureContext"
              value={selectedChapter.content}
            />
            <Input
              name="query"
              placeholder="Ask about a verse or term..."
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
