/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Scroll, User, ChevronRight, Loader2, Zap } from 'lucide-react';
import { FORTUNE_STICKS, Stick } from './constants';
import { interpretFortune, FortuneResult } from './services/gemini';
import { generateComicBackground } from './services/imageGen';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [step, setStep] = useState<'intro' | 'drawing' | 'result'>('intro');
  const [drawCount, setDrawCount] = useState(0);
  const [drawnSticks, setDrawnSticks] = useState<Stick[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [currentStick, setCurrentStick] = useState<Stick | null>(null);
  const [interpretations, setInterpretations] = useState<FortuneResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState('');
  const [bgImage, setBgImage] = useState<string>('');

  useEffect(() => {
    const loadBg = async () => {
      const img = await generateComicBackground();
      setBgImage(img);
    };
    loadBg();
  }, []);

  const handleStart = () => {
    if (!focus.trim()) {
      alert('请先输入您求签所问之事（如：事业、姻缘、健康）');
      return;
    }
    setStep('drawing');
  };

  const handleDraw = useCallback(() => {
    if (isShaking || drawCount >= 3) return;

    setIsShaking(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * FORTUNE_STICKS.length);
      const stick = FORTUNE_STICKS[randomIndex];
      
      setCurrentStick(stick);
      setDrawnSticks(prev => [...prev, stick]);
      setDrawCount(prev => prev + 1);
      setIsShaking(false);
    }, 2000);
  }, [isShaking, drawCount]);

  const handleNextStick = () => {
    setCurrentStick(null);
    if (drawCount === 3) {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setStep('result');
    try {
      const results = await Promise.all(
        drawnSticks.map(stick => interpretFortune(stick.verse, focus))
      );
      setInterpretations(results);
    } catch (error) {
      console.error('解签失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('intro');
    setDrawCount(0);
    setDrawnSticks([]);
    setInterpretations([]);
    setFocus('');
    setCurrentStick(null);
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] text-[#1a0f0a] overflow-hidden relative font-serif">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {bgImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
        <div className="absolute inset-0 halftone-bg" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto h-screen flex flex-col items-center justify-center p-6">
        
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotate: 5 }}
              className="text-center space-y-8 w-full"
            >
              <div className="space-y-2 relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-10 -right-10 opacity-50"
                >
                  <Zap size={80} className="text-[#f1c40f] fill-[#f1c40f]" />
                </motion.div>
                <h1 className="text-6xl font-chinese text-[#c0392b] comic-text-stroke drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">道观求签</h1>
                <p className="text-sm tracking-[0.3em] font-comic font-bold text-[#d35400]">MANHUA FORTUNE TELLER</p>
              </div>

              <div className="comic-card p-6 space-y-4 transform -rotate-1">
                <div className="flex items-center gap-3 text-[#d35400]">
                  <User size={24} strokeWidth={3} />
                  <span className="text-lg font-comic font-bold uppercase">求签者意图</span>
                </div>
                <textarea
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="心中默念所求之事..."
                  className="w-full bg-transparent border-b-4 border-black focus:border-[#d35400] outline-none py-2 resize-none h-24 text-xl font-comic placeholder:opacity-30"
                />
              </div>

              <button
                onClick={handleStart}
                className="w-full py-5 bg-[#c0392b] hover:bg-[#a93226] text-white comic-border rounded-lg font-comic font-bold text-2xl transform hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                虔诚入殿 <ChevronRight strokeWidth={4} />
              </button>
              
              <div className="bg-black text-white px-4 py-1 inline-block transform skew-x-12">
                <p className="text-sm font-comic italic">“心诚则灵，随缘而定”</p>
              </div>
            </motion.div>
          )}

          {step === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-between h-full py-12 w-full"
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={drawCount >= i ? { scale: [1, 1.5, 1], rotate: [0, 360, 0] } : {}}
                      className={cn(
                        "w-6 h-6 border-4 border-black rotate-45",
                        drawCount >= i ? "bg-[#f1c40f]" : "bg-white"
                      )}
                    />
                  ))}
                </div>
                <h2 className="text-4xl font-chinese comic-text-stroke text-white">第 {drawCount + 1} 次求签</h2>
                <p className="font-comic font-bold text-black bg-white px-2 py-1 inline-block">请点击签筒，虔诚摇晃！</p>
              </div>

              <div className="relative py-20">
                <motion.div
                  animate={isShaking ? {
                    rotate: [0, -15, 15, -15, 15, 0],
                    x: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ repeat: isShaking ? Infinity : 0, duration: 0.15 }}
                  className="cursor-pointer relative"
                  onClick={handleDraw}
                >
                  {isShaking && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1.5 }}
                      className="absolute -top-10 -left-10 z-20 font-comic font-black text-4xl text-[#c0392b] comic-text-stroke"
                    >
                      SHAKE!
                    </motion.div>
                  )}
                  
                  <svg width="140" height="200" viewBox="0 0 120 180" className="drop-shadow-[10px_10px_0px_rgba(0,0,0,0.5)]">
                    <path d="M20 40 L100 40 L110 170 L10 170 Z" fill="#4a3728" stroke="#000" strokeWidth="6" />
                    <rect x="30" y="10" width="10" height="70" fill="#d35400" stroke="#000" strokeWidth="3" rx="2" transform="rotate(-15 34 40)" />
                    <rect x="50" y="5" width="10" height="70" fill="#d35400" stroke="#000" strokeWidth="3" rx="2" />
                    <rect x="70" y="12" width="10" height="70" fill="#d35400" stroke="#000" strokeWidth="3" rx="2" transform="rotate(10 74 42)" />
                    <rect x="85" y="20" width="10" height="70" fill="#d35400" stroke="#000" strokeWidth="3" rx="2" transform="rotate(25 89 50)" />
                    <rect x="15" y="25" width="10" height="70" fill="#d35400" stroke="#000" strokeWidth="3" rx="2" transform="rotate(-30 19 55)" />
                    <rect x="15" y="80" width="90" height="6" fill="#000" />
                    <rect x="12" y="140" width="96" height="6" fill="#000" />
                  </svg>
                </motion.div>

                <AnimatePresence>
                  {currentStick && (
                    <motion.div
                      initial={{ y: -50, opacity: 0, rotate: 0, scale: 0.5 }}
                      animate={{ y: 180, opacity: 1, rotate: 15, scale: 1.2 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
                    >
                      <div className="w-10 h-60 bg-[#f1c40f] rounded-sm border-4 border-black flex items-center justify-center shadow-[5px_5px_0px_rgba(0,0,0,1)]">
                        <span className="chinese-text text-black font-chinese text-xl font-bold p-1">
                          {currentStick.verse.slice(0, 4)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full">
                {currentStick ? (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNextStick}
                    className="w-full py-5 bg-[#d35400] text-white comic-border rounded-lg font-comic font-bold text-xl flex items-center justify-center gap-2"
                  >
                    {drawCount < 3 ? "NEXT STICK!" : "REVEAL FATE!"} <ChevronRight strokeWidth={4} />
                  </motion.button>
                ) : (
                  <div className="h-14 flex items-center justify-center font-comic font-bold text-xl text-black bg-white/50 comic-border px-4">
                    {isShaking ? "RUMBLE RUMBLE..." : "CLICK TO SHAKE!"}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-6 overflow-y-auto max-h-full pb-12 scrollbar-hide"
            >
              <div className="text-center sticky top-0 bg-white/90 backdrop-blur comic-border py-4 z-20 transform -rotate-1">
                <h2 className="text-4xl font-chinese text-[#c0392b] comic-text-stroke">三签定乾坤</h2>
                <p className="font-comic font-bold text-black tracking-widest mt-1">THE TRIPLE REVELATION</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <RefreshCw className="text-[#d35400]" size={64} strokeWidth={4} />
                  </motion.div>
                  <p className="font-comic text-2xl font-black uppercase italic">Master is thinking...</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {interpretations.map((res, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className={cn(
                        "comic-card overflow-hidden transform",
                        i % 2 === 0 ? "rotate-1" : "-rotate-1"
                      )}
                    >
                      <div className="bg-black p-3 flex justify-between items-center px-6">
                        <span className="font-comic font-black text-xl text-white">#{i + 1} · {res.level}</span>
                        <Sparkles size={20} className="text-[#f1c40f] fill-[#f1c40f]" />
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex justify-center">
                          <div className="chinese-text text-3xl font-chinese text-[#c0392b] border-4 border-black px-6 py-4 bg-[#fdf6e3]">
                            {res.verse}
                          </div>
                        </div>
                        <div className="space-y-4 font-comic">
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-white bg-black px-2 py-1 inline-block">MEANING</h4>
                            <p className="text-lg leading-tight font-bold">{res.meaning}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-black bg-[#f1c40f] px-2 py-1 inline-block">ADVICE</h4>
                            <p className="text-lg leading-tight font-bold italic text-[#c0392b]">{res.advice}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="pt-6 space-y-6">
                    <div className="comic-card p-6 bg-[#f1c40f] text-center transform rotate-2">
                      <p className="font-comic font-black text-sm uppercase mb-2">FINAL VERDICT</p>
                      <p className="text-xl font-bold italic">“凡事不可强求，顺应天时，自有转机。”</p>
                    </div>
                    
                    <button
                      onClick={reset}
                      className="w-full py-5 bg-black text-white comic-border rounded-lg font-comic font-bold text-2xl transform hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={24} strokeWidth={3} /> TRY AGAIN!
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-4 left-4 opacity-10 pointer-events-none">
        <Scroll size={120} className="text-black" strokeWidth={3} />
      </div>
      <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
        <Sparkles size={100} className="text-black" strokeWidth={3} />
      </div>
    </div>
  );
}
