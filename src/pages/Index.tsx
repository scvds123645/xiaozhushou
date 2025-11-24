import { useState } from "react";
import { CheckCircle, Loader2, Trash2, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InfoBanner } from "@/components/InfoBanner";
import { InputHint } from "@/components/InputHint";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [input, setInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [aliveIds, setAliveIds] = useState<string[]>([]);
  const [deadIds, setDeadIds] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const [hintType, setHintType] = useState<"error" | "success" | "warning" | "info">("info");
  const [showHint, setShowHint] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"info" | "success" | "error" | "warning">("info");
  const [showNotification, setShowNotification] = useState(false);

  const showInputHint = (message: string, type: "error" | "success" | "warning" | "info" = "error") => {
    setHintMessage(message);
    setHintType(type);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 4000);
  };

  const showNotificationBanner = (message: string, type: "info" | "success" | "error" | "warning" = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

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

  const detectBatch = async (uids: string[], concurrency = 5) => {
    const results: { uid: string; isAlive: boolean }[] = [];
    
    for (let i = 0; i < uids.length; i += concurrency) {
      const batch = uids.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (uid) => {
          const isAlive = await checkFbAccount(uid);
          setProcessedCount((prev) => prev + 1);
          return { uid, isAlive };
        })
      );
      results.push(...batchResults);
    }
    
    return results;
  };

  const startDetection = async () => {
    const inputValue = input.trim();
    
    if (!inputValue) {
      showInputHint("请输入需要检测的文本", "error");
      return;
    }

    const lines = inputValue.split("\n").map((line) => line.trim()).filter((line) => line);

    if (lines.length === 0) {
      showInputHint("输入的内容无效，请检查格式", "error");
      return;
    }

    const extractedUIDs: string[] = [];
    lines.forEach((line) => {
      const uid = extract14DigitUID(line);
      if (uid) {
        extractedUIDs.push(uid);
      }
    });

    if (extractedUIDs.length === 0) {
      showInputHint("未找到任何14位数字的UID，请检查输入格式", "error");
      return;
    }

    const skippedCount = lines.length - extractedUIDs.length;

    setIsDetecting(true);
    setAliveIds([]);
    setDeadIds([]);
    setTotalCount(extractedUIDs.length);
    setProcessedCount(0);
    setShowResults(false);

    try {
      const results = await detectBatch(extractedUIDs, 5);

      const alive: string[] = [];
      const dead: string[] = [];

      results.forEach(({ uid, isAlive }) => {
        if (isAlive) {
          alive.push(uid);
        } else {
          dead.push(uid);
        }
      });

      setAliveIds(alive);
      setDeadIds(dead);
      setShowResults(true);

      let successMsg = `检测完成！存活 ${alive.length} 个，失效 ${dead.length} 个`;
      if (skippedCount > 0) {
        successMsg += `，跳过 ${skippedCount} 行无效数据`;
      }
      showNotificationBanner(successMsg, "success");
    } catch (error) {
      console.error("检测过程出错:", error);
      showNotificationBanner("检测过程出错，请检查网络后重试", "error");
    } finally {
      setIsDetecting(false);
    }
  };

  const clearAll = () => {
    setInput("");
    setAliveIds([]);
    setDeadIds([]);
    setTotalCount(0);
    setProcessedCount(0);
    setShowResults(false);
  };

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
          message={notificationMessage}
          type={notificationType}
          visible={showNotification}
        />

        {/* 输入卡片 */}
        <div className="bg-card/70 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-3 sm:mb-5 transition-smooth hover:shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-5">输入待检测账号</h2>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (showHint) setShowHint(false);
            }}
            placeholder="请输入包含14位FB账号UID的文本（一行一个）&#10;例如：&#10;100012345678901&#10;UID: 100012345678902 备注信息&#10;账号100012345678903已激活"
            className="w-full min-h-[140px] sm:min-h-[160px] p-3 sm:p-4 bg-secondary/60 rounded-xl font-mono text-xs sm:text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            aria-label="待检测的FB账号UID"
            disabled={isDetecting}
          />
          <InputHint message={hintMessage} type={hintType} visible={showHint} />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-5 mb-3 sm:mb-5">
            <Button
              onClick={startDetection}
              disabled={isDetecting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 sm:h-11 rounded-xl transition-smooth text-sm sm:text-base"
            >
              {isDetecting ? (
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
              disabled={isDetecting}
              variant="secondary"
              className="flex-1 sm:flex-none sm:min-w-[120px] h-10 sm:h-11 rounded-xl font-semibold text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空
            </Button>
          </div>

          <ProgressBar current={processedCount} total={totalCount} visible={isDetecting} />
        </div>

        {/* 结果展示 */}
        {showResults && (
          <div className="bg-card/70 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-5">检测结果</h2>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <ResultCard type="alive" count={aliveIds.length} uids={aliveIds} />
              <ResultCard type="dead" count={deadIds.length} uids={deadIds} />
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!showResults && !isDetecting && (
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
