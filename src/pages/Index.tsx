import { useState, useCallback, useMemo, useReducer, memo } from "react";
import { CheckCircle, Loader2, Trash2, Search, Download, Moon, Sun, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============= Types =============
type NotificationType = "info" | "success" | "error" | "warning";
type DetectionState = {
  alive: string[];
  dead: string[];
  total: number;
  processed: number;
  isDetecting: boolean;
  showResults: boolean;
};

type Action =
  | { type: "START_DETECTION"; payload: number }
  | { type: "UPDATE_PROGRESS"; payload: number }
  | { type: "ADD_RESULT"; payload: { uid: string; isAlive: boolean } }
  | { type: "FINISH_DETECTION" }
  | { type: "RESET" };

// ============= Reducer =============
const detectionReducer = (state: DetectionState, action: Action): DetectionState => {
  switch (action.type) {
    case "START_DETECTION":
      return { ...state, alive: [], dead: [], total: action.payload, processed: 0, isDetecting: true, showResults: false };
    case "UPDATE_PROGRESS":
      return { ...state, processed: action.payload };
    case "ADD_RESULT":
      return {
        ...state,
        alive: action.payload.isAlive ? [...state.alive, action.payload.uid] : state.alive,
        dead: !action.payload.isAlive ? [...state.dead, action.payload.uid] : state.dead,
        processed: state.processed + 1,
      };
    case "FINISH_DETECTION":
      return { ...state, isDetecting: false, showResults: true };
    case "RESET":
      return { alive: [], dead: [], total: 0, processed: 0, isDetecting: false, showResults: false };
    default:
      return state;
  }
};

// ============= Custom Hooks =============
const useNotification = () => {
  const [notification, setNotification] = useState<{ message: string; type: NotificationType; visible: boolean }>({
    message: "",
    type: "info",
    visible: false,
  });

  const show = useCallback((message: string, type: NotificationType = "info", duration = 4000) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), duration);
  }, []);

  return { notification, show };
};

const useTheme = () => {
  const [isDark, setIsDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const toggle = useCallback(() => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  }, []);

  return { isDark, toggle };
};

const useUIDExtractor = () => {
  const extract = useCallback((text: string): string[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const uids = new Set<string>();
    
    lines.forEach((line) => {
      const match = line.match(/\b\d{14}\b/);
      if (match) uids.add(match[0]);
    });
    
    return Array.from(uids);
  }, []);

  return { extract };
};

// ============= API =============
const checkFbAccount = async (uid: string): Promise<boolean> => {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?type=normal`;
    const response = await fetch(url, { redirect: "follow" });
    return !response.url.includes("rsrc.php");
  } catch {
    return false;
  }
};

const detectBatch = async (uids: string[], concurrency: number, onProgress: (uid: string, isAlive: boolean) => void) => {
  for (let i = 0; i < uids.length; i += concurrency) {
    const batch = uids.slice(i, i + concurrency);
    await Promise.allSettled(
      batch.map(async (uid) => {
        const isAlive = await checkFbAccount(uid);
        onProgress(uid, isAlive);
      })
    );
  }
};

// ============= Components =============
const Notification = memo(({ message, type, visible }: { message: string; type: NotificationType; visible: boolean }) => {
  if (!visible) return null;
  
  const colors = {
    info: "bg-blue-500/90",
    success: "bg-green-500/90",
    error: "bg-red-500/90",
    warning: "bg-yellow-500/90",
  };

  return (
    <div className={`${colors[type]} text-white px-4 py-3 rounded-xl mb-3 shadow-lg animate-in slide-in-from-top`}>
      <p className="text-sm sm:text-base font-medium">{message}</p>
    </div>
  );
});

const ProgressBar = memo(({ current, total, visible }: { current: number; total: number; visible: boolean }) => {
  if (!visible) return null;
  
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
        <span>检测进度</span>
        <span className="font-mono">{current}/{total} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
});

const ResultCard = memo(({ type, count, uids }: { type: "alive" | "dead"; count: number; uids: string[] }) => {
  const [expanded, setExpanded] = useState(false);
  
  const config = {
    alive: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "存活账号" },
    dead: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "失效账号" },
  };

  const { icon: Icon, color, bg, label } = config[type];

  const exportData = useCallback(() => {
    const text = uids.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_uids_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [uids, type]);

  return (
    <div className={`${bg} rounded-xl p-4 sm:p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`${color} w-5 h-5 sm:w-6 sm:h-6`} />
          <h3 className="font-semibold text-base sm:text-lg">{label}</h3>
          <span className={`${color} font-bold text-lg sm:text-xl`}>{count}</span>
        </div>
        {count > 0 && (
          <Button onClick={exportData} size="sm" variant="ghost" className="h-8 text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            导出
          </Button>
        )}
      </div>
      
      {count > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            {expanded ? "收起" : "展开"} ({count} 个)
          </button>
          
          {expanded && (
            <div className="mt-3 max-h-60 overflow-y-auto bg-background/50 rounded-lg p-3">
              <div className="font-mono text-xs sm:text-sm space-y-1">
                {uids.map((uid, idx) => (
                  <div key={uid} className="py-1 px-2 hover:bg-secondary/50 rounded transition-colors">
                    {idx + 1}. {uid}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

// ============= Main Component =============
const Index = () => {
  const [input, setInput] = useState("");
  const [state, dispatch] = useReducer(detectionReducer, {
    alive: [],
    dead: [],
    total: 0,
    processed: 0,
    isDetecting: false,
    showResults: false,
  });
  
  const { notification, show } = useNotification();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { extract } = useUIDExtractor();

  const detectedCount = useMemo(() => extract(input).length, [input, extract]);

  const startDetection = useCallback(async () => {
    const uids = extract(input.trim());
    
    if (uids.length === 0) {
      show("未找到任何14位数字的UID，请检查输入格式", "error");
      return;
    }

    if (uids.length > 1000) {
      show("检测数量过大，建议分批处理（单批≤1000个）", "warning");
      return;
    }

    dispatch({ type: "START_DETECTION", payload: uids.length });

    try {
      await detectBatch(uids, 5, (uid, isAlive) => {
        dispatch({ type: "ADD_RESULT", payload: { uid, isAlive } });
      });
      
      dispatch({ type: "FINISH_DETECTION" });
      show(`检测完成！存活 ${state.alive.length} 个，失效 ${state.dead.length} 个`, "success");
    } catch (error) {
      show("检测过程出错，请检查网络后重试", "error");
      dispatch({ type: "FINISH_DETECTION" });
    }
  }, [input, extract, show, state.alive.length, state.dead.length]);

  const clearAll = useCallback(() => {
    if (state.total > 0 && !confirm("确定要清空所有数据吗？")) return;
    setInput("");
    dispatch({ type: "RESET" });
  }, [state.total]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b bg-card/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">FB账号存活检测</span>
            <span className="sm:hidden">FB检测</span>
          </div>
          <Button onClick={toggleTheme} size="icon" variant="ghost" className="w-9 h-9">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-5">
        <Notification {...notification} />

        {/* Input Card */}
        <div className="bg-card rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">输入待检测账号</h2>
            {detectedCount > 0 && (
              <span className="text-sm text-muted-foreground">
                已识别 <span className="font-bold text-primary">{detectedCount}</span> 个UID
              </span>
            )}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入包含14位FB账号UID的文本（一行一个）&#10;例如：100012345678901"
            className="w-full min-h-[160px] p-4 bg-secondary/60 rounded-xl font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={state.isDetecting}
          />

          <div className="flex gap-3 mt-4">
            <Button onClick={startDetection} disabled={state.isDetecting} className="flex-1 h-11 rounded-xl font-semibold">
              {state.isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  检测中...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  开始检测
                </>
              )}
            </Button>
            <Button onClick={clearAll} disabled={state.isDetecting} variant="secondary" className="h-11 px-6 rounded-xl font-semibold">
              <Trash2 className="w-4 h-4 mr-2" />
              清空
            </Button>
          </div>

          <ProgressBar current={state.processed} total={state.total} visible={state.isDetecting} />
        </div>

        {/* Results */}
        {state.showResults ? (
          <div className="bg-card rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">检测结果</h2>
            <div className="space-y-4">
              <ResultCard type="alive" count={state.alive.length} uids={state.alive} />
              <ResultCard type="dead" count={state.dead.length} uids={state.dead} />
            </div>
          </div>
        ) : !state.isDetecting && (
          <div className="bg-card rounded-2xl p-12 shadow-sm text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">暂无检测结果</h3>
            <p className="text-muted-foreground">请在上方输入框中输入包含14位FB账号UID的文本</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
