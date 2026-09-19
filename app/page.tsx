'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Trophy, Volume2, VolumeX, Star, Zap } from 'lucide-react';
import createShuffledPool from '@/util/createShuffledPool';
import { FeedbackState } from '@/types/feedbackState';
import { DECADES } from '@/snakeData/decades';
import STAR_PARTICLES from '@/util/starParticles';
import SnakeStrip from '@/util/snake_utils/snakeStrip';

export default function NumberSequenceGame() {
  // Lazy state initialization prevents setting state during rendering or initial mount effects
  const [boardState, setBoardState] = useState<(number | null)[]>(() => Array(100).fill(null));
  const [pool, setPool] = useState<number[]>(() => createShuffledPool());
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isBoxOpening, setIsBoxOpening] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [wiggleSlot, setWiggleSlot] = useState<number | null>(null);

  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Sound Ref Elements safely
  useEffect(() => {
    correctAudioRef.current = new Audio('/sounds/correct.mp3');
    winAudioRef.current = new Audio('/sounds/win.mp3');
    wrongAudioRef.current = new Audio('/sounds/wrong.mp3');
  }, []);

  // Web Audio API Fallback Synthesizer
  const playFallbackTone = useCallback((type: 'correct' | 'win' | 'wrong') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Ignore audio synthesis restrictions silently
    }
  }, []);

  const playSound = useCallback((type: 'correct' | 'win' | 'wrong') => {
    if (!soundEnabled) return;

    if (type === 'correct') {
      if (correctAudioRef.current) {
        correctAudioRef.current.currentTime = 0;
        correctAudioRef.current.play().catch(() => playFallbackTone(type));
      } else {
        playFallbackTone(type);
      }
    } else if (type === 'win') {
      if (winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(() => playFallbackTone(type));
      } else {
        playFallbackTone(type);
      }
    } else if (type === 'wrong') {
      if (wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play().catch(() => playFallbackTone(type));
      } else {
        playFallbackTone(type);
      }
    }
  }, [soundEnabled, playFallbackTone]);

  // Start/Reset Game State
  const initializeGame = useCallback(() => {
    const newPool = createShuffledPool();
    setPool(newPool);
    setBoardState(Array(100).fill(null));
    setCurrentNumber(null);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setShowCelebration(false);
  }, []);

  const drawNumber = () => {
    if (pool.length === 0 || currentNumber !== null) return;

    setIsBoxOpening(true);
    setTimeout(() => {
      const nextNum = pool[0];
      setPool((prev) => prev.slice(1));
      setCurrentNumber(nextNum);
      setIsBoxOpening(false);
    }, 450);
  };

  const handleSlotClick = (index: number) => {
    if (currentNumber === null) return;

    const expectedNumber = index + 1;

    if (expectedNumber === currentNumber) {
      playSound('correct');
      const newBoard = [...boardState];
      newBoard[index] = currentNumber;
      setBoardState(newBoard);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((prev) => prev + 10 + newStreak * 2);
      setCurrentNumber(null);

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 900);

      setFeedback({
        type: 'success',
        msg: `Awesome! ${expectedNumber} is right in its place!`,
      });

      if (pool.length === 0 && !newBoard.includes(null)) {
        playSound('win');
        setFeedback({
          type: 'success',
          msg: '🎉 YOU COMPLETED ALL 100 NUMBERS! YOU ARE A COUNTING SUPERSTAR!',
        });
      }
    } else {
      playSound('wrong');
      setWiggleSlot(index);
      setTimeout(() => setWiggleSlot(null), 350);
      setStreak(0);
      setFeedback({
        type: 'error',
        msg: `Oops! Where does ${currentNumber} belong? Try again!`,
      });
    }

    setTimeout(() => setFeedback(null), 2500);
  };

  const activeRange = useMemo(() => {
    if (currentNumber === null) return null;
    const decadeIndex = Math.floor((currentNumber - 1) / 10);
    return DECADES[decadeIndex].label;
  }, [currentNumber]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-2 sm:p-4 md:p-6 flex flex-col items-center select-none overflow-x-hidden">
      {/* Header Bar - Fully Responsive Stack */}
      <header className="w-full max-w-6xl flex flex-wrap sm:flex-nowrap justify-between items-center bg-slate-900/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl mb-4 sm:mb-6 backdrop-blur-xl gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-3 bg-linear-to-tr from-amber-400 to-yellow-500 rounded-xl sm:rounded-2xl text-slate-950 font-black text-lg sm:text-xl shadow-lg shadow-amber-500/20">
            100
          </div>
          <div>
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-yellow-200 to-amber-400 leading-tight">
              Snake Sequence Adventure
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Place numbers 1 to 100 on the snakes!</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto sm:ml-0">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border border-slate-700/60">
            <Trophy className="text-amber-400 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-extrabold text-xs sm:text-base text-amber-300">{score}</span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-1 sm:px-3 sm:py-1 rounded-xl sm:rounded-2xl text-amber-300 font-bold text-[10px] sm:text-xs">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300" />
              <span>{streak}x</span>
            </div>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl sm:rounded-2xl border border-slate-700 transition"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="text-emerald-400 w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="text-rose-400 w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <button
            onClick={initializeGame}
            className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl sm:rounded-2xl transition shadow-lg shadow-amber-500/20 flex items-center gap-1 text-xs sm:text-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Reset
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Mystery Box Controls - Compact Horizontal Layout on Mobile */}
        <div className="lg:col-span-1 bg-slate-900/80 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-row lg:flex-col items-center justify-around sm:justify-center text-center shadow-2xl backdrop-blur-md lg:sticky lg:top-6 gap-3 sm:gap-4">
          
          <div className="flex flex-col items-center">
            <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Surprise Box</h2>

            <motion.div
              animate={isBoxOpening ? { scale: [1, 1.08, 0.95, 1], rotate: [0, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              onClick={drawNumber}
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all border-2 sm:border-4 relative overflow-hidden ${
                currentNumber !== null
                  ? 'bg-slate-800 border-slate-700 cursor-not-allowed opacity-90'
                  : 'bg-linear-to-br from-purple-600 via-indigo-600 to-blue-700 border-purple-300 hover:scale-105 active:scale-95 shadow-purple-500/25'
              }`}
            >
              {currentNumber === null ? (
                <>
                  <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-yellow-300 mb-1 animate-pulse" />
                  <span className="font-black text-[10px] sm:text-xs tracking-wider text-purple-100">TAP TO DRAW</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-purple-200/70 mt-0.5">{pool.length} Left</span>
                </>
              ) : (
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 px-2 text-center">Place tile on board!</span>
              )}
            </motion.div>
          </div>

          {/* Current Drawn Tile Display */}
          <div className="flex flex-col items-center relative">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Drawn Number
            </span>

            <AnimatePresence mode="wait">
              {currentNumber !== null ? (
                <motion.div
                  key={currentNumber}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="w-18 h-18 sm:w-22 sm:h-22 bg-linear-to-tr from-amber-300 via-yellow-400 to-amber-500 text-slate-950 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center font-black shadow-xl border-2 border-white/80 ring-4 ring-amber-500/30 relative"
                >
                  <span className="text-2xl sm:text-3xl font-black">{currentNumber}</span>
                  {activeRange && (
                    <span className="text-[9px] sm:text-[10px] bg-slate-950/80 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full mt-0.5 border border-amber-500/40">
                      Decade {activeRange}
                    </span>
                  )}
                </motion.div>
              ) : (
                <div className="w-18 h-18 sm:w-22 sm:h-22 bg-slate-800/40 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-2xl sm:text-3xl font-bold">
                  ?
                </div>
              )}
            </AnimatePresence>

            {/* Star Particle Explosion on Correct Answer */}
            {showCelebration && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {STAR_PARTICLES.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: 0, y: 0, opacity: 1, scale: p.scale }}
                    animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute"
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300 drop-shadow-md" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full col-span-2 lg:col-span-1 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold border leading-relaxed text-center ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.msg}
            </motion.div>
          )}
        </div>

        {/* 10 Snake Strips Board */}
        <div className="lg:col-span-3 space-y-2 sm:space-y-4">
          {DECADES.map((decade, decadeIdx) => (
            <SnakeStrip
              key={decade.label}
              decadeIdx={decadeIdx}
              decade={decade}
              boardState={boardState}
              handleSlotClick={handleSlotClick}
              wiggleSlot={wiggleSlot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}