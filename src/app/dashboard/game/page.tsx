'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Award, Repeat, Zap, Columns } from 'lucide-react';
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

type GameType = 'match-columns' | 'translate-word';

const words = [
  { en: 'Hello', es: 'Hola' },
  { en: 'Goodbye', es: 'Adiós' },
  { en: 'Thank you', es: 'Gracias' },
  { en: 'Yes', es: 'Sí' },
  { en: 'No', es: 'No' },
  { en: 'Cat', es: 'Gato' },
  { en: 'Dog', es: 'Perro' },
  { en: 'House', es: 'Casa' },
  { en: 'Water', es: 'Agua' },
  { en: 'Sun', es: 'Sol' },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

const getGameData = (level: number) => {
  const shuffledWords = shuffleArray(words);
  const gameWords = shuffledWords.slice(0, 5);

  const mcqOptions = gameWords.map(word => {
    const wrongAnswers = shuffledWords
      .filter(w => w.en !== word.en)
      .slice(0, 3)
      .map(w => w.es);
    const options = shuffleArray([word.es, ...wrongAnswers]);
    return { question: word.en, options, answer: word.es };
  });

  return {
    matchColumns: {
      left: shuffleArray(gameWords.map(w => w.en)),
      right: shuffleArray(gameWords.map(w => w.es)),
      mapping: gameWords.reduce(
        (acc, w) => ({ ...acc, [w.en]: w.es }),
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

  const handleSelect = (side: 'left' | 'right', value: string) => {
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
      } else if (leftVal && rightVal) {
        setIncorrectPairs(prev => ({ ...prev, [leftVal]: rightVal }));
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

  if (Object.keys(correctPairs).length === 5) {
    onGameEnd(score);
  }

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

  const question = gameData[currentQuestion];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    if (answer === question.answer) {
      setIsCorrect(true);
      setScore(s => s + 1);
    } else {
      setIsCorrect(false);
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
            <Button variant="outline" onClick={onRestart}>
              <Repeat className="mr-2" /> Try Again
            </Button>
            {success && (
              <Button onClick={onNextLevel}>
                Next Level <Award className="ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Button variant="link" onClick={onMainMenu} className="mt-4">
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
  const [gameData, setGameData] = useState(getGameData(level));

  const startGame = (type: GameType) => {
    setGameType(type);
    setGameState('playing');
    setGameData(getGameData(level));
  };

  const handleGameEnd = (finalScore: number) => {
    setScore(finalScore);
    setGameState('score');
  };

  const handleNextLevel = () => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setGameData(getGameData(nextLevel));
    setGameState('playing');
  };

  const handleRestart = () => {
    setGameData(getGameData(level));
    setGameState('playing');
  };

  const handleMainMenu = () => {
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
            <GameCard
              title="Match the Columns"
              description="Match English words to their Spanish translations."
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
