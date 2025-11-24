import React, { useState, useRef, useEffect } from "react";
import { 
  CheckCircle, Search, Download, 
  Copy, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- 类型定义 ---
type DetectionResult = { uid: string; status: "alive" | "dead" };
type Stats = { liveCount: number; dieCount: number; processed: number; total: number };

// --- 加载 SweetAlert2 ---
const useSweetAlert = () => {
  const [Swal, setSwal] = useState<any>(null);

  useEffect(() => {
    // 加载 SweetAlert2 CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/11.7.32/sweetalert2.min.css';
    document.head.appendChild(link);

    // 加载 SweetAlert2 JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/11.7.32/sweetalert2.all.min.js';
    script.onload = () => {
      setSwal((window as any).Swal);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  return Swal;
};

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
  const Swal = useSweetAlert();

  const showAutoCloseAlert = (title: string, html: string, timer: number = 2000) => {
    if (!Swal) return;

    let timerInterval: any;
    Swal.fire({
      title: title,
      html: html,
      timer: timer,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timerElement = Swal.getPopup().querySelector("b");
        if (timerElement) {
          timerInterval = setInterval(() => {
            timerElement.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        }
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result: any) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log("Alert was closed by the timer");
      }
    });
  };

  const handleStart = () => {
    if (!input.trim()) {
      if (Swal) {
        Swal.fire({
          icon: 'warning',
          title: '提示',
          text: '请输入UID列表',
          confirmButtonText: '确定'
        });
      } else {
        alert("请输入UID列表");
      }
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

    // 显示开始检测提示
    showAutoCloseAlert(
      "开始检测",
      `正在检测 <b>${totalIds}</b> 个UID，请稍候...`,
      1500
    );

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
        
        // 显示完成提示
        if (Swal) {
          Swal.fire({
            icon: 'success',
            title: '检测完成!',
            html: `
              <div style="text-align: left; padding: 10px;">
                <p>✅ 存活: <b>${checker.liveCount}</b> 个</p>
                <p>❌ 失效: <b>${checker.dieCount}</b> 个</p>
                <p>📊 总计: <b>${checker.liveCount + checker.dieCount}</b> 个</p>
              </div>
            `,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonText: '确定'
          });
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

    // 显示导出成功提示
    showAutoCloseAlert(
      "导出成功",
      `文件已保存为 <b>fb-${prefix}-*.txt</b>`,
      1500
    );
  };

  const copyData = (data: string) => {
    const lines = data.split('\n').filter(l => l.trim()).length;
    navigator.clipboard.writeText(data);
    
    // 使用 SweetAlert2 显示复制成功
    showAutoCloseAlert(
      "复制成功",
      `已复制 <b>${lines}</b> 个UID到剪贴板`,
      1500
    );
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
            placeholder="在此粘贴UID,每行一个,支持混合文本(自动提取14位数字)..."
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

          {/* 进度显示 */}
          {isChecking && stats.total > 0 && (
            <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>进度: {stats.processed} / {stats.total}</span>
                <span>{Math.round((stats.processed / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(stats.processed / stats.total) * 100}%` }}
                />
              </div>
            </div>
          )}
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