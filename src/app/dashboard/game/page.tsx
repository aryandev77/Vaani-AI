'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Award, Repeat, Zap, Columns, Heart } from 'lucide-react';
import useSound from 'use-sound';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type GameType = 'match-columns' | 'translate-word';

const words: { [key: string]: string }[] = [
  { en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo', ja: 'こんにちは', zh: '你好', hi: 'नमस्ते', bn: 'হ্যালো', mr: 'नमस्कार', ta: 'வணக்கம்', te: 'నమస్కారం', bho: 'प्रणाम', ml: 'നമസ്കാരം', ur: 'ہیلو', pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ' },
  { en: 'Goodbye', es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', ja: 'さようなら', zh: '再见', hi: 'अलविदा', bn: 'বিদায়', mr: 'अलविदा', ta: 'போய் வருகிறேன்', te: 'వీడ్కోలు', bho: 'बिदाई', ml: 'വിട', ur: 'الوداع', pa: 'ਅਲਵਿਦਾ' },
  { en: 'Thank you', es: 'Gracias', fr: 'Merci', de: 'Danke', ja: 'ありがとう', zh: '谢谢', hi: 'धन्यवाद', bn: 'ধন্যবাদ', mr: 'धन्यवाद', ta: 'நன்றி', te: 'ధన్యవాదాలు', bho: 'धन्यवाद', ml: 'നന്ദി', ur: 'شکریہ', pa: 'ਧੰਨਵਾਦ' },
  { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja', ja: 'はい', zh: '是', hi: 'हाँ', bn: 'হ্যাঁ', mr: 'हो', ta: 'ஆம்', te: 'అవును', bho: 'हाँ', ml: 'അതെ', ur: 'ہاں', pa: 'ਹਾਂ' },
  { en: 'No', es: 'No', fr: 'Non', de: 'Nein', ja: 'いいえ', zh: '不是', hi: 'नहीं', bn: 'না', mr: 'नाही', ta: 'இல்லை', te: 'కాదు', bho: 'ना', ml: 'ഇല്ല', ur: 'نہیں', pa: 'ਨਹੀਂ' },
  { en: 'Cat', es: 'Gato', fr: 'Chat', de: 'Katze', ja: '猫', zh: '猫', hi: 'बिल्ली', bn: 'বিড়াল', mr: 'मांजर', ta: 'பூனை', te: 'పిల్లి', bho: 'बिलार', ml: 'പൂച്ച', ur: 'بلی', pa: 'ਬਿੱਲੀ' },
  { en: 'Dog', es: 'Perro', fr: 'Chien', de: 'Hund', ja: '犬', zh: '狗', hi: 'कुत्ता', bn: 'কুকুর', mr: 'कुत्रा', ta: 'நாய்', te: 'కుక్క', bho: 'कुकुर', ml: 'പട്ടി', ur: 'کتا', pa: 'ਕੁੱਤਾ' },
  { en: 'House', es: 'Casa', fr: 'Maison', de: 'Haus', ja: '家', zh: '房子', hi: 'घर', bn: 'বাড়ি', mr: 'घर', ta: 'வீடு', te: 'ఇల్లు', bho: 'घर', ml: 'വീട്', ur: 'گھر', pa: 'ਘਰ' },
  { en: 'Water', es: 'Agua', fr: 'Eau', de: 'Wasser', ja: '水', zh: '水', hi: 'पानी', bn: 'জল', mr: 'पाणी', ta: 'தண்ணீர்', te: 'నీరు', bho: 'पानी', ml: 'വെള്ളം', ur: 'پانی', pa: 'ਪਾਣੀ' },
  { en: 'Sun', es: 'Sol', fr: 'Soleil', de: 'Sonne', ja: '太陽', zh: '太阳', hi: 'सूरज', bn: 'সূর্য', mr: 'सूर्य', ta: 'சூரியன்', te: 'సూర్యుడు', bho: 'सुरुज', ml: 'സൂര്യൻ', ur: 'سورج', pa: 'ਸੂਰਜ' },
];

const gameLanguages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'hi', label: 'Hindi' },
    { value: 'bn', label: 'Bengali' },
    { value: 'mr', label: 'Marathi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'bho', label: 'Bhojpuri' },
    { value: 'ml', label: 'Malayalam' },
    { value: 'ur', label: 'Urdu' },
    { value: 'pa', label: 'Punjabi' },
];

const SOUNDS = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  win: '/sounds/win.mp3',
  start: '/sounds/start.mp3',
  click: '/sounds/click.mp3',
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

const getGameData = (
  level: number,
  sourceLang: string,
  targetLang: string
) => {
  const shuffledWords = shuffleArray(words);
  const gameWords = shuffledWords.slice(0, 5);

  const mcqOptions = gameWords.map(word => {
    const wrongAnswers = shuffledWords
      .filter(w => w[sourceLang] !== word[sourceLang])
      .slice(0, 3)
      .map(w => w[targetLang]);
    const options = shuffleArray([word[targetLang], ...wrongAnswers]);
    return { question: word[sourceLang], options, answer: word[targetLang] };
  });

  return {
    matchColumns: {
      left: shuffleArray(gameWords.map(w => w[sourceLang])),
      right: shuffleArray(gameWords.map(w => w[targetLang])),
      mapping: gameWords.reduce(
        (acc, w) => ({ ...acc, [w[sourceLang]]: w[targetLang] }),
        {} as Record<string, string>
      ),
    },
    translateWord: mcqOptions,
  };
};

const GameCard = ({
  title,
  description,
  icon,
  onStart,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onStart: () => void;
}) => (
  <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
    <CardHeader className="flex flex-row items-center gap-4">
      {icon}
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      <Button onClick={onStart} className="w-full">
        Play Now
      </Button>
    </CardContent>
  </Card>
);

const MatchColumnsGame = ({ gameData, level, onGameEnd }: any) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [correctPairs, setCorrectPairs] = useState<Record<string, string>>({});
  const [incorrectPairs, setIncorrectPairs] = useState<Record<string, string>>(
    {}
  );
  const [lives, setLives] = useState(3);
  const [playCorrect] = useSound(SOUNDS.correct);
  const [playIncorrect] = useSound(SOUNDS.incorrect);
  const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });
  const isGameOver = lives <= 0;

  useEffect(() => {
    if (Object.keys(correctPairs).length === gameData.left.length) {
      onGameEnd(Object.keys(correctPairs).length);
    }
  }, [correctPairs, onGameEnd, gameData.left.length]);

  useEffect(() => {
    if (lives <= 0) {
      setTimeout(() => onGameEnd(Object.keys(correctPairs).length), 1000);
    }
  }, [lives, onGameEnd, correctPairs]);


  const handleSelect = (side: 'left' | 'right', value: string) => {
    if (isGameOver) return;
    playClick();

    let currentLeft = selectedLeft;
    let currentRight = selectedRight;

    if (side === 'left') {
      currentLeft = value;
      setSelectedLeft(value);
    } else {
      currentRight = value;
      setSelectedRight(value);
    }

    if (currentLeft && currentRight) {
      if (gameData.mapping[currentLeft] === currentRight) {
        setCorrectPairs(prev => ({ ...prev, [currentLeft]: currentRight }));
        playCorrect();
      } else {
        setLives(prev => prev - 1);
        setIncorrectPairs(prev => ({
          ...prev,
          [currentLeft as string]: currentRight as string,
        }));
        playIncorrect();
        setTimeout(() => {
          setIncorrectPairs(prev => {
            const newIncorrect = { ...prev };
            delete newIncorrect[currentLeft as string];
            return newIncorrect;
          });
        }, 1000);
      }
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const isComplete = (value: string, side: 'left' | 'right') => {
    if (side === 'left') return !!correctPairs[value];
    return Object.values(correctPairs).includes(value);
  };

  const isIncorrect = (value: string, side: 'left' | 'right') => {
    if (side === 'left') return !!incorrectPairs[value];
    return Object.values(incorrectPairs).includes(value);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Match the Words (Level {level})
        </h2>
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className={cn(
                'h-6 w-6 transition-colors',
                i < lives
                  ? 'text-red-500 fill-red-500'
                  : 'text-muted-foreground/50'
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {gameData.left.map((word: string) => (
            <Button
              key={word}
              variant="outline"
              className={cn(
                'w-full justify-start p-6 text-lg',
                selectedLeft === word && 'ring-2 ring-primary',
                isComplete(word, 'left') &&
                  'bg-green-500/20 text-white hover:bg-green-500/30',
                isIncorrect(word, 'left') &&
                  'bg-red-500/20 text-white hover:bg-red-500/30 animate-shake'
              )}
              onClick={() => handleSelect('left', word)}
              disabled={isComplete(word, 'left') || isGameOver}
            >
              {word}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          {gameData.right.map((word: string) => (
            <Button
              key={word}
              variant="outline"
              className={cn(
                'w-full justify-start p-6 text-lg',
                selectedRight === word && 'ring-2 ring-primary',
                isComplete(word, 'right') &&
                  'bg-green-500/20 text-white hover:bg-green-500/30',
                isIncorrect(word, 'right') &&
                  'bg-red-500/20 text-white hover:bg-red-500/30 animate-shake'
              )}
              onClick={() => handleSelect('right', word)}
              disabled={isComplete(word, 'right') || isGameOver}
            >
              {word}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};


const TranslateWordGame = ({ gameData, level, onGameEnd }: any) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [playCorrect] = useSound(SOUNDS.correct);
  const [playIncorrect] = useSound(SOUNDS.incorrect);

  const question = gameData[currentQuestion];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    if (answer === question.answer) {
      setIsCorrect(true);
      setScore(s => s + 1);
      playCorrect();
    } else {
      setIsCorrect(false);
      playIncorrect();
    }

    setTimeout(() => {
      if (currentQuestion < 4) {
        setCurrentQuestion(q => q + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        onGameEnd(score + (answer === question.answer ? 1 : 0));
      }
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Progress
        value={((currentQuestion + 1) / 5) * 100}
        className="mb-4"
      />
      <h2 className="mb-2 text-center text-xl font-bold">Level {level}</h2>
      <Card className="text-center">
        <CardHeader>
          <CardDescription>Translate the word:</CardDescription>
          <CardTitle className="text-4xl font-bold">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {question.options.map((option: string) => (
            <Button
              key={option}
              variant="outline"
              className={cn(
                'p-8 text-lg',
                selectedAnswer === option && isCorrect && 'bg-green-500/20 text-white animate-pulse',
                selectedAnswer === option && !isCorrect && 'bg-red-500/20 text-white animate-shake',
                selectedAnswer && option === question.answer && 'bg-green-500/20 text-white'
              )}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedAnswer}
            >
              {option}
            </Button>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ScoreScreen = ({
  score,
  level,
  onRestart,
  onNextLevel,
  onMainMenu,
}: any) => {
  const success = score >= 3;
  const [playWin] = useSound(SOUNDS.win, { volume: 0.7 });
  const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });

  useEffect(() => {
    if (success) {
      playWin();
    }
  }, [success, playWin]);

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center"
    >
      {success && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <Card
        className={cn(
          'w-full max-w-md text-center',
          success ? 'border-green-500' : 'border-red-500'
        )}
      >
        <CardHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.2, type: 'spring' } }}
            className="mx-auto"
          >
            {success ? (
              <Award className="h-24 w-24 text-green-500" />
            ) : (
              <X className="h-24 w-24 text-red-500" />
            )}
          </motion.div>
          <CardTitle className="text-3xl">
            {success ? 'Level Complete!' : 'Try Again!'}
          </CardTitle>
          <CardDescription>
            You scored {score} out of 5 in Level {level}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-center gap-2">
            <p className="text-6xl font-bold">{score}</p>
            <p className="text-2xl text-muted-foreground">/ 5</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => { playClick(); onRestart(); }}>
              <Repeat className="mr-2" /> Try Again
            </Button>
            {success && (
              <Button onClick={() => { playClick(); onNextLevel(); }}>
                Next Level <Award className="ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Button variant="link" onClick={() => { playClick(); onMainMenu(); }} className="mt-4">
        Back to Main Menu
      </Button>
    </motion.div>
  );
};

export default function GamePage() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'score'>(
    'menu'
  );
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [gameData, setGameData] = useState(getGameData(level, sourceLang, targetLang));
  const [playStart] = useSound(SOUNDS.start);
  const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });
  
  useEffect(() => {
    if (sourceLang === targetLang) {
      const newTarget = gameLanguages.find(l => l.value !== sourceLang)?.value;
      if (newTarget) {
        setTargetLang(newTarget);
      }
    }
  }, [sourceLang, targetLang]);

  useEffect(() => {
    setGameData(getGameData(level, sourceLang, targetLang));
  }, [sourceLang, targetLang, level]);


  const startGame = (type: GameType) => {
    playStart();
    setGameType(type);
    setGameState('playing');
    setGameData(getGameData(level, sourceLang, targetLang));
  };

  const handleGameEnd = (finalScore: number) => {
    if (gameState === 'playing') {
      setScore(finalScore);
      setGameState('score');
    }
  };

  const handleNextLevel = () => {
    playStart();
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setGameState('playing');
  };

  const handleRestart = () => {
    playStart();
    setScore(0);
    setGameState('playing');
  };

  const handleMainMenu = () => {
    playClick();
    setGameState('menu');
    setGameType(null);
    setLevel(1);
    setScore(0);
  };

  return (
    <div className="flex h-full items-center justify-center">
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid w-full max-w-2xl grid-cols-1 gap-8 md:grid-cols-2"
          >
            <div className="col-span-1 md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Language Settings</CardTitle>
                        <CardDescription>Choose your languages for the games.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="source-language">From</Label>
                            <Select value={sourceLang} onValueChange={setSourceLang}>
                                <SelectTrigger id="source-language">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gameLanguages.map(lang => (
                                        <SelectItem key={lang.value} value={lang.value} disabled={lang.value === targetLang}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="target-language">To</Label>
                            <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger id="target-language">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gameLanguages.map(lang => (
                                        <SelectItem key={lang.value} value={lang.value} disabled={lang.value === sourceLang}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <GameCard
              title="Match the Columns"
              description="Match words to their translations."
              icon={<Columns className="h-10 w-10 text-primary" />}
              onStart={() => startGame('match-columns')}
            />
            <GameCard
              title="Translate the Word"
              description="Choose the correct translation from multiple choices."
              icon={<Zap className="h-10 w-10 text-accent" />}
              onStart={() => startGame('translate-word')}
            />
          </motion.div>
        )}

        {gameState === 'playing' && gameType && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-xl"
          >
            {gameType === 'match-columns' ? (
              <MatchColumnsGame
                gameData={gameData.matchColumns}
                level={level}
                onGameEnd={handleGameEnd}
              />
            ) : (
              <TranslateWordGame
                gameData={gameData.translateWord}
                level={level}
                onGameEnd={handleGameEnd}
              />
            )}
          </motion.div>
        )}

        {gameState === 'score' && (
          <motion.div
            key="score"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <ScoreScreen
              score={score}
              level={level}
              onRestart={handleRestart}
              onNextLevel={handleNextLevel}
              onMainMenu={handleMainMenu}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
