import React, { useCallback, useEffect, useReducer, useRef, useState, memo } from 'react';
import {
  Check,
  CheckCircle,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  Users,
  XCircle,
  Zap,
  Play,
} from 'lucide-react';

// --- Type Definitions ---
// (Keep your existing type definitions: UserResult, HistoryRecord, CheckState, CheckAction)
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

type CheckState = {
  results: UserResult[];
  progress: number;
  totalToCheck: number;
  isChecking: boolean;
  itemsPerSecond: number;
};

type CheckAction =
  | { type: 'START_CHECK'; total: number }
  | { type: 'WORKER_UPDATE'; payload: { results: UserResult[], progress: number, itemsPerSecond: number } }
  | { type: 'FINISH_CHECK' }
  | { type: 'RESET' };


// --- Constants ---
const HISTORY_KEY_PREFIX = 'fb_history:';
const VIRTUAL_ITEM_HEIGHT = 48;
const VIRTUAL_BUFFER = 5;


// --- Reducer ---
const checkReducer = (state: CheckState, action: CheckAction): CheckState => {
  switch (action.type) {
    case 'START_CHECK':
      return { ...state, isChecking: true, totalToCheck: action.total, progress: 0, results: [], itemsPerSecond: 0 };
    case 'WORKER_UPDATE':
      return { ...state, ...action.payload };
    case 'FINISH_CHECK':
      return { ...state, isChecking: false, itemsPerSecond: 0 };
    case 'RESET':
      return { results: [], progress: 0, totalToCheck: 0, isChecking: false, itemsPerSecond: 0 };
    default:
      return state;
  }
};

// --- Custom Hook for Worker Logic ---
const useCheckWorker = (dispatch: React.Dispatch<CheckAction>) => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    // Initialize the worker
    workerRef.current = new Worker(new URL('./checker.worker.js', import.meta.url));

    // Handle messages from the worker
    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'update') {
        dispatch({ type: 'WORKER_UPDATE', payload });
      } else if (type === 'finish') {
        dispatch({ type: 'FINISH_CHECK' });
      }
    };

    // Cleanup
    return () => {
      workerRef.current?.terminate();
    };
  }, [dispatch]);

  const runCheckWithIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    dispatch({ type: 'START_CHECK', total: ids.length });
    workerRef.current?.postMessage({ type: 'start', ids });
  }, []);

  return { runCheckWithIds };
};


// --- VirtualList and ResultItem Components ---
// (No changes needed for VirtualList and ResultItem, you can keep your existing components)
const VirtualList = memo<{
  items: UserResult[];
  height: number;
  itemHeight: number;
  renderItem: (item: UserResult, index: number) => React.ReactNode;
}>(({ items, height, itemHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER);
  const visibleEnd = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + VIRTUAL_BUFFER);
  const visibleItems = items.slice(visibleStart, visibleEnd);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent touch-pan-y"
      style={{ height: `${height}px` }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, idx) => (
            <div key={`${item.id}-${visibleStart + idx}`}>{renderItem(item, visibleStart + idx)}</div>
          ))}
        </div>
      </div>
    </div>
  );
});
VirtualList.displayName = 'VirtualList';


const ResultItem = memo<{ user: UserResult; type: 'live' | 'die' }>(({ user, type }) => {
  const isLive = type === 'live';
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white mb-1 border border-white/5 active:bg-white/10 transition-colors"
      style={{ minHeight: `${VIRTUAL_ITEM_HEIGHT}px` }}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${isLive ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-400 shadow-red-400/50'}`} />
        <span className="font-mono opacity-90 tracking-wide">{user.id}</span>
      </div>
      {isLive ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
    </div>
  );
});
ResultItem.displayName = 'ResultItem';


// --- Utility Functions ---
// (Keep your existing copyTextToClipboard and parseInputIds functions)
const copyTextToClipboard = async (text: string) => {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    return true;
  } catch {
    return false;
  }
};

const parseInputIds = (raw: string) => {
  const matches = raw.match(/\d{14,}/g) ?? [];
  return Array.from(new Set(matches));
};


// --- Main App Component ---
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check');
  const [inputValue, setInputValue] = useState<string>('');
  const [state, dispatch] = useReducer(checkReducer, { results: [], progress: 0, totalToCheck: 0, isChecking: false, itemsPerSecond: 0 });
  const { runCheckWithIds } = useCheckWorker(dispatch);

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  
  const [copiedHistoryKey, setCopiedHistoryKey] = useState<string | null>(null);
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedDie, setCopiedDie] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [currentCheckNote, setCurrentCheckNote] = useState('');

  // --- History Logic ---
  const loadHistory = useCallback(() => {
    // ... (Your existing loadHistory logic remains the same)
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // --- Handlers ---
  const handleStartCheck = useCallback(() => {
    const ids = parseInputIds(inputValue);
    if (ids.length === 0) { alert('未识别到有效 ID'); return; }
    runCheckWithIds(ids);
    setShowSavePrompt(false);
  }, [inputValue, runCheckWithIds]);

  const handleSaveToHistory = useCallback(() => {
      if (state.results.length === 0) return;
      const liveCount = state.results.filter((item) => item.status === 'Live').length;
      const timestamp = Date.now();
      const historyValue = {
        timestamp,
        total: state.results.length,
        live: liveCount,
        die: state.results.length - liveCount,
        note: currentCheckNote.slice(0, 200),
        users: state.results,
      };
      const historyKey = `${HISTORY_KEY_PREFIX}${timestamp}`;
      try {
          localStorage.setItem(historyKey, JSON.stringify(historyValue));
          setHistoryRecords((prev) => [{ key: historyKey, ...historyValue }, ...prev]);
          setShowSavePrompt(false);
          setCurrentCheckNote('');
          setActiveTab('history');
      } catch (e) { alert('保存失败，空间不足'); }
  }, [state.results, currentCheckNote]);
  
  useEffect(() => {
    if (!state.isChecking && state.totalToCheck > 0) {
      setShowSavePrompt(true);
      setCurrentCheckNote('');
    }
  }, [state.isChecking, state.totalToCheck]);


  const handleRecheckHistory = useCallback((record: HistoryRecord) => {
    const ids = record.users.map((user) => user.id);
    setActiveTab('check');
    setInputValue(ids.join('\n'));
    runCheckWithIds(ids);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [runCheckWithIds]);

  const copyToClipboard = useCallback(async (text: string, onSuccess: () => void) => {
    const success = await copyTextToClipboard(text);
    if (success) onSuccess();
  }, []);
  
  // --- UI Vars ---
  const liveResults = state.results.filter((item) => item.status === 'Live');
  const dieResults = state.results.filter((item) => item.status === 'Die');
  const progressPercentage = state.totalToCheck === 0 ? 0 : Math.min(100, Math.round((state.progress / state.totalToCheck) * 100));

  // --- JSX ---
  // (Your existing JSX for rendering the UI remains largely the same)
  // Just make sure to use `state.itemsPerSecond` where you previously used the local `itemsPerSecond` state.
  // Example change:
  // <span className="font-mono font-bold">{state.itemsPerSecond}</span>
  
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans pb-24 selection:bg-blue-500/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-12">
        
        {/* Header */}
        <header className="rounded-3xl bg-white/5 p-4 sm:p-6 shadow-2xl backdrop-blur-md border border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Facebook Tools</p>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Turbo Checker</h1>
                </div>
              </div>
              
              {state.isChecking && state.itemsPerSecond > 0 && (
                 <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-xs text-emerald-400 animate-pulse sm:hidden">
                  <Zap className="h-3 w-3" />
                  <span className="font-mono font-bold">{state.itemsPerSecond}</span>/s
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {state.isChecking && state.itemsPerSecond > 0 && (
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400 animate-pulse">
                  <Zap className="h-4 w-4" />
                  <span className="font-mono font-bold">{state.itemsPerSecond}</span> ID/s
                </div>
              )}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-800/50 p-1 border border-white/10">
                {(['check', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab === 'check' ? '检查' : '历史'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'check' ? (
          <main className="flex flex-col gap-6">
            {/* Input Area */}
            <section className="rounded-3xl bg-white/5 p-4 sm:p-6 border border-white/10 backdrop-blur-md">
                <div className="mb-3">
                    <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-blue-400"/> 输入账号
                    </h2>
                </div>
                
                <textarea
                  className="min-h-[150px] w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono resize-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`100001234567890\n100002345678901`}
                  disabled={state.isChecking}
                />
                
                <div className="mt-4 grid grid-cols-1">
                    <button
                        onClick={handleStartCheck}
                        disabled={state.isChecking}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {state.isChecking ? <Loader2 className="h-5 w-5 animate-spin"/> : <Play className="h-5 w-5 fill-current" />}
                        {state.isChecking ? '检查中...' : '开始检查'}
                    </button>
                </div>
                
                {state.totalToCheck > 0 && (
                    <div className="mt-5 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>进度 {progressPercentage}%</span>
                            <span>{state.progress} / {state.totalToCheck}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </section>
            
            {/* Result Area */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Live Panel */}
                <div className="flex flex-col rounded-3xl bg-white/5 border border-emerald-500/20 overflow-hidden">
                    <div className="p-3 sm:p-4 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live</div>
                            <div className="text-xl sm:text-2xl font-bold text-white">{liveResults.length}</div>
                        </div>
                        <button 
                            onClick={() => copyToClipboard(liveResults.map(u => u.id).join('\n'), () => { setCopiedLive(true); setTimeout(() => setCopiedLive(false), 2000); })}
                            disabled={liveResults.length === 0}
                            className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30"
                        >
                            {copiedLive ? <Check className="h-5 w-5 text-emerald-400"/> : <Copy className="h-5 w-5 text-emerald-400"/>}
                        </button>
                    </div>
                    <div className="flex-1 p-2 relative min-h-[300px]">
                            <VirtualList items={liveResults} height={350} itemHeight={VIRTUAL_ITEM_HEIGHT} renderItem={item => <ResultItem user={item} type="live" />} />
                    </div>
                </div>
                {/* Die Panel */}
                <div className="flex flex-col rounded-3xl bg-white/5 border border-red-500/20 overflow-hidden">
                    <div className="p-3 sm:p-4 bg-red-500/10 border-b border-red-500/10 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Die</div>
                            <div className="text-xl sm:text-2xl font-bold text-white">{dieResults.length}</div>
                        </div>
                            <button 
                            onClick={() => copyToClipboard(dieResults.map(u => u.id).join('\n'), () => { setCopiedDie(true); setTimeout(() => setCopiedDie(false), 2000); })}
                            disabled={dieResults.length === 0}
                            className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30"
                        >
                            {copiedDie ? <Check className="h-5 w-5 text-red-400"/> : <Copy className="h-5 w-5 text-red-400"/>}
                        </button>
                    </div>
                    <div className="flex-1 p-2 relative min-h-[300px]">
                            <VirtualList items={dieResults} height={350} itemHeight={VIRTUAL_ITEM_HEIGHT} renderItem={item => <ResultItem user={item} type="die" />} />
                    </div>
                </div>
            </div>

          </main>
        ) : (
           <main className="space-y-4 sm:space-y-6">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-lg sm:text-xl font-bold">历史记录 ({historyRecords.length})</h2>
                {historyRecords.length > 0 && (
                    <button 
                        onClick={() => { if(confirm('确定清空所有历史？')) { localStorage.clear(); setHistoryRecords([]); } }}
                        className="text-red-400 px-2 py-1 rounded hover:bg-red-500/10 text-sm flex items-center gap-1"
                    >
                        <Trash2 className="h-4 w-4"/> 清空
                    </button>
                )}
            </div>
            
            <div className="grid gap-3 sm:gap-4">
                {historyRecords.map(record => (
                    <div key={record.key} className="rounded-2xl bg-white/5 border border-white/10 p-4 active:border-blue-500/50 transition-colors">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs text-slate-400 mb-1">
                                        {new Date(record.timestamp).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-emerald-400 font-mono text-sm font-bold">L: {record.live}</span>
                                        <span className="text-red-400 font-mono text-sm font-bold">D: {record.die}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRecheckHistory(record)} className="p-2 bg-white/5 rounded-lg active:bg-white/20 text-slate-300">
                                        <RefreshCw className="h-4 w-4"/>
                                    </button>
                                    <button onClick={() => copyToClipboard(record.users.map(u => u.id).join('\n'), () => setCopiedHistoryKey(record.key))} className="p-2 bg-white/5 rounded-lg active:bg-white/20 text-slate-300">
                                        {copiedHistoryKey === record.key ? <Check className="h-4 w-4 text-emerald-400"/> : <Copy className="h-4 w-4"/>}
                                    </button>
                                    <button onClick={() => setExpandedRecords(p => ({...p, [record.key]: !p[record.key]}))} className="p-2 bg-white/5 rounded-lg active:bg-white/20 text-slate-300">
                                        {expandedRecords[record.key] ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                    </button>
                                </div>
                            </div>
                            
                            {editingNoteKey === record.key ? (
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-black/30 rounded px-2 py-2 text-sm text-white border border-white/10"
                                        value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                                        placeholder="输入备注..."
                                    />
                                    <button onClick={() => {
                                        const newNote = noteDraft.slice(0, 200);
                                        const newRec = { ...record, note: newNote };
                                        localStorage.setItem(record.key, JSON.stringify({ ...newRec, key: undefined }));
                                        setHistoryRecords(p => p.map(x => x.key === record.key ? newRec : x));
                                        setEditingNoteKey(null);
                                    }} className="text-xs bg-blue-600 px-3 rounded-lg text-white font-bold">保存</button>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-300 flex items-center gap-2 py-1 px-2 rounded-lg bg-white/5" onClick={() => { setEditingNoteKey(record.key); setNoteDraft(record.note); }}>
                                    <Edit2 className="h-3 w-3 opacity-50"/>
                                    <span className="truncate">{record.note || '点击添加备注'}</span>
                                </div>
                            )}
                            
                             {expandedRecords[record.key] && (
                                <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                    {record.users.slice(0, 50).map(u => (
                                        <div key={u.id} className={`text-[10px] px-2 py-1 rounded flex justify-between ${u.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <span>{u.id.slice(0,8)}...</span><span>{u.status}</span>
                                        </div>
                                    ))}
                                    {record.users.length > 50 && <div className="col-span-2 text-center text-[10px] text-slate-500">仅显示前 50 条</div>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </main>
        )}
        
        {/* Save Prompt */}
        {showSavePrompt && state.results.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-slate-900 to-slate-900/90 backdrop-blur-lg border-t border-white/10">
                <div className="mx-auto max-w-7xl flex flex-col gap-3">
                    <div className="flex items-center justify-between text-white">
                        <span className="font-bold flex items-center gap-2"><Save className="h-4 w-4"/> 检查完成</span>
                        <span className="text-xs opacity-70">L:{state.results.filter(x=>x.status==='Live').length} / D:{state.results.filter(x=>x.status==='Die').length}</span>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={currentCheckNote}
                            onChange={e => setCurrentCheckNote(e.target.value)}
                            placeholder="备注..."
                            className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white/30"
                        />
                        <button onClick={handleSaveToHistory} className="bg-white text-slate-900 px-4 rounded-lg text-sm font-bold">保存</button>
                        <button 
                            onClick={() => { setShowSavePrompt(false); }} 
                            className="text-white/60 px-2 text-sm"
                        >
                            放弃
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );

};

export default App;
