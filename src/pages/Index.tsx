import React, { useState, useRef, useReducer, useCallback, useEffect } from 'react';
import {
  CheckCircle, Search, Download, Copy, X, AlertCircle, Pause, Play,
  BarChart3, History, Settings, Moon, Sun, Trash2, RefreshCw, Zap
} from 'lucide-react';

// ==================== 配置 ====================
const CONFIG = {
  API: {
    TIMEOUT: 5000,
    MAX_CONCURRENT: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    RATE_LIMIT: { requests: 100, window: 60000 }
  },
  UI: {
    CHUNK_SIZE: 50,
    DEBOUNCE_DELAY: 300
  },
  VALIDATION: {
    UID_LENGTH: 14,
    UID_PATTERN: /\d{14}/g
  }
};

// ==================== 类型定义 ====================
type Status = 'idle' | 'checking' | 'paused' | 'completed' | 'error';
type Theme = 'light' | 'dark';
type Language = 'zh' | 'en';

interface DetectionResult {
  uid: string;
  status: 'alive' | 'dead' | 'error';
  timestamp: number;
  retries: number;
}

interface CheckStats {
  liveCount: number;
  dieCount: number;
  errorCount: number;
  processed: number;
  total: number;
  startTime: number;
  endTime: number;
  elapsedSeconds: number;
}

interface HistoryRecord {
  id: string;
  timestamp: number;
  total: number;
  liveCount: number;
  dieCount: number;
  results: { alive: string[]; dead: string[] };
}

interface AppState {
  status: Status;
  stats: CheckStats;
  liveList: string[];
  dieList: string[];
  errorList: string[];
  isPaused: boolean;
  theme: Theme;
  language: Language;
  history: HistoryRecord[];
  selectedHistoryId: string | null;
  showStats: boolean;
  networkStatus: boolean;
}

// ==================== 语言配置 ====================
const I18N = {
  zh: {
    title: 'UID 检测工具 Pro',
    import: '导入账号',
    startCheck: '开始检测',
    checking: '检测中...',
    paused: '已暂停',
    pause: '暂停',
    resume: '继续',
    cancel: '取消',
    alive: '存活',
    dead: '失效',
    errors: '错误',
    copied: (n: number) => `已复制 ${n} 个UID`,
    exported: '导出成功',
    noData: '无数据',
    stats: '统计信息',
    history: '历史记录',
    settings: '设置',
    theme: '主题',
    language: '语言',
    clear: '清空',
    undo: '撤销',
    retry: '重试',
    import: '导入',
    export: '导出',
    duration: '耗时',
    progress: '进度',
    errors: '错误',
    noNetwork: '网络连接失败',
  },
  en: {
    title: 'UID Checker Pro',
    import: 'Import Accounts',
    startCheck: 'Start Check',
    checking: 'Checking...',
    paused: 'Paused',
    pause: 'Pause',
    resume: 'Resume',
    cancel: 'Cancel',
    alive: 'Alive',
    dead: 'Dead',
    errors: 'Errors',
    copied: (n: number) => `Copied ${n} UIDs`,
    exported: 'Export successful',
    noData: 'No data',
    stats: 'Statistics',
    history: 'History',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    clear: 'Clear',
    undo: 'Undo',
    retry: 'Retry',
    import: 'Import',
    export: 'Export',
    duration: 'Duration',
    progress: 'Progress',
    errors: 'Errors',
    noNetwork: 'Network connection failed',
  }
};

// ==================== API 服务层 ====================
class APIService {
  private requestCache = new Map<string, { result: boolean; timestamp: number }>();
  private rateLimitTracker: number[] = [];
  private isOnline = true;

  constructor() {
    this.monitorNetworkStatus();
  }

  private monitorNetworkStatus() {
    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  private validateUID(uid: string): boolean {
    return /^\d{14}$/.test(uid.trim());
  }

  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    this.rateLimitTracker = this.rateLimitTracker.filter(
      t => now - t < CONFIG.API.RATE_LIMIT.window
    );
    
    if (this.rateLimitTracker.length >= CONFIG.API.RATE_LIMIT.requests) {
      return false;
    }
    
    this.rateLimitTracker.push(now);
    return true;
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkUID(uid: string): Promise<{ status: 'alive' | 'dead' | 'error'; retries: number }> {
    if (!this.validateUID(uid)) {
      return { status: 'error', retries: 0 };
    }

    // 检查缓存
    const cached = this.requestCache.get(uid);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return { status: cached.result ? 'alive' : 'dead', retries: 0 };
    }

    // 检查速率限制
    if (!await this.checkRateLimit()) {
      await this.sleep(100);
      return this.checkUID(uid);
    }

    if (!this.isOnline) {
      return { status: 'error', retries: 0 };
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < CONFIG.API.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);

        const response = await fetch(
          `https://graph.facebook.com/${uid}/picture?type=normal`,
          { signal: controller.signal, redirect: 'follow' }
        );

        clearTimeout(timeout);

        const isAlive = !response.url.includes('static');
        this.requestCache.set(uid, { result: isAlive, timestamp: Date.now() });
        return { status: isAlive ? 'alive' : 'dead', retries: attempt };
      } catch (error) {
        lastError = error as Error;
        if (attempt < CONFIG.API.MAX_RETRIES - 1) {
          await this.sleep(CONFIG.API.RETRY_DELAY * Math.pow(2, attempt));
        }
      }
    }

    return { status: 'error', retries: CONFIG.API.MAX_RETRIES };
  }

  clearCache() {
    this.requestCache.clear();
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

// ==================== 输入验证器 ====================
class InputValidator {
  static validateAndExtract(input: string): string[] {
    const uids = new Set<string>();
    
    const matches = input.match(CONFIG.VALIDATION.UID_PATTERN) || [];
    matches.forEach(uid => {
      if (/^\d{14}$/.test(uid)) {
        uids.add(uid);
      }
    });

    return Array.from(uids);
  }

  static sanitizeForExport(data: string): string {
    return data.trim().split('\n').filter(l => l.trim()).join('\n');
  }
}

// ==================== 并发控制器 ====================
class ConcurrencyController {
  private semaphore: number;
  private queue: (() => Promise<any>)[] = [];

  constructor(maxConcurrent: number) {
    this.semaphore = maxConcurrent;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.semaphore <= 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.semaphore--;
    try {
      return await fn();
    } finally {
      this.semaphore++;
    }
  }
}

// ==================== 状态管理 ====================
interface StateAction {
  type: string;
  payload?: any;
}

const initialState: AppState = {
  status: 'idle',
  stats: { liveCount: 0, dieCount: 0, errorCount: 0, processed: 0, total: 0, startTime: 0, endTime: 0, elapsedSeconds: 0 },
  liveList: [],
  dieList: [],
  errorList: [],
  isPaused: false,
  theme: 'light',
  language: 'zh',
  history: [],
  selectedHistoryId: null,
  showStats: false,
  networkStatus: true,
};

const appReducer = (state: AppState, action: StateAction): AppState => {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'ADD_RESULT':
      const { uid, resultStatus } = action.payload;
      return {
        ...state,
        liveList: resultStatus === 'alive' ? [...state.liveList, uid] : state.liveList,
        dieList: resultStatus === 'dead' ? [...state.dieList, uid] : state.dieList,
        errorList: resultStatus === 'error' ? [...state.errorList, uid] : state.errorList,
        stats: {
          ...state.stats,
          liveCount: resultStatus === 'alive' ? state.stats.liveCount + 1 : state.stats.liveCount,
          dieCount: resultStatus === 'dead' ? state.stats.dieCount + 1 : state.stats.dieCount,
          errorCount: resultStatus === 'error' ? state.stats.errorCount + 1 : state.stats.errorCount,
          processed: state.stats.processed + 1
        }
      };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'CLEAR_ALL':
      return { ...state, liveList: [], dieList: [], errorList: [], stats: initialState.stats, status: 'idle' };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused };
    case 'ADD_HISTORY':
      return { ...state, history: [action.payload, ...state.history].slice(0, 10) };
    case 'TOGGLE_STATS':
      return { ...state, showStats: !state.showStats };
    case 'SET_NETWORK_STATUS':
      return { ...state, networkStatus: action.payload };
    default:
      return state;
  }
};

// ==================== UI 组件 ====================
const ProgressBar = ({ progress, stats, t }: { progress: number; stats: CheckStats; t: any }) => (
  <div className="w-full space-y-2">
    <div className="flex justify-between text-xs sm:text-sm">
      <span>{t.progress}: {stats.processed}/{stats.total}</span>
      <span>{Math.round(progress)}%</span>
    </div>
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div className="text-xs text-muted-foreground">
      {stats.elapsedSeconds > 0 && `${t.duration}: ${stats.elapsedSeconds}s`}
    </div>
  </div>
);

const ResultSection = React.memo(({
  title,
  count,
  results,
  type,
  onCopy,
  onExport,
  onResultChange,
  color
}: {
  title: string;
  count: number;
  results: string[];
  type: 'alive' | 'dead' | 'error';
  onCopy: () => void;
  onExport: () => void;
  onResultChange: (value: string[]) => void;
  color: string;
}) => {
  const colorClass = color === 'green'
    ? 'text-green-600 bg-green-500/10 border-green-200/50 dark:border-green-900/50'
    : color === 'red'
      ? 'text-red-600 bg-red-500/10 border-red-200/50 dark:border-red-900/50'
      : 'text-yellow-600 bg-yellow-500/10 border-yellow-200/50 dark:border-yellow-900/50';

  const icon = type === 'alive' ? <CheckCircle className="w-4 h-4" /> : type === 'dead' ? <X className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;

  return (
    <div className={`flex flex-col p-4 rounded-xl border ${colorClass} bg-card/50 backdrop-blur`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
          {icon}
          <span>{title} ({count})</span>
        </div>
        <div className="flex gap-1">
          <button onClick={onCopy} className="p-2 hover:bg-background/50 rounded-lg transition">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onExport} className="p-2 hover:bg-background/50 rounded-lg transition">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <textarea
        value={results.join('\n')}
        onChange={(e) => onResultChange(e.target.value.split('\n').filter(l => l.trim()))}
        className="bg-background/50 rounded-lg p-2 h-48 sm:h-64 font-mono text-xs border resize-none focus:ring-2 focus:ring-primary/50 dark:bg-slate-900/50 dark:border-slate-700"
        placeholder="无数据"
      />
    </div>
  );
});

// ==================== 主应用 ====================
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [input, setInput] = useState('');
  const apiRef = useRef(new APIService());
  const concurrencyRef = useRef(new ConcurrencyController(CONFIG.API.MAX_CONCURRENT));
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = I18N[state.language];

  // 初始化主题
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_NETWORK_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_NETWORK_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 更新检测时间
  useEffect(() => {
    if (state.status === 'checking' && state.stats.startTime) {
      timerRef.current = setInterval(() => {
        dispatch({
          type: 'SET_STATS',
          payload: {
            ...state.stats,
            elapsedSeconds: Math.floor((Date.now() - state.stats.startTime) / 1000)
          }
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.stats.startTime]);

  const handleStartCheck = async () => {
    if (!input.trim()) {
      alert(t.import + ' 不能为空');
      return;
    }

    const uids = InputValidator.validateAndExtract(input);
    if (uids.length === 0) {
      alert('未找到有效的 UID');
      return;
    }

    abortControllerRef.current = new AbortController();
    dispatch({ type: 'SET_STATUS', payload: 'checking' });
    dispatch({
      type: 'SET_STATS',
      payload: {
        liveCount: 0,
        dieCount: 0,
        errorCount: 0,
        processed: 0,
        total: uids.length,
        startTime: Date.now(),
        endTime: 0,
        elapsedSeconds: 0
      }
    });

    const chunks = [];
    for (let i = 0; i < uids.length; i += CONFIG.UI.CHUNK_SIZE) {
      chunks.push(uids.slice(i, i + CONFIG.UI.CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      if (abortControllerRef.current.signal.aborted) break;

      while (state.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await Promise.allSettled(
        chunk.map(uid =>
          concurrencyRef.current.run(async () => {
            const result = await apiRef.current.checkUID(uid);
            dispatch({
              type: 'ADD_RESULT',
              payload: { uid, resultStatus: result.status }
            });
          })
        )
      );
    }

    dispatch({
      type: 'SET_STATS',
      payload: {
        ...state.stats,
        endTime: Date.now(),
        elapsedSeconds: Math.floor((Date.now() - state.stats.startTime) / 1000)
      }
    });

    const record: HistoryRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      total: uids.length,
      liveCount: state.stats.liveCount,
      dieCount: state.stats.dieCount,
      results: { alive: state.liveList, dead: state.dieList }
    };

    dispatch({ type: 'ADD_HISTORY', payload: record });
    dispatch({ type: 'SET_STATUS', payload: 'completed' });
  };

  const handlePause = () => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
  };

  const handleExport = (data: string[], format: 'txt' | 'json' = 'txt') => {
    const content = format === 'txt' ? data.join('\n') : JSON.stringify({ uids: data, timestamp: Date.now() }, null, 2);
    const blob = new Blob([content], { type: format === 'txt' ? 'text/plain' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uid-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (data: string[]) => {
    navigator.clipboard.writeText(data.join('\n'));
    alert(t.copied(data.length));
  };

  const progress = state.stats.total > 0 ? (state.stats.processed / state.stats.total) * 100 : 0;

  return (
    <div className={`min-h-screen ${state.theme === 'dark' ? 'dark' : ''} bg-background text-foreground transition-colors duration-300`}>
      {/* 头部 */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="container max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline">{t.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {!state.networkStatus && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-600 rounded-lg text-xs">
                <AlertCircle className="w-3 h-3" />
                {t.noNetwork}
              </div>
            )}
            <button
              onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' })}
              className="p-2 hover:bg-secondary rounded-lg transition"
            >
              {state.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 输入区域 */}
        <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4 dark:bg-slate-900/50 dark:border-slate-700">
          <h2 className="font-semibold text-lg">{t.import}</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴 UID，每行一个，支持混合文本（自动提取14位数字）..."
            className="w-full min-h-[150px] p-4 bg-secondary/30 rounded-lg border focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-y dark:bg-slate-800/50 dark:border-slate-600"
            disabled={state.status === 'checking'}
          />

          <div className="flex gap-3 flex-wrap">
            {state.status !== 'checking' ? (
              <button
                onClick={handleStartCheck}
                className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                <Search className="w-4 h-4 inline mr-2" />
                {t.startCheck}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="flex-1 h-11 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
                >
                  {state.isPaused ? <Play className="w-4 h-4 inline mr-2" /> : <Pause className="w-4 h-4 inline mr-2" />}
                  {state.isPaused ? t.resume : t.pause}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 h-11 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  {t.cancel}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 进度条 */}
        {state.status === 'checking' && (
          <ProgressBar progress={progress} stats={state.stats} t={t} />
        )}

        {/* 统计信息 */}
        {(state.liveList.length > 0 || state.dieList.length > 0 || state.errorList.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-200/50 dark:border-green-900/50">
              <div className="text-2xl font-bold text-green-600">{state.stats.liveCount}</div>
              <div className="text-sm text-muted-foreground">{t.alive}</div>
            </div>
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-200/50 dark:border-red-900/50">
              <div className="text-2xl font-bold text-red-600">{state.stats.dieCount}</div>
              <div className="text-sm text-muted-foreground">{t.dead}</div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-200/50 dark:border-yellow-900/50">
              <div className="text-2xl font-bold text-yellow-600">{state.stats.errorCount}</div>
              <div className="text-sm text-muted-foreground">{t.errors}</div>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-200/50 dark:border-blue-900/50">
              <div className="text-2xl font-bold text-blue-600">{state.stats.elapsedSeconds}s</div>
              <div className="text-sm text-muted-foreground">{t.duration}</div>
            </div>
          </div>
        )}

        {/* 结果区域 */}
        {(state.liveList.length > 0 || state.dieList.length > 0 || state.errorList.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {state.liveList.length > 0 && (
              <ResultSection
                title={t.alive}
                count={state.liveList.length}
                results={state.liveList}
                type="alive"
                color="green"
                onCopy={() => handleCopy(state.liveList)}
                onExport={() => handleExport(state.liveList)}
                onResultChange={(data) => dispatch({ type: 'ADD_RESULT', payload: { uid: data[0], resultStatus: 'alive' } })}
              />
            )}
            {state.dieList.length > 0 && (
              <ResultSection
                title={t.dead}
                count={state.dieList.length}
                results={state.dieList}
                type="dead"
                color="red"
                onCopy={() => handleCopy(state.dieList)}
                onExport={() => handleExport(state.dieList)}
                onResultChange={(data) => dispatch({ type: 'ADD_RESULT', payload: { uid: data[0], resultStatus: 'dead' } })}
              />
            )}
            {state.errorList.length > 0 && (
              <ResultSection
                title={t.errors}
                count={state.errorList.length}
                results={state.errorList}
                type="error"
                color="yellow"
                onCopy={() => handleCopy(state.errorList)}
                onExport={() => handleExport(state.errorList)}
                onResultChange={(data) => dispatch({ type: 'ADD_RESULT', payload: { uid: data[0], resultStatus: 'error' } })}
              />
            )}
          </div>
        )}

        {/* 底部操作 */}
        {(state.liveList.length > 0 || state.dieList.length > 0) && (
          <div className="flex gap-3 flex-wrap justify-center pb-4">
            <button
              onClick={() => dispatch({ type: 'CLEAR_ALL' })}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              {t.clear}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}