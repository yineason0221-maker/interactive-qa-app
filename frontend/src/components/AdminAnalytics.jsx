import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Clock, MessageSquare, Activity, User } from 'lucide-react';

export default function AdminAnalytics({ token }) {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/responses/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/responses/clear-all', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalyticsData([]);
        setSelectedSession(null);
        setShowClearConfirm(false);
        alert('所有使用者紀錄與數據已成功清空！');
      }
    } catch (err) {
      alert('清空紀錄失敗');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '未完成 / 作答中';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <User className="w-5 h-5 text-zinc-400" />
            使用者作答與停留時間分析 ({analyticsData.length} 人次)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">查看每名受訪者的作答內容、停留秒數與行為軌跡</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono rounded-xl flex items-center gap-2 border border-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            刷新數據
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/60 text-xs font-mono rounded-xl flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            一鍵清空所有紀錄
          </button>
        </div>
      </div>

      {/* Main Analytics Table & Detail View */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 font-mono">載入歷史紀錄中...</div>
      ) : analyticsData.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
          尚無使用者作答紀錄
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {analyticsData.map((session, idx) => {
              const isSelected = selectedSession?.session_id === session.session_id;
              return (
                <div
                  key={session.session_id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-800 border-white text-white shadow-lg'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-base text-white">
                      {session.nickname || `訪客 #${idx + 1}`}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {formatDuration(session.duration_seconds)}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-zinc-500 font-mono space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{new Date(session.start_time).toLocaleString()}</span>
                    </div>
                    <div className="truncate text-zinc-600">ID: {session.session_id}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Responses / Logs */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-h-[600px] overflow-y-auto">
            {selectedSession ? (
              <div className="space-y-6">
                <div className="border-b border-zinc-800 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedSession.nickname || '匿名使用者'}
                    </h3>
                    <p className="text-xs font-mono text-zinc-400 mt-1">
                      Session: {selectedSession.session_id} | 裝置: {selectedSession.device_info || '一般瀏覽器'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 font-mono block">停留總時間</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {formatDuration(selectedSession.duration_seconds)}
                    </span>
                  </div>
                </div>

                {/* Question Answers */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    回答內容紀錄 ({selectedSession.answers?.length || 0} 題)
                  </h4>

                  {selectedSession.answers && selectedSession.answers.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSession.answers.map((ans, i) => (
                        <div key={i} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                          <div className="text-xs text-zinc-500 font-mono mb-1">
                            {ans.step_title ? `[${ans.step_title}] ` : ''}{ans.question_text}
                          </div>
                          <div className="text-base font-semibold text-white mt-1">
                            {ans.answer_value || '<無填寫>'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">尚無問題回答紀錄</p>
                  )}
                </div>

                {/* Event Logs */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-400" />
                    操作軌跡與行為紀錄 ({selectedSession.logs?.length || 0} 事件)
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(selectedSession.logs || []).map((log, i) => (
                      <div key={i} className="text-xs font-mono flex justify-between items-center bg-zinc-950/50 px-3 py-2 rounded-lg text-zinc-400 border border-zinc-800/40">
                        <span className="text-white font-semibold">{log.event_type}</span>
                        <span className="text-zinc-500">{log.detail}</span>
                        <span className="text-zinc-600">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-zinc-500 font-mono">
                ← 請點擊左側列表檢視該位使用者的回答與停留時間
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-red-400">確定要一鍵清空所有紀錄？</h3>
            <p className="text-sm text-zinc-300">
              此操作將永久刪除所有受訪者的回答內容、停留時間與動作日誌，無法復原。
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
