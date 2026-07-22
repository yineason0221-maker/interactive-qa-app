import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Film, Sparkles, MessageSquare, Type } from 'lucide-react';

export default function AdminFlowEditor({ token, steps: initialSteps, onSaveSuccess }) {
  const [steps, setSteps] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialSteps && initialSteps.length > 0) {
      setSteps(initialSteps);
    }
  }, [initialSteps]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/flow/steps/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ steps })
      });
      const data = await res.json();
      if (data.success) {
        alert('流程與問題內容已成功更新！');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        alert(data.error || '儲存失敗');
      }
    } catch (err) {
      alert('無法與伺服器連線');
    } finally {
      setIsSaving(false);
    }
  };

  const addStep = (type) => {
    const newId = Date.now();
    let newStep = {
      id: newId,
      type,
      title: '新關卡',
      content: {}
    };

    if (type === 'subtitle') {
      newStep.title = '新增字幕';
      newStep.content = {
        text: '請在此輸入字幕內容...',
        duration: 4,
        fadeIn: 1,
        fadeOut: 1,
        textSize: 'large'
      };
    } else if (type === 'question') {
      newStep.title = '新增問題';
      newStep.content = {
        questionText: '請在此輸入問題標題...',
        questionType: 'text',
        options: ['選項 A', '選項 B'],
        required: true
      };
    } else if (type === 'effect') {
      newStep.title = '特效動態';
      newStep.content = {
        effectType: 'fireworks',
        duration: 3
      };
    } else if (type === 'video') {
      newStep.title = '影片關卡';
      newStep.content = {
        videoUrl: '',
        autoPlay: true
      };
    }

    const updated = [...steps, newStep];
    setSteps(updated);
    setActiveStepIndex(updated.length - 1);
  };

  const removeStep = (index) => {
    if (steps.length <= 1) {
      alert('最少需要保留一個步驟關卡！');
      return;
    }
    const updated = steps.filter((_, idx) => idx !== index);
    setSteps(updated);
    if (activeStepIndex >= updated.length) {
      setActiveStepIndex(updated.length - 1);
    }
  };

  const moveStep = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSteps(updated);
    setActiveStepIndex(targetIndex);
  };

  const updateActiveStep = (updatedFields) => {
    const updated = [...steps];
    updated[activeStepIndex] = {
      ...updated[activeStepIndex],
      ...updatedFields
    };
    setSteps(updated);
  };

  const updateActiveContent = (updatedContent) => {
    const updated = [...steps];
    updated[activeStepIndex] = {
      ...updated[activeStepIndex],
      content: {
        ...updated[activeStepIndex].content,
        ...updatedContent
      }
    };
    setSteps(updated);
  };

  const activeStep = steps[activeStepIndex];

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">內容與流程編輯器</h2>
          <p className="text-xs text-zinc-400 mt-1">管理問題、字幕、特效與影片播放順序</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => addStep('subtitle')}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Type className="w-3.5 h-3.5" /> +字幕
          </button>
          <button
            onClick={() => addStep('question')}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> +問題
          </button>
          <button
            onClick={() => addStep('effect')}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> +特效
          </button>
          <button
            onClick={() => addStep('video')}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Film className="w-3.5 h-3.5" /> +影片
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg ml-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Sequence List */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <div
                key={step.id || idx}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-zinc-800 border-white text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-white truncate">{step.title}</div>
                    <div className="text-[10px] font-mono uppercase text-zinc-500">{step.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveStep(idx, -1); }}
                    disabled={idx === 0}
                    className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveStep(idx, 1); }}
                    disabled={idx === steps.length - 1}
                    className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeStep(idx); }}
                    className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-red-200 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Inspector & Property Editor */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          {activeStep ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">關卡標題 / 識別名</label>
                  <input
                    type="text"
                    value={activeStep.title || ''}
                    onChange={(e) => updateActiveStep({ title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">類型 (Type)</label>
                  <input
                    type="text"
                    disabled
                    value={activeStep.type}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-500 uppercase font-mono"
                  />
                </div>
              </div>

              {/* SUBTITLE EDITOR */}
              {activeStep.type === 'subtitle' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">字幕顯示文字</label>
                    <textarea
                      rows={3}
                      value={activeStep.content.text || ''}
                      onChange={(e) => updateActiveContent({ text: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-base text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">持續時間 (秒)</label>
                      <input
                        type="number"
                        min={1}
                        value={activeStep.content.duration || 4}
                        onChange={(e) => updateActiveContent({ duration: parseFloat(e.target.value) || 1 })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">淡入時間 (秒)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={activeStep.content.fadeIn || 1}
                        onChange={(e) => updateActiveContent({ fadeIn: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-zinc-400 block mb-1">淡出時間 (秒)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={activeStep.content.fadeOut || 1}
                        onChange={(e) => updateActiveContent({ fadeOut: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">字體大小</label>
                    <select
                      value={activeStep.content.textSize || 'large'}
                      onChange={(e) => updateActiveContent({ textSize: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      <option value="large">特大 (Large)</option>
                      <option value="medium">中等 (Medium)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* QUESTION EDITOR */}
              {activeStep.type === 'question' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">問題題目文字</label>
                    <textarea
                      rows={2}
                      value={activeStep.content.questionText || ''}
                      onChange={(e) => updateActiveContent({ questionText: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-base text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">題型選擇</label>
                    <select
                      value={activeStep.content.questionType || 'text'}
                      onChange={(e) => updateActiveContent({ questionType: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      <option value="text">文字簡答 (Short Text)</option>
                      <option value="single_choice">單選題 (Single Choice)</option>
                      <option value="multi_choice">多選題 (Multi Choice)</option>
                      <option value="rating">1-10分 評分題 (Rating Scale)</option>
                    </select>
                  </div>

                  {(activeStep.content.questionType === 'single_choice' || activeStep.content.questionType === 'multi_choice') && (
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-zinc-400 block">選項列表</label>
                      {(activeStep.content.options || []).map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(activeStep.content.options || [])];
                              newOpts[oIdx] = e.target.value;
                              updateActiveContent({ options: newOpts });
                            }}
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm text-white"
                          />
                          <button
                            onClick={() => {
                              const newOpts = (activeStep.content.options || []).filter((_, i) => i !== oIdx);
                              updateActiveContent({ options: newOpts });
                            }}
                            className="p-2 text-red-400 hover:text-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOpts = [...(activeStep.content.options || []), `選項 ${(activeStep.content.options?.length || 0) + 1}`];
                          updateActiveContent({ options: newOpts });
                        }}
                        className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-mono pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> 新增選項
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* EFFECT EDITOR */}
              {activeStep.type === 'effect' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">特效類型</label>
                    <select
                      value={activeStep.content.effectType || 'fireworks'}
                      onChange={(e) => updateActiveContent({ effectType: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      <option value="fireworks">絢麗煙火爆發 (Fireworks)</option>
                      <option value="glitch">電視故障雜訊 (Glitch)</option>
                      <option value="matrix">駭客帝國代碼雨 (Matrix Rain)</option>
                      <option value="shake">畫面震撼抖動 (Screen Shake)</option>
                      <option value="flash">閃光頻閃 (Flash Strobe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">持續時間 (秒)</label>
                    <input
                      type="number"
                      min={1}
                      value={activeStep.content.duration || 3}
                      onChange={(e) => updateActiveContent({ duration: parseFloat(e.target.value) || 1 })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              )}

              {/* VIDEO EDITOR */}
              {activeStep.type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1">影片 URL 網址 (MP4)</label>
                    <input
                      type="text"
                      placeholder="e.g. /uploads/video.mp4 或外部連結"
                      value={activeStep.content.videoUrl || ''}
                      onChange={(e) => updateActiveContent({ videoUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                      可在「系統設定與上傳」分頁中上傳本地 MP4 影片，並將連結複製至此。
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 font-mono">請選擇關卡進行編輯</div>
          )}
        </div>
      </div>
    </div>
  );
}
