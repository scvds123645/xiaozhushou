import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, CheckCircle, Copy, Edit2, Eye, EyeOff, History, Loader2, RefreshCw, Save, Trash2, Users, XCircle } from 'lucide-react';

type UserResult = {
  id: string;
  status: 'Live' | 'Die';
  url: string;
};

type HistoryRecord = {
  key: string;
  timestamp: number;
  total: number;
  live: number;
  die: number;
  note: string;
  users: UserResult[];
};

const MAX_RECORDS_WARNING = 50;

export default function FacebookStatusChecker() {
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check');
  const [inputValue, setInputValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalToCheck, setTotalToCheck] = useState(0);
  const [results, setResults] = useState<UserResult[]>([]);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copiedHistoryKey, setCopiedHistoryKey] = useState<string | null>(null);
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedDie, setCopiedDie] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [currentCheckNote, setCurrentCheckNote] = useState('');

  const parseInputIds = (text: string): string[] => {
    const matches = text.match(/\d{14,}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const checkSingleUser = async (id: string): Promise<UserResult> => {
    try {
      const url = `https://graph.facebook.com/${id}/picture?redirect=false`;
      const response = await fetch(url);
      const data = await response.json();
      const imageUrl = data?.data?.url || '';
      const status = imageUrl.includes('static') ? 'Die' : 'Live';
      return { id, status, url: imageUrl };
    } catch (error) {
      return { id, status: 'Die', url: '' };
    }
  };

  const runCheckWithIds = async (ids: string[]) => {
    setIsChecking(true);
    setProgress(0);
    setTotalToCheck(ids.length);
    setResults([]);
    setShowSavePrompt(false);

    const resultMap = new Map<string, UserResult>();
    const concurrencyLimit = 100;
    let completed = 0;

    const checkBatch = async (batch: string[]) => {
      const promises = batch.map(id => checkSingleUser(id));
      const batchResults = await Promise.all(promises);
      
      batchResults.forEach(result => {
        resultMap.set(result.id, result);
        completed++;
        setProgress(completed);
      });
    };

    for (let i = 0; i < ids.length; i += concurrencyLimit) {
      const batch = ids.slice(i, i + concurrencyLimit);
      await checkBatch(batch);
    }

    const orderedResults = ids.map(id => resultMap.get(id)!);
    setResults(orderedResults);
    setIsChecking(false);
    setShowSavePrompt(true);
  };

  const handleCheck = () => {
    const ids = parseInputIds(inputValue);
    if (ids.length === 0) return;
    runCheckWithIds(ids);
  };

  const copyTextToClipboard = async (text: string, callback: () => void) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      callback();
      setTimeout(() => callback(), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const copyLiveIds = () => {
    const liveIds = results.filter(r => r.status === 'Live').map(r => r.id).join('\n');
    if (liveIds) {
      setCopiedLive(true);
      copyTextToClipboard(liveIds, () => setCopiedLive(false));
    }
  };

  const copyDieIds = () => {
    const dieIds = results.filter(r => r.status === 'Die').map(r => r.id).join('\n');
    if (dieIds) {
      setCopiedDie(true);
      copyTextToClipboard(dieIds, () => setCopiedDie(false));
    }
  };

  const saveToHistory = () => {
    const record: HistoryRecord = {
      key: `history_${Date.now()}`,
      timestamp: Date.now(),
      total: results.length,
      live: results.filter(r => r.status === 'Live').length,
      die: results.filter(r => r.status === 'Die').length,
      note: currentCheckNote.slice(0, 200),
      users: results
    };

    setHistoryRecords(prev => [record, ...prev]);
    setShowSavePrompt(false);
    setCurrentCheckNote('');
  };

  const discardResults = () => {
    setShowSavePrompt(false);
    setCurrentCheckNote('');
  };

  const recheckRecord = (record: HistoryRecord) => {
    const ids = record.users.map(u => u.id);
    setInputValue(ids.join('\n'));
    setActiveTab('check');
    setTimeout(() => runCheckWithIds(ids), 100);
  };

  const toggleExpandRecord = (key: string) => {
    setExpandedRecords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyRecordIds = (record: HistoryRecord) => {
    const ids = record.users.map(u => u.id).join('\n');
    setCopiedHistoryKey(record.key);
    copyTextToClipboard(ids, () => setCopiedHistoryKey(null));
  };

  const startEditNote = (record: HistoryRecord) => {
    setEditingNoteKey(record.key);
    setNoteDraft(record.note);
  };

  const saveNote = (key: string) => {
    setHistoryRecords(prev => prev.map(r => 
      r.key === key ? { ...r, note: noteDraft.slice(0, 200) } : r
    ));
    setEditingNoteKey(null);
    setNoteDraft('');
  };

  const cancelEditNote = () => {
    setEditingNoteKey(null);
    setNoteDraft('');
  };

  const deleteRecord = (key: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      setHistoryRecords(prev => prev.filter(r => r.key !== key));
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作无法撤销。')) {
      setHistoryRecords([]);
    }
  };

  const liveCount = results.filter(r => r.status === 'Live').length;
  const dieCount = results.filter(r => r.status === 'Die').length;
  const progressPercent = totalToCheck > 0 ? Math.round((progress / totalToCheck) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8" />
              Facebook 账号状态检查器
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('check')}
              className={`flex-1 py-5 px-6 font-medium transition-all ${
                activeTab === 'check'
                  ? 'bg-white text-blue-600 border-b-3 border-blue-600'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                状态检查
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-5 px-6 font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 border-b-3 border-blue-600'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <History className="w-6 h-6" />
                历史记录
                {historyRecords.length > 0 && (
                  <span className="ml-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {historyRecords.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Check Tab */}
          {activeTab === 'check' && (
            <div className="p-6 space-y-6">
              {/* Input Area */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  输入 Facebook ID（每行一个，14位以上数字）
                </label>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入或粘贴 Facebook ID...&#10;支持混合文本，系统会自动提取14位以上的数字"
                  className="w-full h-40 px-5 py-4 border border-slate-300 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-slate-900 placeholder:text-slate-400"
                  disabled={isChecking}
                />
                <div className="mt-3 text-sm text-slate-600 font-medium">
                  已识别 {parseInputIds(inputValue).length} 个有效 ID
                </div>
              </div>

              {/* Check Button */}
              <button
                onClick={handleCheck}
                disabled={isChecking || parseInputIds(inputValue).length === 0}
                className="w-full bg-blue-600 text-white py-4 rounded-full font-semibold hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 shadow-md"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    检查中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    开始检查
                  </>
                )}
              </button>

              {/* Progress */}
              {isChecking && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-slate-800">
                    <span>检查进度</span>
                    <span>{progress} / {totalToCheck} ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm text-slate-600 font-semibold mb-2">总计</div>
                      <div className="text-4xl font-bold text-slate-900">{results.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm text-green-700 font-semibold mb-2">Live</div>
                      <div className="text-4xl font-bold text-green-600">{liveCount}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm text-red-700 font-semibold mb-2">Die</div>
                      <div className="text-4xl font-bold text-red-600">{dieCount}</div>
                    </div>
                  </div>

                  {/* Copy Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={copyLiveIds}
                      disabled={liveCount === 0}
                      className="flex-1 bg-green-600 text-white py-4 rounded-full font-semibold hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-md"
                    >
                      {copiedLive ? (
                        <>
                          <Check className="w-6 h-6" />
                          已复制 Live
                        </>
                      ) : (
                        <>
                          <Copy className="w-6 h-6" />
                          复制 Live ID
                        </>
                      )}
                    </button>
                    <button
                      onClick={copyDieIds}
                      disabled={dieCount === 0}
                      className="flex-1 bg-red-600 text-white py-4 rounded-full font-semibold hover:bg-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-md"
                    >
                      {copiedDie ? (
                        <>
                          <Check className="w-6 h-6" />
                          已复制 Die
                        </>
                      ) : (
                        <>
                          <Copy className="w-6 h-6" />
                          复制 Die ID
                        </>
                      )}
                    </button>
                  </div>

                  {/* Results List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Results */}
                    <div className="rounded-3xl overflow-hidden shadow-md border border-transparent bg-white">
                      <div className="bg-green-600 text-white px-5 py-4 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        Live 账号 ({liveCount})
                      </div>
                      <div className="max-h-96 overflow-y-auto p-5 space-y-2 bg-green-50">
                        {results.filter(r => r.status === 'Live').map(result => (
                          <div key={result.id} className="bg-white p-3 rounded-2xl shadow-sm text-sm font-mono text-slate-800">
                            {result.id}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Die Results */}
                    <div className="rounded-3xl overflow-hidden shadow-md border border-transparent bg-white">
                      <div className="bg-red-600 text-white px-5 py-4 font-semibold flex items-center gap-2">
                        <XCircle className="w-6 h-6" />
                        Die 账号 ({dieCount})
                      </div>
                      <div className="max-h-96 overflow-y-auto p-5 space-y-2 bg-red-50">
                        {results.filter(r => r.status === 'Die').map(result => (
                          <div key={result.id} className="bg-white p-3 rounded-2xl shadow-sm text-sm font-mono text-slate-800">
                            {result.id}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Save Prompt */}
                  {showSavePrompt && (
                    <div className="bg-amber-50 rounded-3xl p-6 shadow-md border border-amber-200">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                        <div className="flex-1 space-y-4">
                          <p className="font-semibold text-amber-900 text-lg">检查完成！是否保存到历史记录？</p>
                          <input
                            type="text"
                            value={currentCheckNote}
                            onChange={(e) => setCurrentCheckNote(e.target.value)}
                            placeholder="添加备注（可选，最多200字符）"
                            maxLength={200}
                            className="w-full px-4 py-3 border border-amber-300 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                          />
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={saveToHistory}
                              className="flex-1 bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                              <Save className="w-5 h-5" />
                              保存
                            </button>
                            <button
                              onClick={discardResults}
                              className="flex-1 bg-slate-400 text-white py-3 rounded-full font-semibold hover:bg-slate-500 hover:shadow-lg transition-all shadow-md"
                            >
                              放弃
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6 space-y-4">
              {/* Warning */}
              {historyRecords.length > MAX_RECORDS_WARNING && (
                <div className="bg-orange-50 rounded-3xl p-6 flex items-start gap-4 shadow-md border border-orange-200">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-900 text-lg">历史记录较多</p>
                    <p className="text-sm text-orange-700 mt-1">当前有 {historyRecords.length} 条记录，建议定期清理以优化性能。</p>
                  </div>
                </div>
              )}

              {/* Clear All Button */}
              {historyRecords.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="w-full bg-red-600 text-white py-4 rounded-full font-semibold hover:bg-red-700 hover:shadow-lg transition-all flex items-center justify-center gap-3 shadow-md"
                >
                  <Trash2 className="w-6 h-6" />
                  清空所有历史记录
                </button>
              )}

              {/* Records List */}
              {historyRecords.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <History className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-semibold">暂无历史记录</p>
                  <p className="text-sm mt-2">完成检查后保存即可查看历史记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyRecords.map(record => (
                    <div key={record.key} className="rounded-3xl overflow-hidden bg-white shadow-md border border-transparent hover:shadow-lg transition-shadow">
                      {/* Record Header */}
                      <div className="bg-slate-50 p-6 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm text-slate-600 mb-2">
                              {new Date(record.timestamp).toLocaleString('zh-CN')}
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="text-sm font-semibold text-slate-700">
                                总计: <span className="text-blue-600 text-base">{record.total}</span>
                              </span>
                              <span className="text-sm font-semibold text-slate-700">
                                Live: <span className="text-green-600 text-base">{record.live}</span>
                              </span>
                              <span className="text-sm font-semibold text-slate-700">
                                Die: <span className="text-red-600 text-base">{record.die}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Note Section */}
                        {editingNoteKey === record.key ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              maxLength={200}
                              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveNote(record.key)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
                              >
                                <Save className="w-4 h-4" />
                                保存
                              </button>
                              <button
                                onClick={cancelEditNote}
                                className="px-4 py-2 bg-slate-400 text-white rounded-full text-sm font-semibold hover:bg-slate-500 hover:shadow-md transition-all shadow-sm"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          record.note && (
                            <div className="text-sm text-slate-700 bg-blue-50 p-4 rounded-2xl border border-blue-200">
                              <span className="font-semibold">备注:</span> {record.note}
                            </div>
                          )
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => recheckRecord(record)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
                          >
                            <RefreshCw className="w-4 h-4" />
                            重检
                          </button>
                          <button
                            onClick={() => toggleExpandRecord(record.key)}
                            className="px-4 py-2 bg-slate-600 text-white rounded-full text-sm font-semibold hover:bg-slate-700 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
                          >
                            {expandedRecords[record.key] ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                收起
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                展开
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => copyRecordIds(record)}
                            className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
                          >
                            {copiedHistoryKey === record.key ? (
                              <>
                                <Check className="w-4 h-4" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                复制
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => startEditNote(record)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-semibold hover:bg-amber-700 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            编辑备注
                          </button>
                          <button
                            onClick={() => deleteRecord(record.key)}
                            className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      </div>

                      {/* Expanded User List */}
                      {expandedRecords[record.key] && (
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Live Users */}
                            <div>
                              <div className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Live ({record.live})
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {record.users.filter(u => u.status === 'Live').map(user => (
                                  <div key={user.id} className="text-xs font-mono bg-white p-3 rounded-2xl shadow-sm border border-transparent">
                                    {user.id}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Die Users */}
                            <div>
                              <div className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                                <XCircle className="w-5 h-5" />
                                Die ({record.die})
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {record.users.filter(u => u.status === 'Die').map(user => (
                                  <div key={user.id} className="text-xs font-mono bg-white p-3 rounded-2xl shadow-sm border border-transparent">
                                    {user.id}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
