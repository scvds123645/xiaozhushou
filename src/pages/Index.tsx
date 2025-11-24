import { useState, useCallback, useMemo, useReducer } from "react";
import { CheckCircle, Loader2, Trash2, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoBanner } from "@/components/InfoBanner";
import { InputHint } from "@/components/InputHint";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";

// 类型定义
type NotificationState = {
  message: string;
  type: "error" | "success" | "warning" | "info";
  visible: boolean;
};

type DetectionState = {
  isDetecting: boolean;
  aliveIds: string[];
  deadIds: string[];
  totalCount: number;
  processedCount: number;
  showResults: boolean;
};

type DetectionAction =
  | { type: "START_DETECTION"; totalCount: number }
  | { type: "UPDATE_PROGRESS" }
  | { type: "SET_RESULTS"; alive: string[]; dead: string[] }
  | { type: "RESET" };

// 状态管理Reducer
const detectionReducer = (state: DetectionState, action: DetectionAction): DetectionState => {
  switch (action.type) {
    case "START_DETECTION":
      return {
        ...state,
        isDetecting: true,
        aliveIds: [],
        deadIds: [],
        totalCount: action.totalCount,
        processedCount: 0,
        showResults: false,
      };
    case "UPDATE_PROGRESS":
      return { ...state, processedCount: state.processedCount + 1 };
    case "SET_RESULTS":
      return {
        ...state,
        isDetecting: false,
        aliveIds: action.alive,
        deadIds: action.dead,
        showResults: true,
      };
    case "RESET":
      return {
        isDetecting: false,
        aliveIds: [],
        deadIds: [],
        totalCount: 0,
        processedCount: 0,
        showResults: false,
      };
    default:
      return state;
  }
};

// 工具函数
const extractUID = (line: string): string | null => line.match(/\b\d{14}\b/)?.[0] || null;

const checkFbAccount = async (uid: string): Promise<boolean> => {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?type=normal`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      redirect: "follow",
    });
    return !response.url.includes("rsrc.php");
  } catch {
    return false;
  }
};

const Index = () => {
  const [input, setInput] = useState("");
  const [inputHint, setInputHint] = useState<NotificationState>({
    message: "",
    type: "info",
    visible: false,
  });
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "info",
    visible: false,
  });
  const [detectionState, dispatch] = useReducer(detectionReducer, {
    isDetecting: false,
    aliveIds: [],
    deadIds: [],
    totalCount: 0,
    processedCount: 0,
    showResults: false,
  });

  // 显示提示信息
  const showHint = useCallback(
    (message: string, type: NotificationState["type"] = "error", duration = 4000) => {
      setInputHint({ message, type, visible: true });
      setTimeout(() => setInputHint((prev) => ({ ...prev, visible: false })), duration);
    },
    []
  );

  const showNotification = useCallback(
    (message: string, type: NotificationState["type"] = "success", duration = 5000) => {
      setNotification({ message, type, visible: true });
      setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), duration);
    },
    []
  );

  // 批量检测
  const detectBatch = useCallback(
    async (uids: string[], concurrency = 5) => {
      const results: { uid: string; isAlive: boolean }[] = [];

      for (let i = 0; i < uids.length; i += concurrency) {
        const batch = uids.slice(i, i + concurrency);
        const batchResults = await Promise.all(
          batch.map(async (uid) => {
            const isAlive = await checkFbAccount(uid);
            dispatch({ type: "UPDATE_PROGRESS" });
            return { uid, isAlive };
          })
        );
        results.push(...batchResults);
      }

      return results;
    },
    []
  );

  // 开始检测
  const startDetection = useCallback(async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      showHint("请输入需要检测的文本");
      return;
    }

    const lines = trimmedInput.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      showHint("输入的内容无效，请检查格式");
      return;
    }

    const extractedUIDs = lines.map(extractUID).filter(Boolean) as string[];

    if (extractedUIDs.length === 0) {
      showHint("未找到任何14位数字的UID，请检查输入格式");
      return;
    }

    const skippedCount = lines.length - extractedUIDs.length;

    dispatch({ type: "START_DETECTION", totalCount: extractedUIDs.length });

    try {
      const results = await detectBatch(extractedUIDs, 5);
      const alive = results.filter((r) => r.isAlive).map((r) => r.uid);
      const dead = results.filter((r) => !r.isAlive).map((r) => r.uid);

      dispatch({ type: "SET_RESULTS", alive, dead });

      const successMsg = `检测完成！存活 ${alive.length} 个，失效 ${dead.length} 个${
        skippedCount > 0 ? `，跳过 ${skippedCount} 行无效数据` : ""
      }`;
      showNotification(successMsg);
    } catch (error) {
      console.error("检测过程出错:", error);
      showNotification("检测过程出错，请检查网络后重试", "error");
      dispatch({ type: "RESET" });
    }
  }, [input, detectBatch, showHint, showNotification]);

  // 清空所有
  const clearAll = useCallback(() => {
    setInput("");
    dispatch({ type: "RESET" });
  }, []);

  // 输入变化处理
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setInputHint((prev) => ({ ...prev, visible: false }));
  }, []);

  // 计算是否显示空状态
  const showEmptyState = useMemo(
    () => !detectionState.showResults && !detectionState.isDetecting,
    [detectionState.showResults, detectionState.isDetecting]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 h-12 sm:h-14 border-b border-border/50 bg-card/70 glass-effect">
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

        {/* 通知横幅 */}
        <InfoBanner message={notification.message} type={notification.type} visible={notification.visible} />

        {/* 输入卡片 */}
        <div className="bg-card/70 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-3 sm:mb-5 transition-smooth hover:shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-5">输入待检测账号</h2>

          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="请输入包含14位FB账号UID的文本（一行一个）&#10;例如：&#10;100012345678901&#10;UID: 100012345678902 备注信息&#10;账号100012345678903已激活"
            className="w-full min-h-[140px] sm:min-h-[160px] p-3 sm:p-4 bg-secondary/60 rounded-xl font-mono text-xs sm:text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            aria-label="待检测的FB账号UID"
            disabled={detectionState.isDetecting}
          />
          <InputHint message={inputHint.message} type={inputHint.type} visible={inputHint.visible} />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-5 mb-3 sm:mb-5">
            <Button
              onClick={startDetection}
              disabled={detectionState.isDetecting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 sm:h-11 rounded-xl transition-smooth text-sm sm:text-base"
            >
              {detectionState.isDetecting ? (
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
            <Button
              onClick={clearAll}
              disabled={detectionState.isDetecting}
              variant="secondary"
              className="flex-1 sm:flex-none sm:min-w-[120px] h-10 sm:h-11 rounded-xl font-semibold text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空
            </Button>
          </div>

          <ProgressBar
            current={detectionState.processedCount}
            total={detectionState.totalCount}
            visible={detectionState.isDetecting}
          />
        </div>

        {/* 结果展示 */}
        {detectionState.showResults && (
          <div className="bg-card/70 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-5">检测结果</h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <ResultCard type="alive" count={detectionState.aliveIds.length} uids={detectionState.aliveIds} />
              <ResultCard type="dead" count={detectionState.deadIds.length} uids={detectionState.deadIds} />
            </div>
          </div>
        )}

        {/* 空状态 */}
        {showEmptyState && (
          <div className="bg-card/70 glass-effect rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-sm text-center">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
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
