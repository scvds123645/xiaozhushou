import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { CheckCircle, Loader2, Trash2, Search, Pause, Play, Download, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// ===== 类型定义 =====
type HintType = "error" | "success" | "warning" | "info";
type DetectionResult = { uid: string; isAlive: boolean; timestamp: number };
type StorageData = {
  results: DetectionResult[];
  timestamp: number;
  totalCount: number;
};

// ===== 自定义Hooks =====
const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: HintType;
    visible: boolean;
  }>({ message: "", type: "info", visible: false });

  const show = useCallback((message: string, type: HintType = "success") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 5000);
  }, []);

  return { notification, showNotification: show };
};

const useStorage = (key: string) => {
  const save = useCallback(async (data: StorageData) => {
    try {
      await window.storage?.set(key, JSON.stringify(data), false);
    } catch (error) {
      console.error("保存数据失败:", error);
    }
  }, [key]);

  const load = useCallback(async (): Promise<StorageData | null> => {
    try {
      const result = await window.storage?.get(key, false);
      return result?.value ? JSON.parse(result.value) : null;
    } catch (error) {
      return null;
    }
  }, [key]);

  const clear = useCallback(async () => {
    try {
      await window.storage?.delete(key, false);
    } catch (error) {
      console.error("清除数据失败:", error);
    }
  }, [key]);

  return { save, load, clear };
};

// ===== 工具函数 =====
const extract14DigitUID = (line: string): string | null => {
  const match = line.match(/\b\d{14}\b/);
  return match ? match[0] : null;
};

const removeDuplicates = (uids: string[]): string[] => {
  return [...new Set(uids)];
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs}秒`;
};

const exportToCSV = (results: DetectionResult[]): string => {
  const header = "UID,状态,检测时间\n";
  const rows = results.map(r => 
    `${r.uid},${r.isAlive ? "存活" : "失效"},${new Date(r.timestamp).toLocaleString()}`
  ).join("\n");
  return header + rows;
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ===== 子组件 =====
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-secondary/80 transition-colors">
      {isDark ? "🌙" : "☀️"}
    </button>
  );
};

const InfoBanner = ({ message, type = "info", visible = true }: { 
  message?: string; 
  type?: HintType; 
  visible?: boolean;
}) => {
  if (!visible) return null;
  
  const defaultMessage = "使用说明：输入包含14位FB账号UID的文本，支持各种格式，系统会自动提取UID进行检测";
  const bgColors = {
    info: "bg-blue-500/10 border-blue-500/20",
    success: "bg-green-500/10 border-green-500/20",
    error: "bg-red-500/10 border-red-500/20",
    warning: "bg-yellow-500/10 border-yellow-500/20"
  };

  return (
    <div className={`${bgColors[type]} border rounded-xl p-3 sm:p-4 mb-3 sm:mb-5 text-sm transition-all`}>
      {message || defaultMessage}
    </div>
  );
};

const ProgressBar = ({ current, total, visible, startTime }: { 
  current: number; 
  total: number; 
  visible: boolean;
  startTime?: number;
}) => {
  if (!visible || total === 0) return null;
  
  const percentage = Math.round((current / total) * 100);
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const estimatedTotal = current > 0 ? Math.floor((elapsed / current) * total) : 0;
  const remaining = Math.max(0, estimatedTotal - elapsed);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current} / {total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {remaining > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          预计剩余时间: {formatTime(remaining)}
        </div>
      )}
    </div>
  );
};

const ResultCard = ({ 
  type, 
  count, 
  results,
  onCopy,
  onExport 
}: { 
  type: "alive" | "dead";
  count: number;
  results: DetectionResult[];
  onCopy: (uids: string[]) => void;
  onExport: (results: DetectionResult[]) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  
  const isAlive = type === "alive";
  const title = isAlive ? "存活账号" : "失效账号";
  const bgColor = isAlive ? "bg-green-500/10" : "bg-red-500/10";
  const borderColor = isAlive ? "border-green-500/20" : "border-red-500/20";
  const icon = isAlive ? "✅" : "❌";

  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    return results.filter(r => r.uid.includes(searchTerm));
  }, [results, searchTerm]);

  const handleCopy = () => {
    onCopy(results.map(r => r.uid));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title} ({count})
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 px-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onExport(results)}
            className="h-8 px-2"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {count > 0 && (
        <>
          <input
            type="text"
            placeholder="搜索UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-3 bg-background/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filteredResults.map((result, idx) => (
              <div 
                key={idx}
                className="p-2 bg-background/30 rounded-lg font-mono text-xs flex justify-between items-center hover:bg-background/50 transition-colors"
              >
                <span>{result.uid}</span>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {count === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">暂无数据</p>
      )}
    </div>
  );
};

// ===== 主组件 =====
const Index = () => {
  const [input, setInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [detectedUIDCount, setDetectedUIDCount] = useState(0);
  
  const { notification, showNotification } = useNotification();
  const storage = useStorage("fb-detector-history");
  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseResolveRef = useRef<(() => void) | null>(null);

  // 实时预览检测到的UID数量
  useEffect(() => {
    const lines = input.split("\n").map(l => l.trim()).filter(l => l);
    const uids = lines.map(extract14DigitUID).filter(Boolean) as string[];
    const uniqueUids = removeDuplicates(uids);
    setDetectedUIDCount(uniqueUids.length);
  }, [input]);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      const data = await storage.load();
      if (data && data.results.length > 0) {
        setResults(data.results);
        setTotalCount(data.totalCount);
        setProcessedCount(data.results.length);
        setShowResults(true);
      }
    };
    loadHistory();
  }, [storage]);

  // 检测FB账号
  const checkFbAccount = async (uid: string, signal?: AbortSignal): Promise<boolean> => {
    try {
      const url = `https://graph.facebook.com/${uid}/picture?type=normal`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        redirect: "follow",
        signal
      });
      return !response.url.includes("rsrc.php");
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error(`检测UID ${uid} 时发生错误:`, error);
      return false;
    }
  };

  // 批量检测
  const detectBatch = async (uids: string[], concurrency = 5) => {
    const detectionResults: DetectionResult[] = [];
    abortControllerRef.current = new AbortController();
    
    for (let i = 0; i < uids.length; i += concurrency) {
      // 检查暂停状态
      if (isPaused) {
        await new Promise<void>(resolve => {
          pauseResolveRef.current = resolve;
        });
      }

      const batch = uids.slice(i, i + concurrency);
      
      try {
        const batchResults = await Promise.all(
          batch.map(async (uid) => {
            const isAlive = await checkFbAccount(uid, abortControllerRef.current?.signal);
            const result: DetectionResult = {
              uid,
              isAlive,
              timestamp: Date.now()
            };
            setProcessedCount(prev => prev + 1);
            return result;
          })
        );
        detectionResults.push(...batchResults);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
        console.error("批量检测出错:", error);
      }
    }
    
    return detectionResults;
  };

  // 开始检测
  const startDetection = async () => {
    const inputValue = input.trim();
    
    if (!inputValue) {
      showNotification("请输入需要检测的文本", "error");
      return;
    }

    const lines = inputValue.split("\n").map(l => l.trim()).filter(l => l);
    const extractedUIDs = lines.map(extract14DigitUID).filter(Boolean) as string[];
    const uniqueUIDs = removeDuplicates(extractedUIDs);

    if (uniqueUIDs.length === 0) {
      showNotification("未找到任何14位数字的UID，请检查输入格式", "error");
      return;
    }

    const duplicateCount = extractedUIDs.length - uniqueUIDs.length;
    if (duplicateCount > 0) {
      showNotification(`已自动去除 ${duplicateCount} 个重复UID`, "info");
    }

    setIsDetecting(true);
    setIsPaused(false);
    setResults([]);
    setTotalCount(uniqueUIDs.length);
    setProcessedCount(0);
    setShowResults(false);
    setStartTime(Date.now());

    try {
      const detectionResults = await detectBatch(uniqueUIDs, 5);
      setResults(detectionResults);
      setShowResults(true);

      const alive = detectionResults.filter(r => r.isAlive).length;
      const dead = detectionResults.filter(r => !r.isAlive).length;

      // 保存到存储
      await storage.save({
        results: detectionResults,
        timestamp: Date.now(),
        totalCount: uniqueUIDs.length
      });

      showNotification(`检测完成！存活 ${alive} 个，失效 ${dead} 个`, "success");
      
      // 播放提示音（简单的音频反馈）
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        showNotification("检测已取消", "warning");
      } else {
        showNotification("检测过程出错，请检查网络后重试", "error");
      }
    } finally {
      setIsDetecting(false);
      setIsPaused(false);
      abortControllerRef.current = null;
    }
  };

  // 暂停/继续
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      pauseResolveRef.current?.();
      pauseResolveRef.current = null;
    } else {
      setIsPaused(true);
    }
  };

  // 停止检测
  const stopDetection = () => {
    abortControllerRef.current?.abort();
    setIsDetecting(false);
    setIsPaused(false);
  };

  // 清空所有
  const clearAll = async () => {
    setInput("");
    setResults([]);
    setTotalCount(0);
    setProcessedCount(0);
    setShowResults(false);
    await storage.clear();
  };

  // 复制UID列表
  const copyUIDs = (uids: string[]) => {
    navigator.clipboard.writeText(uids.join("\n"));
    showNotification("已复制到剪贴板", "success");
  };

  // 导出结果
  const exportResults = (resultsToExport: DetectionResult[]) => {
    const csv = exportToCSV(resultsToExport);
    downloadFile(csv, `fb-detection-${Date.now()}.csv`, "text/csv");
    showNotification("已导出CSV文件", "success");
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isDetecting) {
        e.preventDefault();
        startDetection();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [input, isDetecting]);

  const aliveResults = useMemo(() => results.filter(r => r.isAlive), [results]);
  const deadResults = useMemo(() => results.filter(r => !r.isAlive), [results]);

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 h-12 sm:h-14 border-b border-border/50 bg-card/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-base sm:text-lg">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="truncate">FB账号存活检测</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-3 sm:py-5">
        <InfoBanner />
        <InfoBanner 
          message={notification.message}
          type={notification.type}
          visible={notification.visible}
        />

        {/* 输入卡片 */}
        <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-3 sm:mb-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold">输入待检测账号</h2>
            {detectedUIDCount > 0 && (
              <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                检测到 {detectedUIDCount} 个UID
              </span>
            )}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入包含14位FB账号UID的文本（一行一个）&#10;支持快捷键: Ctrl+Enter 开始检测&#10;&#10;例如：&#10;100012345678901&#10;UID: 100012345678902 备注信息&#10;账号100012345678903已激活"
            className="w-full min-h-[140px] sm:min-h-[160px] p-3 sm:p-4 bg-secondary/60 rounded-xl font-mono text-xs sm:text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isDetecting}
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-5 mb-3 sm:mb-5">
            {!isDetecting ? (
              <>
                <Button
                  onClick={startDetection}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 sm:h-11 rounded-xl transition-all"
                >
                  <Search className="w-4 h-4 mr-2" />
                  开始检测
                </Button>
                <Button
                  onClick={clearAll}
                  variant="secondary"
                  className="flex-1 sm:flex-none sm:min-w-[120px] h-10 sm:h-11 rounded-xl font-semibold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={togglePause}
                  variant="secondary"
                  className="flex-1 h-10 sm:h-11 rounded-xl font-semibold"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      继续
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      暂停
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopDetection}
                  variant="destructive"
                  className="flex-1 h-10 sm:h-11 rounded-xl font-semibold"
                >
                  <X className="w-4 h-4 mr-2" />
                  停止
                </Button>
              </>
            )}
          </div>

          <ProgressBar 
            current={processedCount} 
            total={totalCount} 
            visible={isDetecting}
            startTime={startTime}
          />
        </div>

        {/* 结果展示 */}
        {showResults && (
          <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-3 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-semibold">检测结果</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportResults(results)}
                className="h-8"
              >
                <Download className="w-4 h-4 mr-1" />
                导出全部
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <ResultCard 
                type="alive" 
                count={aliveResults.length} 
                results={aliveResults}
                onCopy={copyUIDs}
                onExport={exportResults}
              />
              <ResultCard 
                type="dead" 
                count={deadResults.length} 
                results={deadResults}
                onCopy={copyUIDs}
                onExport={exportResults}
              />
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!showResults && !isDetecting && (
          <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">暂无检测结果</h3>
            <p className="text-muted-foreground text-sm sm:text-base px-2">
              请在上方输入框中输入包含14位FB账号UID的文本，然后点击"开始检测"按钮
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;