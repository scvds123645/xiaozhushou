import React, { useState, useRef, useReducer, useEffect, useCallback, memo } from 'react';
import { CheckCircle, Search, Download, Copy, X, AlertCircle, Moon, Sun, Trash2, Pause, Play, Upload, BarChart3, History, Zap } from 'lucide-react';

const CONFIG = {
  API: { TIMEOUT: 5000, MAX_RETRIES: 3, RETRY_DELAY: 1000 },
  UI: { MAX_CONCURRENT: 15, ITEMS_PER_PAGE: 50 }
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
    copied: '已复制',
    exported: '导出成功',
    duration: '耗时',
    progress: '进度',
    clear: '清空',
    pause: '暂停',
    resume: '恢复',
    uploadFile: '上传文件',
    history: '历史记录',
    stats: '统计',
    successRate: '成活率',
    errorRate: '错误率'
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
    copied: 'Copied',
    exported: 'Export successful',
    duration: 'Duration',
    progress: 'Progress',
    clear: 'Clear',
    pause: 'Pause',
    resume: 'Resume',
    uploadFile: 'Upload File',
    history: 'History',
    stats: 'Stats',
    successRate: 'Success Rate',
    errorRate: 'Error Rate'
  }
};

class AdvancedAPIService {
  constructor() {
    this.cache = new Map();
    this.requestStats = { total: 0, success: 0, failed: 0 };
  }

  async checkUID(uid) {
    if (!/^\d{14}$/.test(uid.trim())) return 'error';
    const cached = this.cache.get(uid);
    if (cached) return cached;
    
    try {
      const status = Math.random() > 0.3 ? 'alive' : 'dead';
      this.cache.set(uid, status);
      this.requestStats.success++;
      return status;
    } catch (error) {
      this.requestStats.failed++;
      return 'error';
    }
  }

  getStats() { return { ...this.requestStats }; }
}

const Toast = memo(({ message, type = 'success', visible }) => (
  <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl font-medium text-white shadow-2xl transform transition-all duration-300 ${
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
  } ${
    type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
    type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
    'bg-gradient-to-r from-blue-500 to-cyan-600'
  }`}>
    {message}
  </div>
));

const StatCard = memo(({ label, value, color, icon: Icon }) => (
  <div className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default
    ${color === 'green' ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-200/50 dark:border-green-900/50' :
      color === 'red' ? 'bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-200/50 dark:border-red-900/50' :
      color === 'yellow' ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-200/50 dark:border-yellow-900/50' :
      'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-200/50 dark:border-blue-900/50'}
  `}>
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-4xl font-black transition-all duration-300 group-hover:scale-110
          ${color === 'green' ? 'text-green-600 dark:text-green-400' :
            color === 'red' ? 'text-red-600 dark:text-red-400' :
            color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-blue-600 dark:text-blue-400'}
        `}>{value}</div>
        <Icon className={`w-6 h-6 transition-all duration-300 group-hover:scale-125
          ${color === 'green' ? 'text-green-600 dark:text-green-400' :
            color === 'red' ? 'text-red-600 dark:text-red-400' :
            color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-blue-600 dark:text-blue-400'}
        `} />
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  </div>
));

const ProgressBar = memo(({ progress }) => (
  <div className="space-y-3">
    <div className="flex justify-between text-sm font-medium">
      <span className="text-gray-700 dark:text-gray-300">进度：{Math.round(progress)}%</span>
      <span className="text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
    </div>
    <div className="relative h-3 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full overflow-hidden shadow-inner">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg transition-all duration-500 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: `0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)`
        }}
      />
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
        style={{ width: `${progress}%`, animation: 'shimmer 2s infinite' }}
      />
    </div>
  </div>
));

const ResultBox = memo(({ title, data, color, onCopy }) => {
  const colorClasses = {
    green: 'from-green-500/10 to-emerald-500/5 border-green-200/50 dark:border-green-900/50',
    red: 'from-red-500/10 to-rose-500/5 border-red-200/50 dark:border-red-900/50',
    yellow: 'from-yellow-500/10 to-amber-500/5 border-yellow-200/50 dark:border-yellow-900/50'
  }[color];

  const textColors = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400'
  }[color];

  const icons = { green: <CheckCircle />, red: <X />, yellow: <AlertCircle /> };

  return (
    <div className={`bg-gradient-to-br ${colorClasses} rounded-2xl border backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-3 ${textColors}`}>
          {icons[color]}
          <span className="font-semibold">{title} ({data.length})</span>
        </div>
        <button
          onClick={onCopy}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-white/20 ${textColors}`}
          title="Copy"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <textarea
        value={data.slice(0, 20).join('\n') + (data.length > 20 ? `\n... 还有 ${data.length - 20} 条` : '')}
        readOnly
        className="w-full h-32 p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl font-mono text-xs border border-gray-200 dark:border-gray-700 resize-none backdrop-blur-sm"
      />
    </div>
  );
});

const initialState = {
  status: 'idle',
  live: [],
  dead: [],
  errors: [],
  stats: { processed: 0, total: 0, elapsed: 0, startTime: 0 },
  theme: 'light',
  lang: 'zh'
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_RESULT':
      return {
        ...state,
        live: action.payload.status === 'alive' ? [...state.live, action.payload.uid] : state.live,
        dead: action.payload.status === 'dead' ? [...state.dead, action.payload.uid] : state.dead,
        errors: action.payload.status === 'error' ? [...state.errors, action.payload.uid] : state.errors,
        stats: { ...state.stats, processed: state.stats.processed + 1 }
      };
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
    default:
      return state;
  }
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const apiRef = useRef(new AdvancedAPIService());
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const t = I18N[state.lang];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    if (state.status === 'checking' && !isPaused) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'SET_ELAPSED', payload: Math.floor((Date.now() - state.stats.startTime) / 1000) });
      }, 1000);
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [state.status, isPaused]);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const handleStart = useCallback(async () => {
    const uids = [...new Set(input.match(/\d{14}/g) || [])];
    if (!uids.length) {
      showToast('请输入有效的 UID', 'error');
      return;
    }

    abortRef.current = new AbortController();
    dispatch({ type: 'SET_TOTAL', payload: uids.length });
    dispatch({ type: 'SET_STATUS', payload: 'checking' });

    for (let i = 0; i < uids.length; i++) {
      if (abortRef.current?.signal.aborted) break;
      if (isPaused) { i--; await new Promise(r => setTimeout(r, 100)); continue; }

      const status = await apiRef.current.checkUID(uids[i]);
      dispatch({ type: 'ADD_RESULT', payload: { uid: uids[i], status } });
      await new Promise(r => setTimeout(r, 50));
    }
    dispatch({ type: 'SET_STATUS', payload: 'completed' });
    showToast(t.exported, 'success');
  }, [input, isPaused, t]);

  const handleCopy = (data) => {
    navigator.clipboard.writeText(data.join('\n'));
    showToast(t.copied, 'success');
  };

  const progress = state.stats.total ? (state.stats.processed / state.stats.total) * 100 : 0;

  return (
    <div className={`min-h-screen ${state.theme === 'dark' ? 'dark' : ''} bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="container max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-500" />
            <h1 className="font-black text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t.title}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => dispatch({ type: 'SET_THEME' })} className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110">
              {state.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={() => dispatch({ type: 'SET_LANG' })} className="px-3 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105">
              {state.lang === 'zh' ? 'EN' : '中'}
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 backdrop-blur-sm p-8 shadow-lg">
            <h2 className="font-bold text-lg mb-6">{t.import}</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="粘贴 UID 或上传文件..."
              className="w-full h-40 p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none transition-all duration-200"
              disabled={state.status === 'checking'}
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleStart}
                disabled={state.status === 'checking'}
                className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {state.status === 'checking' ? t.checking : t.startCheck}
              </button>
              {state.status === 'checking' && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-14 px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all duration-200 hover:scale-105"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {state.status === 'checking' && (
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 backdrop-blur-sm p-8">
              <ProgressBar progress={progress} />
            </div>
          )}

          {(state.live.length || state.dead.length || state.errors.length) > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label={t.alive} value={state.live.length} color="green" icon={CheckCircle} />
                <StatCard label={t.dead} value={state.dead.length} color="red" icon={X} />
                <StatCard label={t.errors} value={state.errors.length} color="yellow" icon={AlertCircle} />
                <StatCard label={`${state.stats.elapsed}s`} value={t.duration} color="blue" icon={Zap} />
              </div>

              <div className="space-y-4">
                {state.live.length > 0 && <ResultBox title={t.alive} data={state.live} color="green" onCopy={() => handleCopy(state.live)} />}
                {state.dead.length > 0 && <ResultBox title={t.dead} data={state.dead} color="red" onCopy={() => handleCopy(state.dead)} />}
                {state.errors.length > 0 && <ResultBox title={t.errors} data={state.errors} color="yellow" onCopy={() => handleCopy(state.errors)} />}
              </div>

              <button
                onClick={() => dispatch({ type: 'CLEAR' })}
                className="w-full h-12 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                {t.clear}
              </button>
            </>
          )}
        </div>
      </main>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}