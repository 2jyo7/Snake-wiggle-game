'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SnakeStripProps } from '@/types/snakeProps';
import SnakeHead from './snakeHead';
import SnakeTail from './snakeTails';

const SnakeStrip: React.FC<SnakeStripProps> = ({
  decadeIdx,
  decade,
  boardState,
  handleSlotClick,
  wiggleSlot,
}) => {
  const isEvenDecade = decadeIdx % 2 === 1;

  // Calculates a static wave layout position (deterministic & hydration-safe)
  const getWaveYOffset = (index: number): number => {
    const waveAmplitude = 20;
    const frequency = (index / 6) * Math.PI * 3;
    return Number((Math.sin(frequency) * waveAmplitude).toFixed(2));
  };

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className={`p-4 md:p-5 rounded-3xl border ${decade.borderColor} ${decade.bgColor} backdrop-blur-md relative shadow-xl my-4 overflow-visible group`}
    >
      {/* Decade Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <span className={`text-xs font-black uppercase tracking-wider ${decade.textColor}`}>
          🐍 Snake Strip #{decadeIdx + 1}
        </span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/60 shadow-sm">
          Numbers: {decade.label}
        </span>
      </div>

      {/* Main Strip Container */}
      <div className="flex items-center gap-1 md:gap-2 min-h-22.5 relative">
        {/* Head or Tail Left */}
        {!isEvenDecade ? (
          <div className="shrink-0 z-20 -mr-2 -translate-y-1">
            <SnakeHead color={decade.snakeBody} />
          </div>
        ) : (
          <div className="shrink-0 z-20 -mr-2 -translate-y-1">
            <SnakeTail color={decade.snakeBody} reverse />
          </div>
        )}

        {/* Bouncy Grid Slot Area */}
        <div className="grid grid-cols-10 gap-1.5 md:gap-2 grow relative items-center py-2">
          
          {/* Underlying Curved Snake Body Spine */}
          <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-12 pointer-events-none opacity-20 overflow-visible">
            <path
              d="M 0 24 Q 10% 0, 20% 24 T 40% 24 T 60% 24 T 80% 24 T 100% 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="18"
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

            // Alternating wiggle angles for the playful row animation
            const wiggleAngle = i % 2 === 0 ? 3 : -3;

            return (
              <motion.button
                key={actualIndex}
                onClick={() => handleSlotClick(actualIndex)}
                style={{ y: yOffset }}
                variants={{
                  rest: { rotate: 0 },
                  // Wiggles back and forth twice when the parent decade box is hovered
                  hover: {
                    rotate: [0, wiggleAngle, -wiggleAngle, wiggleAngle, 0],
                    transition: {
                      duration: 0.5,
                      ease: 'easeInOut',
                      delay: i * 0.02, // Staggered wave effect along the snake body!
                    },
                  },
                }}
                // Individual tile hover overrides the row wiggle and grounds the tile!
                whileHover={{
                  scale: 1.2,
                  rotate: 0, // Stops rotation so it's steady and easy to click
                  y: yOffset - 4, // Lifts slightly off the body
                  zIndex: 30,
                  transition: { type: 'spring', stiffness: 500, damping: 15 },
                }}
                whileTap={{ scale: 0.9, rotate: 0 }}
                animate={isWiggling ? { x: [-8, 8, -6, 6, -2, 2, 0] } : undefined}
                className={`h-12 md:h-14 rounded-2xl font-black text-sm md:text-base flex items-center justify-center relative transition-colors duration-150 border-2 z-10 shadow-md ${
                  isFilled
                    ? 'bg-slate-900 border-amber-400 text-amber-300 shadow-amber-500/20'
                    : 'bg-slate-800/90 border-slate-700/80 text-slate-400 hover:bg-slate-700 hover:border-slate-400'
                }`}
              >
                {isFilled ? (
                  <span className="text-base md:text-lg drop-shadow-md">{boardState[actualIndex]}</span>
                ) : (
                  <span className="opacity-30 text-xs font-semibold">{tileNum}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Head or Tail Right */}
        {!isEvenDecade ? (
          <div className="shrink-0 z-20 -ml-2 -translate-y-1">
            <SnakeTail color={decade.snakeBody} />
          </div>
        ) : (
          <div className="shrink-0 z-20 -ml-2 -translate-y-1">
            <SnakeHead color={decade.snakeBody} reverse />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SnakeStrip;