import React, { useState, useRef } from "react";
import { 
  CheckCircle, Search, Download, 
  Copy, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- 类型定义 ---
type DetectionResult = { uid: string; status: "alive" | "dead" };
type Stats = { liveCount: number; dieCount: number; processed: number; total: number };

// --- 核心检测类 ---
class CheckFbLive {
  liveCount: number = 0;
  dieCount: number = 0;
  content: string = '';

  constructor(content: string = '') {
    this.content = content;
  }

  get objIds(): string[] {
    return this.content
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  async checkLive(uid: string): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/${uid}/picture?type=normal`, {
        method: 'GET',
        redirect: 'follow'
      });
      return !response.url.includes('static');
    } catch {
      return false;
    }
  }

  async checkLives(
    arrayIds: string[], 
    callback: ((uid: string, live: boolean) => void) | null = null
  ): Promise<void> {
    for (let uid of arrayIds) {
      let realUid = uid.toString().trim();
      
      // 提取数字UID
      if (!/^\d+$/.test(realUid)) {
        const match = uid.match(/(\d{14})/);
        if (!match) continue;
        realUid = match[1];
      }

      const live = await this.checkLive(realUid);
      this[live ? 'liveCount' : 'dieCount']++;
      
      if (callback) callback(realUid, live);
    }
  }

  checkLiveWithThreads(
    threads: number = 50,
    callbackCheckLive: ((uid: string, live: boolean) => void) | null = null,
    onDone: (() => void) | null = null
  ): void {
    const array = this.objIds;
    const chunkSize = Math.ceil(array.length / threads);
    const dataPerThreads: string[][] = [];

    // 分配数据到每个线程
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      dataPerThreads.push(chunk);
    }

    const total = dataPerThreads.length;
    let done = 0;

    for (let listIds of dataPerThreads) {
      this.checkLives(listIds, callbackCheckLive).then(() => {
        done++;
        if (done >= total && onDone) {
          onDone();
        }
      });
    }
  }
}

// --- UI 组件: 结果卡片 ---
const ResultSection = React.memo(({ 
  title, 
  count, 
  results, 
  type, 
  onCopy, 
  onExport 
}: {
  title: string;
  count: number;
  results: string;
  type: 'alive' | 'dead';
  onCopy: () => void;
  onExport: () => void;
}) => {
  const colorClass = type === 'alive' 
    ? 'text-green-600 bg-green-500/10 border-green-200/50' 
    : 'text-red-600 bg-red-500/10 border-red-200/50';
  const icon = type === 'alive' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />;
  
  const lines = results.split('\n').filter(l => l.trim());

  return (
    <div className={`flex flex-col p-4 rounded-xl border ${colorClass} bg-card/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
          {icon}
          <span>{title} ({count})</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExport}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <textarea
        value={results}
        readOnly
        className="bg-background/50 rounded-lg p-2 h-64 sm:h-80 font-mono text-xs border resize-none"
        placeholder={count === 0 ? '无数据' : ''}
      />
    </div>
  );
});

// --- 主组件 ---
const Index = () => {
  const [input, setInput] = useState("");
  const [liveList, setLiveList] = useState("");
  const [dieList, setDieList] = useState("");
  const [stats, setStats] = useState<Stats>({ liveCount: 0, dieCount: 0, processed: 0, total: 0 });
  const [isChecking, setIsChecking] = useState(false);
  
  const checkFbLiveRef = useRef<CheckFbLive | null>(null);

  const handleStart = () => {
    if (!input.trim()) {
      alert("请输入UID列表");
      return;
    }

    setIsChecking(true);
    setLiveList("");
    setDieList("");
    setStats({ liveCount: 0, dieCount: 0, processed: 0, total: 0 });

    const checker = new CheckFbLive(input);
    checkFbLiveRef.current = checker;
    
    const totalIds = checker.objIds.length;
    setStats(prev => ({ ...prev, total: totalIds }));

    checker.checkLiveWithThreads(
      100,
      (uid, live) => {
        if (live) {
          setLiveList(prev => prev ? `${prev}\n${uid}` : uid);
          setStats(prev => ({ 
            ...prev, 
            liveCount: checker.liveCount,
            processed: checker.liveCount + checker.dieCount
          }));
        } else {
          setDieList(prev => prev ? `${prev}\n${uid}` : uid);
          setStats(prev => ({ 
            ...prev, 
            dieCount: checker.dieCount,
            processed: checker.liveCount + checker.dieCount
          }));
        }
      },
      () => {
        setIsChecking(false);
        if (navigator.vibrate) navigator.vibrate(100);
      }
    );
  };

  const exportData = (data: string, prefix: string) => {
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fb-${prefix}-${new Date().toLocaleTimeString().replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyData = (data: string) => {
    const lines = data.split('\n').filter(l => l.trim()).length;
    navigator.clipboard.writeText(data);
    alert(`已复制 ${lines} 个UID`);
  };

  const clearAll = () => {
    setInput("");
    setLiveList("");
    setDieList("");
    setStats({ liveCount: 0, dieCount: 0, processed: 0, total: 0 });
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
          <h2 className="font-semibold text-lg">导入账号</h2>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴UID，每行一个，支持混合文本（自动提取14位数字）..."
            className="w-full min-h-[120px] sm:min-h-[150px] p-3 bg-secondary/30 rounded-lg border focus:ring-2 focus:ring-primary/50 text-xs sm:text-sm font-mono resize-y"
            disabled={isChecking}
          />

          <div className="flex gap-3">
            <Button 
              onClick={handleStart} 
              disabled={isChecking}
              className="flex-1 h-11 text-base font-medium shadow-lg shadow-primary/20"
            >
              <Search className="w-4 h-4 mr-2" /> 
              {isChecking ? '检测中...' : '开始检测'}
            </Button>
          </div>
        </div>



        {/* 结果区域 */}
        {(liveList || dieList) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultSection 
              title="存活"
              count={stats.liveCount}
              results={liveList}
              type="alive"
              onCopy={() => copyData(liveList)}
              onExport={() => exportData(liveList, 'alive')}
            />
            <ResultSection 
              title="失效"
              count={stats.dieCount}
              results={dieList}
              type="dead"
              onCopy={() => copyData(dieList)}
              onExport={() => exportData(dieList, 'dead')}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;