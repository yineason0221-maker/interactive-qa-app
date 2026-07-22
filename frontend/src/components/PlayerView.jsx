import React, { useState, useEffect, useRef } from 'react';
import EffectsCanvas from './EffectsCanvas';
import AudioPlayer from './AudioPlayer';
import { Maximize, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';

export default function PlayerView({ steps, settings, onLogEvent, onRecordAnswer, onFinishSession, onStartSession }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [multiSelectValue, setMultiSelectValue] = useState([]);
  const [nickname, setNickname] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [subtitleOpacity, setSubtitleOpacity] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const [escapeClicks, setEscapeClicks] = useState({});
  const optionContainerRef = useRef(null);

  const stepTimerRef = useRef(null);
  const currentStep = steps[currentStepIndex];
  const effectiveBgmUrl = currentStep?.content?.bgm_url || settings.bgm_url || '';

  const isNicknameQuestion = (step) => {
    return currentStepIndex === 0 || step.title.includes('暱稱') || step.title.includes('名字');
  };

  const hashStr = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const playOptionSound = (url) => {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleEscapeOptionClick = (opt, meta) => {
    const clicksNeeded = meta.clicksNeeded || 3;
    if (meta.soundEffect) playOptionSound(meta.soundEffect);

    setEscapeClicks(prev => {
      const newCount = (prev[opt] || 0) + 1;
      if (newCount < clicksNeeded) {
        onLogEvent('ESCAPE_CLICK', `Clicked "${opt}" (${newCount}/${clicksNeeded})`);
      } else {
        onLogEvent('ESCAPE_CAPTURED', `Captured "${opt}" after ${clicksNeeded} clicks`);
        handleOptionSelected(opt, meta);
      }
      return { ...prev, [opt]: newCount };
    });
  };

  const handleOptionSelected = (opt, meta) => {
    if (!currentStep) return;

    let targetIndex = currentStepIndex + 1;

    if (meta?.nextStepId) {
      const foundIndex = steps.findIndex(s => s.id === meta.nextStepId);
      if (foundIndex >= 0) targetIndex = foundIndex;
    }

    const branches = currentStep.content.branches || {};
    if (branches[opt] !== undefined && !meta?.nextStepId) {
      const foundIndex = steps.findIndex(s => s.id === branches[opt]);
      if (foundIndex >= 0) targetIndex = foundIndex;
    }

    if (isNicknameQuestion(currentStep)) {
      if (typeof opt === 'string' && opt.trim()) {
        setNickname(opt.trim());
      }
    }

    if (meta?.soundEffect) playOptionSound(meta.soundEffect);

    setAnswers(prev => ({ ...prev, [currentStep.id]: opt }));
    onRecordAnswer({
      stepId: currentStep.id,
      stepTitle: currentStep.title,
      questionText: currentStep.content.questionText,
      answerValue: opt,
      nickname
    });

    if (targetIndex < steps.length) {
      setCurrentStepIndex(targetIndex);
    } else {
      setCompleted(true);
      const totalSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);
      onFinishSession(nickname || 'Anonymous', totalSeconds);
      onLogEvent('FINISHED_JOURNEY', `Total time spent: ${totalSeconds}s`);
    }
  };

  const handleQuestionSubmit = (overrideVal) => {
    if (!currentStep) return;
    const finalAns = overrideVal !== undefined ? overrideVal : (currentStep.content.questionType === 'multi_choice' ? multiSelectValue : currentInputValue);

    if (isNicknameQuestion(currentStep)) {
      if (typeof finalAns === 'string' && finalAns.trim()) {
        setNickname(finalAns.trim());
      }
    }

    setAnswers(prev => ({ ...prev, [currentStep.id]: finalAns }));
    onRecordAnswer({
      stepId: currentStep.id,
      stepTitle: currentStep.title,
      questionText: currentStep.content.questionText,
      answerValue: Array.isArray(finalAns) ? finalAns.join(', ') : finalAns,
      nickname
    });

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      const totalSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);
      onFinishSession(nickname || 'Anonymous', totalSeconds);
      onLogEvent('FINISHED_JOURNEY', `Total time spent: ${totalSeconds}s`);
    }
  };

  const goToNextStep = () => {
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    onLogEvent('STEP_COMPLETED', `Completed step index ${currentStepIndex}: ${currentStep?.title}`);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      const totalSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);
      onFinishSession(nickname || 'Anonymous', totalSeconds);
      onLogEvent('FINISHED_JOURNEY', `Total time spent: ${totalSeconds}s`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        onLogEvent('ENTER_FULLSCREEN', 'User enabled fullscreen');
      }).catch(err => console.log('Fullscreen request denied:', err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
        onLogEvent('EXIT_FULLSCREEN', 'User exited fullscreen');
      }
    }
  };

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleStart = () => {
    if (settings.force_fullscreen === 'true') toggleFullscreen();
    onStartSession();
    setIsStarted(true);
    setStartTime(Date.now());
    setCurrentStepIndex(0);
    onLogEvent('START_JOURNEY', 'User clicked start journey');
  };

  useEffect(() => {
    if (!isStarted || !currentStep) return;
    setEscapeClicks({});
  }, [currentStepIndex, isStarted]);

  useEffect(() => {
    if (!isStarted || !currentStep) return;

    if (currentStep.type === 'subtitle') {
      const content = currentStep.content || {};
      const duration = (content.duration || 4) * 1000;
      const fadeIn = (content.fadeIn || 1) * 1000;
      const fadeOut = (content.fadeOut || 1) * 1000;

      setSubtitleOpacity(0);
      const fadeInTimer = setTimeout(() => setSubtitleOpacity(1), 50);
      const fadeOutTimer = setTimeout(() => setSubtitleOpacity(0), duration - fadeOut);
      stepTimerRef.current = setTimeout(goToNextStep, duration);

      return () => {
        clearTimeout(fadeInTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(stepTimerRef.current);
      };
    }

    if (currentStep.type === 'question') {
      setCurrentInputValue(answers[currentStep.id] || '');
      setMultiSelectValue(Array.isArray(answers[currentStep.id]) ? answers[currentStep.id] : []);
    }
  }, [currentStepIndex, isStarted]);

  // Render Cover / Start Screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-2xl space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white glitch-text">
            {settings.site_title || '神秘問答體驗'}
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light tracking-widest leading-relaxed">
            一個屬於我們的沉浸式故事與問答旅程。<br />
            請在安靜且不受打擾的環境下開始。
          </p>

          <div className="pt-6">
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              <span>點擊開始體驗</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="pt-8">
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
            >
              <Maximize className="w-4 h-4" />
              <span>{isFullscreen ? '全螢幕已開啟' : '切換全螢幕 (推薦)'}</span>
            </button>
          </div>
        </div>

        {effectiveBgmUrl && <AudioPlayer src={effectiveBgmUrl} />}
      </div>
    );
  }

  // Render Completed / Ending Screen
  if (completed) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-xl space-y-6">
          <CheckCircle2 className="w-20 h-20 text-white mx-auto animate-bounce" />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">問答旅程已結束</h2>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            感謝你的認真作答與寶貴回應。<br />
            所有的回答與想法都已經安全記錄。
          </p>
          <div className="pt-8">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-300 hover:text-white hover:border-white rounded-full transition-all text-sm font-mono"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新體驗</span>
            </button>
          </div>
        </div>
        {effectiveBgmUrl && <AudioPlayer src={effectiveBgmUrl} />}
      </div>
    );
  }

  const options = currentStep?.content?.options || [];
  const optionMeta = currentStep?.content?.optionMeta || {};

  const isNormalOption = (opt) => {
    const meta = optionMeta[opt] || {};
    const clicksNeeded = meta.clicksNeeded || 1;
    const isEscape = meta.behavior === 'escape';
    const captured = isEscape && (escapeClicks[opt] || 0) >= clicksNeeded;
    return !isEscape || captured;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
      {/* Top Header Progress */}
      <div className="flex justify-between items-center text-xs font-mono text-zinc-600 z-20">
        <div>STEP {currentStepIndex + 1} / {steps.length}</div>
        <div>{currentStep?.title || 'Interactive'}</div>
      </div>

      {/* Main Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto z-20 max-w-4xl mx-auto w-full text-center">
        {/* SUBTITLE STEP */}
        {currentStep.type === 'subtitle' && (
          <div
            onClick={goToNextStep}
            className="cursor-pointer transition-opacity duration-700 w-full"
            style={{ opacity: subtitleOpacity }}
          >
            <p className={`font-medium tracking-wide leading-relaxed text-white ${
              currentStep.content.textSize === 'large' ? 'text-4xl md:text-6xl' : 'text-2xl md:text-4xl'
            }`}>
              {currentStep.content.text}
            </p>
            <div className="mt-12 text-xs text-zinc-600 font-mono tracking-widest animate-pulse">
              [ 點擊任意處可跳過 ]
            </div>
          </div>
        )}

        {/* QUESTION STEP */}
        {currentStep.type === 'question' && (
          <div className="w-full space-y-8 animate-fade-in text-left md:text-center">
            <h3 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              {currentStep.content.questionText}
            </h3>

            {currentStep.content.questionType === 'text' && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <textarea
                  rows={4}
                  value={currentInputValue}
                  onChange={(e) => setCurrentInputValue(e.target.value)}
                  placeholder="輸入你的回答..."
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-2xl p-5 text-xl focus:border-white focus:outline-none transition-all resize-none"
                  autoFocus
                />
                <button
                  onClick={() => handleQuestionSubmit()}
                  disabled={currentStep.content.required && !currentInputValue.trim()}
                  className="w-full py-4 bg-white text-black font-bold text-lg rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                >
                  確認，下一題
                </button>
              </div>
            )}

            {currentStep.content.questionType === 'single_choice' && options.length > 0 && (
              <div className="relative max-w-3xl mx-auto pt-4" ref={optionsContainerRef} style={{ minHeight: options.some(o => (optionMeta[o] || {}).behavior === 'escape') ? '500px' : 'auto' }}>
                {/* Normal options in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt, idx) => {
                    if (!isNormalOption(opt)) return null;
                    const meta = optionMeta[opt] || {};
                    const hasBranch = meta.nextStepId || (currentStep.content.branches && currentStep.content.branches[opt]);
                    const isEscapeCaptured = (meta.behavior === 'escape');
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelected(opt, meta)}
                        className="p-6 text-left border border-zinc-800 bg-zinc-950/80 rounded-2xl hover:border-white hover:bg-zinc-900 transition-all text-xl font-medium text-white flex items-center justify-between group"
                      >
                        <span>{opt}{isEscapeCaptured && <span className="text-green-400 text-sm ml-2">(已捕獲)</span>}</span>
                        <div className="flex items-center gap-2">
                          {hasBranch && <span className="text-[10px] text-zinc-500 font-mono">BRANCH</span>}
                          <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Escape options (floating) */}
                {options.map((opt, idx) => {
                  const meta = optionMeta[opt] || {};
                  if (meta.behavior !== 'escape') return null;
                  const clicksNeeded = meta.clicksNeeded || 3;
                  const currentClicks = escapeClicks[opt] || 0;

                  const rect = optionsContainerRef.current?.getBoundingClientRect();
                  const cw = rect ? rect.width : 600;
                  const ch = rect ? rect.height : 500;
                  const pad = 140;
                  const randX = (hashStr(opt + currentStepIndex + currentClicks) % 100) / 100;
                  const randY = (hashStr(opt + 'y' + currentStepIndex * 2 + currentClicks * 3) % 100) / 100;
                  const posX = pad + randX * Math.max(cw - pad * 2 - 200, 100);
                  const posY = pad + randY * Math.max(ch - pad * 2 - 80, 60);

                  return (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); handleEscapeOptionClick(opt, meta); }}
                      className="p-5 border-2 border-zinc-600 bg-zinc-900/90 rounded-2xl hover:border-white transition-all text-lg font-medium text-white shadow-2xl"
                      style={{
                        position: 'absolute',
                        left: posX + 'px',
                        top: posY + 'px',
                        transform: 'translate(-50%, -50%)',
                        transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        zIndex: 10,
                        minWidth: '180px',
                        animation: 'pulse-glow 2s ease-in-out infinite',
                      }}
                    >
                      <div className="text-center">
                        <div>{opt}</div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">
                          {currentClicks}/{clicksNeeded} 捕獲
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep.content.questionType === 'multi_choice' && options.length > 0 && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 gap-3 text-left">
                  {options.map((opt, idx) => {
                    const isSelected = multiSelectValue.includes(opt);
                    const meta = optionMeta[opt] || {};
                    const hasSound = meta.soundEffect;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (hasSound) playOptionSound(meta.soundEffect);
                          if (isSelected) {
                            setMultiSelectValue(multiSelectValue.filter(v => v !== opt));
                          } else {
                            setMultiSelectValue([...multiSelectValue, opt]);
                          }
                        }}
                        className={`p-5 rounded-2xl border transition-all text-lg font-medium flex items-center justify-between ${
                          isSelected ? 'border-white bg-zinc-800 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {opt}
                          {hasSound && <span className="text-[10px] text-zinc-500 font-mono">🔊</span>}
                        </span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'border-white bg-white text-black' : 'border-zinc-600'}`}>
                          {isSelected && '✓'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleQuestionSubmit()}
                  disabled={currentStep.content.required && multiSelectValue.length === 0}
                  className="w-full py-4 bg-white text-black font-bold text-lg rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-40"
                >
                  確認提交選擇
                </button>
              </div>
            )}

            {currentStep.content.questionType === 'rating' && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <button
                      key={num}
                      onClick={() => handleQuestionSubmit(num)}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border border-zinc-700 bg-zinc-900 text-xl font-bold hover:border-white hover:bg-white hover:text-black transition-all"
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 font-mono">1 = 非常低 / 10 = 極高</p>
              </div>
            )}
          </div>
        )}

        {/* EFFECT STEP */}
        {currentStep.type === 'effect' && (
          <EffectsCanvas
            effectType={currentStep.content.effectType}
            duration={currentStep.content.duration || 3}
            onComplete={goToNextStep}
          />
        )}

        {/* VIDEO STEP */}
        {currentStep.type === 'video' && (
          <div className="w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl relative">
            <video
              src={currentStep.content.videoUrl}
              autoPlay
              controls
              onEnded={goToNextStep}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Bottom Footer Progress Bar */}
      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden z-20">
        <div
          className="bg-white h-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {effectiveBgmUrl && <AudioPlayer src={effectiveBgmUrl} />}
    </div>
  );
}
