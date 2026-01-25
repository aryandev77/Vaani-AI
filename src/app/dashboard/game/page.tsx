'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Award, Repeat, Zap, Columns } from 'lucide-react';
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
  { en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo' },
  { en: 'Goodbye', es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen' },
  { en: 'Thank you', es: 'Gracias', fr: 'Merci', de: 'Danke' },
  { en: 'Yes', es: 'Sí', fr: 'Oui', de: 'Ja' },
  { en: 'No', es: 'No', fr: 'Non', de: 'Nein' },
  { en: 'Cat', es: 'Gato', fr: 'Chat', de: 'Katze' },
  { en: 'Dog', es: 'Perro', fr: 'Chien', de: 'Hund' },
  { en: 'House', es: 'Casa', fr: 'Maison', de: 'Haus' },
  { en: 'Water', es: 'Agua', fr: 'Eau', de: 'Wasser' },
  { en: 'Sun', es: 'Sol', fr: 'Soleil', de: 'Sonne' },
];

const gameLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
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
  const [score, setScore] = useState(0);
  const [playCorrect] = useSound(SOUNDS.correct);
  const [playIncorrect] = useSound(SOUNDS.incorrect);
  const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });

  useEffect(() => {
    if (Object.keys(correctPairs).length === gameData.left.length) {
      onGameEnd(score);
    }
  }, [correctPairs, score, onGameEnd, gameData.left.length]);

  const handleSelect = (side: 'left' | 'right', value: string) => {
    playClick();
    if (side === 'left') setSelectedLeft(value);
    if (side === 'right') setSelectedRight(value);

    if (
      (side === 'left' && selectedRight) ||
      (side === 'right' && selectedLeft)
    ) {
      const leftVal = side === 'left' ? value : selectedLeft;
      const rightVal = side === 'right' ? value : selectedRight;

      if (leftVal && rightVal && gameData.mapping[leftVal] === rightVal) {
        setCorrectPairs(prev => ({ ...prev, [leftVal]: rightVal }));
        setScore(prev => prev + 1);
        playCorrect();
      } else if (leftVal && rightVal) {
        setIncorrectPairs(prev => ({ ...prev, [leftVal]: rightVal }));
        playIncorrect();
        setTimeout(() => {
          setIncorrectPairs(prev => {
            const newIncorrect = { ...prev };
            delete newIncorrect[leftVal];
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
      <h2 className="mb-4 text-center text-2xl font-bold">
        Match the Words (Level {level})
      </h2>
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
              disabled={isComplete(word, 'left')}
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
              disabled={isComplete(word, 'right')}
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

  const startGame = (type: GameType) => {
    playStart();
    setGameType(type);
    setGameState('playing');
    setGameData(getGameData(level, sourceLang, targetLang));
  };

  const handleGameEnd = (finalScore: number) => {
    setScore(finalScore);
    setGameState('score');
  };

  const handleNextLevel = () => {
    playStart();
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setGameData(getGameData(nextLevel, sourceLang, targetLang));
    setGameState('playing');
  };

  const handleRestart = () => {
    playStart();
    setGameData(getGameData(level, sourceLang, targetLang));
    setGameState('playing');
  };

  const handleMainMenu = () => {
    playClick();
    setGameState('menu');
    setGameType(null);
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

// Add this to your globals.css for the shake animation
/*
@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}

.animate-shake {
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
}
*/
