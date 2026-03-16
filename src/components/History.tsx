import React from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon } from 'lucide-react';

interface HistoryProps {
  history: number[];
}

export const History: React.FC<HistoryProps> = ({ history }) => {
  const getBadgeStyle = (val: number) => {
    if (val >= 10.0) return 'bg-[#c017b4] text-white'; // Pink/Red
    if (val >= 2.0) return 'bg-[#913ef8] text-white'; // Purple
    return 'bg-[#4e72e6] text-white'; // Blue
  };

  return (
    <div className="h-[34px] flex-shrink-0 bg-[#14151b] border-b border-white/5 flex items-center px-4 overflow-hidden">
      <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {history.length === 0 && (
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Round History</span>
        )}
        {history.map((val, i) => (
          <motion.div
            key={`${i}-${val}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex-shrink-0 px-3 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${getBadgeStyle(val)}`}
          >
            {val.toFixed(2)}x
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 ml-4 border-l border-white/10 pl-4 h-full">
        <button className="text-gray-500 hover:text-white transition-colors">
          <HistoryIcon size={14} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};
