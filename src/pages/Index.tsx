import React, { useCallback, useEffect, useReducer, useRef, useState, memo } from 'react';
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
  Pause,
  Play,
  RefreshCw,
  Save,
  Trash2,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

// --- 类型定义 ---

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
  isPaused: boolean;
};

type CheckAction =
  | { type: 'START_CHECK'; total: number }
  | { type: 'BATCH_UPDATE'; results: UserResult[]; progress: number }
  | { type: 'FINISH_CHECK' }
  | { type: 'PAUSE_CHECK' }
  | { type: 'RESUME_CHECK' }
  | { type: 'RESET' };

// --- 常量配置 ---

const HISTORY_KEY_PREFIX = 'fb_history:';
// 并发数：决定了速度的核心。200 是一个比较激进但通常安全的数字。
// 如果网络带宽很大，可以尝试调高到 300-500，但要注意浏览器限制。
const CONCURRENCY_LIMIT = 200; 
// UI刷新频率(ms)：降低频率可以显著减少CPU占用，让步给网络请求
const UI_UPDATE_INTERVAL = 500; 
const VIRTUAL_ITEM_HEIGHT = 44;
const VIRTUAL_BUFFER = 5;

// --- Reducer ---

const checkReducer = (state: CheckState, action: CheckAction): CheckState => {
  switch (action.type) {
    case 'START_CHECK':
      return {
        ...state,
        isChecking: true,
        isPaused: false,
        totalToCheck: action.total,
        progress: 0,
        results: [],
      };
    case 'BATCH_UPDATE':
      return {
        ...state,
        results: action.results, // 此时接收的是全量数组
        progress: action.progress,
      };
    case 'FINISH_CHECK':
      return { ...state, isChecking: false, isPaused: false };
    case 'PAUSE_CHECK':
      return { ...state, isPaused: true };
    case 'RESUME_CHECK':
      return { ...state, isPaused: false };
    case 'RESET':
      return {
        results: [],
        progress: 0,
        totalToCheck: 0,
        isChecking: false,
        isPaused: false,
      };
    default:
      return state;
  }
};

// --- 虚拟列表组件 ---

const VirtualList = memo<{
  items: UserResult[];
  height: number;
  itemHeight: number;
  renderItem: (item: UserResult, index: number) => React.ReactNode;
}>(({ items, height, itemHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / itemHeight) + VIRTUAL_BUFFER
  );

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
      className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      style={{ height: `${height}px` }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, idx) => (
            <div key={`${item.id}-${visibleStart + idx}`}>
              {renderItem(item, visibleStart + idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
VirtualList.displayName = 'VirtualList';

// --- 结果单项组件 ---

const ResultItem = memo<{ user: UserResult; type: 'live' | 'die' }>(({ user, type }) => {
  const isLive = type === 'live';
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white mb-1 border border-white/5"
      style={{ minHeight: `${VIRTUAL_ITEM_HEIGHT}px` }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full shadow-sm ${isLive ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-400 shadow-red-400/50'}`}
        />
        <span className="font-mono opacity-90">{user.id}</span>
      </div>
      {isLive ? (
        <CheckCircle className="h-4 w-4 text-emerald-400" />
      ) : (
        <XCircle className="h-4 w-4 text-red-400" />
      )}
    </div>
  );
});
ResultItem.displayName = 'ResultItem';

// --- 工具函数 ---

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
  const matches = raw.match(/\d{5,}/g) ?? []; // 宽松匹配5位以上数字
  return Array.from(new Set(matches));
};

// --- 主应用 ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check');
  const [inputValue, setInputValue] = useState<string>('');
  
  const [state, dispatch] = useReducer(checkReducer, {
    results: [],
    progress: 0,
    totalToCheck: 0,
    isChecking: false,
    isPaused: false,
  });

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [editingNoteKey, setEditingNoteKey] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  
  const [copiedHistoryKey, setCopiedHistoryKey] = useState<string | null>(null);
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedDie, setCopiedDie] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [currentCheckNote, setCurrentCheckNote] = useState('');
  
  const [itemsPerSecond, setItemsPerSecond] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- 历史记录加载 ---

  const loadHistory = useCallback(() => {
    if (typeof window === 'undefined') return;
    const stored: HistoryRecord[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(HISTORY_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.users)) {
            stored.push({
              key,
              timestamp: parsed.timestamp,
              total: parsed.total,
              live: parsed.live ?? 0,
              die: parsed.die ?? 0,
              note: parsed.note ?? '',
              users: parsed.users,
            });
          }
        } catch { /* ignore */ }
      }
    }
    const sorted = stored.sort((a, b) => b.timestamp - a.timestamp);
    setHistoryRecords(sorted);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // --- 核心检查逻辑 (优化版) ---

  const checkSingleUser = useCallback(async (id: string, signal: AbortSignal): Promise<UserResult> => {
    const url = `https://graph.facebook.com/${id}/picture?redirect=false`;
    try {
      const res = await fetch(url, { signal, keepalive: true } as any);
      if (!res.ok) throw new Error('Err');
      const data = await res.json();
      const urlField = data?.data?.url ?? '';
      const status: UserResult['status'] = urlField.includes('static') ? 'Die' : 'Live';
      return { id, status, url: urlField };
    } catch {
      return { id, status: 'Die', url: '' };
    }
  }, []);

  const runCheckWithIds = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;

      // 1. 初始化
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;
      
      dispatch({ type: 'START_CHECK', total: ids.length });
      setShowSavePrompt(false);
      setItemsPerSecond(0);

      // 2. 使用 Ref 存储临时结果，不触发渲染
      const resultsRef = { current: [] as UserResult[] };
      let completedCount = 0;
      const startTime = Date.now();

      // 3. 启动 UI 刷新定时器 (解耦渲染)
      const uiTimer = setInterval(() => {
        if (resultsRef.current.length > 0) {
          // 计算瞬时速度
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = elapsed > 0 ? completedCount / elapsed : 0;
          setItemsPerSecond(Math.round(speed));

          // 批量更新 State
          dispatch({ 
            type: 'BATCH_UPDATE', 
            results: [...resultsRef.current], // 复制当前所有结果
            progress: completedCount 
          });
        }
      }, UI_UPDATE_INTERVAL);

      // 4. 并发池控制逻辑
      const activePromises = new Set<Promise<void>>();
      const idsIterator = ids.values();

      try {
        for (const id of idsIterator) {
          // 停止检查
          if (signal.aborted) break;

          // 暂停逻辑
          while (state.isPaused && !signal.aborted) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // 创建任务
          const task = checkSingleUser(id, signal).then(result => {
            if (!signal.aborted) {
              resultsRef.current.push(result);
              completedCount++;
            }
            activePromises.delete(task);
          });

          activePromises.add(task);

          // 如果池满了，等待任意一个任务完成 (Promise.race)
          if (activePromises.size >= CONCURRENCY_LIMIT) {
            await Promise.race(activePromises);
          }
        }

        // 等待剩余任务完成
        await Promise.all(activePromises);

      } catch (e) {
        console.error("Check loop interrupted", e);
      } finally {
        clearInterval(uiTimer);
        
        if (!signal.aborted) {
          // 最终同步一次
          dispatch({ 
            type: 'BATCH_UPDATE', 
            results: resultsRef.current, 
            progress: ids.length 
          });
          dispatch({ type: 'FINISH_CHECK' });
          setShowSavePrompt(true);
          setCurrentCheckNote('');
          setItemsPerSecond(0);
        }
      }
    },
    [checkSingleUser, state.isPaused] // 去除了 state.results 依赖，避免闭包陷阱
  );

  // --- 交互处理 ---

  const handleStartCheck = useCallback(() => {
    const ids = parseInputIds(inputValue);
    if (ids.length === 0) {
      alert('未识别到有效 ID，请输入数字 ID');
      return;
    }
    runCheckWithIds(ids);
  }, [inputValue, runCheckWithIds]);

  const handlePauseResume = useCallback(() => {
    if (state.isPaused) dispatch({ type: 'RESUME_CHECK' });
    else dispatch({ type: 'PAUSE_CHECK' });
  }, [state.isPaused]);

  const handleStopCheck = useCallback(() => {
    abortControllerRef.current?.abort();
    dispatch({ type: 'RESET' });
    setShowSavePrompt(false);
    setItemsPerSecond(0);
  }, []);

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
    } catch (e) {
        alert('保存失败，可能是存储空间已满，请清理历史记录。');
    }
  }, [state.results, currentCheckNote]);

  const handleRecheckHistory = useCallback((record: HistoryRecord) => {
    const ids = record.users.map((user) => user.id);
    setActiveTab('check');
    setInputValue(ids.join('\n'));
    runCheckWithIds(ids);
  }, [runCheckWithIds]);

  const copyToClipboard = useCallback(async (text: string, onSuccess: () => void) => {
    const success = await copyTextToClipboard(text);
    if (success) onSuccess();
  }, []);

  // --- UI 辅助 ---

  const liveResults = state.results.filter((item) => item.status === 'Live');
  const dieResults = state.results.filter((item) => item.status === 'Die');
  const progressPercentage = state.totalToCheck === 0 ? 0 : Math.min(100, Math.round((state.progress / state.totalToCheck) * 100));
  
  const estimatedTimeRemaining = () => {
    if (!state.isChecking || state.progress === 0 || itemsPerSecond === 0) return null;
    const remaining = state.totalToCheck - state.progress;
    const seconds = remaining / itemsPerSecond;
    if (seconds < 60) return `约 ${Math.round(seconds)} 秒`;
    return `约 ${Math.round(seconds / 60)} 分钟`;
  };

  // --- 渲染 ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans selection:bg-blue-500/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        
        {/* Header */}
        <header className="rounded-3xl bg-white/5 p-6 shadow-2xl backdrop-blur-md border border-white/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Facebook Tools</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Turbo Checker Pro</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {state.isChecking && itemsPerSecond > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-400 animate-pulse">
                  <Zap className="h-4 w-4" />
                  <span className="font-mono font-bold">{itemsPerSecond}</span> ID/s
                </div>
              )}
              <div className="flex rounded-xl bg-slate-800/50 p-1 border border-white/10">
                {(['check', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab === 'check' ? '检查工具' : '历史记录'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'check' ? (
          <main className="grid gap-6 lg:grid-cols-12">
            {/* 左侧控制区 */}
            <div className="lg:col-span-4 space-y-6">
              <section className="rounded-3xl bg-white/5 p-6 border border-white/10 backdrop-blur-md flex flex-col h-full">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-blue-400"/> 输入账号
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">支持混合文本，自动提取 ID</p>
                </div>
                
                <textarea
                  className="flex-1 min-h-[200px] w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono resize-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`粘贴文本内容...\n100001234567890\n100002345678901\n...`}
                  disabled={state.isChecking}
                />
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                    {!state.isChecking ? (
                        <button
                            onClick={handleStartCheck}
                            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            <Play className="h-4 w-4 fill-current" /> 开始极速检查
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handlePauseResume}
                                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-sm font-bold text-white transition-all active:scale-95"
                            >
                                {state.isPaused ? <Play className="h-4 w-4 fill-current"/> : <Pause className="h-4 w-4 fill-current"/>}
                                {state.isPaused ? '继续' : '暂停'}
                            </button>
                            <button
                                onClick={handleStopCheck}
                                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-400 py-3 text-sm font-bold text-white transition-all active:scale-95"
                            >
                                <Trash2 className="h-4 w-4"/> 停止
                            </button>
                        </>
                    )}
                </div>

                {/* 进度条 */}
                {state.totalToCheck > 0 && (
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>进度 {Math.round((state.progress / state.totalToCheck) * 100)}%</span>
                            <span>{state.progress} / {state.totalToCheck}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className={`h-full transition-all duration-300 ${state.isPaused ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-center text-[10px] text-slate-500 h-4">
                            {estimatedTimeRemaining() && `预计剩余: ${estimatedTimeRemaining()}`}
                        </p>
                    </div>
                )}
              </section>
            </div>

            {/* 右侧结果区 */}
            <div className="lg:col-span-8 space-y-6">
                {/* 保存提示 */}
                {showSavePrompt && state.results.length > 0 && (
                    <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-white/20 rounded-lg"><Save className="h-6 w-6 text-white"/></div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white">检查完成</h3>
                                <div className="mt-3 flex gap-3">
                                    <input 
                                        type="text" 
                                        value={currentCheckNote}
                                        onChange={e => setCurrentCheckNote(e.target.value)}
                                        placeholder="输入备注..."
                                        className="flex-1 bg-black/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 outline-none border border-transparent focus:border-white/30"
                                    />
                                    <button onClick={handleSaveToHistory} className="bg-white text-teal-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90">保存</button>
                                    <button onClick={() => { setShowSavePrompt(false); dispatch({type:'RESET'}); }} className="text-white/80 hover:text-white px-3 text-sm">丢弃</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 h-[600px]">
                    {/* Live Panel */}
                    <div className="flex flex-col rounded-3xl bg-white/5 border border-emerald-500/20 overflow-hidden">
                        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Accounts</div>
                                <div className="text-2xl font-bold text-white">{liveResults.length}</div>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(liveResults.map(u => u.id).join('\n'), () => { setCopiedLive(true); setTimeout(() => setCopiedLive(false), 2000); })}
                                disabled={liveResults.length === 0}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                            >
                                {copiedLive ? <Check className="h-5 w-5 text-emerald-400"/> : <Copy className="h-5 w-5 text-emerald-400"/>}
                            </button>
                        </div>
                        <div className="flex-1 p-2 relative">
                             <VirtualList items={liveResults} height={520} itemHeight={VIRTUAL_ITEM_HEIGHT} renderItem={item => <ResultItem user={item} type="live" />} />
                        </div>
                    </div>

                    {/* Die Panel */}
                    <div className="flex flex-col rounded-3xl bg-white/5 border border-red-500/20 overflow-hidden">
                        <div className="p-4 bg-red-500/10 border-b border-red-500/10 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Die Accounts</div>
                                <div className="text-2xl font-bold text-white">{dieResults.length}</div>
                            </div>
                             <button 
                                onClick={() => copyToClipboard(dieResults.map(u => u.id).join('\n'), () => { setCopiedDie(true); setTimeout(() => setCopiedDie(false), 2000); })}
                                disabled={dieResults.length === 0}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                            >
                                {copiedDie ? <Check className="h-5 w-5 text-red-400"/> : <Copy className="h-5 w-5 text-red-400"/>}
                            </button>
                        </div>
                        <div className="flex-1 p-2 relative">
                             <VirtualList items={dieResults} height={520} itemHeight={VIRTUAL_ITEM_HEIGHT} renderItem={item => <ResultItem user={item} type="die" />} />
                        </div>
                    </div>
                </div>
            </div>
          </main>
        ) : (
          /* 历史记录 Tab */
          <main className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">历史记录 ({historyRecords.length})</h2>
                {historyRecords.length > 0 && (
                    <button 
                        onClick={() => { if(confirm('确定清空所有历史？')) { localStorage.clear(); setHistoryRecords([]); } }}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                        <Trash2 className="h-4 w-4"/> 清空
                    </button>
                )}
            </div>
            
            <div className="grid gap-4">
                {historyRecords.map(record => (
                    <div key={record.key} className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-blue-500/30 transition-colors">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                    <span>{new Date(record.timestamp).toLocaleString()}</span>
                                    <span>·</span>
                                    <span>共 {record.total} 条</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-400 font-mono text-sm font-bold">Live: {record.live}</span>
                                    <span className="text-red-400 font-mono text-sm font-bold">Die: {record.die}</span>
                                </div>
                                {editingNoteKey === record.key ? (
                                    <div className="mt-3 flex gap-2">
                                        <input 
                                            className="bg-black/30 rounded px-2 py-1 text-sm text-white border border-white/10"
                                            value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={() => {
                                            const newNote = noteDraft.slice(0, 200);
                                            const newRec = { ...record, note: newNote };
                                            localStorage.setItem(record.key, JSON.stringify({ ...newRec, key: undefined }));
                                            setHistoryRecords(p => p.map(x => x.key === record.key ? newRec : x));
                                            setEditingNoteKey(null);
                                        }} className="text-xs bg-blue-600 px-2 rounded text-white">保存</button>
                                    </div>
                                ) : (
                                    <div className="mt-2 text-sm text-slate-300 flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingNoteKey(record.key); setNoteDraft(record.note); }}>
                                        <span className="opacity-50 group-hover:opacity-100 transition-opacity"><Edit2 className="h-3 w-3"/></span>
                                        {record.note || '无备注'}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRecheckHistory(record)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-300" title="重检"><RefreshCw className="h-4 w-4"/></button>
                                <button onClick={() => copyToClipboard(record.users.map(u => u.id).join('\n'), () => setCopiedHistoryKey(record.key))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-300" title="复制所有ID">
                                    {copiedHistoryKey === record.key ? <Check className="h-4 w-4 text-emerald-400"/> : <Copy className="h-4 w-4"/>}
                                </button>
                                <button onClick={() => setExpandedRecords(p => ({...p, [record.key]: !p[record.key]}))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-300" title="详情">
                                    {expandedRecords[record.key] ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </button>
                            </div>
                        </div>
                        {expandedRecords[record.key] && (
                            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                {record.users.slice(0, 100).map(u => (
                                    <div key={u.id} className={`text-xs px-2 py-1 rounded flex justify-between ${u.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        <span>{u.id}</span><span>{u.status}</span>
                                    </div>
                                ))}
                                {record.users.length > 100 && <div className="col-span-2 text-center text-xs text-slate-500">仅显示前 100 条</div>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
