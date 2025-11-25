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

  /**
   * 检查单个UID是否存活
   * 通过检查图片重定向URL是否包含'static'来判断
   */
  async checkLive(uid: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${uid}/picture?type=normal`,
        {
          method: 'GET',
          redirect: 'follow'
        }
      );
      // 如果responseURL不包含'static'，说明账号活跃
      return !response.url.includes('static');
    } catch {
      return false;
    }
  }

  /**
   * 批量检查UID列表
   * 包含UID验证和提取逻辑
   */
  async checkLives(
    arrayIds: string[], 
    callback: ((uid: string, live: boolean) => void) | null = null
  ): Promise<void> {
    for (let uid of arrayIds) {
      let realUid = uid.toString().trim();
      
      // 验证是否为纯数字UID
      if (!/^\d+$/.test(realUid)) {
        // 尝试从混合文本中提取14位数字UID
        const match = uid.match(/(\d{14})/);
        if (!match) {
          // 如果没有14位数字，尝试提取任意数字序列
          const fallback = uid.match(/(\d+)/);
          if (!fallback) continue;
          realUid = fallback[1];
        } else {
          realUid = match[1];
        }
      }

      const live = await this.checkLive(realUid);
      
      // 更新计数器
      if (live) {
        this.liveCount++;
      } else {
        this.dieCount++;
      }
      
      if (callback) {
        callback(realUid, live);
      }
    }
  }

  /**
   * 多线程并发检测
   * 将UID列表分成多个批次，每个批次并发处理
   */
  checkLiveWithThreads(
    threads: number = 50,
    callbackCheckLive: ((uid: string, live: boolean) => void) | null = null,
    onDone: (() => void) | null = null
  ): void {
    const array = this.objIds;
    
    // 计算每个线程处理的UID数量
    const chunkSize = Math.ceil(array.length / threads);
    const dataPerThreads: string[][] = [];

    // 将数据分配到每个线程
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      dataPerThreads.push(chunk);
    }

    const total = dataPerThreads.length;
    let done = 0;

    // 启动并发检测
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

// --- UI 组件: 统计信息 ---
const StatsBar = ({ stats, isChecking }: { stats: Stats; isChecking: boolean }) => {
  const progress = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;
  
  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-200/50">
          <div className="text-sm text-green-600 font-medium">存活</div>
          <div className="text-2xl font-bold text-green-600">{stats.liveCount}</div>
        </div>
        <div className="p-3 bg-red-500/10 rounded-lg border border-red-200/50">
          <div className="text-sm text-red-600 font-medium">失效</div>
          <div className="text-2xl font-bold text-red-600">{stats.dieCount}</div>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-200/50">
          <div className="text-sm text-blue-600 font-medium">已检测</div>
          <div className="text-2xl font-bold text-blue-600">{stats.processed}/{stats.total}</div>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-200/50">
          <div className="text-sm text-purple-600 font-medium">进度</div>
          <div className="text-2xl font-bold text-purple-600">{progress}%</div>
        </div>
      </div>
      
      {isChecking && (
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// --- UI 组件: 结果卡片 ---
const ResultSection = React.memo(({ 
  title, 
  count, 
  results, 
  type, 
  onCopy, 
  onExport,
  onResultChange
}: {
  title: string;
  count: number;
  results: string;
  type: 'alive' | 'dead';
  onCopy: () => void;
  onExport: () => void;
  onResultChange: (value: string) => void;
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
        onChange={(e) => onResultChange(e.target.value)}
        className="bg-background/50 rounded-lg p-2 h-64 sm:h-80 font-mono text-xs border resize-none focus:ring-2 focus:ring-primary/50"
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

    // 使用100个线程进行并发检测
    checker.checkLiveWithThreads(
      100,
      (uid, live) => {
        if (live) {
          setLiveList(prev => prev ? `${prev}\n${uid}` : uid);
        } else {
          setDieList(prev => prev ? `${prev}\n${uid}` : uid);
        }
        
        // 实时更新统计信息
        setStats(prev => ({ 
          ...prev, 
          liveCount: checker.liveCount,
          dieCount: checker.dieCount,
          processed: checker.liveCount + checker.dieCount
        }));
      },
      () => {
        setIsChecking(false);
        // 检测完成，触发振动反馈
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
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
    if (isChecking) {
      alert("检测进行中，无法清空");
      return;
    }
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
            <Button 
              onClick={clearAll}
              disabled={isChecking}
              variant="outline"
              className="px-6 h-11"
            >
              清空
            </Button>
          </div>
        </div>

        {/* 统计信息区 */}
        {(isChecking || stats.total > 0) && (
          <StatsBar stats={stats} isChecking={isChecking} />
        )}

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
              onResultChange={setLiveList}
            />
            <ResultSection 
              title="失效"
              count={stats.dieCount}
              results={dieList}
              type="dead"
              onCopy={() => copyData(dieList)}
              onExport={() => exportData(dieList, 'dead')}
              onResultChange={setDieList}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;