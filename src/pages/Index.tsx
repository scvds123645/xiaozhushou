import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  HardDrive,
  History,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';

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

const HISTORY_KEY_PREFIX = 'fb_history:';
const MAX_USERS_PER_RECORD = 2500;

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

const getLocalStorageSize = () => {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        total += key.length + value.length;
      }
    }
  }
  return total;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'check' | 'history'>('check');
  const [inputValue, setInputValue] = useState<string>('');
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [storageSize, setStorageSize] = useState(0);
  const [compressMode, setCompressMode] = useState(true);

  useEffect(() => {
    setCopiedLive(false);
    setCopiedDie(false);
  }, [results]);

  const parseInputIds = (raw: string) => {
    const matches = raw.match(/\d{14,}/g) ?? [];
    const unique = Array.from(new Set(matches));
    return unique;
  };

  const loadHistory = () => {
    if (typeof window === 'undefined') return;
    const stored: HistoryRecord[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(HISTORY_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            typeof parsed.timestamp === 'number' &&
            typeof parsed.total === 'number' &&
            Array.isArray(parsed.users)
          ) {
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
        } catch {
          // ignore invalid entry
        }
      }
    }
    const sorted = stored.sort((a, b) => b.timestamp - a.timestamp);
    setHistoryRecords(sorted);
    setStorageSize(getLocalStorageSize());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const liveResults = useMemo(() => results.filter((item) => item.status === 'Live'), [results]);
  const dieResults = useMemo(() => results.filter((item) => item.status === 'Die'), [results]);

  const checkSingleUser = async (id: string): Promise<UserResult> => {
    const url = `https://graph.facebook.com/${id}/picture?redirect=false`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('网络错误');
      const data = await res.json();
      const urlField = data?.data?.url ?? '';
      const status: UserResult['status'] = urlField.includes('static') ? 'Die' : 'Live';
      return {
        id,
        status,
        url: urlField,
      };
    } catch {
      return {
        id,
        status: 'Die',
        url: '',
      };
    }
  };

  const runCheckWithIds = async (ids: string[]) => {
    if (ids.length === 0) return;
    setIsChecking(true);
    setTotalToCheck(ids.length);
    setProgress(0);
    setResults([]);
    setShowSavePrompt(false);
    setSaveError(null);

    const idsWithIndex = ids.map((id, index) => ({ id, index }));
    const tempResults: Array<UserResult | null> = Array(ids.length).fill(null);
    const buildOrderedResults = () =>
      tempResults.filter((item): item is UserResult => item !== null);

    const queue = [...idsWithIndex];
    const concurrency = Math.min(100, ids.length);

    const worker = async () => {
      while (queue.length > 0) {
        const entry = queue.shift();
        if (!entry) break;
        const result = await checkSingleUser(entry.id);
        tempResults[entry.index] = result;
        setResults(buildOrderedResults());
        setProgress((prev) => prev + 1);
      }
    };

    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    const finalResults = buildOrderedResults();
    setIsChecking(false);
    setResults(finalResults);
    setShowSavePrompt(true);
    setCurrentCheckNote('');
  };

  const handleStartCheck = () => {
    const ids = parseInputIds(inputValue);
    if (ids.length === 0) return;
    runCheckWithIds(ids);
  };

  const handleSaveToHistory = () => {
    if (results.length === 0) return;
    
    setSaveError(null);
    const liveCount = results.filter((item) => item.status === 'Live').length;
    const dieCount = results.length - liveCount;
    const baseTimestamp = Date.now();
    const trimmedNote = currentCheckNote.slice(0, 200);

    const shouldSplit = results.length > MAX_USERS_PER_RECORD;
    const chunks: UserResult[][] = [];

    if (shouldSplit) {
      for (let i = 0; i < results.length; i += MAX_USERS_PER_RECORD) {
        chunks.push(results.slice(i, i + MAX_USERS_PER_RECORD));
      }
    } else {
      chunks.push(results);
    }

    const savedRecords: HistoryRecord[] = [];

    try {
      chunks.forEach((chunk, index) => {
        const usersToSave = compressMode
          ? chunk.map(({ id, status }) => ({ id, status, url: '' }))
          : chunk;

        const chunkLive = chunk.filter((item) => item.status === 'Live').length;
        const chunkDie = chunk.length - chunkLive;

        const partLabel = shouldSplit ? ` (${index + 1}/${chunks.length})` : '';
        const historyValue = {
          timestamp: baseTimestamp + index,
          total: chunk.length,
          live: chunkLive,
          die: chunkDie,
          note: trimmedNote + partLabel,
          users: usersToSave,
        };

        const historyKey = `${HISTORY_KEY_PREFIX}${baseTimestamp + index}`;
        
        try {
          localStorage.setItem(historyKey, JSON.stringify(historyValue));
          savedRecords.push({ key: historyKey, ...historyValue });
        } catch (error) {
          throw new Error('存储空间不足');
        }
      });

      setHistoryRecords((prev) => [...savedRecords.reverse(), ...prev]);
      setShowSavePrompt(false);
      setCurrentCheckNote('');
      setStorageSize(getLocalStorageSize());
      setActiveTab('history');

      if (shouldSplit) {
        alert(`结果已分割为 ${chunks.length} 条记录保存（每条最多 ${MAX_USERS_PER_RECORD} 个账号）`);
      }
    } catch (error) {
      savedRecords.forEach((record) => localStorage.removeItem(record.key));
      
      if (error instanceof Error && error.message === '存储空间不足') {
        setSaveError(
          '保存失败：浏览器存储空间已满。请清理部分历史记录后重试，或开启压缩模式节省空间。'
        );
      } else {
        setSaveError('保存失败：发生未知错误，请稍后重试。');
      }
    }
  };

  const handleDiscardResults = () => {
    const confirmed = window.confirm('确定要放弃当前检查结果？');
    if (!confirmed) return;
    setShowSavePrompt(false);
    setResults([]);
    setCurrentCheckNote('');
    setSaveError(null);
  };

  const handleRecheckHistory = (record: HistoryRecord) => {
    const ids = record.users.map((user) => user.id);
    setActiveTab('check');
    setInputValue(ids.join('\n'));
    runCheckWithIds(ids);
  };

  const handleCopyLiveResults = async () => {
    if (liveResults.length === 0) return;
    const payload = liveResults.map((user) => user.id).join('\n');
    const success = await copyTextToClipboard(payload);
    if (!success) return;
    setCopiedLive(true);
    setTimeout(() => setCopiedLive(false), 2000);
  };

  const handleCopyDieResults = async () => {
    if (dieResults.length === 0) return;
    const payload = dieResults.map((user) => user.id).join('\n');
    const success = await copyTextToClipboard(payload);
    if (!success) return;
    setCopiedDie(true);
    setTimeout(() => setCopiedDie(false), 2000);
  };

  const handleCopyHistoryList = async (record: HistoryRecord) => {
    const payload = record.users.map((user) => user.id).join('\n');
    const success = await copyTextToClipboard(payload);
    if (!success) return;
    setCopiedHistoryKey(record.key);
    setTimeout(() => {
      setCopiedHistoryKey(null);
    }, 2000);
  };

  const toggleExpand = (key: string) => {
    setExpandedRecords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startEditingNote = (record: HistoryRecord) => {
    setEditingNoteKey(record.key);
    setNoteDraft(record.note ?? '');
  };

  const saveNote = (record: HistoryRecord) => {
    const trimmed = noteDraft.slice(0, 200);
    const updatedRecord = { ...record, note: trimmed };
    const { key, ...payload } = updatedRecord;
    
    try {
      localStorage.setItem(key, JSON.stringify(payload));
      setHistoryRecords((prev) =>
        prev.map((item) => (item.key === key ? { ...item, note: trimmed } : item))
      );
      setEditingNoteKey(null);
      setNoteDraft('');
      setStorageSize(getLocalStorageSize());
    } catch {
      alert('保存备注失败：存储空间不足');
    }
  };

  const cancelEditing = () => {
    setEditingNoteKey(null);
    setNoteDraft('');
  };

  const deleteHistoryRecord = (record: HistoryRecord) => {
    const confirmed = window.confirm('确定要删除此条历史记录？此操作无法恢复。');
    if (!confirmed) return;
    localStorage.removeItem(record.key);
    setHistoryRecords((prev) => prev.filter((item) => item.key !== record.key));
    setStorageSize(getLocalStorageSize());
  };

  const clearHistory = () => {
    if (historyRecords.length === 0) return;
    const confirmed = window.confirm('确定要清空所有历史记录？此操作无法恢复。');
    if (!confirmed) return;
    historyRecords.forEach((record) => localStorage.removeItem(record.key));
    setHistoryRecords([]);
    setStorageSize(getLocalStorageSize());
  };

  const progressPercentage =
    totalToCheck === 0 ? 0 : Math.min(100, Math.round((progress / totalToCheck) * 100));

  const storageWarning = storageSize > 4 * 1024 * 1024;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12">
        <header className="rounded-3xl bg-white/10 p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-white">
                <Users className="h-6 w-6 text-white" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Facebook 工具</p>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">账号状态检查器</h1>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                  <History className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.3em]">即时</span>
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    storageWarning
                      ? 'bg-red-500/20 text-red-200'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  <HardDrive className="h-3 w-3" />
                  <span>{formatBytes(storageSize)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/20 p-2">
              <button
                type="button"
                onClick={() => setActiveTab('check')}
                className={`flex-1 rounded-2xl border border-white/50 px-4 py-2 text-center font-semibold transition-transform hover:scale-105 active:scale-95 ${
                  activeTab === 'check'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white/80 hover:bg-white/30'
                }`}
              >
                状态检查
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 rounded-2xl border border-white/50 px-4 py-2 text-center font-semibold transition-transform hover:scale-105 active:scale-95 ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white/80 hover:bg-white/30'
                }`}
              >
                查询历史
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'check' ? (
          <main className="space-y-6">
            <section className="rounded-3xl bg-white/90 p-6 shadow-2xl text-slate-900">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-500">输入 Facebook 账号 ID（每行一条，可混合文字）</p>
                <h2 className="text-2xl font-semibold text-slate-900">开始检查账号状态</h2>
              </div>
              <textarea
                className="mt-4 min-h-[150px] w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-900 outline-none transition-shadow focus:border-blue-500 focus:shadow-lg"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`示例：\n12345678901234\n不规则文字 145678901234567\n请输入每行 14 位以上数字 ID`}
                disabled={isChecking}
              />
              <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    type="button"
                    onClick={handleStartCheck}
                    disabled={isChecking}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-lg font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                  >
                    {isChecking && <Loader2 className="h-5 w-5 animate-spin" />}
                    <span>{isChecking ? '检查进行中...' : '开始检查'}</span>
                  </button>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCopyLiveResults}
                      disabled={liveResults.length === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {copiedLive ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>已复制 Live</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>复制 Live</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyDieResults}
                      disabled={dieResults.length === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {copiedDie ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>已复制 Die</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>复制 Die</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-500 md:text-sm">
                  <p className="break-words">
                    总共 {totalToCheck} 条 · 已完成 {progress}/{totalToCheck}
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {showSavePrompt && results.length > 0 && (
              <section className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 shadow-2xl">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Save className="h-6 w-6 text-white" />
                    <div>
                      <h3 className="text-xl font-bold text-white">保存检查结果</h3>
                      <p className="text-sm text-white/80">
                        检查完成，是否保存到历史记录？
                        {results.length > MAX_USERS_PER_RECORD &&
                          ` (将自动分割为 ${Math.ceil(results.length / MAX_USERS_PER_RECORD)} 条记录)`}
                      </p>
                    </div>
                  </div>

                  {saveError && (
                    <div className="flex items-start gap-2 rounded-2xl bg-red-500/20 border border-red-300 p-4 text-sm text-white">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">保存失败</p>
                        <p className="mt-1 text-white/90">{saveError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="compressMode"
                      checked={compressMode}
                      onChange={(e) => setCompressMode(e.target.checked)}
                      className="h-4 w-4 rounded border-white/30 bg-white/20 text-teal-600 focus:ring-2 focus:ring-white/50"
                    />
                    <label htmlFor="compressMode" className="text-sm text-white cursor-pointer">
                      压缩模式（仅保存 ID 和状态，不保存 URL，可节省约 60% 空间）
                    </label>
                  </div>

                  <textarea
                    value={currentCheckNote}
                    onChange={(e) => setCurrentCheckNote(e.target.value.slice(0, 200))}
                    placeholder="添加备注（选填，最多200字）"
                    className="min-h-[80px] w-full rounded-2xl border border-white/30 bg-white/20 p-4 text-sm text-white placeholder-white/60 outline-none transition-shadow focus:border-white/50 focus:shadow-lg"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSaveToHistory}
                      className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-teal-700 transition-transform hover:scale-105 active:scale-95"
                    >
                      <Save className="h-5 w-5" />
                      保存到历史
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscardResults}
                      className="rounded-2xl border-2 border-white/50 px-6 py-3 font-semibold text-white transition-transform hover:scale-105 active:scale-95"
                    >
                      放弃结果
                    </button>
                  </div>
                  <p className="text-xs text-white/70">{currentCheckNote.length}/200</p>
                </div>
              </section>
            )}

            <section className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col rounded-3xl bg-white/10 p-4 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live</p>
                    <p className="text-xl font-semibold text-white">{liveResults.length}</p>
                  </div>
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="mt-3 max-h-96 w-full space-y-1 overflow-y-auto pr-1">
                  {liveResults.length === 0 ? (
                    <p className="text-xs text-slate-400">尚未取得 Live 结果</p>
                  ) : (
                    liveResults.map((user) => (
                      <div
                        key={`live-${user.id}`}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2 text-xs font-medium text-white"
                        style={{ minHeight: '40px' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span className="font-mono">{user.id}</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex flex-col rounded-3xl bg-white/10 p-4 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Die</p>
                    <p className="text-xl font-semibold text-white">{dieResults.length}</p>
                  </div>
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="mt-3 max-h-96 w-full space-y-1 overflow-y-auto pr-1">
                  {dieResults.length === 0 ? (
                    <p className="text-xs text-slate-400">尚未取得 Die 结果</p>
                  ) : (
                    dieResults.map((user) => (
                      <div
                        key={`die-${user.id}`}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2 text-xs font-medium text-white"
                        style={{ minHeight: '40px' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                          <span className="font-mono">{user.id}</span>
                        </div>
                        <XCircle className="h-4 w-4 text-red-400" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </main>
        ) : (
          <main className="space-y-6">
            <section className="rounded-3xl bg-white/90 p-6 text-slate-900 shadow-2xl">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">历史记录</p>
                    <h2 className="text-2xl font-semibold text-slate-900">查询记录总览</h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearHistory}
                    disabled={historyRecords.length === 0}
                    className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>清空历史</span>
                  </button>
                </div>
                <p className="text-sm text-slate-500">
                  手动保存每次检查结果，可快速重新检查亦可加入备注。
                </p>
                {storageWarning && (
                  <div className="flex items-center gap-2 rounded-2xl bg-orange-100/80 px-4 py-3 text-sm text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    存储空间使用较多（{formatBytes(storageSize)}），建议清理部分历史记录以避免保存失败。
                  </div>
                )}
                {historyRecords.length > 50 && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-100/80 px-4 py-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    超过 50 条历史记录，建议定期清理。
                  </div>
                )}
              </div>
            </section>
            <section className="space-y-3">
              {historyRecords.length === 0 ? (
                <div className="rounded-3xl bg-white/40 p-6 text-center text-slate-900 shadow-lg">
                  <p className="text-lg font-semibold">暂无查询记录</p>
                  <p className="text-sm text-slate-600">先回到「状态检查」开始一次检查并保存吧。</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {historyRecords.map((record) => (
                    <article
                      key={record.key}
                      className="rounded-3xl bg-white/90 shadow-2xl transition-shadow hover:shadow-2xl"
                    >
                      <div className="flex items-start justify-between gap-3 px-4 py-3">
                        <div>
                          <p className="text-xs text-slate-500">
                            {new Date(record.timestamp).toLocaleString('zh-TW', {
                              hour12: false,
                            })}
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {record.total} 条 · Live {record.live} / Die {record.die}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                              Live {record.live}
                            </span>
                            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-red-600">
                              Die {record.die}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRecheckHistory(record)}
                              className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition-transform hover:scale-105 active:scale-95"
                            >
                              <RefreshCw className="h-3 w-3" />
                              重检
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleExpand(record.key)}
                              className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition-transform hover:scale-105 active:scale-95"
                            >
                              {expandedRecords[record.key] ? (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  收起
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3" />
                                  展开
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyHistoryList(record)}
                              className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition-transform hover:scale-105 active:scale-95"
                            >
                              {copiedHistoryKey === record.key ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-500" />
                                  已复制
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  复制
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteHistoryRecord(record)}
                              className="flex items-center gap-1 rounded-full border border-red-300 px-2 py-1 text-[11px] font-semibold text-red-600 transition-transform hover:scale-105 active:scale-95"
                            >
                              <Trash2 className="h-3 w-3" />
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <p className="max-w-[70%] text-slate-600">
                            {record.note || '尚未新增备注，可点击右侧编辑'}
                          </p>
                          <button
                            type="button"
                            onClick={() => startEditingNote(record)}
                            className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600 transition-transform hover:scale-105 active:scale-95"
                          >
                            <Edit2 className="h-3 w-3" />
                            编辑
                          </button>
                        </div>
                        {editingNoteKey === record.key && (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value.slice(0, 200))}
                              className="h-24 w-full rounded-2xl border border-slate-300 p-3 text-sm text-slate-900 outline-none transition-shadow focus:border-blue-500 focus:shadow-lg"
                              placeholder="最多 200 字"
                            />
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>{noteDraft.length}/200</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="rounded-2xl border border-slate-300 px-3 py-1 text-slate-600 transition-transform hover:scale-105 active:scale-95"
                                >
                                  取消
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveNote(record)}
                                  className="rounded-2xl bg-blue-600 px-3 py-1 text-white transition-transform hover:scale-105 active:scale-95"
                                >
                                  保存
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {expandedRecords[record.key] && (
                          <div className="mt-3 max-h-60 overflow-y-auto space-y-1 rounded-2xl bg-slate-50/80 p-3 text-[11px] text-slate-700">
                            {record.users.map((user) => (
                              <div
                                key={`history-${record.key}-${user.id}`}
                                className="flex items-center justify-between rounded-2xl bg-white/60 px-3 py-1.5 shadow-sm"
                              >
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-900">
                                  {user.status === 'Live' ? (
                                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <XCircle className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className="font-mono">{user.id}</span>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    user.status === 'Live'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-red-100 text-red-600'
                                  }`}
                                >
                                  {user.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
