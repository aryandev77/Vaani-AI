'use client';

import { useActionState, useRef, useEffect, useState } from 'react';
import { LoaderCircle, SendHorizonal, User, BookOpen } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

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
import { useUser, useFirestore } from '@/firebase';
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
import {
  scriptureLibrary,
  type Scripture,
  type ScriptureChapter,
} from '@/lib/scriptures';
import { Skeleton } from '@/components/ui/skeleton';
import { LogoIcon } from '@/components/logo-icon';

export default function SpiritualTextsPage() {
  const user = useUser();
  const firestore = useFirestore();
  const userAvatar = getPlaceholderImage('user-avatar');
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedReligion, setSelectedReligion] = useState(
    Object.keys(scriptureLibrary)[0]
  );
  
  const getBooksForReligion = (religionId: string) => scriptureLibrary[religionId]?.scriptures || [];
  const getFirstBook = (religionId: string) => getBooksForReligion(religionId)[0];
  const getFirstChapter = (religionId: string) => getFirstBook(religionId)?.chapters[0];

  const [books, setBooks] = useState<Scripture[]>(getBooksForReligion(selectedReligion));
  const [selectedBook, setSelectedBook] = useState<Scripture | undefined>(getFirstBook(selectedReligion));
  const [selectedChapter, setSelectedChapter] = useState<ScriptureChapter | undefined>(getFirstChapter(selectedReligion));


  useEffect(() => {
    if (user && firestore) {
      const fetchProfile = async () => {
        setLoadingProfile(true);
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Check if the user's religion exists in our library, otherwise default
            if (userData.religion && scriptureLibrary[userData.religion]) {
              setSelectedReligion(userData.religion);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user's religion:", error);
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [user, firestore]);

  // Update books, selected book, and chapter when religion changes
  useEffect(() => {
    const newBooks = getBooksForReligion(selectedReligion);
    const newBook = newBooks[0];
    const newChapter = newBook?.chapters[0];

    setBooks(newBooks);
    setSelectedBook(newBook);
    setSelectedChapter(newChapter);
  }, [selectedReligion]);


  const initialState: ScriptureChatState = {
    history: [
      {
        role: 'model',
        content: [
          {
            text: 'Welcome! Select a text to begin reading. I am here to help you understand it. Feel free to ask me anything about the verses.',
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

  const handleReligionChange = (religionId: string) => {
    setSelectedReligion(religionId);
  };
  
  const handleBookChange = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(book.chapters[0]);
    }
  };

  const handleChapterChange = (chapterId: string) => {
    const chapter = selectedBook?.chapters.find(c => c.id === chapterId);
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
          {loadingProfile ? (
             <div className="grid grid-cols-3 gap-4 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          ): (
            <div className="grid grid-cols-3 gap-4 pt-4">
            <div>
              <Label htmlFor="religion-select">Religion</Label>
              <Select
                value={selectedReligion}
                onValueChange={handleReligionChange}
              >
                <SelectTrigger id="religion-select">
                  <SelectValue placeholder="Select a religion" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(scriptureLibrary).map(([id, religion]) => (
                    <SelectItem key={id} value={id}>
                      {religion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="book-select">Book</Label>
              <Select
                value={selectedBook?.id || ''}
                onValueChange={handleBookChange}
                disabled={!books.length}
              >
                <SelectTrigger id="book-select">
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="chapter-select">Chapter</Label>
              <Select
                value={selectedChapter?.id || ''}
                onValueChange={handleChapterChange}
                disabled={!selectedBook}
              >
                <SelectTrigger id="chapter-select">
                  <SelectValue placeholder="Select a chapter" />
                </SelectTrigger>
                <SelectContent>
                  {selectedBook?.chapters.map(chapter => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {selectedChapter ? (
            <ScrollArea className="h-full pr-4">
            <h3 className="mb-2 text-lg font-semibold">
              {selectedChapter.title}
            </h3>
            <p className="whitespace-pre-wrap font-code">
              {selectedChapter.content}
            </p>
          </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Text Selected</h3>
              <p className="text-sm text-muted-foreground">Please select a religion and book to begin reading.</p>
            </div>
          )}
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
        </div>

        <div className="border-t p-4">
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
            <input
              type="hidden"
              name="scriptureContext"
              value={selectedChapter?.content || 'No text selected.'}
            />
            <Input
              name="query"
              placeholder="Ask about a verse or term..."
              autoComplete="off"
              disabled={isPending || !selectedChapter}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !selectedChapter}
            >
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
