import React, { useCallback, useEffect, useReducer, useRef, useState, memo } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Check, CheckCircle, Copy, Edit2, Eye, EyeOff, Loader2, RefreshCw, Save, Trash2, Users, XCircle, Zap, Play, HelpCircle, Star, ShieldCheck, StopCircle, Target
} from 'lucide-react';

// --- 类型定义 ---

type UserResult = { id: string; status: 'Live' | 'Die'; url: string; };
type HistoryRecord = { key: string; timestamp: number; total: number; live: number; die: number; note: string; users: UserResult[]; };

// 修改 State 结构以适应自动扫描
type CheckState = { 
  results: UserResult[]; 
  totalScanned: number; 
  liveCount: number;
  isChecking: boolean; 
};

// 修改 Action 类型
type CheckAction = 
  | { type: 'START_CHECK' } 
  | { type: 'APPEND_BATCH'; newResults: UserResult[] } 
  | { type: 'FINISH_CHECK' } 
  | { type: 'RESET' }
  | { type: 'RESTORE_HISTORY'; results: UserResult[] }; // 用于历史记录回显

// --- 常量配置 ---

const HISTORY_KEY_PREFIX = 'fb_history:';
const CONCURRENCY_LIMIT = 200; // 并发请求数
const BATCH_SIZE = 200; // 每一批生成的 ID 数量
const VIRTUAL_ITEM_HEIGHT = 48;
const VIRTUAL_BUFFER = 5;

// --- Reducer (逻辑调整) ---

const checkReducer = (state: CheckState, action: CheckAction): CheckState => {
  switch (action.type) {
    case 'START_CHECK': 
      return { ...state, isChecking: true, results: [], totalScanned: 0, liveCount: 0 };
    case 'APPEND_BATCH': {
      const newLive = action.newResults.filter(r => r.status === 'Live').length;
      return { 
        ...state, 
        results: [...state.results, ...action.newResults], 
        totalScanned: state.totalScanned + action.newResults.length,
        liveCount: state.liveCount + newLive
      };
    }
    case 'FINISH_CHECK': 
      return { ...state, isChecking: false };
    case 'RESET': 
      return { results: [], totalScanned: 0, liveCount: 0, isChecking: false };
    case 'RESTORE_HISTORY':
      return { 
        results: action.results, 
        totalScanned: action.results.length, 
        liveCount: action.results.filter(r => r.status === 'Live').length, 
        isChecking: false 
      };
    default: 
      return state;
  }
};

// --- 虚拟列表组件 (保持不变) ---
const VirtualList = memo<{ items: UserResult[]; height: number; itemHeight: number; renderItem: (item: UserResult, index: number) => React.ReactNode; }>(({ items, height, itemHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER);
  const visibleEnd = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + VIRTUAL_BUFFER);
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => { setScrollTop(e.currentTarget.scrollTop); }, []);
  return (
    <div ref={containerRef} onScroll={handleScroll} className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent touch-pan-y" style={{ height: `${height}px` }}>
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, idx) => ( <div key={`${item.id}-${visibleStart + idx}`}>{renderItem(item, visibleStart + idx)}</div> ))}
        </div>
      </div>
    </div>
  );
});
VirtualList.displayName = 'VirtualList';

// --- 结果单项组件 (保持不变) ---
const ResultItem = memo<{ user: UserResult; type: 'live' | 'die' }>(({ user, type }) => {
  const isLive = type === 'live';
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white mb-1 border border-white/5 active:bg-white/10 transition-colors" style={{ minHeight: `${VIRTUAL_ITEM_HEIGHT}px` }}>
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${isLive ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-400 shadow-red-400/50'}`} />
        <span className="font-mono opacity-90 tracking-wide">{user.id}</span>
      </div>
      {isLive ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
    </div>
  );
});
ResultItem.displayName = 'ResultItem';

// --- 工具函数 ---

const copyTextToClipboard = async (text: string) => { if (!text) return false; try { if (navigator?.clipboard?.writeText) { await navigator.clipboard.writeText(text); } else { const textarea = document.createElement('textarea'); textarea.value = text; textarea.style.position = 'fixed'; textarea.style.left = '-9999px'; document.body.appendChild(textarea); textarea.focus(); textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea); } return true; } catch { return false; } };

// 生成随机 ID：6156 + 10位随机数字
const generateRandomIds = (count: number): string[] => {
  const ids = new Set<string>();
  while (ids.size < count) {
    // 生成 10 位随机数，不足补0
    const randomPart = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    ids.add(`6156${randomPart}`);
  }
  return Array.from(ids);
};

// --- 主应用 ---

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check');
  
  // 核心 State
  const [targetLiveCount, setTargetLiveCount] = useState<number>(10);
  const [state, dispatch] = useReducer(checkReducer, { results: [], totalScanned: 0, liveCount: 0, isChecking: false });
  
  // 引用 Refs 用于循环控制，避免闭包陷阱
  const abortControllerRef = useRef<AbortController | null>(null);
  const statsRef = useRef({ currentLive: 0, isRunning: false });
  
  // 历史记录相关
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

  // 加载历史
  const loadHistory = useCallback(() => { if (typeof window === 'undefined') return; const stored: HistoryRecord[] = []; for (let i = 0; i < localStorage.length; i += 1) { const key = localStorage.key(i); if (key && key.startsWith(HISTORY_KEY_PREFIX)) { const raw = localStorage.getItem(key); if (!raw) continue; try { const parsed = JSON.parse(raw); if (parsed && Array.isArray(parsed.users)) { stored.push({ key, timestamp: parsed.timestamp, total: parsed.total, live: parsed.live ?? 0, die: parsed.die ?? 0, note: parsed.note ?? '', users: parsed.users, }); } } catch { } } } setHistoryRecords(stored.sort((a, b) => b.timestamp - a.timestamp)); }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // 单个用户检查逻辑 (保持原样，确保 Fetch 逻辑稳定)
  const checkSingleUser = useCallback(async (id: string, maxRetries = 2): Promise<UserResult> => { 
    const url = `https://graph.facebook.com/${id}/picture?redirect=false`; 
    for (let attempt = 1; attempt <= maxRetries; attempt++) { 
      try { 
        const res = await fetch(url, { keepalive: true } as any); 
        if (res.status >= 400 && res.status < 500) { return { id, status: 'Die', url: '' }; } 
        if (!res.ok) { throw new Error('Temporary fetch error'); } 
        const data = await res.json(); 
        const urlField = data?.data?.url ?? ''; 
        const status: UserResult['status'] = urlField.includes('static') ? 'Die' : 'Live'; 
        return { id, status, url: urlField }; 
      } catch (error) { 
        if (attempt === maxRetries) { return { id, status: 'Die', url: '' }; } 
        await new Promise(res => setTimeout(res, 300 * attempt)); 
      } 
    } 
    return { id, status: 'Die', url: '' }; 
  }, []);

  // --- 新的核心逻辑：处理一批 ID ---
  const processBatch = async (ids: string[]): Promise<UserResult[]> => {
    const results: UserResult[] = [];
    const activePromises = new Set<Promise<void>>();
    
    for (const id of ids) {
      // 如果用户点击停止，立即中断批处理循环
      if (!statsRef.current.isRunning) break;

      const task = checkSingleUser(id).then(result => {
        results.push(result);
        activePromises.delete(task);
      });

      activePromises.add(task);
      if (activePromises.size >= CONCURRENCY_LIMIT) {
        await Promise.race(activePromises);
      }
    }
    await Promise.all(activePromises);
    return results;
  };

  // --- 新的核心逻辑：自动生成并扫描的主循环 ---
  const runAutoScan = useCallback(async () => {
    if (targetLiveCount <= 0) { alert("目标数量必须大于 0"); return; }

    // 1. 初始化状态
    dispatch({ type: 'START_CHECK' });
    setShowSavePrompt(false);
    setItemsPerSecond(0);
    
    // 2. 初始化 Ref (用于循环控制)
    statsRef.current = { currentLive: 0, isRunning: true };
    abortControllerRef.current = new AbortController();

    const startTime = Date.now();
    let localTotalScanned = 0;

    // UI 计时器
    const uiTimer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 0) {
            setItemsPerSecond(Math.round(localTotalScanned / elapsed));
        }
    }, 500);

    try {
        // 3. 主循环：只要 Live 数未达标且处于运行状态，就持续生成
        while (statsRef.current.isRunning && statsRef.current.currentLive < targetLiveCount) {
            
            // 生成一批 ID
            const batchIds = generateRandomIds(BATCH_SIZE);
            
            // 处理这批 ID
            const batchResults = await processBatch(batchIds);
            
            // 计算这批结果
            const batchLiveCount = batchResults.filter(u => u.status === 'Live').length;
            
            // 更新 Ref 计数
            statsRef.current.currentLive += batchLiveCount;
            localTotalScanned += batchResults.length;

            // 更新 UI State
            dispatch({ type: 'APPEND_BATCH', newResults: batchResults });

            // 可以在这里加一点微小的延迟让主线程喘口气，虽然 await 已经让出了控制权
        }
    } catch (e) {
        console.error("Auto scan error:", e);
    } finally {
        clearInterval(uiTimer);
        statsRef.current.isRunning = false;
        setItemsPerSecond(0);
        dispatch({ type: 'FINISH_CHECK' });
        setShowSavePrompt(true);
        setCurrentCheckNote(`Auto Scan: Target ${targetLiveCount}`);
    }
  }, [targetLiveCount, checkSingleUser]);

  const handleStop = useCallback(() => {
      statsRef.current.isRunning = false; // 循环会在下一个检查点停止
  }, []);

  const handleSaveToHistory = useCallback(() => { 
    if (state.results.length === 0) return; 
    const timestamp = Date.now(); 
    const historyValue = { 
        timestamp, 
        total: state.results.length, 
        live: state.liveCount, 
        die: state.results.length - state.liveCount, 
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
        alert('保存失败，浏览器存储空间不足。建议导出或清理旧记录。'); 
    } 
  }, [state.results, state.liveCount, currentCheckNote]);

  const handleRecheckHistory = useCallback((record: HistoryRecord) => { 
    // 历史记录回显不再支持“继续扫描”，而是静态展示，因为原逻辑是文本框输入
    // 如果需要支持，可以提取 ID 重新跑 checkSingleUser，但这里我们简单做回显
    setActiveTab('check'); 
    dispatch({ type: 'RESTORE_HISTORY', results: record.users });
  }, []);

  const copyToClipboard = useCallback(async (text: string, onSuccess: () => void) => { const success = await copyTextToClipboard(text); if (success) onSuccess(); }, []);

  // UI Vars
  const liveResults = state.results.filter((item) => item.status === 'Live');
  const dieResults = state.results.filter((item) => item.status === 'Die');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans pb-24 selection:bg-blue-500/30">
        <HelmetProvider>
            <Helmet>
                <title>Facebook 自动撞库检测 | 批量 FB UID 生成与存活检查</title>
                <meta name="description" content="全自动 Facebook 账号存活检测工具。自动生成 UID 并批量验证 Live/Die 状态，支持设定目标存活数量自动停止。" />
            </Helmet>
        </HelmetProvider>

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
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">FB 自动撞库检测器</h1>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Auto-Gen & Check</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-800/50 p-1 border border-white/10">
                {(['check', 'history'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${ activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5' }`}>
                    {tab === 'check' ? '自动检查' : '历史记录'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>
        
        {activeTab === 'check' ? (
          <main className="flex flex-col gap-6">
            
            {/* --- 控制面板 (重构部分) --- */}
            <section className="rounded-3xl bg-white/5 p-4 sm:p-6 border border-white/10 backdrop-blur-md">
                <div className="mb-4 flex items-center gap-2 text-blue-300">
                    <Target className="h-5 w-5" />
                    <h2 className="text-lg font-semibold text-white">配置与控制</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* 1. 目标设置 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">目标 Live 数量</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="1" 
                                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 pl-4 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-lg"
                                value={targetLiveCount}
                                onChange={(e) => setTargetLiveCount(parseInt(e.target.value) || 0)}
                                disabled={state.isChecking}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">个</span>
                        </div>
                    </div>

                    {/* 2. 状态展示 */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">当前扫描状态</label>
                        <div className="flex items-center justify-between rounded-xl bg-black/20 border border-white/10 p-3 px-4 h-[54px]">
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] text-slate-500">已生成并扫描</span>
                                <span className="text-lg font-mono font-bold text-white">{state.totalScanned.toLocaleString()}</span>
                            </div>
                            {state.isChecking && (
                                <div className="flex items-center gap-1 text-emerald-400 animate-pulse">
                                    <Zap className="h-4 w-4" />
                                    <span className="text-xs font-mono font-bold">{itemsPerSecond}/s</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. 操作按钮 */}
                    <div>
                        {!state.isChecking ? (
                            <button onClick={runAutoScan} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 h-[54px] text-base font-bold text-white shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform hover:bg-blue-500">
                                <Play className="h-5 w-5 fill-current" /> 开始自动生成
                            </button>
                        ) : (
                            <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/80 border border-red-500 h-[54px] text-base font-bold text-white shadow-lg shadow-red-500/20 active:scale-[0.98] transition-transform hover:bg-red-500">
                                <StopCircle className="h-5 w-5" /> 停止扫描
                            </button>
                        )}
                    </div>
                </div>
                
                {/* 进度条 */}
                {state.isChecking && (
                     <div className="mt-6">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>目标进度 ({state.liveCount} / {targetLiveCount})</span>
                            <span>{Math.min(100, Math.round((state.liveCount / targetLiveCount) * 100))}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, (state.liveCount / targetLiveCount) * 100)}%` }} />
                        </div>
                     </div>
                )}
            </section>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col rounded-3xl bg-white/5 border border-emerald-500/20 overflow-hidden">
                    <div className="p-3 sm:p-4 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center justify-between">
                        <div><div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live (有效)</div><div className="text-xl sm:text-2xl font-bold text-white">{liveResults.length}</div></div>
                        <button onClick={() => copyToClipboard(liveResults.map(u => u.id).join('\n'), () => { setCopiedLive(true); setTimeout(() => setCopiedLive(false), 2000); })} disabled={liveResults.length === 0} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30">{copiedLive ? <Check className="h-5 w-5 text-emerald-400"/> : <Copy className="h-5 w-5 text-emerald-400"/>}</button>
                    </div>
                    <div className="flex-1 p-2 relative min-h-[300px]"><VirtualList items={liveResults} height={350} itemHeight={VIRTUAL_ITEM_HEIGHT} renderItem={item => <ResultItem user={item} type="live" />} /></div>
                </div>
                <div className="flex flex-col rounded-3xl bg-white/5 border border-red-500/20 overflow-hidden">
                    <div className="p-3 sm:p-4 bg-red-500/10 border-b border-red-500/10 flex items-center justify-between">
                        <div><div className="text-xs font-bold text-red-400 uppercase tracking-wider">Die (无效)</div><div className="text-xl sm:text-2xl font-bold text-white">{dieResults.length}</div></div>
                        <button onClick={() => copyToClipboard(dieResults.map(u => u.id).join('\n'), () => { setCopiedDie(true); setTimeout(() => setCopiedDie(false), 2000); })} disabled={dieResults.length === 0} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30">{copiedDie ? <Check className="h-5 w-5 text-red-400"/> : <Copy className="h-5 w-5 text-red-400"/>}</button>
                    </div>
                    <div className="flex-1 p-2 relative min-h-[300px]"><VirtualList items={dieResults} height={350} itemHeight={VIRTUAL_ITEM_HEIGHT} renderItem={item => <ResultItem user={item} type="die" />} /></div>
                </div>
            </div>
          </main>
        ) : (
          <main className="space-y-4 sm:space-y-6">
             {/* 历史记录部分 (逻辑微调：移除清空全部，保留单条，UI保持) */}
             <div className="flex items-center justify-between px-1"><h2 className="text-lg sm:text-xl font-bold">历史记录 ({historyRecords.length})</h2>{historyRecords.length > 0 && (<button onClick={() => { if(confirm('确定清空所有历史？')) { localStorage.clear(); setHistoryRecords([]); } }} className="text-red-400 px-2 py-1 rounded hover:bg-red-500/10 text-sm flex items-center gap-1"><Trash2 className="h-4 w-4"/> 清空</button>)}</div>
            <div className="grid gap-3 sm:gap-4">{historyRecords.map(record => ( <div key={record.key} className="rounded-2xl bg-white/5 border border-white/10 p-4 active:border-blue-500/50 transition-colors"><div className="flex flex-col gap-3"><div className="flex justify-between items-start"><div><div className="text-xs text-slate-400 mb-1">{new Date(record.timestamp).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div><div className="flex items-center gap-3"><span className="text-emerald-400 font-mono text-sm font-bold">L: {record.live}</span><span className="text-red-400 font-mono text-sm font-bold">D: {record.die}</span></div></div><div className="flex gap-2"><button onClick={() => handleRecheckHistory(record)} title="查看详情" className="p-2 bg-white/5 rounded-lg active:bg-white/20 text-slate-300"><Eye className="h-4 w-4"/></button><button onClick={() => copyToClipboard(record.users.map(u => u.id).join('\n'), () => setCopiedHistoryKey(record.key))} className="p-2 bg-white/5 rounded-lg active:bg-white/20 text-slate-300">{copiedHistoryKey === record.key ? <Check className="h-4 w-4 text-emerald-400"/> : <Copy className="h-4 w-4"/>}</button></div></div>{editingNoteKey === record.key ? (<div className="flex gap-2"><input className="flex-1 bg-black/30 rounded px-2 py-2 text-sm text-white border border-white/10" value={noteDraft} onChange={e => setNoteDraft(e.target.value)} placeholder="输入备注..."/><button onClick={() => { const newNote = noteDraft.slice(0, 200); const newRec = { ...record, note: newNote }; localStorage.setItem(record.key, JSON.stringify({ ...newRec, key: undefined })); setHistoryRecords(p => p.map(x => x.key === record.key ? newRec : x)); setEditingNoteKey(null); }} className="text-xs bg-blue-600 px-3 rounded-lg text-white font-bold">保存</button></div>) : (<div className="text-sm text-slate-300 flex items-center gap-2 py-1 px-2 rounded-lg bg-white/5" onClick={() => { setEditingNoteKey(record.key); setNoteDraft(record.note); }}><Edit2 className="h-3 w-3 opacity-50"/><span className="truncate">{record.note || '点击添加备注'}</span></div>)}</div></div>))}</div>
          </main>
        )}
        
        {/* 底部说明区域 (文案调整) */}
        <section className="rounded-3xl bg-white/5 p-4 sm:p-6 border border-white/10 backdrop-blur-md space-y-6">
          <div>
              <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 mb-3">
                  <HelpCircle className="h-5 w-5 text-blue-400"/> 自动撞库模式说明
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                  本工具已切换为自动生成模式。程序会不断生成以 <code>6156</code> 开头的 14 位随机 ID，并自动检测其存活状态。当检测到的有效（Live）账号数量达到您设定的目标值时，程序将自动停止。
              </p>
          </div>
          <div>
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-amber-400"/> 核心特性
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <li className="flex items-start gap-3"><Target className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5"/><span className="text-slate-300"><strong>目标导向:</strong> 设定想要的号量（如 100 个），挂机等待即可。</span></li>
                  <li className="flex items-start gap-3"><Zap className="h-5 w-5 text-fuchsia-400 flex-shrink-0 mt-0.5"/><span className="text-slate-300"><strong>自动循环:</strong> 采用分批（Batch）生成机制，防止浏览器崩溃，持续稳定运行。</span></li>
              </ul>
          </div>
        </section>

        {showSavePrompt && state.results.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-slate-900 to-slate-900/90 backdrop-blur-lg border-t border-white/10">
                <div className="mx-auto max-w-7xl flex flex-col gap-3">
                    <div className="flex items-center justify-between text-white"><span className="font-bold flex items-center gap-2"><Save className="h-4 w-4"/> 检测完成</span><span className="text-xs opacity-70">L:{state.liveCount} / Total:{state.totalScanned}</span></div>
                    <div className="flex gap-2">
                        <input type="text" value={currentCheckNote} onChange={e => setCurrentCheckNote(e.target.value)} placeholder="备注..." className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-white/30" />
                        <button onClick={handleSaveToHistory} className="bg-white text-slate-900 px-4 rounded-lg text-sm font-bold">保存结果</button>
                        <button onClick={() => { setShowSavePrompt(false); }} className="text-white/60 px-2 text-sm">放弃</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <HelmetProvider>
    <AppContent />
  </HelmetProvider>
);

export default App;
