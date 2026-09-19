'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SnakeStripProps } from '@/types/snakeProps';
import SnakeTail from './snakeTails';
import SnakeHead from './snakeHead';


const SnakeStrip: React.FC<SnakeStripProps> = ({
  decadeIdx,
  decade,
  boardState,
  handleSlotClick,
  wiggleSlot,
}) => {
  const isEvenDecade = decadeIdx % 2 === 1;

  // Calculates wave layout position (deterministic & hydration-safe)
  const getWaveYOffset = (index: number): number => {
    const waveAmplitude = 8; // Slightly reduced amplitude for small mobile viewports
    const frequency = (index / 9) * Math.PI * 3;
    return Number((Math.sin(frequency) * waveAmplitude).toFixed(2));
  };

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className={`p-2.5 sm:p-4 rounded-2xl md:rounded-3xl border ${decade.borderColor} ${decade.bgColor} backdrop-blur-md relative shadow-xl my-3 overflow-hidden group`}
    >
      {/* Decade Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
        <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${decade.textColor}`}>
          🐍 Snake Strip #{decadeIdx + 1}
        </span>
        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/60 shadow-sm">
          Decade: {decade.label}
        </span>
      </div>

      {/* Main Strip Container - Mobile Scroll/Flex Safe */}
      <div className="flex items-center gap-1 sm:gap-2 min-h-[70px] sm:min-h-[90px] overflow-x-auto no-scrollbar py-1">
        {/* Head or Tail Left */}
        {!isEvenDecade ? (
          <div className="flex-shrink-0 z-20 -mr-1.5 sm:-mr-2">
            <SnakeHead color={decade.snakeBody} />
          </div>
        ) : (
          <div className="flex-shrink-0 z-20 -mr-1.5 sm:-mr-2">
            <SnakeTail color={decade.snakeBody} reverse />
          </div>
        )}

        {/* Bouncy Grid Slot Area */}
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5 flex-grow min-w-[300px] sm:min-w-0 relative items-center py-2">
          {/* Underlying Curved Snake Body Spine */}
          <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-8 sm:h-12 pointer-events-none opacity-20 overflow-visible">
            <path
              d="M 0 24 Q 10% 0, 20% 24 T 40% 24 T 60% 24 T 80% 24 T 100% 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              className={decade.textColor}
            />
          </svg>

          {/* 10 Slot Buttons */}
          {Array.from({ length: 10 }, (_, i) => {
            const actualIndex = decadeIdx * 10 + i;
            const tileNum = actualIndex + 1;
            const isFilled = boardState[actualIndex] !== null;
            const isWiggling = wiggleSlot === actualIndex;
            const yOffset = getWaveYOffset(i);

            const wiggleAngle = i % 2 === 0 ? 3 : -3;

            return (
              <motion.button
                key={actualIndex}
                onClick={() => handleSlotClick(actualIndex)}
                style={{ y: yOffset }}
                variants={{
                  rest: { rotate: 0 },
                  hover: {
                    rotate: [0, wiggleAngle, -wiggleAngle, wiggleAngle, 0],
                    transition: {
                      duration: 0.5,
                      ease: 'easeInOut',
                      delay: i * 0.02,
                    },
                  },
                }}
                whileHover={{
                  scale: 1.15,
                  rotate: 0,
                  y: yOffset - 3,
                  zIndex: 30,
                  transition: { type: 'spring', stiffness: 500, damping: 15 },
                }}
                whileTap={{ scale: 0.88, rotate: 0 }}
                animate={isWiggling ? { x: [-6, 6, -4, 4, -2, 2, 0] } : undefined}
                className={`h-9 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center relative transition-colors duration-150 border sm:border-2 z-10 shadow-sm sm:shadow-md ${
                  isFilled
                    ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-amber-500/20'
                    : 'bg-slate-800/90 border-slate-700/80 text-slate-400 hover:bg-slate-700 hover:border-slate-400'
                }`}
              >
                {isFilled ? (
                  <span className="text-xs sm:text-base md:text-lg drop-shadow-md">
                    {boardState[actualIndex]}
                  </span>
                ) : (
                  <span className="opacity-30 text-[10px] sm:text-xs font-semibold">{tileNum}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Head or Tail Right */}
        {!isEvenDecade ? (
          <div className="flex-shrink-0 z-20 -ml-1.5 sm:-ml-2">
            <SnakeTail color={decade.snakeBody} />
          </div>
        ) : (
          <div className="flex-shrink-0 z-20 -ml-1.5 sm:-ml-2">
            <SnakeHead color={decade.snakeBody} reverse />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SnakeStrip;