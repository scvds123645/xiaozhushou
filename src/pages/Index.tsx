import React, { useState, useRef, useReducer, useEffect, useCallback, useMemo, memo } from 'react';
import { CheckCircle, Search, Download, Copy, X, AlertCircle, Moon, Sun, Trash2, Pause, Play, Upload, BarChart3, History } from 'lucide-react';

// ===================== CONFIGURATIONS =====================
const CONFIG = {
  API: { TIMEOUT: 5000, MAX_RETRIES: 3, RETRY_DELAY: 1000, RATE_LIMIT: { requests: 10000, window: 60000 } },
  UI: { MAX_CONCURRENT: 15, BATCH_SIZE: 100, ITEMS_PER_PAGE: 50 },
  CACHE: { MAX_SIZE: 1000, TTL: 3600000 }
};

const I18N = {
  zh: {
    title: 'UID 检测工具',
    import: '导入账号',
    startCheck: '开始检测',
    checking: '检测中...',
    cancel: '取消',
    alive: '存活',
    dead: '失效',
    errors: '错误',
    copied: (n) => `已复制 ${n} 个`,
    exported: '导出成功',
    duration: '耗时',
    progress: '进度',
    clear: '清空',
    noNetwork: '网络离线',
    pause: '暂停',
    resume: '恢复',
    uploadFile: '上传文件',
    history: '历史记录',
    stats: '统计',
    successRate: '成活率',
    errorRate: '错误率',
    batch: '批次'
  },
  en: {
    title: 'UID Checker',
    import: 'Import Accounts',
    startCheck: 'Start Check',
    checking: 'Checking...',
    cancel: 'Cancel',
    alive: 'Alive',
    dead: 'Dead',
    errors: 'Errors',
    copied: (n) => `Copied ${n}`,
    exported: 'Export successful',
    duration: 'Duration',
    progress: 'Progress',
    clear: 'Clear',
    noNetwork: 'Offline',
    pause: 'Pause',
    resume: 'Resume',
    uploadFile: 'Upload File',
    history: 'History',
    stats: 'Stats',
    successRate: 'Success Rate',
    errorRate: 'Error Rate',
    batch: 'Batch'
  }
};

// ===================== OPTIMIZED CACHE WITH LRU =====================
class LRUCache {
  constructor(maxSize = CONFIG.CACHE.MAX_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const item = this.cache.get(key);
    if (Date.now() - item.time > CONFIG.CACHE.TTL) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, time: Date.now() });
  }

  clear() { this.cache.clear(); }
  size() { return this.cache.size; }
}

// ===================== ADVANCED API SERVICE =====================
class AdvancedAPIService {
  constructor() {
    this.cache = new LRUCache();
    this.requestTimes = [];
    this.isOnline = navigator.onLine;
    this.batchQueue = [];
    this.requestStats = { total: 0, success: 0, failed: 0 };
    this.apiSources = ['https://graph.facebook.com'];
    
    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  async checkRateLimit() {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(t => now - t < CONFIG.API.RATE_LIMIT.window);
    if (this.requestTimes.length >= CONFIG.API.RATE_LIMIT.requests) {
      await new Promise(r => setTimeout(r, 100));
      return this.checkRateLimit();
    }
    this.requestTimes.push(now);
  }

  async checkUID(uid, retryCount = 0) {
    if (!/^\d{14}$/.test(uid.trim())) return 'error';
    
    const cached = this.cache.get(uid);
    if (cached) return cached;
    
    await this.checkRateLimit();
    if (!this.isOnline) return 'error';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
      const res = await fetch(`${this.apiSources[0]}/${uid}/picture?type=normal`, { signal: controller.signal });
      clearTimeout(timeout);
      
      const status = res.url.includes('static') ? 'dead' : 'alive';
      this.cache.set(uid, status);
      this.requestStats.success++;
      return status;
    } catch (error) {
      if (retryCount < CONFIG.API.MAX_RETRIES) {
        await new Promise(r => setTimeout(r, CONFIG.API.RETRY_DELAY * Math.pow(2, retryCount)));
        return this.checkUID(uid, retryCount + 1);
      }
      this.requestStats.failed++;
      return 'error';
    } finally {
      this.requestStats.total++;
    }
  }

  getStats() { return { ...this.requestStats }; }
  clearCache() { this.cache.clear(); }
}

// ===================== CUSTOM HOOKS =====================
const useAsync = (asyncFunc, immediate = true) => {
  const [status, setStatus] = useState(immediate ? 'pending' : 'idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    try {
      const response = await asyncFunc();
      setValue(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [asyncFunc]);

  useEffect(() => { if (immediate) execute(); }, [execute, immediate]);
  return { execute, status, value, error };
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// ===================== MEMOIZED COMPONENTS =====================
const StatCard = memo(({ label, value, color, icon: Icon }) => (
  <div className={`bg-${color}-500/10 p-4 rounded-lg border border-${color}-200/50 dark:border-${color}-900/50`}>
    <div className="flex items-center justify-between mb-1">
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
      <Icon className={`w-5 h-5 text-${color}-600`} />
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
  </div>
));

const ProgressBar = memo(({ progress, animated = true }) => (
  <div className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${animated ? 'shadow-sm' : ''}`}>
    <div
      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
      style={{
        width: `${progress}%`,
        transition: animated ? 'width 0.3s ease-out' : 'none'
      }}
    />
  </div>
));

const ResultBox = memo(({ title, data, color, onCopy, onExport, currentPage, totalPages, onPageChange }) => {
  const startIdx = (currentPage - 1) * CONFIG.UI.ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIdx, startIdx + CONFIG.UI.ITEMS_PER_PAGE);
  
  const colorClass = {
    green: 'text-green-600 bg-green-500/10 border-green-200/50',
    red: 'text-red-600 bg-red-500/10 border-red-200/50',
    yellow: 'text-yellow-600 bg-yellow-500/10 border-yellow-200/50'
  }[color];

  const icons = { green: <CheckCircle />, red: <X />, yellow: <AlertCircle /> };

  return (
    <div className={`p-4 rounded-xl border ${colorClass} bg-white dark:bg-slate-900/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 text-sm font-medium ${colorClass} px-3 py-1 rounded-full`}>
          {icons[color]}
          <span>{title} ({data.length})</span>
        </div>
        <div className="flex gap-1">
          <button onClick={onCopy} title="Copy" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg"><Copy className="w-4 h-4" /></button>
          <button onClick={onExport} title="Export" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg"><Download className="w-4 h-4" /></button>
        </div>
      </div>
      <textarea value={paginatedData.join('\n')} readOnly className="w-full h-40 p-2 bg-gray-100 dark:bg-slate-900 rounded-lg font-mono text-xs border resize-none" />
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-600 dark:text-gray-400">Page {currentPage}/{totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 text-xs bg-gray-200 dark:bg-slate-800 rounded disabled:opacity-50">Prev</button>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 text-xs bg-gray-200 dark:bg-slate-800 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
});

const HistoryPanel = memo(({ history, onRestore, onClear }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
    <h3 className="font-semibold mb-3 flex items-center gap-2"><History className="w-4 h-4" />检测历史</h3>
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">暂无历史记录</p>
      ) : (
        history.map((item, idx) => (
          <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg flex justify-between items-center">
            <div className="text-sm">
              <p className="font-medium">{item.timestamp}</p>
              <p className="text-xs text-gray-500">✓ {item.live} ✗ {item.dead} ⚠ {item.errors}</p>
            </div>
            <button onClick={() => onRestore(item)} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">恢复</button>
          </div>
        ))
      )}
    </div>
    {history.length > 0 && (
      <button onClick={onClear} className="w-full mt-3 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">清空历史</button>
    )}
  </div>
));

const StatsChart = memo(({ live, dead, errors, elapsed }) => {
  const total = live + dead + errors || 1;
  const successRate = ((live / total) * 100).toFixed(1);
  const errorRate = ((errors / total) * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" />检测统计</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{successRate}%</div>
          <p className="text-xs text-gray-500">成活率</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{errorRate}%</div>
          <p className="text-xs text-gray-500">错误率</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{elapsed}s</div>
          <p className="text-xs text-gray-500">总耗时</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{total}</div>
          <p className="text-xs text-gray-500">总数</p>
        </div>
      </div>
    </div>
  );
});

// ===================== MAIN APP =====================
const initialState = {
  status: 'idle',
  live: [], dead: [], errors: [],
  stats: { processed: 0, total: 0, elapsed: 0, startTime: 0 },
  theme: 'light',
  lang: 'zh',
  online: true,
  pages: { live: 1, dead: 1, errors: 1 }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_RESULT': {
      const { uid, status } = action.payload;
      return {
        ...state,
        live: status === 'alive' ? [...state.live, uid] : state.live,
        dead: status === 'dead' ? [...state.dead, uid] : state.dead,
        errors: status === 'error' ? [...state.errors, uid] : state.errors,
        stats: { ...state.stats, processed: state.stats.processed + 1 }
      };
    }
    case 'SET_TOTAL':
      return { ...state, stats: { ...state.stats, total: action.payload, startTime: Date.now(), processed: 0 }, live: [], dead: [], errors: [] };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ELAPSED':
      return { ...state, stats: { ...state.stats, elapsed: action.payload } };
    case 'SET_PAGE':
      return { ...state, pages: { ...state.pages, [action.payload.key]: action.payload.value } };
    case 'CLEAR':
      return { ...state, live: [], dead: [], errors: [], stats: { ...initialState.stats }, status: 'idle', pages: initialState.pages };
    case 'SET_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'SET_LANG':
      return { ...state, lang: state.lang === 'zh' ? 'en' : 'zh' };
    case 'SET_ONLINE':
      return { ...state, online: action.payload };
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const apiRef = useRef(new AdvancedAPIService());
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const [history, setHistory] = useLocalStorage('uid-checker-history', []);

  const t = I18N[state.lang];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    window.addEventListener('online', () => dispatch({ type: 'SET_ONLINE', payload: true }));
    window.addEventListener('offline', () => dispatch({ type: 'SET_ONLINE', payload: false }));
  }, []);

  useEffect(() => {
    if (state.status === 'checking' && state.stats.startTime && !isPaused) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'SET_ELAPSED', payload: Math.floor((Date.now() - state.stats.startTime) / 1000) });
      }, 1000);
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [state.status, state.stats.startTime, isPaused]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        setInput(typeof text === 'string' ? text : '');
      };
      reader.readAsText(file);
    }
  }, []);

  const handleStart = useCallback(async () => {
    const uids = [...new Set(input.match(/\d{14}/g) || [])];
    if (!uids.length) { alert('No valid UIDs found'); return; }

    abortRef.current = new AbortController();
    dispatch({ type: 'SET_TOTAL', payload: uids.length });
    dispatch({ type: 'SET_STATUS', payload: 'checking' });

    const queue = [];
    for (let i = 0; i < uids.length; i++) {
      if (abortRef.current?.signal.aborted) break;
      if (isPaused) { i--; await new Promise(r => setTimeout(r, 100)); continue; }

      queue.push(
        (async () => {
          const status = await apiRef.current.checkUID(uids[i]);
          dispatch({ type: 'ADD_RESULT', payload: { uid: uids[i], status } });
        })()
      );

      if (queue.length >= CONFIG.UI.MAX_CONCURRENT) {
        await Promise.race(queue);
        queue.splice(0, 1);
      }
    }
    await Promise.allSettled(queue);
    dispatch({ type: 'SET_STATUS', payload: 'completed' });
  }, [input, isPaused]);

  const handleCopy = useCallback((data) => {
    navigator.clipboard.writeText(data.join('\n'));
  }, []);

  const handleExport = useCallback((data) => {
    const blob = new Blob([data.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uid-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleSaveHistory = useCallback(() => {
    const newRecord = {
      timestamp: new Date().toLocaleString(),
      live: state.live.length,
      dead: state.dead.length,
      errors: state.errors.length,
      data: { live: state.live, dead: state.dead, errors: state.errors }
    };
    setHistory([newRecord, ...history.slice(0, 9)]);
  }, [state, history, setHistory]);

  const handleRestoreHistory = useCallback((item) => {
    dispatch({ type: 'RESTORE_STATE', payload: { live: item.data.live, dead: item.data.dead, errors: item.data.errors } });
    setShowHistory(false);
  }, []);

  const progress = state.stats.total ? (state.stats.processed / state.stats.total) * 100 : 0;
  const totalPages = { live: Math.ceil(state.live.length / CONFIG.UI.ITEMS_PER_PAGE), dead: Math.ceil(state.dead.length / CONFIG.UI.ITEMS_PER_PAGE), errors: Math.ceil(state.errors.length / CONFIG.UI.ITEMS_PER_PAGE) };

  return (
    <div className={`min-h-screen ${state.theme === 'dark' ? 'dark' : ''} bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors`}>
      <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="container max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
          <h1 className="font-bold text-lg">{t.title}</h1>
          <div className="flex gap-2 items-center">
            {!state.online && <div className="flex items-center gap-1 text-xs bg-red-500/10 text-red-600 px-3 py-1 rounded-lg"><AlertCircle className="w-3 h-3" />{t.noNetwork}</div>}
            <button onClick={() => setShowStats(!showStats)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg"><BarChart3 className="w-5 h-5" /></button>
            <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg"><History className="w-5 h-5" /></button>
            <button onClick={() => dispatch({ type: 'SET_THEME' })} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg">{state.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
            <button onClick={() => dispatch({ type: 'SET_LANG' })} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg text-sm font-medium">{state.lang === 'zh' ? 'EN' : '中'}</button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-6 space-y-4">
            <h2 className="font-semibold">{t.import}</h2>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste UIDs or upload file..." className="w-full h-32 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg border focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none" disabled={state.status === 'checking'} />
            <div className="flex gap-3">
              <button onClick={handleStart} disabled={state.status === 'checking'} className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50">
                <Search className="w-4 h-4 inline mr-2" />
                {state.status === 'checking' ? t.checking : t.startCheck}
              </button>
              <label className="h-11 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 cursor-pointer flex items-center px-4">
                <Upload className="w-4 h-4 mr-2" />
                {t.uploadFile}
                <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
              </label>
              {state.status === 'checking' && (
                <button onClick={() => { setIsPaused(!isPaused); abortRef.current?.abort(); }} className="h-11 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 px-4">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {state.status === 'checking' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>{t.progress}: {state.stats.processed}/{state.stats.total}</span><span>{Math.round(progress)}%</span></div>
              <ProgressBar progress={progress} animated />
            </div>
          )}

          {(state.live.length || state.dead.length || state.errors.length) > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label={t.alive} value={state.live.length} color="green" icon={CheckCircle} />
                <StatCard label={t.dead} value={state.dead.length} color="red" icon={X} />
                <StatCard label={t.errors} value={state.errors.length} color="yellow" icon={AlertCircle} />
                <StatCard label={t.duration} value={`${state.stats.elapsed}s`} color="blue" icon={() => <></>} />
              </div>

              <div className="space-y-4">
                {state.live.length > 0 && <ResultBox title={t.alive} data={state.live} color="green" onCopy={() => handleCopy(state.live)} onExport={() => handleExport(state.live)} currentPage={state.pages.live} totalPages={totalPages.live} onPageChange={(p) => dispatch({ type: 'SET_PAGE', payload: { key: 'live', value: p } })} />}
                {state.dead.length > 0 && <ResultBox title={t.dead} data={state.dead} color="red" onCopy={() => handleCopy(state.dead)} onExport={() => handleExport(state.dead)} currentPage={state.pages.dead} totalPages={totalPages.dead} onPageChange={(p) => dispatch({ type: 'SET_PAGE', payload: { key: 'dead', value: p } })} />}
                {state.errors.length > 0 && <ResultBox title={t.errors} data={state.errors} color="yellow" onCopy={() => handleCopy(state.errors)} onExport={() => handleExport(state.errors)} currentPage={state.pages.errors} totalPages={totalPages.errors} onPageChange={(p) => dispatch({ type: 'SET_PAGE', payload: { key: 'errors', value: p } })} />}
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleSaveHistory()} className="flex-1 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"><History className="w-4 h-4 inline mr-2" />保存结果</button>
                <button onClick={() => dispatch({ type: 'CLEAR' })} className="flex-1 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"><Trash2 className="w-4 h-4 inline mr-2" />{t.clear}</button>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          {showStats && <StatsChart live={state.live.length} dead={state.dead.length} errors={state.errors.length} elapsed={state.stats.elapsed} />}
          {showHistory && <HistoryPanel history={history} onRestore={handleRestoreHistory} onClear={() => setHistory([])} />}
        </div>
      </main>
    </div>
  );
}