import React, { useState, useRef, useReducer, useEffect } from 'react';
import { CheckCircle, Search, Download, Copy, X, AlertCircle, Moon, Sun, Trash2 } from 'lucide-react';

const CONFIG = {
  API: { TIMEOUT: 5000, MAX_RETRIES: 3, RETRY_DELAY: 1000, RATE_LIMIT: { requests: 10000, window: 60000 } },
  UI: { MAX_CONCURRENT: 10 }
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
    noNetwork: '网络离线'
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
    noNetwork: 'Offline'
  }
};

class APIService {
  constructor() {
    this.cache = new Map();
    this.requestTimes = [];
    this.isOnline = navigator.onLine;
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

  async checkUID(uid) {
    if (!/^\d{14}$/.test(uid.trim())) return 'error';
    
    const cached = this.cache.get(uid);
    if (cached && Date.now() - cached.time < 3600000) return cached.status;
    
    await this.checkRateLimit();
    if (!this.isOnline) return 'error';

    for (let i = 0; i < CONFIG.API.MAX_RETRIES; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
        const res = await fetch(`https://graph.facebook.com/${uid}/picture?type=normal`, { signal: controller.signal });
        clearTimeout(timeout);
        const status = res.url.includes('static') ? 'dead' : 'alive';
        this.cache.set(uid, { status, time: Date.now() });
        return status;
      } catch {
        if (i < CONFIG.API.MAX_RETRIES - 1) await new Promise(r => setTimeout(r, CONFIG.API.RETRY_DELAY * Math.pow(2, i)));
      }
    }
    return 'error';
  }
}

const initialState = {
  status: 'idle',
  live: [], dead: [], errors: [],
  stats: { processed: 0, total: 0, elapsed: 0, startTime: 0 },
  theme: 'light',
  lang: 'zh',
  online: true
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
    case 'CLEAR':
      return { ...state, live: [], dead: [], errors: [], stats: { ...initialState.stats }, status: 'idle' };
    case 'SET_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'SET_LANG':
      return { ...state, lang: state.lang === 'zh' ? 'en' : 'zh' };
    case 'SET_ONLINE':
      return { ...state, online: action.payload };
    default:
      return state;
  }
};

const ResultBox = ({ title, data, color, onCopy, onExport }) => {
  const colorClass = { green: 'text-green-600 bg-green-500/10 border-green-200/50', red: 'text-red-600 bg-red-500/10 border-red-200/50', yellow: 'text-yellow-600 bg-yellow-500/10 border-yellow-200/50' }[color];
  const icon = { green: <CheckCircle />, red: <X />, yellow: <AlertCircle /> }[color];
  
  return (
    <div className={`p-4 rounded-xl border ${colorClass} bg-card/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 text-sm font-medium ${colorClass} px-3 py-1 rounded-full`}>
          {icon}
          <span>{title} ({data.length})</span>
        </div>
        <div className="flex gap-1">
          <button onClick={onCopy} className="p-2 hover:bg-background/50 rounded-lg"><Copy className="w-4 h-4" /></button>
          <button onClick={onExport} className="p-2 hover:bg-background/50 rounded-lg"><Download className="w-4 h-4" /></button>
        </div>
      </div>
      <textarea value={data.join('\n')} readOnly className="w-full h-40 p-2 bg-background/50 rounded-lg font-mono text-xs border dark:bg-slate-900/50" />
    </div>
  );
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState('');
  const apiRef = useRef(new APIService());
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const t = I18N[state.lang];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    window.addEventListener('online', () => dispatch({ type: 'SET_ONLINE', payload: true }));
    window.addEventListener('offline', () => dispatch({ type: 'SET_ONLINE', payload: false }));
  }, []);

  useEffect(() => {
    if (state.status === 'checking' && state.stats.startTime) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'SET_ELAPSED', payload: Math.floor((Date.now() - state.stats.startTime) / 1000) });
      }, 1000);
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [state.status, state.stats.startTime]);

  const handleStart = async () => {
    const uids = [...new Set(input.match(/\d{14}/g) || [])];
    if (!uids.length) { alert('No valid UIDs found'); return; }

    abortRef.current = new AbortController();
    dispatch({ type: 'SET_TOTAL', payload: uids.length });
    dispatch({ type: 'SET_STATUS', payload: 'checking' });

    const promises = uids.map(uid =>
      (async () => {
        if (abortRef.current?.signal.aborted) return;
        const status = await apiRef.current.checkUID(uid);
        dispatch({ type: 'ADD_RESULT', payload: { uid, status } });
      })()
    );

    const queue = [];
    for (const p of promises) {
      queue.push(p);
      if (queue.length >= CONFIG.UI.MAX_CONCURRENT) await Promise.race(queue);
      queue.splice(queue.findIndex(x => x.status === 'fulfilled'), 1);
    }
    await Promise.allSettled(promises);

    dispatch({ type: 'SET_STATUS', payload: 'completed' });
  };

  const handleCopy = (data) => {
    navigator.clipboard.writeText(data.join('\n'));
    alert(t.copied(data.length));
  };

  const handleExport = (data) => {
    const blob = new Blob([data.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uid-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = state.stats.total ? (state.stats.processed / state.stats.total) * 100 : 0;

  return (
    <div className={`min-h-screen ${state.theme === 'dark' ? 'dark' : ''} bg-background text-foreground transition-colors`}>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container max-w-5xl mx-auto h-16 flex items-center justify-between px-4">
          <h1 className="font-bold text-lg">{t.title}</h1>
          <div className="flex gap-2">
            {!state.online && <div className="flex items-center gap-1 text-xs bg-red-500/10 text-red-600 px-3 py-1 rounded-lg"><AlertCircle className="w-3 h-3" />{t.noNetwork}</div>}
            <button onClick={() => dispatch({ type: 'SET_THEME' })} className="p-2 hover:bg-secondary rounded-lg">{state.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
            <button onClick={() => dispatch({ type: 'SET_LANG' })} className="p-2 hover:bg-secondary rounded-lg text-sm font-medium">{state.lang === 'zh' ? 'EN' : '中'}</button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="font-semibold">{t.import}</h2>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste UIDs, one per line..." className="w-full h-32 p-4 bg-secondary/30 rounded-lg border focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none dark:bg-slate-800/50" disabled={state.status === 'checking'} />
          <button onClick={handleStart} disabled={state.status === 'checking'} className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50">
            <Search className="w-4 h-4 inline mr-2" />
            {state.status === 'checking' ? t.checking : t.startCheck}
          </button>
        </div>

        {state.status === 'checking' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>{t.progress}: {state.stats.processed}/{state.stats.total}</span><span>{Math.round(progress)}%</span></div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progress}%` }} /></div>
          </div>
        )}

        {(state.live.length || state.dead.length || state.errors.length) > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-200/50 dark:border-green-900/50"><div className="text-2xl font-bold text-green-600">{state.live.length}</div><div className="text-sm">{t.alive}</div></div>
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-200/50 dark:border-red-900/50"><div className="text-2xl font-bold text-red-600">{state.dead.length}</div><div className="text-sm">{t.dead}</div></div>
              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-200/50 dark:border-yellow-900/50"><div className="text-2xl font-bold text-yellow-600">{state.errors.length}</div><div className="text-sm">{t.errors}</div></div>
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-200/50 dark:border-blue-900/50"><div className="text-2xl font-bold text-blue-600">{state.stats.elapsed}s</div><div className="text-sm">{t.duration}</div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.live.length > 0 && <ResultBox title={t.alive} data={state.live} color="green" onCopy={() => handleCopy(state.live)} onExport={() => handleExport(state.live)} />}
              {state.dead.length > 0 && <ResultBox title={t.dead} data={state.dead} color="red" onCopy={() => handleCopy(state.dead)} onExport={() => handleExport(state.dead)} />}
              {state.errors.length > 0 && <ResultBox title={t.errors} data={state.errors} color="yellow" onCopy={() => handleCopy(state.errors)} onExport={() => handleExport(state.errors)} />}
            </div>

            <button onClick={() => dispatch({ type: 'CLEAR' })} className="w-full h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"><Trash2 className="w-4 h-4 inline mr-2" />{t.clear}</button>
          </>
        )}
      </main>
    </div>
  );
}