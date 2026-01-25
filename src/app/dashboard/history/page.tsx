'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingIndicator } from '@/components/loading-indicator';

interface TranslationDoc {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  date: Timestamp;
}

export default function HistoryPage() {
  const user = useUser();
  const firestore = useFirestore();
  const [translations, setTranslations] = useState<TranslationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      const translationsQuery = query(
        collection(firestore, 'users', user.uid, 'translations'),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(
        translationsQuery,
        snapshot => {
          const newTranslations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<TranslationDoc, 'id'>),
          }));
          setTranslations(newTranslations);
          setLoading(false);
        },
        error => {
          console.error('Error fetching translation history: ', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else if (user === null) {
      setLoading(false);
    }
  }, [user, firestore]);

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Past Translations</CardTitle>
          <CardDescription>
            A log of your recent translation activities, saved to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Text</TableHead>
                <TableHead>Translated Text</TableHead>
                <TableHead className="hidden md:table-cell">
                  Languages
                </TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : translations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {user === null
                      ? 'Please log in to see your history.'
                      : 'You have no translation history yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                translations.map(convo => (
                  <TableRow key={convo.id}>
                    <TableCell>
                      <div className="font-medium">{convo.sourceText}</div>
                    </TableCell>
                    <TableCell>{convo.translatedText}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{convo.sourceLang.toUpperCase()}</Badge>
                        <span>→</span>
                        <Badge variant="outline">{convo.targetLang.toUpperCase()}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {convo.date
                        ? format(convo.date.toDate(), 'PP')
                        : 'No date'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
