'use client';

import { useActionState, useRef, useEffect } from 'react';
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

const scriptureText = `
Bhagavad Gita - Chapter 1

Verse 1
धृतराष्ट्र उवाच |
धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |
मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय || १ ||

dhṛtarāṣṭra uvāca |
dharmakṣetre kurukṣetre samavetā yuyutsavaḥ |
māmakāḥ pāṇḍavāścaiva kimakurvata sañjaya || 1 ||

Dhritarashtra said: O Sanjaya, after my sons and the sons of Pandu assembled in the place of pilgrimage at Kurukshetra, desiring to fight, what did they do?

---

Verse 2
सञ्जय उवाच |
दृष्ट्वा तु पाण्डवानीकं व्यूढं दुर्योधनस्तदा |
आचार्यमुपसङ्गम्य राजा वचनमब्रवीत् || २ ||

sañjaya uvāca |
dṛṣṭvā tu pāṇḍavānīkaṁ vyūḍhaṁ duryodhanastadā |
ācāryamupasaṅgamya rājā vacanamabravīt || 2 ||

Sanjaya said: On seeing the army of the Pandavas drawn in military array, King Duryodhana then approached his teacher (Drona) and spoke the following words.

---

Verse 3
पश्यैतां पाण्डुपुत्राणामाचार्य महतीं चमूम् |
व्यूढां द्रुपदपुत्रेण तव शिष्येण धीमता || ३ ||

paśyaitāṁ pāṇḍuputrāṇāmācārya mahatīṁ camūm |
vyūḍhāṁ drupadaputreṇa tava śiṣyeṇa dhīmatā || 3 ||

O my teacher, behold the great army of the sons of Pandu, so expertly arrayed by your intelligent disciple, the son of Drupada.

---

Verse 4
अत्र शूरा महेष्वासा भीमार्जुनसमा युधि |
युयुधानो विराटश्च द्रुपदश्च महारथः || ४ ||

atra śūrā maheṣvāsā bhīmārjunasamā yudhi |
yuyudhāno virāṭaśca drupadaśca mahārathaḥ || 4 ||

Here in this army are many heroic bowmen equal in fighting to Bhima and Arjuna: great fighters like Yuyudhana, Virata and Drupada.

---

Verse 5
धृष्टकेतुश्चेकितानः काशिराजश्च वीर्यवान् |
पुरुजित्कुन्तिभोजश्च शैब्यश्च नरपुङ्गवः || ५ ||

dhṛṣṭaketuścekitānaḥ kāśirājaśca vīryavān |
purujitkuntibhojaśca śaibyaśca narapuṅgavaḥ || 5 ||

There are also great, heroic, powerful fighters like Dhrishtaketu, Cekitana, Kasiraja, Purujit, Kuntibhoja and Saibya.
`;

export default function SpiritualTextsPage() {
  const user = useUser();
  const userAvatar = getPlaceholderImage('user-avatar');
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialState: ScriptureChatState = {
    history: [
      {
        role: 'model',
        content: [
          {
            text: "Welcome to the Spiritual Texts study. I am here to help you understand the scripture. Feel free to ask me anything about the text you're reading.",
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

  return (
    <div className="grid h-full max-h-[85vh] grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Bhagavad Gita - Chapter 1</CardTitle>
          <CardDescription>
            Observe the armies on the battlefield of Kurukshetra.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full pr-4">
            <p className="whitespace-pre-wrap font-code">{scriptureText}</p>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex h-full flex-col rounded-lg border bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Scripture Tutor</CardTitle>
          <CardDescription>
            Ask questions about the text to get explanations.
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
              value={scriptureText}
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
