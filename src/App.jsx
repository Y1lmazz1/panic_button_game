import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- SABİTLER ---
const COLORS = { RED: '#ff4444', BLUE: '#3399ff', GREEN: '#22ff88', YELLOW: '#ffcc00' };
const COLOR_NAMES = { RED: 'KIRMIZI', BLUE: 'MAVİ', GREEN: 'YEŞİL', YELLOW: 'SARI' };
const SHAPES = { TRIANGLE: 3, SQUARE: 4, PENTAGON: 5, STAR: 10 };
const KEY_OPTIONS = ['F', 'J', 'K', 'D', 'S', 'L'];
const INTRO_QUEUE = ['BASIC', 'GEOMETRY', 'STROOP', 'MATH', 'NEGATIVE'];

// --- SKOR TABLOSU HOOK ---
function useLeaderboard() {
  const [scores, setScores] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sys_lb') || '[]'); } catch { return []; }
  });
  const addScore = useCallback((s) => {
    setScores(prev => {
      const next = [...prev, { score: s, date: new Date().toLocaleDateString('tr-TR') }]
        .sort((a, b) => b.score - a.score).slice(0, 7);
      try { localStorage.setItem('sys_lb', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return [scores, addScore];
}

// --- TUTORIAL ---
const Tutorial = ({ onStart }) => (
  <div className="flex flex-col items-center max-w-md animate-in fade-in duration-700 p-6 text-center bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
    <div className="mb-1 text-[9px] tracking-[0.5em] text-zinc-600 uppercase">v2.4.1 // ERİŞİM PROTOKOLİ</div>
    <h2 className="text-orange-500 font-black tracking-[0.3em] mb-5 text-2xl">SİSTEM GİRİŞİ</h2>

    <div className="grid grid-cols-1 gap-2 text-left w-full mb-5">
      {[
        { id: '01', title: 'TEMEL GİRİŞ', desc: 'Butona gösterilen sayı kadar bas.', tip: '"2 kez bas" → 2 kez' },
        { id: '02', title: 'FORM ANALİZİ', desc: 'Şekil belirir ve kaybolur — köşe sayısı kadar bas.', tip: 'Üçgen=3 · Kare=4 · Beşgen=5 · Yıldız=10' },
        { id: '03', title: 'STROOP', desc: 'Yazının rengine göre hareket et, kelimeye değil.', tip: 'Alt yazı kaç kez basacağını söyler' },
        { id: '04', title: 'ARİTMETİK', desc: 'İşlemi hesapla, o kadar kez bas.', tip: '"5 + 3" → 8 kez' },
        { id: '05', title: 'NEGATİF FİLTRE', desc: 'Hariç tutulan rengi çıkar, kalan noktalar kadar bas.', tip: '4 nokta, 1 kırmızı hariç → 3 kez' },
      ].map(({ id, title, desc, tip }) => (
        <div key={id} className="flex items-start gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
          <span className="text-orange-500 font-black text-[10px] mt-0.5 shrink-0 w-5">{id}</span>
          <div>
            <strong className="text-white text-[11px] block mb-0.5">{title}</strong>
            <p className="text-zinc-400 text-[10px] leading-relaxed">{desc}</p>
            <p className="text-orange-400/60 text-[9px] mt-0.5">{tip}</p>
          </div>
        </div>
      ))}

      <div className="border border-zinc-700/60 rounded-xl p-3 bg-zinc-900/40 mt-1">
        <p className="text-zinc-500 text-[9px] uppercase tracking-widest text-center mb-2">— Skor 8+ sonrası devreye girer —</p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: '06', color: 'text-cyan-400', border: 'border-l-cyan-500/60', title: 'FARE TAKİBİ', desc: 'İmleç göründüğünde tıkla — ne olursa olsun.' },
            { id: '07', color: 'text-violet-400', border: 'border-l-violet-500/60', title: 'KLAVYE GİRİŞİ', desc: 'Belirtilen tuşa bas. Butona tıklama işe yaramaz.' },
            { id: '08', color: 'text-emerald-400', border: 'border-l-emerald-500/60', title: 'TUTMA PROTOKOLİ', desc: 'Butonu basılı tut, dairesel sayaç dolsun. Erken bırakırsan çöküş.' },
          ].map(({ id, color, border, title, desc }) => (
            <div key={id} className={`flex items-start gap-3 bg-zinc-900/60 border border-zinc-700/50 border-l-2 ${border} rounded-xl p-3`}>
              <span className={`${color} font-black text-[10px] mt-0.5 shrink-0 w-5`}>{id}</span>
              <div>
                <strong className="text-white text-[11px] block mb-0.5">{title}</strong>
                <p className="text-zinc-400 text-[10px]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex items-start gap-2 bg-zinc-900/60 border border-zinc-700/50 border-l-2 border-l-red-500/60 rounded-xl p-3">
          <span className="text-red-400 font-black text-[10px] shrink-0">⚠</span>
          <div>
            <strong className="text-white text-[11px] block mb-0.5">PARADOKS</strong>
            <p className="text-zinc-400 text-[10px]">"ASILSIZDIR" çıkarsa sonraki görevde 1 kez bas.</p>
          </div>
        </div>
        <div className="flex-1 flex items-start gap-2 bg-zinc-900/60 border border-zinc-700/50 border-l-2 border-l-yellow-500/60 rounded-xl p-3">
          <span className="text-yellow-400 font-black text-[10px] shrink-0">⚠</span>
          <div>
            <strong className="text-white text-[11px] block mb-0.5">KÖR NOKTA</strong>
            <p className="text-zinc-400 text-[10px]">Arayüz kararır — talimatı önceden ezberle.</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-2.5 text-center">
        <p className="text-zinc-600 text-[9px] uppercase tracking-widest">Fazla basarsan → çöküş &nbsp;·&nbsp; Süre biterse → çöküş</p>
      </div>
    </div>

    <button onClick={onStart} className="w-full py-4 border border-orange-500/50 bg-orange-500/5 text-orange-400 hover:bg-orange-500/15 active:scale-95 transition-all text-[11px] tracking-[0.5em] font-black uppercase rounded-xl">
      ANALİZİ ONAYLA VE BAŞLAT
    </button>
  </div>
);

// --- SKOR TABLOSU PANELİ ---
const Leaderboard = ({ scores }) => (
  <div className="w-48 flex flex-col gap-3">
    <div className="text-[8px] tracking-[0.4em] text-zinc-600 uppercase font-black text-center">En Yüksek Skorlar</div>
    <div className="flex flex-col gap-1.5">
      {scores.length === 0 && (
        <div className="text-zinc-700 text-[9px] text-center py-4 border border-zinc-800/50 rounded-lg">
          Henüz kayıt yok
        </div>
      )}
      {scores.map((entry, i) => (
        <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${i === 0 ? 'border-orange-500/40 bg-orange-500/5' : 'border-zinc-800/60 bg-zinc-900/40'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black w-4 ${i === 0 ? 'text-orange-400' : 'text-zinc-600'}`}>
              {i === 0 ? '👑' : `${i + 1}.`}
            </span>
            <span className={`text-[9px] ${i === 0 ? 'text-orange-300' : 'text-zinc-500'}`}>{entry.date}</span>
          </div>
          <span className={`text-[11px] font-black ${i === 0 ? 'text-orange-400' : 'text-zinc-400'}`}>{entry.score}</span>
        </div>
      ))}
    </div>
    {scores.length > 0 && (
      <div className="text-center">
        <div className="text-[8px] text-zinc-700 uppercase tracking-widest">rekor</div>
        <div className="text-2xl font-black text-orange-500">{scores[0]?.score}</div>
      </div>
    )}
  </div>
);

// --- ANA UYGULAMA ---
function App() {
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7);
  const [clickCount, setClickCount] = useState(0);
  const [currentTask, setCurrentTask] = useState({ text: '', subText: '', type: 'INIT', target: 0, color: '#fff' });
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [visualObj, setVisualObj] = useState(null);
  const [nextIsLying, setNextIsLying] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [negativeColorDots, setNegativeColorDots] = useState([]);
  const [cursorTarget, setCursorTarget] = useState(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [flashSuccess, setFlashSuccess] = useState(false);

  const [leaderboard, addScore] = useLeaderboard();

  const introIndexRef = useRef(0);
  const maxTimeRef = useRef(7);
  const scoreRef = useRef(score);
  const nextIsLyingRef = useRef(nextIsLying);
  const holdIntervalRef = useRef(null);
  const isHoldingRef = useRef(false);
  const isTaskDoneRef = useRef(isTaskDone);
  const currentTaskRef = useRef(currentTask);
  const gameStateRef = useRef(gameState);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { nextIsLyingRef.current = nextIsLying; }, [nextIsLying]);
  useEffect(() => { isTaskDoneRef.current = isTaskDone; }, [isTaskDone]);
  useEffect(() => { currentTaskRef.current = currentTask; }, [currentTask]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const getRank = () => {
    if (score < 4) return 'STAJYER ANALİST';
    if (score < 8) return 'SİSTEM TEKNİSYENİ';
    if (score < 12) return 'KIDEMLİ OPERATÖR';
    if (score < 18) return 'SİSTEM MİMARI';
    return 'KAOS MÜHENDİSİ';
  };

  const playClickSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180 + clickCount * 35, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }, [clickCount]);

  const playSuccessSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.15);
      });
    } catch (e) {}
  }, []);

  const triggerSuccess = useCallback(() => {
    setFlashSuccess(true);
    setTimeout(() => setFlashSuccess(false), 300);
    playSuccessSound();
  }, [playSuccessSound]);

  const generateTask = useCallback(() => {
    maxTimeRef.current = 7;
    setTimeLeft(7);
    setClickCount(0);
    setIsTaskDone(false);
    setVisualObj(null);
    setIsBlindMode(false);
    setNegativeColorDots([]);
    setCursorTarget(null);
    setCursorVisible(false);
    setHoldProgress(0);
    isHoldingRef.current = false;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    const currentScore = scoreRef.current;
    const isLyingNext = nextIsLyingRef.current;

    if (currentScore >= 6 && Math.random() > 0.6) {
      setTimeout(() => setIsBlindMode(true), 800);
    }

    if (currentScore >= 4 && Math.random() < 0.15 && !isLyingNext) {
      setNextIsLying(true);
      setCurrentTask({ text: 'ASILSIZDIR', subText: 'Bir sonraki görevde doğru cevap yerine 1 kez bas', type: 'PARADOX', color: '#ff4444', target: 0 });
      setTimeout(() => generateTask(), 2000);
      return;
    }

    const isLyingCurrent = isLyingNext;
    if (isLyingNext) setNextIsLying(false);

    let selectedType;
    if (introIndexRef.current < INTRO_QUEUE.length) {
      selectedType = INTRO_QUEUE[introIndexRef.current];
      introIndexRef.current++;
    } else {
      const pool = ['BASIC', 'GEOMETRY', 'STROOP', 'MATH', 'NEGATIVE'];
      if (currentScore >= 8) pool.push('CURSOR_CLICK', 'KEY_PRESS', 'HOLD');
      selectedType = pool[Math.floor(Math.random() * pool.length)];
    }

    switch (selectedType) {
      case 'GEOMETRY': {
        const shapeKeys = Object.keys(SHAPES);
        const shape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
        const gTarget = isLyingCurrent ? 1 : SHAPES[shape];
        setVisualObj(shape);
        setTimeout(() => setVisualObj(null), Math.max(1000 - currentScore * 60, 400));
        setCurrentTask({ text: 'FORM ANALİZİ', subText: isLyingCurrent ? '1 KEZ TETİKLE (PARADOKS)' : 'Şeklin köşe sayısı kadar bas', type: 'CLICK_WAIT', target: gTarget, color: '#fff' });
        break;
      }
      case 'STROOP': {
        const colorKeys = Object.keys(COLORS);
        const writtenColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        const actualColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        const stroopTarget = isLyingCurrent ? 1 : Math.floor(Math.random() * 2) + 2;
        setCurrentTask({ text: COLOR_NAMES[writtenColor], subText: isLyingCurrent ? '1 KEZ TETİKLE (PARADOKS)' : `Yazının rengine göre — ${stroopTarget} kez bas`, type: 'CLICK_WAIT', target: stroopTarget, color: COLORS[actualColor] });
        break;
      }
      case 'MATH': {
        const a = Math.floor(Math.random() * 5) + 3;
        const b = Math.floor(Math.random() * 3) + 1;
        const isAdd = Math.random() > 0.5;
        const mTarget = isLyingCurrent ? 1 : (isAdd ? a + b : a - b);
        setCurrentTask({ text: `${a} ${isAdd ? '+' : '-'} ${b}`, subText: isLyingCurrent ? '1 KEZ TETİKLE (PARADOKS)' : 'Sonucu hesapla, o kadar kez bas', type: 'CLICK_WAIT', target: mTarget, color: '#fff' });
        break;
      }
      case 'NEGATIVE': {
        const colorKeys = Object.keys(COLORS);
        const excludedColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        const allDots = [excludedColorKey];
        let excludedCount = 1;
        for (let i = 1; i < 4; i++) {
          const pick = colorKeys[Math.floor(Math.random() * colorKeys.length)];
          allDots.push(pick);
          if (pick === excludedColorKey) excludedCount++;
        }
        for (let i = allDots.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allDots[i], allDots[j]] = [allDots[j], allDots[i]];
        }
        const negTarget = isLyingCurrent ? 1 : (allDots.length - excludedCount);
        setNegativeColorDots(allDots);
        setCurrentTask({ text: `FİLTRE: ${COLOR_NAMES[excludedColorKey]}`, subText: isLyingCurrent ? '1 KEZ TETİKLE (PARADOKS)' : `${COLOR_NAMES[excludedColorKey]} hariç kalan noktalar kadar bas`, type: 'CLICK_WAIT', target: negTarget, color: '#fff' });
        break;
      }
      case 'CURSOR_CLICK': {
        const x = 10 + Math.random() * 80;
        const y = 5 + Math.random() * 60;
        setCurrentTask({ text: 'FARE TAKİBİ', subText: 'İmleci gördüğünde tıkla — ne olursa olsun', type: 'CURSOR_CLICK', target: 1, color: '#22ddff' });
        setTimeout(() => {
          if (gameStateRef.current !== 'PLAYING') return;
          setCursorTarget({ x, y });
          setCursorVisible(true);
          const disappearDelay = Math.max(2800 - currentScore * 80, 1000);
          setTimeout(() => {
            if (!isTaskDoneRef.current && currentTaskRef.current.type === 'CURSOR_CLICK' && gameStateRef.current === 'PLAYING') {
              setCursorVisible(false);
              setCursorTarget(null);
              setGameState('GAMEOVER');
            }
          }, disappearDelay);
        }, 500);
        break;
      }
      case 'KEY_PRESS': {
        const key = KEY_OPTIONS[Math.floor(Math.random() * KEY_OPTIONS.length)];
        setCurrentTask({ text: `TUŞA BAS`, subText: 'Klavyenden bu tuşa bas — butona tıklama işe yaramaz', type: 'KEY_PRESS', target: key, color: '#bb88ff' });
        break;
      }
      case 'HOLD': {
        const holdDuration = 2200 + Math.random() * 1300;
        setCurrentTask({ text: 'TUTMA PROTOKOLİ', subText: 'Butonu basılı tut — dairesel sayacı doldur', type: 'HOLD', target: holdDuration, color: '#44ffaa' });
        break;
      }
      default: {
        const bTarget = isLyingCurrent ? 1 : 2;
        setCurrentTask({ text: 'TEMEL GİRİŞ', subText: isLyingCurrent ? '1 KEZ TETİKLE (PARADOKS)' : '2 kez bas', type: 'CLICK_WAIT', target: bTarget, color: '#fff' });
      }
    }
  }, []);

  // Klavye dinleyici
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentTask.type !== 'KEY_PRESS') return;
    const handler = (e) => {
      if (e.key.toUpperCase() === currentTask.target) {
        triggerSuccess();
        setIsTaskDone(true);
      } else {
        setGameState('GAMEOVER');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, currentTask, triggerSuccess]);

  // Hold handlers
  const startHold = useCallback(() => {
    if (currentTaskRef.current.type !== 'HOLD' || isTaskDoneRef.current) return;
    isHoldingRef.current = true;
    const step = 80;
    const increment = (step / currentTaskRef.current.target) * 100;
    holdIntervalRef.current = setInterval(() => {
      if (!isHoldingRef.current) { clearInterval(holdIntervalRef.current); return; }
      setHoldProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(holdIntervalRef.current);
          triggerSuccess();
          setIsTaskDone(true);
          return 100;
        }
        return next;
      });
    }, step);
  }, [triggerSuccess]);

  const endHold = useCallback(() => {
    if (currentTaskRef.current.type !== 'HOLD') return;
    if (isHoldingRef.current && !isTaskDoneRef.current) {
      isHoldingRef.current = false;
      clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
      setGameState('GAMEOVER');
    }
  }, []);

  const handleAction = () => {
    if (gameState !== 'PLAYING') {
      setScore(0);
      introIndexRef.current = 0;
      setGameState('PLAYING');
      generateTask();
      return;
    }
    if (currentTask.type === 'HOLD' || currentTask.type === 'KEY_PRESS') return;
    if (currentTask.type === 'CURSOR_CLICK') {
      if (cursorVisible) {
        triggerSuccess();
        setCursorVisible(false);
        setCursorTarget(null);
        setIsTaskDone(true);
      } else {
        setGameState('GAMEOVER');
      }
      return;
    }
    if (currentTask.type === 'CLICK_WAIT') {
      playClickSound();
      const nextCount = clickCount + 1;
      setClickCount(nextCount);
      if (nextCount === currentTask.target) {
        triggerSuccess();
        setIsTaskDone(true);
      } else if (nextCount > currentTask.target) {
        setGameState('GAMEOVER');
      }
    }
  };

  // Universal timer — HOLD dahil, ama HOLD'da sadece timeout görevi geçirmez
  // İsTaskDone olunca her görevde bir sonrakine geçer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (currentTask.type === 'HOLD') {
      // HOLD'da timer yok — sadece isTaskDone izliyoruz
      return;
    }
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) { clearInterval(timer); return 0; }
        return +(prev - 0.1).toFixed(2);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [gameState, currentTask]);

  // Görev tamamlandıysa veya süre bittiyse
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const advance = () => {
      setScore(s => { const ns = s + 1; scoreRef.current = ns; return ns; });
      generateTask();
    };

    if (currentTask.type === 'HOLD') {
      if (isTaskDone) advance();
    } else {
      if (timeLeft === 0) {
        if (isTaskDone) advance();
        else setGameState('GAMEOVER');
      }
    }
  }, [timeLeft, isTaskDone, gameState, currentTask.type, generateTask]);

  // Game over → skoru kaydet
  useEffect(() => {
    if (gameState === 'GAMEOVER' && score > 0) {
      addScore(score);
    }
  }, [gameState]);

  const progressValue = currentTask.type === 'HOLD' ? holdProgress : (timeLeft / maxTimeRef.current) * 100;
  const progressColor = currentTask.type === 'HOLD' ? 'bg-emerald-500' : timeLeft < 1.5 ? 'bg-red-500 animate-pulse' : 'bg-blue-600';

  return (
    <div className={`min-h-screen w-full bg-[#030303] text-[#d1d1d1] font-mono select-none overflow-hidden transition-all duration-700 ${isBlindMode ? 'brightness-[0.07] blur-[5px]' : ''}`}>
      
      {/* Arka plan doku */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, #ffffff 24px, #ffffff 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, #ffffff 24px, #ffffff 25px)' }} />

      {/* Flash success overlay */}
      {flashSuccess && <div className="fixed inset-0 pointer-events-none bg-white/5 z-50 animate-ping" />}

      {gameState === 'START' ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Tutorial onStart={() => { setScore(0); introIndexRef.current = 0; setGameState('PLAYING'); generateTask(); }} />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen gap-10 px-8">

          {/* SOL: boşluk / ileride eklenebilir */}
          <div className="w-48 hidden lg:block" />

          {/* MERKEZ: oyun */}
          <div className="flex flex-col items-center flex-1 max-w-sm">

            {/* Üst header */}
            <div className="flex items-center justify-between w-full mb-6 px-1">
              <div className="text-[8px] tracking-[0.4em] text-zinc-700 uppercase">SİSTEM // AKTİF</div>
              <div className={`text-[8px] tracking-[0.3em] uppercase font-black px-2 py-1 rounded border ${gameState === 'GAMEOVER' ? 'text-red-500 border-red-500/30 bg-red-500/5' : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'}`}>
                {gameState === 'GAMEOVER' ? 'ÇÖKÜŞ' : '● CANLI'}
              </div>
            </div>

            {/* Üst görsel alan */}
            <div className="h-24 w-full flex items-center justify-center relative mb-6">
              {visualObj && (
                <div className="animate-in fade-in zoom-in duration-200">
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    {visualObj === 'TRIANGLE' && <polygon points="50,15 90,85 10,85" fill="none" stroke="#e4e4e4" strokeWidth="2.5" />}
                    {visualObj === 'SQUARE' && <rect x="20" y="20" width="60" height="60" fill="none" stroke="#e4e4e4" strokeWidth="2.5" />}
                    {visualObj === 'PENTAGON' && <polygon points="50,5 95,39 78,94 22,94 5,39" fill="none" stroke="#e4e4e4" strokeWidth="2.5" />}
                    {visualObj === 'STAR' && <polygon points="50,5 63,35 95,35 70,55 80,85 50,65 20,85 30,55 5,35 37,35" fill="none" stroke="#e4e4e4" strokeWidth="2" />}
                  </svg>
                </div>
              )}
              {negativeColorDots.length > 0 && (
                <div className="flex gap-4">
                  {negativeColorDots.map((colorKey, i) => (
                    <div key={i} className="w-7 h-7 rounded-full shadow-lg" style={{ backgroundColor: COLORS[colorKey], boxShadow: `0 0 12px ${COLORS[colorKey]}66` }} />
                  ))}
                </div>
              )}
              {/* Fare hedefi */}
              {cursorVisible && cursorTarget && (
                <div
                  className="absolute animate-in fade-in zoom-in duration-100 cursor-pointer z-10"
                  style={{ left: `${cursorTarget.x}%`, top: `${cursorTarget.y}%`, transform: 'translate(-50%,-50%)' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (gameStateRef.current === 'PLAYING' && currentTaskRef.current.type === 'CURSOR_CLICK') {
                      triggerSuccess();
                      setCursorVisible(false);
                      setCursorTarget(null);
                      setIsTaskDone(true);
                    }
                  }}
                >
                  <div className="w-11 h-11 rounded-full border-2 border-cyan-400 bg-cyan-400/10 flex items-center justify-center"
                    style={{ boxShadow: '0 0 20px rgba(34,221,255,0.5), inset 0 0 10px rgba(34,221,255,0.1)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22ddff" strokeWidth="2.5">
                      <path d="M5 3l14 9-7 2-2 7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Ana Buton */}
            <button
              onClick={handleAction}
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={(e) => { e.preventDefault(); startHold(); }}
              onTouchEnd={endHold}
              className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-150 active:scale-95
                ${gameState === 'GAMEOVER'
                  ? 'bg-[#1a0000] border-4 border-red-900/60'
                  : 'bg-[#0c0c0c] border-4 border-zinc-800/80 hover:border-zinc-700/80'}
              `}
              style={{
                boxShadow: gameState === 'GAMEOVER'
                  ? '0 0 60px rgba(255,0,0,0.1), 0 20px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)'
                  : '0 0 40px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)'
              }}
            >
              {/* HOLD dairesel progress */}
              {currentTask.type === 'HOLD' && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="47" fill="none" stroke="#111" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="47" fill="none" stroke="#44ffaa" strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 47}`}
                    strokeDashoffset={`${2 * Math.PI * 47 * (1 - holdProgress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.08s linear', filter: 'drop-shadow(0 0 6px rgba(68,255,170,0.6))' }}
                  />
                </svg>
              )}

              <div className={`flex flex-col items-center text-center px-6 transition-opacity duration-500 ${isBlindMode ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-[9px] mb-3 text-zinc-700 tracking-[0.4em] uppercase font-black">
                  {gameState === 'GAMEOVER' ? 'SYSTEM FAILURE' : getRank()}
                </span>
                <h1 style={{ color: currentTask.color, textShadow: `0 0 20px ${currentTask.color}44` }}
                  className="text-2xl font-black uppercase tracking-tighter leading-none mb-3">
                  {gameState === 'GAMEOVER' ? 'SİSTEM ÇÖKTÜ' : currentTask.text}
                </h1>
                <p className="text-[10px] text-zinc-500 max-w-[160px] font-bold tracking-tight leading-snug">
                  {gameState === 'GAMEOVER' ? `BAŞARI ORANI: %${Math.min(score * 5, 100)}` : currentTask.subText}
                </p>

                {/* KEY_PRESS büyük tuş */}
                {currentTask.type === 'KEY_PRESS' && !isBlindMode && (
                  <div className="mt-4 w-14 h-14 border-2 border-violet-500/60 rounded-xl flex items-center justify-center"
                    style={{ boxShadow: '0 0 16px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.05)', background: 'rgba(139,92,246,0.05)' }}>
                    <span className="text-violet-300 font-black text-3xl">{currentTask.target}</span>
                  </div>
                )}
              </div>
            </button>

            {/* Progress bar */}
            <div className="mt-10 w-full max-w-xs flex flex-col gap-3">
              <div className="relative w-full h-[2px] bg-zinc-900 rounded-full overflow-visible">
                <div className={`h-full rounded-full transition-all duration-100 ease-linear ${progressColor}`}
                  style={{ width: `${Math.max(0, progressValue)}%` }} />
              </div>
              <div className="flex justify-between text-[8px] tracking-widest text-zinc-700 uppercase font-black">
                <div>
                  <span>{currentTask.type === 'HOLD' ? 'TUTMA' : 'SÜRE'}</span>
                  <span className="text-zinc-500 ml-2">%{Math.max(0, Math.floor(progressValue))}</span>
                </div>
                <div className="text-right">
                  <span>SKOR</span>
                  <span className="text-zinc-400 ml-2 text-sm font-black">{score}</span>
                </div>
              </div>
            </div>

            {gameState === 'GAMEOVER' && (
              <button onClick={() => { setGameState('START'); setScore(0); }}
                className="mt-6 text-[9px] text-zinc-600 hover:text-orange-400 underline tracking-widest transition-colors">
                SİSTEMİ YENİDEN BAŞLAT
              </button>
            )}
          </div>

          {/* SAĞ: Skor tablosu */}
          <div className="hidden lg:block">
            <Leaderboard scores={leaderboard} />
          </div>

          {/* Mobil skor tablosu — altta */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-800 px-4 py-3">
            <div className="flex items-center justify-between max-w-sm mx-auto">
              <span className="text-[8px] tracking-widest text-zinc-600 uppercase">En İyi</span>
              <div className="flex gap-3">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <span key={i} className={`text-[10px] font-black ${i === 0 ? 'text-orange-400' : 'text-zinc-600'}`}>{entry.score}</span>
                ))}
                {leaderboard.length === 0 && <span className="text-zinc-700 text-[9px]">—</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;