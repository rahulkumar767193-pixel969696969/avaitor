import { useEffect, useState, useRef } from 'react';

export type GameState = 'IDLE' | 'LOADING' | 'FLYING' | 'CRASHED' | 'CASHED_OUT';

interface UseGameLoopProps {
  gameState: GameState;
  onCrash: (crashPoint: number) => void;
  onTick: (multiplier: number) => void;
  autoCashOutValue: number | null;
  onAutoCashOut: (multiplier: number) => void;
}

export function useGameLoop({
  gameState,
  onCrash,
  onTick,
  autoCashOutValue,
  onAutoCashOut,
}: UseGameLoopProps) {
  const [multiplier, setMultiplier] = useState(1.0);
  const startTimeRef = useRef<number | null>(null);
  const crashPointRef = useRef<number>(1.0);
  const requestRef = useRef<number | null>(null);
  const hasAutoCashedOut = useRef<boolean>(false);

  const generateCrashPoint = () => {
    // Standard crash game RNG logic (simplified for demo)
    // 99% of the time it's > 1.00
    // House edge is simulated by the distribution
    const r = Math.random();
    if (r < 0.03) return 1.0; // Instant crash at 1.00 (3% chance)
    
    // Distribution formula: 0.99 / (1 - X)
    // We'll use a simpler version for demo that feels "right"
    const raw = 0.99 / (1 - Math.random());
    return Math.max(1.01, Math.floor(raw * 100) / 100);
  };

  const animate = (time: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = time;
    }

    const elapsed = (time - startTimeRef.current) / 1000; // seconds
    
    // Exponential growth formula: 1.00 * e^(0.08 * t)
    // This makes it faster as it goes higher
    const currentMultiplier = Math.pow(Math.E, 0.08 * elapsed);
    const formattedMultiplier = Math.floor(currentMultiplier * 100) / 100;

    if (formattedMultiplier >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      onCrash(crashPointRef.current);
      return;
    }

    // Handle Auto Cash Out
    if (
      autoCashOutValue && 
      !hasAutoCashedOut.current && 
      formattedMultiplier >= autoCashOutValue
    ) {
      hasAutoCashedOut.current = true;
      onAutoCashOut(formattedMultiplier);
    }

    setMultiplier(formattedMultiplier);
    onTick(formattedMultiplier);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (gameState === 'LOADING') {
      setMultiplier(1.0);
      startTimeRef.current = null;
      crashPointRef.current = generateCrashPoint();
      hasAutoCashedOut.current = false;
    } else if (gameState === 'FLYING') {
      requestRef.current = requestAnimationFrame(animate);
    } else if (gameState === 'IDLE') {
        setMultiplier(1.0);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState]);

  return { multiplier };
}
