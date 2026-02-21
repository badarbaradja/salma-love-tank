'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

// MASSIVE BANK: Puluhan variasi kalimat agar terasa digenerate oleh AI
const MASSIVE_QUESTION_BANK = [
  // Seputar Thailand & Keren
  { text: "Siapa cewek paling keren dan pintar yang sebentar lagi bakal student exchange ke Thailand?", options: ["Orang lain", "Salma"], correct: "Salma" },
  { text: "Siapa yang bentar lagi bakal bawa nama baik kampusnya sampai ke Thailand?", options: ["Salma dong!", "Gatau"], correct: "Salma dong!" },
  { text: "Cewek mana yang pinternya kebangetan sampai tembus student exchange ke luar negeri?", options: ["Akuuu (Salma)", "Hmm siapa ya"], correct: "Akuuu (Salma)" },
  
  // Seputar Kesmas & Lingkungan
  { text: "Siapa mahasiswa Kesmas dan Ambassador yang paling peduli sama lingkungan?", options: ["Salma", "Orang lewat"], correct: "Salma" },
  { text: "Duta lingkungan mana yang cantiknya natural dan peduli banget sama bumi?", options: ["Salma pastinya", "Rahasia"], correct: "Salma pastinya" },
  { text: "Siapa anak Kesmas yang selalu bikin Badar bangga luar biasa?", options: ["Salma, hehe", "Gatau ah"], correct: "Salma, hehe" },

  // Seputar Kejutan Ulang Tahun 13 Feb
  { text: "Siapa yang ngasih surprise ulang tahun paling the best di tanggal 10 Februari kemarin?", options: ["Rahasia", "Salma dan Keluarga"], correct: "Salma dan Keluarga" },
  { text: "Keluarga siapa yang super baik dan bikin ulang tahun ke-21 Badar jadi spesial banget?", options: ["Keluarganya Salma", "Lupa"], correct: "Keluarganya Salma" },
  { text: "Siapa mastermind di balik surprise kado terindah di bulan Februari?", options: ["Salma cintaku", "Siapa ya"], correct: "Salma cintaku" },

  // Seputar KUI 2023 & Confess
  { text: "Siapa yang nemenin belajar bareng dan punya kenangan seru waktu bimbel KUI 2023 dulu?", options: ["Lupa", "Salma, hehe"], correct: "Salma, hehe" },
  { text: "Siapa cewek cantik yang dulu ditembak pakai website khusus pake puisi romantis?", options: ["Aku (Salma)!", "Siapa ya..."], correct: "Aku (Salma)!" },
  { text: "Cewek mana yang pernah kejebak di tombol 'No' yang kabur-kaburan pas ditembak?", options: ["Salma wkwk", "Orang lain"], correct: "Salma wkwk" },
  { text: "Siapa teman seperjuangan bimbel KUI 2023 yang sekarang jadi pemenang hati Badar?", options: ["Salma!", "Gatau"], correct: "Salma!" },

  // Seputar Photobox & Random Cute
  { text: "Siapa partner paling seru buat diajakin pose aneh-aneh di photobox?", options: ["Salma pastinya", "Orang lewat"], correct: "Salma pastinya" },
  { text: "Kalau lagi capek, pundak siapa yang selalu siap jadi tempat bersandar buat Salma?", options: ["Pundaknya Badar", "Tembok"], correct: "Pundaknya Badar" },
  { text: "Siapa yang senyumnya paling manis dan berhak bahagia banget hari ini?", options: ["Salma!", "Gatau"], correct: "Salma!" },
  { text: "Siapa yang kalau lagi overthinking tetap kelihatan gemesin?", options: ["Akuuu", "Dinding"], correct: "Akuuu" },
  { text: "Siapa yang badannya butuh istirahat, tapi hatinya selalu dipenuhi cinta dari Badar?", options: ["Salma sayang", "Orang gajelas"], correct: "Salma sayang" },
  { text: "Dan siapa yang selalu disayang, dibanggain, dan di-support penuh sama Badar gimanapun keadaannya?", options: ["Akuuu (Salma)", "Hmm siapa ya"], correct: "Akuuu (Salma)" }
];

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function LoveTankApp() {
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  // Menggunakan useRef untuk menyimpan tumpukan soal agar tidak me-render ulang layar secara tak perlu
  const questionQueue = useRef<any[]>([]);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    startNewRefill();
  }, []);

  const startNewRefill = useCallback(() => {
    // Jika tumpukan soal kurang dari 4, kita acak ULANG seluruh bank soal dan masukkan ke tumpukan
    if (questionQueue.current.length < 4) {
      questionQueue.current = [...questionQueue.current, ...shuffleArray(MASSIVE_QUESTION_BANK)];
    }

    // Ambil 4 soal teratas dari tumpukan, lalu hapus dari tumpukan tersebut (pop)
    const nextQuestions = questionQueue.current.splice(0, 4);
    
    // Acak posisi pilihan ganda agar makin susah ditebak
    const randomizedOptions = nextQuestions.map(q => ({
      ...q,
      options: shuffleArray([...q.options])
    }));
    
    setActiveQuestions(randomizedOptions);
    setCurrentQuestionIndex(0);
    setProgress(0);
    setIsCompleted(false);
  }, []);

  const handleAnswer = (option: string, isCorrect: boolean) => {
    if (isCorrect) {
      const nextProgress = progress + 25;
      setProgress(nextProgress);
      
      if (nextProgress >= 100) {
        setTimeout(() => setIsCompleted(true), 1000); 
      } else {
        setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 600);
      }
    } else {
      setShakingOption(option);
      setTimeout(() => setShakingOption(null), 500);
    }
  };

  if (activeQuestions.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#FFF5F6] flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      {isCompleted && windowSize.width > 0 && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.15} />
      )}

      <div className="max-w-md w-full flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rose-800 mb-2 tracking-tight">Salma's Love Tank 🩷</h1>
          <p className="text-rose-600/80 font-medium">Refill Station</p>
        </motion.div>

        {/* Love Tank SVG */}
        <div className="relative w-48 h-48 mb-12 drop-shadow-xl flex-shrink-0">
          <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
            <defs>
              <clipPath id="fill-clip">
                <motion.rect x="0" initial={{ y: 32, height: 0 }} animate={{ y: 32 - (32 * progress) / 100, height: (32 * progress) / 100 }} transition={{ duration: 1.2, type: "spring", bounce: 0.3 }} width="32" />
              </clipPath>
            </defs>
            <path d="M16 28.72a3 3 0 0 1-2.13-.88L3.57 17.54a8.72 8.72 0 0 1-2.52-6.25 8.06 8.06 0 0 1 8.14-8 8.18 8.18 0 0 1 6.81 3.39 8.18 8.18 0 0 1 6.81-3.39 8.06 8.06 0 0 1 8.14 8 8.72 8.72 0 0 1-2.52 6.25l-10.3 10.3A3 3 0 0 1 16 28.72Z" fill="#ffe4e6" stroke="#fb7185" strokeWidth="0.5" />
            <path d="M16 28.72a3 3 0 0 1-2.13-.88L3.57 17.54a8.72 8.72 0 0 1-2.52-6.25 8.06 8.06 0 0 1 8.14-8 8.18 8.18 0 0 1 6.81 3.39 8.18 8.18 0 0 1 6.81-3.39 8.06 8.06 0 0 1 8.14 8 8.72 8.72 0 0 1-2.52 6.25l-10.3 10.3A3 3 0 0 1 16 28.72Z" fill="#f43f5e" clipPath="url(#fill-clip)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center mt-4">
            <span className={`font-bold text-xl drop-shadow-md transition-colors duration-500 ${progress > 50 ? 'text-white' : 'text-rose-400'}`}>{progress}%</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div key={`quiz-${currentQuestionIndex}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-rose-100">
              <p className="text-lg text-rose-900 font-medium text-center mb-6 h-24 flex items-center justify-center">{activeQuestions[currentQuestionIndex].text}</p>
              <div className="flex flex-col gap-3">
                {activeQuestions[currentQuestionIndex].options.map((option: string) => {
                  const isCorrect = option === activeQuestions[currentQuestionIndex].correct;
                  const isShaking = shakingOption === option;
                  return (
                    <motion.button key={option} animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} onClick={() => handleAnswer(option, isCorrect)} className="w-full py-4 px-6 rounded-2xl font-semibold transition-all shadow-sm text-center bg-white text-rose-700 border-2 border-rose-100 hover:border-rose-300 hover:bg-rose-50 active:scale-95">
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="final" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="w-full flex flex-col items-center">
              <div className="bg-white p-4 pb-10 shadow-2xl rounded-sm rotate-2 max-w-[300px] w-full border border-gray-100 mb-8">
                <div className="bg-rose-50 aspect-square w-full rounded-sm overflow-hidden relative">
                  <img src="/salma.jpg" alt="Salma" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400/ffe4e6/be123c?text=Salma's+Picture+Here"; }} />
                </div>
                <p className="mt-6 font-serif italic text-rose-900 text-center text-[1.1rem] leading-relaxed px-2">"Your love tank is now 100% full! ❤️ You are enough. I'm so proud of you, and I will always support your growth. Take all the time you need. Happy Sunday, Sayang!"</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startNewRefill} className="py-3 px-8 bg-rose-500 text-white rounded-full font-bold shadow-lg hover:bg-rose-600 transition-colors">
                Mau Refill Lagi? 🔋
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}