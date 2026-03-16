import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Info, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameCanvas } from './components/GameCanvas';
import { Controls } from './components/Controls';
import { History } from './components/History';
import { useGameLoop, GameState } from './hooks/useGameLoop';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [history, setHistory] = useState<number[]>([]);
  const [autoCashOut, setAutoCashOut] = useState<string>('1.10');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    // Request microphone permission on mount
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => console.log('Microphone permission granted'))
      .catch((err) => console.warn('Microphone permission denied or error:', err));
  }, []);

  const handleCrash = useCallback((crashPoint: number) => {
    setGameState('CRASHED');
    setHistory(prev => [crashPoint, ...prev].slice(0, 50));
  }, []);

  const handleAutoCashOut = useCallback((multiplier: number) => {
    if (gameState === 'FLYING') {
      handleCashOut(multiplier);
    }
  }, [gameState]);

  const { multiplier } = useGameLoop({
    gameState,
    onCrash: handleCrash,
    onTick: () => {},
    autoCashOutValue: parseFloat(autoCashOut) || null,
    onAutoCashOut: handleAutoCashOut,
  });

  const handleStart = () => {
    setCashedOutAt(null);
    setGameState('LOADING');
    setTimeout(() => {
      setGameState('FLYING');
    }, 2000);
  };

  const handleCashOut = (atMultiplier?: number) => {
    const finalMultiplier = atMultiplier || multiplier;
    setCashedOutAt(finalMultiplier);
    setGameState('CASHED_OUT');
    
    if (soundEnabled) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#ffffff', '#e11d48']
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#000000] text-white font-sans overflow-hidden select-none">
      {/* Top Bar */}
      <header className="h-[48px] flex-shrink-0 flex items-center justify-between px-4 bg-[#14151b] border-b border-white/5 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-600 rounded flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M21 16V14.5L13 9.5V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9.5L2 14.5V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"/>
              </svg>
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic text-white">AVIATOR</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#28a745] tracking-tighter">0.00 ARS</span>
            <div className="h-6 w-[1px] bg-white/10 mx-1" />
            <button className="text-gray-400 hover:text-white transition-colors"><div className="w-5 h-4 flex flex-col justify-between"><div className="h-[2px] bg-current w-full"/><div className="h-[2px] bg-current w-full"/><div className="h-[2px] bg-current w-full"/></div></button>
            <button className="text-gray-400 hover:text-white transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-[280px] flex-col bg-[#14151b] border-r border-white/5">
          <div className="p-3 flex flex-col gap-3">
            <div className="flex bg-black/40 p-1 rounded-full">
              <button className="flex-1 py-1 text-[10px] font-black text-white uppercase tracking-widest bg-[#2c2d35] rounded-full">All Bets</button>
              <button className="flex-1 py-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">My Bets</button>
              <button className="flex-1 py-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">Top</button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-gray-600 flex items-center justify-center text-[8px]">?</div>
                  <span>Previous Round</span>
                </div>
              </div>
              <div className="text-center py-32 text-[10px] font-bold text-gray-600 uppercase tracking-widest flex flex-col items-center gap-2">
                <span>Cash out ARS</span>
              </div>
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Powered by SPRIBE</span>
            <div className="w-4 h-4 rounded bg-gray-800" />
          </div>
        </div>

        {/* Game Viewport */}
        <div className="flex-1 flex flex-col bg-[#000000] relative">
          <History history={history} />
          
          <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
            <div className="flex-1 min-h-0">
              <GameCanvas 
                multiplier={multiplier} 
                isCrashed={gameState === 'CRASHED'} 
                isFlying={gameState === 'FLYING'} 
              />
            </div>

            {/* Bottom Controls */}
            <div className="h-[220px] flex-shrink-0">
              <Controls 
                gameState={gameState}
                onStart={handleStart}
                onCashOut={() => handleCashOut()}
                autoCashOut={autoCashOut}
                setAutoCashOut={setAutoCashOut}
                lastMultiplier={multiplier}
              />
            </div>
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {gameState === 'LOADING' && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full"
                />
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {gameState === 'CASHED_OUT' && cashedOutAt && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-[#28a745] px-12 py-6 rounded-[40px] shadow-[0_20px_50px_rgba(40,167,69,0.4)] border border-white/20">
                  <span className="text-6xl font-black text-white tracking-tighter">{cashedOutAt.toFixed(2)}x</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#1b1c24] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                <ShieldAlert size={40} className="text-amber-500" />
              </div>
              <h2 className="text-3xl font-black text-center mb-6 uppercase tracking-tighter leading-none">EDUCATIONAL DEMO</h2>
              <p className="text-gray-400 text-center text-sm leading-relaxed mb-10 font-medium">
                This is a <strong>high-fidelity simulation</strong> of a crash game interface. 
                It is built strictly for <strong>educational and UI/UX demonstration</strong> purposes.
                <br /><br />
                <span className="text-amber-500/80">NO REAL MONEY IS INVOLVED. NO BETTING IS POSSIBLE.</span>
              </p>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
              >
                Enter Demo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
