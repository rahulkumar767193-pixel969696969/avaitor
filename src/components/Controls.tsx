import React from 'react';
import { Minus, Plus, Settings2, Coins } from 'lucide-react';

interface ControlsProps {
  gameState: 'IDLE' | 'LOADING' | 'FLYING' | 'CRASHED' | 'CASHED_OUT';
  onStart: () => void;
  onCashOut: () => void;
  autoCashOut: string;
  setAutoCashOut: (val: string) => void;
  lastMultiplier: number;
}

const ControlPanel: React.FC<{
  gameState: 'IDLE' | 'LOADING' | 'FLYING' | 'CRASHED' | 'CASHED_OUT';
  onStart: () => void;
  onCashOut: () => void;
  autoCashOut: string;
  setAutoCashOut: (val: string) => void;
  lastMultiplier: number;
}> = ({ gameState, onStart, onCashOut, autoCashOut, setAutoCashOut, lastMultiplier }) => {
  const [amount, setAmount] = React.useState('20.00');
  const [activeTab, setActiveTab] = React.useState<'BET' | 'AUTO'>('BET');
  const [autoBet, setAutoBet] = React.useState(false);
  const [autoCashOutEnabled, setAutoCashOutEnabled] = React.useState(false);

  const adjustAmount = (delta: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(Math.max(1, current + delta).toFixed(2));
  };

  const isActionDisabled = gameState === 'LOADING' || gameState === 'FLYING';

  return (
    <div className="flex-1 bg-[#1b1c24] rounded-2xl p-3 flex flex-col gap-3 border border-white/5">
      {/* Tabs */}
      <div className="flex bg-black/40 p-1 rounded-full w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('BET')}
          className={`px-6 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'BET' ? 'bg-[#2c2d35] text-white' : 'text-gray-500'}`}
        >
          Bet
        </button>
        <button 
          onClick={() => setActiveTab('AUTO')}
          className={`px-6 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeTab === 'AUTO' ? 'bg-[#2c2d35] text-white' : 'text-gray-500'}`}
        >
          Auto
        </button>
      </div>

      <div className="flex gap-3">
        {/* Amount Controls */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
            <button 
              onClick={() => adjustAmount(-1)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Minus size={16} strokeWidth={3} />
            </button>
            <input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-center text-sm font-black focus:outline-none"
            />
            <button 
              onClick={() => adjustAmount(1)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {['20.00', '50.00', '100.00', '500.00'].map(val => (
              <button 
                key={val}
                onClick={() => setAmount(val)}
                className="py-1 bg-[#2c2d35] hover:bg-[#3a3b45] rounded-lg text-[10px] font-black transition-colors border border-white/5"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Main Action Button */}
        <div className="flex-1">
          {gameState === 'FLYING' ? (
            <button
              onClick={onCashOut}
              className="w-full h-full bg-gradient-to-b from-[#ffb800] to-[#d49a00] hover:from-[#ffc42e] hover:to-[#e5a800] rounded-2xl flex flex-col items-center justify-center gap-1 shadow-[0_8px_0_#9e7300] active:translate-y-1 active:shadow-none transition-all group"
            >
              <span className="text-[10px] font-black text-black/60 uppercase tracking-widest leading-none">CASH OUT</span>
              <span className="text-2xl font-black text-black leading-none">{(parseFloat(amount) * lastMultiplier).toFixed(2)} ARS</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={isActionDisabled}
              className={`w-full h-full bg-gradient-to-b from-[#28a745] to-[#1e7e34] hover:from-[#2ebc4e] hover:to-[#218838] rounded-2xl flex flex-col items-center justify-center gap-1 shadow-[0_8px_0_#155d25] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-1`}
            >
              <span className="text-sm font-black text-white uppercase tracking-widest leading-none">BET</span>
              <span className="text-xl font-black text-white leading-none">{amount} ARS</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto Toggles */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAutoBet(!autoBet)}
              className={`w-8 h-4 rounded-full relative transition-colors ${autoBet ? 'bg-[#28a745]' : 'bg-[#2c2d35]'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoBet ? 'right-0.5' : 'left-0.5'}`} />
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto Bet</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAutoCashOutEnabled(!autoCashOutEnabled)}
              className={`w-8 h-4 rounded-full relative transition-colors ${autoCashOutEnabled ? 'bg-[#28a745]' : 'bg-[#2c2d35]'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoCashOutEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto Cash Out</span>
            <input 
              type="text" 
              value={autoCashOut}
              onChange={(e) => setAutoCashOut(e.target.value)}
              className="w-12 bg-black/40 rounded px-1 text-[10px] font-black text-center focus:outline-none border border-white/5"
            />
            <span className="text-[10px] font-black text-gray-500">x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Controls: React.FC<ControlsProps> = (props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
      <ControlPanel {...props} />
      <ControlPanel {...props} />
    </div>
  );
};
