'use client';

import { useEffect, useState } from 'react';

export function Waveform() {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const generateBars = () => {
      const newBars = Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);
      setBars(newBars);
    };

    generateBars(); // Initial generation
    const interval = setInterval(generateBars, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-16 w-full items-center justify-center gap-1 rounded-lg bg-secondary p-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-primary/50 transition-all duration-200"
          style={{ height: `${height * 100}%` }}
        />
      ))}
    </div>
  );
}
