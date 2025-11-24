import { useState, useCallback, useMemo, useReducer } from "react";
import { CheckCircle, Loader2, Trash2, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoBanner } from "@/components/InfoBanner";
import { InputHint } from "@/components/InputHint";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";

// 状态管理优化：使用reducer管理复杂状态
interface AppState {
  input: string;
  isDetecting: boolean;
  aliveIds: string[];
  deadIds: string[];
  totalCount: number;
  processedCount: number;
  showResults: boolean;
  hint: {
    message: string;
    type: "error" | "success" | "warning" | "info";
    visible: boolean;
  };
  notification: {
    message: string;
    type: "info" | "success" | "error" | "warning";
    visible: boolean;
  };
}

type AppAction =
  | { type: "SET_INPUT"; payload: string }
  | { type: "START_DETECTION" }
  | { type: "SET_DETECTION_RESULTS"; payload: { alive: string[]; dead: string[] } }
  | { type: "INCREMENT_PROCESSED_COUNT" }
  | { type: "SET_PROCESSED_COUNT"; payload: number }
  | { type: "SET_TOTAL_COUNT"; payload: number }
  | { type: "SET_SHOW_RESULTS"; payload: boolean }
  | { type: "SET_HINT"; payload: Partial<AppState["hint"]> }
  | { type: "SET_NOTIFICATION"; payload: Partial<AppState["notification"]> }
  | { type: "CLEAR_ALL" };

const initialState: AppState = {
  input: "",
  isDetecting: false,
  aliveIds: [],
  deadIds: [],
  totalCount: 0,
  processedCount: 0,
  showResults: false,
  hint: { message: "", type: "info", visible: false },
  notification: { message: "", type: "info", visible: false },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, input: action.payload, hint: { ...state.hint, visible: false } };
    case "START_DETECTION":
      return {
        ...state,
        isDetecting: true,
        aliveIds: [],
        deadIds: [],
        processedCount: 0,
        showResults: false,
      };
    case "SET_DETECTION_RESULTS":
      return {
        ...state,
        aliveIds: action.payload.alive,
        deadIds: action.payload.dead,
        showResults: true,
        isDetecting: false,
      };
    case "INCREMENT_PROCESSED_COUNT":
      return { ...state, processedCount: state.processedCount + 1 };
    case "SET_PROCESSED_COUNT":
      return { ...state, processedCount: action.payload };
    case "SET_TOTAL_COUNT":
      return { ...state, totalCount: action.payload };
    case "SET_SHOW_RESULTS":
      return { ...state, showResults: action.payload };
    case "SET_HINT":
      return { ...state, hint: { ...state.hint, ...action.payload } };
    case "SET_NOTIFICATION":
      return { ...state, notification: { ...state.notification, ...action.payload } };
    case "CLEAR_ALL":
      return {
        ...initialState,
        hint: state.hint,
        notification: state.notification,
      };
    default:
      return state;
  }
}

// 工具函数提取
const extract14DigitUID = (line: string): string | null => {
  const match = line.match(/\b\d{14}\b/);
  return match ? match[0] : null;
};

const checkFbAccount = async (uid: string): Promise<boolean> => {
  try {
    const url = `https://graph.facebook.com/${uid}/picture?type=normal`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });
    return !response.url.includes("rsrc.php");
  } catch (error) {
    console.error(`检测UID ${uid} 时发生错误:`, error);
    return false;
  }
};

const processBatch = async (uids: string[], concurrency = 5, onProgress: () => void) => {
  const results: { uid: string; isAlive: boolean }[] = [];
  
  for (let i = 0; i < uids.length; i += concurrency) {
    const batch = uids.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (uid) => {
        const isAlive = await checkFbAccount(uid);
        onProgress();
        return { uid, isAlive };
      })
    );
    results.push(...batchResults);
  }
  
  return results;
};

const Index = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 性能优化：使用useCallback缓存函数
  const showInputHint = useCallback((message: string, type: "error" | "success" | "warning" | "info" = "error") => {
    dispatch({ type: "SET_HINT", payload: { message, type, visible: true } });
    setTimeout(() => dispatch({ type: "SET_HINT", payload: { visible: false } }), 4000);
  }, []);

  const showNotificationBanner = useCallback((message: string, type: "info" | "success" | "error" | "warning" = "success") => {
    dispatch({ type: "SET_NOTIFICATION", payload: { message, type, visible: true } });
    setTimeout(() => dispatch({ type: "SET_NOTIFICATION", payload: { visible: false } }), 5000);
  }, []);

  // 用户体验改进：增强输入验证
  const validateInput = useCallback((inputValue: string) => {
    if (!inputValue.trim()) {
      showInputHint("请输入需要检测的文本", "error");
      return false;
    }

    const lines = inputValue.split("\n").map(line => line.trim()).filter(line => line);
    if (lines.length === 0) {
      showInputHint("输入的内容无效，请检查格式", "error");
      return false;
    }

    const extractedUIDs = lines.map(extract14DigitUID).filter(Boolean) as string[];
    if (extractedUIDs.length === 0) {
      showInputHint("未找到任何14位数字的UID，请检查输入格式", "error");
      return false;
    }

    return extractedUIDs;
  }, [showInputHint]);

  const startDetection = useCallback(async () => {
    const extractedUIDs = validateInput(state.input);
    if (!extractedUIDs) return;

    const skippedCount = state.input.split("\n").length - extractedUIDs.length;

    dispatch({ type: "START_DETECTION" });
    dispatch({ type: "SET_TOTAL_COUNT", payload: extractedUIDs.length });

    try {
      const results = await processBatch(
        extractedUIDs, 
        5, 
        () => dispatch({ type: "INCREMENT_PROCESSED_COUNT" })
      );

      const alive: string[] = [];
      const dead: string[] = [];

      results.forEach(({ uid, isAlive }) => {
        if (isAlive) alive.push(uid);
        else dead.push(uid);
      });

      dispatch({ type: "SET_DETECTION_RESULTS", payload: { alive, dead } });

      let successMsg = `检测完成！存活 ${alive.length} 个，失效 ${dead.length} 个`;
      if (skippedCount > 0) {
        successMsg += `，跳过 ${skippedCount} 行无效数据`;
      }
      showNotificationBanner(successMsg, "success");
    } catch (error) {
      console.error("检测过程出错:", error);
      showNotificationBanner("检测过程出错，请检查网络后重试", "error");
      dispatch({ type: "SET_SHOW_RESULTS", payload: false });
    }
  }, [state.input, validateInput, showNotificationBanner]);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const handleInputChange = useCallback((value: string) => {
    dispatch({ type: "SET_INPUT", payload: value });
  }, []);

  // 性能优化：使用useMemo缓存计算结果
  const hasResults = useMemo(() => 
    state.showResults && (state.aliveIds.length > 0 || state.deadIds.length > 0), 
    [state.showResults, state.aliveIds.length, state.deadIds.length]
  );

  const isEmptyState = useMemo(() => 
    !state.showResults && !state.isDetecting, 
    [state.showResults, state.isDetecting]
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
        <InfoBanner 
          message={state.notification.message}
          type={state.notification.type}
          visible={state.notification.visible}
        />

        {/* 输入卡片 */}
        <div className="bg-card/70 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-3 sm:mb-5 transition-smooth hover:shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-5">输入待检测账号</h2>

          <textarea
            value={state.input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="请输入包含14位FB账号UID的文本（一行一个）&#10;例如：&#10;100012345678901&#10;UID: 100012345678902 备注信息&#10;账号100012345678903已激活"
            className="w-full min-h-[140px] sm:min-h-[160px] p-3 sm:p-4 bg-secondary/60 rounded-xl font-mono text-xs sm:text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            aria-label="待检测的FB账号UID"
            disabled={state.isDetecting}
          />
          <InputHint 
            message={state.hint.message} 
            type={state.hint.type} 
            visible={state.hint.visible} 
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-5 mb-3 sm:mb-5">
            <Button
              onClick={startDetection}
              disabled={state.isDetecting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 sm:h-11 rounded-xl transition-smooth text-sm sm:text-base"
            >
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
            <Button
              onClick={clearAll}
              disabled={state.isDetecting}
              variant="secondary"
              className="flex-1 sm:flex-none sm:min-w-[120px] h-10 sm:h-11 rounded-xl font-semibold text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空
            </Button>
          </div>

          <ProgressBar 
            current={state.processedCount} 
            total={state.totalCount} 
            visible={state.isDetecting} 
          />
        </div>

        {/* 结果展示 */}
        {hasResults && (
          <div className="bg-card/70 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-5">检测结果</h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <ResultCard type="alive" count={state.aliveIds.length} uids={state.aliveIds} />
              <ResultCard type="dead" count={state.deadIds.length} uids={state.deadIds} />
            </div>
          </div>
        )}

        {/* 空状态 */}
        {isEmptyState && (
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
