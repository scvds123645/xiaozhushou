import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { 
  CheckCircle, Loader2, Trash2, Search, Download, 
  PauseCircle, PlayCircle, Upload, Copy, AlertCircle, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- 类型定义 ---
type DetectionStatus = "idle" | "running" | "paused" | "completed";
type DetectionResult = { uid: string; status: "alive" | "dead"; timestamp: number };
type Stats = { total: number; processed: number; alive: number; dead: number; startTime: number };

// --- 工具函数 ---
const CONSTANTS = {
  CONCURRENCY: 20,
  TIMEOUT: 5000,
  REGEX: /\b\d{14,16}\b/,
};

const extractUIDs = (text: string): string[] => {
  const uniqueSet = new Set<string>();
  text.split(/\r?\n/).forEach(line => {
    const match = line.match(CONSTANTS.REGEX);
    if (match) uniqueSet.add(match[0]);
  });
  return Array.from(uniqueSet);
};

// --- 核心检测 Hook ---
const useDetection = () => {
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, processed: 0, alive: 0, dead: 0, startTime: 0 });
  
  const isPausedRef = useRef(false);
  const activeWorkers = useRef(0);

  // 核心检测请求
  const checkUID = async (uid: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.TIMEOUT);
      
      const response = await fetch(`https://graph.facebook.com/${uid}/picture?type=normal`, {
        method: 'GET',
        signal: controller.signal,
        redirect: "follow",
      });
      
      clearTimeout(timeoutId);
      return !response.url.includes("rsrc.php");
    } catch {
      return false;
    }
  };

  // 处理器：从队列中取任务
  const processQueue = useCallback(() => {
    if (isPausedRef.current) return;

    setQueue(prev => {
      if (prev.length === 0) return prev;
      
      const availableSlots = CONSTANTS.CONCURRENCY - activeWorkers.current;
      if (availableSlots <= 0) return prev;

      const currentBatch = prev.slice(0, availableSlots);
      const remaining = prev.slice(availableSlots);

      currentBatch.forEach(uid => {
        activeWorkers.current++;
        checkUID(uid).then(isAlive => {
          // 更新结果和统计
          setResults(prevRes => [...prevRes, { uid, status: isAlive ? 'alive' : 'dead', timestamp: Date.now() }]);
          setStats(s => ({
            ...s,
            processed: s.processed + 1,
            alive: s.alive + (isAlive ? 1 : 0),
            dead: s.dead + (isAlive ? 0 : 1)
          }));

          // 完成一个任务后减少计数
          activeWorkers.current--;
          
          // 检查是否全部完成
          setQueue(currentQueue => {
            if (currentQueue.length === 0 && activeWorkers.current === 0) {
              setStatus('completed');
            } else if (!isPausedRef.current && currentQueue.length > 0) {
              // 继续处理剩余任务
              setTimeout(processQueue, 0);
            }
            return currentQueue;
          });
        }).catch(() => {
          // 处理异常情况
          activeWorkers.current--;
          setStats(s => ({ ...s, processed: s.processed + 1, dead: s.dead + 1 }));
          
          setQueue(currentQueue => {
            if (currentQueue.length === 0 && activeWorkers.current === 0) {
              setStatus('completed');
            }
            return currentQueue;
          });
        });
      });

      return remaining;
    });
  }, []);

  // 监听状态变化自动触发处理
  useEffect(() => {
    if (status === 'running' && queue.length > 0 && activeWorkers.current < CONSTANTS.CONCURRENCY) {
      processQueue();
    }
  }, [status, queue, processQueue]);

  const start = (uids: string[]) => {
    setResults([]);
    setQueue(uids);
    setStats({ total: uids.length, processed: 0, alive: 0, dead: 0, startTime: Date.now() });
    setStatus("running");
    isPausedRef.current = false;
    activeWorkers.current = 0;
  };

  const pause = () => {
    setStatus("paused");
    isPausedRef.current = true;
  };

  const resume = () => {
    setStatus("running");
    isPausedRef.current = false;
    processQueue();
  };

  const reset = () => {
    setStatus("idle");
    setResults([]);
    setQueue([]);
    setStats({ total: 0, processed: 0, alive: 0, dead: 0, startTime: 0 });
    isPausedRef.current = false;
    activeWorkers.current = 0;
  };

  return { status, stats, results, start, pause, resume, reset };
};

// --- UI 组件: 进度条 ---
const ProgressBar = React.memo(({ current, total, status }: { current: number, total: number, status: string }) => {
  const percent = total === 0 ? 0 : Math.min(100, (current / total) * 100);
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span>进度: {current}/{total}</span>
        <span>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 sm:h-3 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ease-out ${status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
});

// --- UI 组件: 结果卡片 ---
const ResultSection = React.memo(({ results, type, onCopy, onExport }: any) => {
  const filtered = results.filter((r: any) => r.status === type);
  const count = filtered.length;
  const colorClass = type === 'alive' ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10';
  const icon = type === 'alive' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />;

  return (
    <div className={`flex flex-col p-4 rounded-xl border ${type === 'alive' ? 'border-green-200/50' : 'border-red-200/50'} bg-card/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
          {icon}
          <span>{type === 'alive' ? '存活' : '失效'} ({count})</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(filtered)}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onExport(filtered, type)}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="bg-background/50 rounded-lg p-2 h-32 sm:h-40 overflow-y-auto font-mono text-xs border">
        {count === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">无数据</div>
        ) : (
          filtered.slice(0, 100).map((r: any) => <div key={r.uid} className="py-0.5">{r.uid}</div>)
        )}
        {count > 100 && <div className="text-center text-xs text-muted-foreground py-2">...还有 {count - 100} 个 (请导出查看全部)</div>}
      </div>
    </div>
  );
});

// --- 主组件 ---
const Index = () => {
  const [input, setInput] = useState("");
  const { status, stats, results, start, pause, resume, reset } = useDetection();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 计算速度
  const speed = useMemo(() => {
    if (stats.startTime === 0 || stats.processed === 0) return 0;
    const seconds = (Date.now() - stats.startTime) / 1000;
    return Math.round(stats.processed / seconds);
  }, [stats.processed, stats.startTime]);

  const handleStart = () => {
    const uids = extractUIDs(input);
    if (uids.length === 0) {
      alert("未检测到有效的UID");
      return;
    }
    start(uids);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setInput(ev.target.result);
    };
    reader.readAsText(file);
  };

  const exportData = (data: DetectionResult[], prefix: string) => {
    const content = data.map(r => r.uid).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fb-${prefix}-${new Date().toLocaleTimeString().replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyData = (data: DetectionResult[]) => {
    const content = data.map(r => r.uid).join("\n");
    navigator.clipboard.writeText(content);
    alert(`已复制 ${data.length} 个UID`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      {/* 头部 */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span>UID Checker</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* 输入区域 */}
        <div className="bg-card rounded-xl border shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">导入账号</h2>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.csv" 
              onChange={handleFileUpload}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> TXT导入
            </Button>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴UID，自动识别14-16位数字，支持混合文本..."
            className="w-full min-h-[120px] sm:min-h-[150px] p-3 bg-secondary/30 rounded-lg border focus:ring-2 focus:ring-primary/50 text-xs sm:text-sm font-mono resize-y"
            disabled={status === 'running' || status === 'paused'}
          />

          <div className="flex gap-3">
            {status === 'idle' || status === 'completed' ? (
              <Button onClick={handleStart} className="flex-1 h-11 text-base font-medium shadow-lg shadow-primary/20">
                <Search className="w-4 h-4 mr-2" /> 开始检测
              </Button>
            ) : (
              <>
                {status === 'running' ? (
                  <Button onClick={pause} variant="secondary" className="flex-1 h-11 border-2 border-primary/20">
                    <PauseCircle className="w-5 h-5 mr-2" /> 暂停
                  </Button>
                ) : (
                  <Button onClick={resume} className="flex-1 h-11 bg-green-600 hover:bg-green-700">
                    <PlayCircle className="w-5 h-5 mr-2" /> 继续
                  </Button>
                )}
                <Button onClick={reset} variant="destructive" className="w-24 h-11">
                  <X className="w-5 h-5" />
                </Button>
              </>
            )}
            <Button onClick={() => setInput('')} variant="ghost" className="h-11 px-3">
              <Trash2 className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* 状态面板 */}
        {(status !== 'idle' || results.length > 0) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card rounded-xl border p-4 shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">实时速度</div>
                  <div className="text-2xl font-bold font-mono">{speed} <span className="text-sm font-normal text-muted-foreground">个/秒</span></div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">状态</div>
                  <div className="text-lg font-medium">
                    {status === 'running' && <span className="text-blue-600">检测中...</span>}
                    {status === 'paused' && <span className="text-orange-600">已暂停</span>}
                    {status === 'completed' && <span className="text-green-600">✓ 已完成</span>}
                  </div>
                </div>
              </div>
              <ProgressBar current={stats.processed} total={stats.total} status={status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultSection 
                results={results} 
                type="alive" 
                onCopy={copyData} 
                onExport={exportData} 
              />
              <ResultSection 
                results={results} 
                type="dead" 
                onCopy={copyData} 
                onExport={exportData} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
