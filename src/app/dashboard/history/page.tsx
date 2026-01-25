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
import { MOCK_CONVERSATIONS } from '@/lib/data';

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-headline md:text-3xl">
          Conversation History
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Past Translations</CardTitle>
          <CardDescription>
            A log of your recent translation activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Text</TableHead>
                <TableHead>Translated Text</TableHead>
                <TableHead className="hidden md:table-cell">Languages</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CONVERSATIONS.map(convo => (
                <TableRow key={convo.id}>
                  <TableCell>
                    <div className="font-medium">{convo.sourceText}</div>
                  </TableCell>
                  <TableCell>{convo.translatedText}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{convo.sourceLang}</Badge>
                      <span>→</span>
                      <Badge variant="outline">{convo.targetLang}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {convo.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
