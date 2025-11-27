import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  History,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  Users,
  XCircle,
  FileText
} from 'lucide-react';

// --- Types ---

type UserStatus = 'Live' | 'Die';

interface UserResult {
  id: string;
  status: UserStatus;
  url: string;
}

interface HistoryRecord {
  key: string;
  timestamp: number;
  total: number;
  live: number;
  die: number;
  note: string;
  users: UserResult[];
}

// --- Constants & Config ---

const STORAGE_KEY = 'fb_history_records';
const CONCURRENT_LIMIT = 100;
const ID_REGEX = /\d{14,}/g;

// --- Helper Functions ---

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      return true;
    }
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// --- Main Component ---

export default function FacebookChecker() {
  // --- State: UI & Navigation ---
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check');

  // --- State: Checker ---
  const [inputValue, setInputValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalToCheck, setTotalToCheck] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [results, setResults] = useState<UserResult[]>([]);
  
  // --- State: Results & Save Prompt ---
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [currentCheckNote, setCurrentCheckNote] = useState('');
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedDie, setCopiedDie] = useState(false);

  // --- State: History ---
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copiedHistoryKey, setCopiedHistoryKey] = useState<string | null>(null);

  // --- Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistoryRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Update localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyRecords));
  }, [historyRecords]);

  // --- Core Logic: Status Checker ---

  const checkSingleUser = async (id: string): Promise<UserResult> => {
    try {
      const response = await fetch(`https://graph.facebook.com/${id}/picture?redirect=false`);
      const data = await response.json();
      
      // Logic: If URL contains "static" -> Die, otherwise Live
      const url = data?.data?.url || '';
      const isLive = url && !url.includes('static');

      return {
        id,
        status: isLive ? 'Live' : 'Die',
        url
      };
    } catch (error) {
      // Network error or fetch fail counts as Die
      return { id, status: 'Die', url: '' };
    }
  };

  const startCheck = async () => {
    const ids = (inputValue.match(ID_REGEX) || []);
    if (ids.length === 0) return;

    setIsChecking(true);
    setResults([]);
    setShowSavePrompt(false);
    setTotalToCheck(ids.length);
    setCompletedCount(0);
    setProgress(0);
    setCurrentCheckNote('');

    // Maintain order by initializing results array with nulls or placeholders, 
    // but here we process concurrency and want to map back to original order.
    // We will just process and then sort or map? 
    // Requirement: "Maintain original input order in results"
    
    // We create a map of promises
    const queue = [...ids];
    const resultsMap = new Map<string, UserResult>();
    let processed = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const id = queue.shift();
        if (!id) break;

        const result = await checkSingleUser(id);
        resultsMap.set(id, result);
        
        processed++;
        setCompletedCount(processed);
        setProgress((processed / ids.length) * 100);
      }
    };

    // Create concurrent workers
    const workers = Array(Math.min(ids.length, CONCURRENT_LIMIT))
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);

    // Reconstruct results in original order
    const orderedResults = ids.map(id => resultsMap.get(id)!);
    setResults(orderedResults);
    setIsChecking(false);
    setShowSavePrompt(true);
  };

  // --- Actions: Results ---

  const copyResults = async (type: 'Live' | 'Die') => {
    const idsToCopy = results
      .filter(r => r.status === type)
      .map(r => r.id)
      .join('\n');
    
    const success = await copyToClipboard(idsToCopy);
    if (success) {
      if (type === 'Live') {
        setCopiedLive(true);
        setTimeout(() => setCopiedLive(false), 2000);
      } else {
        setCopiedDie(true);
        setTimeout(() => setCopiedDie(false), 2000);
      }
    }
  };

  const saveCurrentResultToHistory = () => {
    const liveCount = results.filter(r => r.status === 'Live').length;
    const dieCount = results.filter(r => r.status === 'Die').length;

    const newRecord: HistoryRecord = {
      key: `fb_history:${Date.now()}`,
      timestamp: Date.now(),
      total: results.length,
      live: liveCount,
      die: dieCount,
      note: currentCheckNote,
      users: results
    };

    setHistoryRecords(prev => [newRecord, ...prev]);
    setShowSavePrompt(false);
    setCurrentCheckNote('');
    setActiveTab('history');
  };

  const discardResults = () => {
    setShowSavePrompt(false);
    setCurrentCheckNote('');
  };

  // --- Actions: History ---

  const clearHistory = () => {
    if (window.confirm("确定要清空所有历史记录吗？")) {
      setHistoryRecords([]);
    }
  };

  const deleteRecord = (key: string) => {
    if (window.confirm("确定删除这条记录吗？")) {
      setHistoryRecords(prev => prev.filter(r => r.key !== key));
    }
  };

  const recheckRecord = (record: HistoryRecord) => {
    const ids = record.users.map(u => u.id).join('\n');
    setInputValue(ids);
    setActiveTab('check');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExpand = (key: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const startEditNote = (record: HistoryRecord) => {
    setEditingNoteKey(record.key);
    setNoteDraft(record.note);
  };

  const saveNoteEdit = (key: string) => {
    setHistoryRecords(prev => prev.map(r => 
      r.key === key ? { ...r, note: noteDraft } : r
    ));
    setEditingNoteKey(null);
  };

  const copyHistoryIds = async (record: HistoryRecord) => {
    const ids = record.users.map(u => u.id).join('\n');
    const success = await copyToClipboard(ids);
    if (success) {
      setCopiedHistoryKey(record.key);
      setTimeout(() => setCopiedHistoryKey(null), 2000);
    }
  };

  // --- Render Helpers ---
  
  const liveResults = results.filter(r => r.status === 'Live');
  const dieResults = results.filter(r => r.status === 'Die');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-slate-800 p-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-sm font-medium opacity-80 tracking-wider">Facebook 工具</h2>
              <h1 className="text-2xl font-bold tracking-tight">账号状态检查器</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
            <History className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-semibold text-emerald-100">即时响应</span>
          </div>
        </header>

        {/* Tab Switcher */}
        <nav className="flex p-1 bg-slate-900/40 rounded-xl backdrop-blur-sm border border-white/10">
          <button
            onClick={() => setActiveTab('check')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 transform ${
              activeTab === 'check'
                ? 'bg-white text-slate-900 shadow-lg scale-100'
                : 'text-white/80 hover:bg-white/10 hover:text-white scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${activeTab === 'check' ? '' : 'opacity-50'}`} />
            状态检查
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-300 transform ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-lg scale-100'
                : 'text-white/80 hover:bg-white/10 hover:text-white scale-95'
            }`}
          >
            <History className={`w-4 h-4 ${activeTab === 'history' ? '' : 'opacity-50'}`} />
            历史记录
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="transition-all duration-500 ease-in-out">
          
          {/* --- CHECK TAB --- */}
          {activeTab === 'check' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Input Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-700 font-bold flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    输入账号 ID (每行一个)
                  </label>
                  <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">
                    支持混合文本解析
                  </span>
                </div>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="在此粘贴包含 UID 的文本...&#10;100000000000001&#10;100000000000002"
                  className="w-full h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-y font-mono text-sm shadow-inner"
                  disabled={isChecking}
                />
                
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
                  <button
                    onClick={startCheck}
                    disabled={isChecking || !inputValue.trim()}
                    className={`
                      w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2
                      transition-all duration-200 transform
                      ${isChecking || !inputValue.trim() 
                        ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 active:scale-95'}
                    `}
                  >
                    {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    {isChecking ? '检查中...' : '开始检查'}
                  </button>

                  <div className="flex gap-2 w-full md:w-auto">
                    {/* Progress Badge */}
                    <div className="flex-1 md:flex-none flex flex-col items-end justify-center px-4">
                      <span className="text-xs text-slate-500 font-medium">进度</span>
                      <span className="text-lg font-bold text-slate-800 font-mono">
                        {completedCount} <span className="text-slate-400 text-sm">/ {totalToCheck}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Save Prompt */}
              {showSavePrompt && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-2xl text-white animate-in zoom-in-95 duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold">检查完成!</h3>
                      <p className="text-emerald-50 opacity-90 text-sm">
                        共检测 {results.length} 个账号。Live: {liveResults.length}, Die: {dieResults.length}。
                      </p>
                      <div className="relative">
                        <textarea
                          maxLength={200}
                          value={currentCheckNote}
                          onChange={(e) => setCurrentCheckNote(e.target.value)}
                          placeholder="添加备注 (可选)..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all text-white h-20 resize-none"
                        />
                        <span className="absolute bottom-2 right-2 text-xs opacity-50">{currentCheckNote.length}/200</span>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={saveCurrentResultToHistory}
                          className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors shadow-md hover:scale-105 active:scale-95 transform"
                        >
                          <Save className="w-4 h-4" /> 保存记录
                        </button>
                        <button 
                          onClick={discardResults}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          不保存
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Live Panel */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden flex flex-col h-[450px] border border-emerald-100">
                  <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                      <h3 className="font-bold text-emerald-800">Live 账号</h3>
                    </div>
                    <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                      {liveResults.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-emerald-50/20">
                    {liveResults.map((user, idx) => (
                      <div key={`live-${idx}`} className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-100 shadow-sm text-sm font-mono text-emerald-700">
                        {user.id}
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                    ))}
                    {liveResults.length === 0 && <div className="text-center text-slate-400 text-sm py-10">无 Live 数据</div>}
                  </div>
                  <div className="p-4 bg-white border-t border-emerald-100">
                    <button
                      onClick={() => copyResults('Live')}
                      disabled={liveResults.length === 0}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform duration-200
                        ${liveResults.length > 0 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-105 active:scale-95' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      {copiedLive ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedLive ? '已复制' : '复制 Live ID'}
                    </button>
                  </div>
                </div>

                {/* Die Panel */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden flex flex-col h-[450px] border border-red-100">
                  <div className="p-4 border-b border-red-100 bg-red-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></div>
                      <h3 className="font-bold text-red-800">Die 账号</h3>
                    </div>
                    <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                      {dieResults.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-red-50/20">
                    {dieResults.map((user, idx) => (
                      <div key={`die-${idx}`} className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100 shadow-sm text-sm font-mono text-red-700">
                        {user.id}
                        <XCircle className="w-3 h-3 text-red-400" />
                      </div>
                    ))}
                    {dieResults.length === 0 && <div className="text-center text-slate-400 text-sm py-10">无 Die 数据</div>}
                  </div>
                  <div className="p-4 bg-white border-t border-red-100">
                    <button
                      onClick={() => copyResults('Die')}
                      disabled={dieResults.length === 0}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform duration-200
                        ${dieResults.length > 0 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105 active:scale-95' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      {copiedDie ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedDie ? '已复制' : '复制 Die ID'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- HISTORY TAB --- */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* History Header */}
              <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                    {historyRecords.length} 条记录
                  </span>
                  {historyRecords.length > 50 && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <AlertCircle className="w-3 h-3" /> 存储建议清理
                    </span>
                  )}
                </div>
                {historyRecords.length > 0 && (
                   <button 
                     onClick={clearHistory}
                     className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                   >
                     <Trash2 className="w-4 h-4" /> 清空历史
                   </button>
                )}
              </div>

              {/* History List */}
              <div className="space-y-4">
                {historyRecords.length === 0 ? (
                  <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-white/30 text-white/70">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无历史记录</p>
                  </div>
                ) : (
                  historyRecords.map((record) => (
                    <div key={record.key} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
                      
                      {/* Record Header */}
                      <div className="p-4 md:p-6 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                {formatDate(record.timestamp)}
                              </span>
                            </div>
                            <div className="flex gap-3 mt-2">
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Live: {record.live}
                              </span>
                              <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Die: {record.die}
                              </span>
                              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                                Total: {record.total}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button onClick={() => recheckRecord(record)} title="重测" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-transform hover:scale-110 active:scale-95">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button onClick={() => copyHistoryIds(record)} title="复制全部 ID" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-transform hover:scale-110 active:scale-95 relative">
                              {copiedHistoryKey === record.key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={() => deleteRecord(record.key)} title="删除" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-transform hover:scale-110 active:scale-95">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleExpand(record.key)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-transform hover:scale-110 active:scale-95">
                              {expandedRecords[record.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Note Section */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          {editingNoteKey === record.key ? (
                            <div className="flex gap-2 items-start animate-in fade-in duration-200">
                              <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                className="w-full text-sm p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                                rows={2}
                                maxLength={200}
                              />
                              <div className="flex flex-col gap-1">
                                <button onClick={() => saveNoteEdit(record.key)} className="p-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingNoteKey(null)} className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 group">
                              <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                              <p className="text-sm text-slate-600 flex-1 break-all">
                                {record.note || <span className="italic opacity-50">无备注</span>}
                              </p>
                              <button onClick={() => startEditNote(record)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity">
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable User List */}
                      {expandedRecords[record.key] && (
                        <div className="bg-slate-50 border-t border-slate-200 p-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="max-h-[240px] overflow-y-auto grid grid-cols-2 md:grid-cols-4 gap-2">
                            {record.users.map((u, i) => (
                              <div key={i} className={`text-xs font-mono p-1 px-2 rounded border truncate ${
                                u.status === 'Live' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {u.id}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
