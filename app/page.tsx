'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

// MASSIVE BANK: Puluhan variasi kalimat
const MASSIVE_QUESTION_BANK = [
  { text: "Siapa cewek paling keren dan pintar yang sebentar lagi bakal student exchange ke Thailand?", options: ["Orang lain", "Salma"], correct: "Salma" },
  { text: "Siapa yang bentar lagi bakal bawa nama baik kampusnya sampai ke Thailand?", options: ["Salma dong!", "Gatau"], correct: "Salma dong!" },
  { text: "Cewek mana yang pinternya kebangetan sampai tembus student exchange ke luar negeri?", options: ["Akuuu (Salma)", "Hmm siapa ya"], correct: "Akuuu (Salma)" },
  { text: "Siapa mahasiswa Kesmas dan Ambassador yang paling peduli sama lingkungan?", options: ["Salma", "Orang lewat"], correct: "Salma" },
  { text: "Duta lingkungan mana yang cantiknya natural dan peduli banget sama bumi?", options: ["Salma pastinya", "Rahasia"], correct: "Salma pastinya" },
  { text: "Siapa anak Kesmas yang selalu bikin Badar bangga luar biasa?", options: ["Salma, hehe", "Gatau ah"], correct: "Salma, hehe" },
  { text: "Siapa yang ngasih surprise ulang tahun paling the best di tanggal 10 Februari kemarin?", options: ["Rahasia", "Salma dan Keluarga"], correct: "Salma dan Keluarga" },
  { text: "Keluarga siapa yang super baik dan bikin ulang tahun ke-21 Badar jadi spesial banget?", options: ["Keluarganya Salma", "Lupa"], correct: "Keluarganya Salma" },
  { text: "Siapa mastermind di balik surprise kado terindah di bulan Februari?", options: ["Salma cintaku", "Siapa ya"], correct: "Salma cintaku" },
  { text: "Siapa yang nemenin belajar bareng dan punya kenangan seru waktu bimbel KUI 2023 dulu?", options: ["Lupa", "Salma, hehe"], correct: "Salma, hehe" },
  { text: "Siapa cewek cantik yang dulu ditembak pakai website khusus pake puisi romantis?", options: ["Aku (Salma)!", "Siapa ya..."], correct: "Aku (Salma)!" },
  { text: "Cewek mana yang pernah kejebak di tombol 'No' yang kabur-kaburan pas ditembak?", options: ["Salma wkwk", "Orang lain"], correct: "Salma wkwk" },
  { text: "Siapa teman seperjuangan bimbel KUI 2023 yang sekarang jadi pemenang hati Badar?", options: ["Salma!", "Gatau"], correct: "Salma!" },
  { text: "Siapa partner paling seru buat diajakin pose aneh-aneh di photobox?", options: ["Salma pastinya", "Orang lewat"], correct: "Salma pastinya" },
  { text: "Kalau lagi capek, pundak siapa yang selalu siap jadi tempat bersandar buat Salma?", options: ["Pundaknya Badar", "Tembok"], correct: "Pundaknya Badar" },
  { text: "Siapa yang senyumnya paling manis dan berhak bahagia banget hari ini?", options: ["Salma!", "Gatau"], correct: "Salma!" },
  { text: "Siapa yang kalau lagi overthinking tetap kelihatan gemesin?", options: ["Akuuu", "Dinding"], correct: "Akuuu" },
  { text: "Siapa yang badannya butuh istirahat, tapi hatinya selalu dipenuhi cinta dari Badar?", options: ["Salma sayang", "Orang gajelas"], correct: "Salma sayang" },
  { text: "Dan siapa yang selalu disayang, dibanggain, dan di-support penuh sama Badar gimanapun keadaannya?", options: ["Akuuu (Salma)", "Hmm siapa ya"], correct: "Akuuu (Salma)" }
];

// Sound effect helper
const playSound = (type: 'correct' | 'wrong' | 'complete') => {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'wrong') {
      oscillator.frequency.value = 200;
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === 'complete') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
      });
    }
  } catch (e) {
    // Silently fail if audio context is not supported
  }
};

// Haptic feedback
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    navigator.vibrate(patterns[type]);
  }
};

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Fixed TS typing for Sparkle Component
const Sparkle: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    initial={{ scale: 0, rotate: 0 }}
    animate={{ 
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      y: [-20, -60],
      x: [0, Math.random() * 40 - 20]
    }}
    transition={{ duration: 0.8, delay }}
    className="absolute text-2xl"
    style={{
      left: '50%',
      top: '50%'
    }}
  >
    ✨
  </motion.div>
);

export default function LoveTankApp() {
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState<string | null>(null);
  const [heartPulse, setHeartPulse] = useState(false);
  
  const questionQueue = useRef<any[]>([]);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    startNewRefill();
  }, []);

  // Heart beat effect when near completion
  useEffect(() => {
    if (progress >= 75 && progress < 100) {
      setHeartPulse(true);
      const interval = setInterval(() => {
        triggerHaptic('light');
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setHeartPulse(false);
    }
  }, [progress]);

  const startNewRefill = useCallback(() => {
    if (questionQueue.current.length < 4) {
      questionQueue.current = [...questionQueue.current, ...shuffleArray(MASSIVE_QUESTION_BANK)];
    }

    const nextQuestions = questionQueue.current.splice(0, 4);
    
    // Fixed implicitly 'any' error for q
    const randomizedOptions = nextQuestions.map((q: any) => ({
      ...q,
      options: shuffleArray([...q.options])
    }));
    
    setActiveQuestions(randomizedOptions);
    setCurrentQuestionIndex(0);
    setProgress(0);
    setIsCompleted(false);
    setWrongAttempts(0);
  }, []);

  const handleAnswer = (option: string, isCorrect: boolean) => {
    triggerHaptic('medium');
    
    if (isCorrect) {
      playSound('correct');
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
      
      const nextProgress = progress + 25;
      setProgress(nextProgress);
      setWrongAttempts(0);
      
      if (nextProgress >= 100) {
        triggerHaptic('heavy');
        playSound('complete');
        setTimeout(() => setIsCompleted(true), 1000);
      } else {
        // Fixed implicitly 'any' error for prev
        setTimeout(() => setCurrentQuestionIndex((prev: number) => prev + 1), 600);
      }
    } else {
      playSound('wrong');
      setShakingOption(option);
      // Fixed implicitly 'any' error for prev
      setWrongAttempts((prev: number) => prev + 1);
      
      if (wrongAttempts + 1 === 3) {
        setEasterEggMessage("Eh Salma, yang bener dong sayanggg 😅💕");
        setTimeout(() => setEasterEggMessage(null), 3000);
      }
      
      setTimeout(() => setShakingOption(null), 500);
    }
  };

  if (activeQuestions.length === 0) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-rose-50 to-white flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative">
      {isCompleted && windowSize.width > 0 && (
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={500} 
          gravity={0.15}
          colors={['#FFC0CB', '#FF69B4', '#FFB6C1', '#FF1493', '#FFF0F5']}
        />
      )}

      {/* Easter Egg Message */}
      <AnimatePresence>
        {easterEggMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="absolute top-8 z-50 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-pink-300"
          >
            <p className="text-pink-600 font-semibold">{easterEggMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md w-full flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-rose-800 mb-2 tracking-tight">
            Salma's Love Tank 🩷
          </h1>
          <p className="text-rose-600/80 font-medium">Refill Station</p>
        </motion.div>

        {/* Love Tank SVG with improved animation */}
        <div className="relative w-48 h-48 mb-12 drop-shadow-xl shrink-0">
          {showSparkles && (
            <>
              {[...Array(5)].map((_, i) => (
                <Sparkle key={i} delay={i * 0.1} />
              ))}
            </>
          )}
          
          <motion.svg 
            viewBox="0 0 32 32" 
            className="w-full h-full overflow-visible"
            animate={heartPulse ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 1,
              repeat: heartPulse ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <defs>
              <clipPath id="fill-clip">
                <motion.rect 
                  x="0" 
                  initial={{ y: 32, height: 0 }} 
                  animate={{ 
                    y: 32 - (32 * progress) / 100, 
                    height: (32 * progress) / 100 
                  }} 
                  transition={{ duration: 1.2, type: "spring", bounce: 0.3 }} 
                  width="32" 
                />
              </clipPath>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF69B4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FF1493" stopOpacity="1" />
                <stop offset="100%" stopColor="#C71585" stopOpacity="1" />
              </linearGradient>
            </defs>
            
            {/* Heart Outline */}
            <motion.path 
              d="M16 28.72a3 3 0 0 1-2.13-.88L3.57 17.54a8.72 8.72 0 0 1-2.52-6.25 8.06 8.06 0 0 1 8.14-8 8.18 8.18 0 0 1 6.81 3.39 8.18 8.18 0 0 1 6.81-3.39 8.06 8.06 0 0 1 8.14 8 8.72 8.72 0 0 1-2.52 6.25l-10.3 10.3A3 3 0 0 1 16 28.72Z" 
              fill="#ffe4e6" 
              stroke="#fb7185" 
              strokeWidth="0.5"
              animate={heartPulse ? {
                strokeWidth: [0.5, 0.7, 0.5]
              } : {}}
              transition={{
                duration: 1,
                repeat: heartPulse ? Infinity : 0,
              }}
            />
            
            {/* Liquid Fill with gradient */}
            <path 
              d="M16 28.72a3 3 0 0 1-2.13-.88L3.57 17.54a8.72 8.72 0 0 1-2.52-6.25 8.06 8.06 0 0 1 8.14-8 8.18 8.18 0 0 1 6.81 3.39 8.18 8.18 0 0 1 6.81-3.39 8.06 8.06 0 0 1 8.14 8 8.72 8.72 0 0 1-2.52 6.25l-10.3 10.3A3 3 0 0 1 16 28.72Z" 
              fill="url(#liquidGradient)" 
              clipPath="url(#fill-clip)" 
            />
          </motion.svg>
          
          {/* Percentage */}
          <div className="absolute inset-0 flex items-center justify-center mt-4">
            <motion.span
              key={progress}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-bold text-xl drop-shadow-md transition-colors duration-500"
              style={{ 
                color: progress > 50 ? 'white' : '#f43f5e',
                textShadow: progress > 50 ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {progress}%
            </motion.span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div 
              key={`quiz-${currentQuestionIndex}`} 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -50 }} 
              className="w-full bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-rose-100"
            >
              <p className="text-lg text-rose-900 font-medium text-center mb-6 h-24 flex items-center justify-center">
                {activeQuestions[currentQuestionIndex].text}
              </p>
              <div className="flex flex-col gap-3">
                {activeQuestions[currentQuestionIndex].options.map((option: string) => {
                  const isCorrect = option === activeQuestions[currentQuestionIndex].correct;
                  const isShaking = shakingOption === option;
                  
                  return (
                    <motion.button 
                      key={option} 
                      animate={isShaking ? { 
                        x: [-10, 10, -10, 10, 0],
                        rotate: [-2, 2, -2, 2, 0]
                      } : {}} 
                      transition={{ duration: 0.4 }} 
                      onClick={() => handleAnswer(option, isCorrect)} 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all shadow-sm text-center ${
                        isCorrect 
                          ? 'bg-linear-to-r from-rose-400 to-pink-400 text-white hover:from-rose-500 hover:to-pink-500 shadow-md hover:shadow-lg' 
                          : 'bg-white text-rose-700 border-2 border-rose-100 hover:border-rose-300 hover:bg-rose-50'
                      } active:scale-95`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="final" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8 }} 
              className="w-full flex flex-col items-center"
            >
              <motion.div 
                className="bg-white p-4 pb-10 shadow-2xl rounded-sm rotate-2 max-w-75 w-full border border-gray-100 mb-8"
                whileHover={{ rotate: 0, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-linear-to-br from-rose-100 to-pink-100 aspect-square w-full rounded-sm overflow-hidden relative">
                  <img 
                    src="/salma.jpg" 
                    alt="Salma" 
                    className="w-full h-full object-cover" 
                    onError={(e: any) => { 
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23ffe4e6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='%23fb7185'%3ESalma's%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' fill='%23fb7185'%3EPicture 💕%3C/text%3E%3C/svg%3E";
                    }} 
                  />
                </div>
                <p className="mt-6 font-serif italic text-rose-900 text-center text-[1.1rem] leading-relaxed px-2">
                  "Your love tank is now 100% full! ❤️ You are enough. I'm so proud of you, dan aku akan selalu support kamu buat tumbuh. Take all the time you need. Happy Sunday, Sayang!"
                </p>
              </motion.div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startNewRefill} 
                className="py-3 px-8 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Mau Refill Lagi? 🔋
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}