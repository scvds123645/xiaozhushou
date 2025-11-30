import { useState, useRef } from "react";
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Settings2,
  Users,
  Check,
  Lock // 新增 Lock 图标，表示数量已锁定
} from "lucide-react";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

const NumberGenerator = () => {
  // --- 配置状态 ---
  const ALLOWED_PREFIXES = ["6155", "6156", "6157", "6158"];
  const FIXED_COUNT = 99; // 核心修改：固定数量为 99
  
  const [config, setConfig] = useState({
    prefix: "6158"
  });

  // --- 核心数据状态 ---
  const [resultList, setResultList] = useState<string[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  
  // --- UI 状态 ---
  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 震动反馈
  const triggerHaptic = (style = 'medium') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (style === 'heavy') navigator.vibrate(20);
      else navigator.vibrate(10);
    }
  };

  const handlePrefixSelect = (prefix: string) => {
    triggerHaptic('light');
    setConfig({ prefix });
  };

  const handleGenerate = () => {
    triggerHaptic('medium');
    setStatus('generating');
    setResultList([]);
    setProgress(0);
    
    // 模拟计算进度
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) {
        clearInterval(interval);
        finishGeneration();
      } else {
        setProgress(currentProgress);
      }
    }, 50);

    const finishGeneration = () => {
      const prefix = config.prefix;
      const totalLength = 14; 
      const randomLength = totalLength - prefix.length; 

      let newNumbers = [];
      // 核心修改：使用固定的 FIXED_COUNT (99)
      for (let i = 0; i < FIXED_COUNT; i++) {
        let randomPart = "";
        for (let j = 0; j < randomLength; j++) {
          randomPart += Math.floor(Math.random() * 10).toString();
        }
        newNumbers.push(prefix + randomPart);
      }
      
      setProgress(100);
      setTimeout(() => {
        setResultList(newNumbers);
        setHistoryCount(newNumbers.length);
        setStatus('success');
        triggerHaptic('heavy');
        
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 200);
    };
  };

  const handleCopy = () => {
    if (resultList.length === 0) return;
    triggerHaptic('medium');
    const textToCopy = resultList.join("\n");
    navigator.clipboard.writeText(textToCopy);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleClear = () => {
    triggerHaptic('medium');
    setResultList([]);
    setHistoryCount(0);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <PageLayout
      title="FB UID 生成器"
      description="批量生成 99 个 Facebook 账户 ID"
      backLabel="返回"
    >
      {/* Toast 提示 */}
      <div className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none
        flex items-center gap-2 px-4 py-2 rounded-full
        bg-slate-900/90 text-white shadow-xl backdrop-blur-md
        transition-all duration-300 transform
        ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}
      `}>
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-xs font-medium">99 个 UID 已复制</span>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 p-3 pb-32 md:p-6">
        
        {/* 1. 配置卡片 */}
        <Card className="rounded-3xl border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-60" />

          <div className="p-5 md:p-6 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                生成参数
              </h2>
              <div className="flex gap-2">
                <div className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-slate-500">14位</span>
                </div>
                {/* 锁定数量的视觉提示 */}
                <div className="bg-orange-50 border border-orange-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-600">固定 99个</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* 号段选择器 */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  选择 UID 前缀
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ALLOWED_PREFIXES.map((p) => {
                    const isSelected = config.prefix === p;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePrefixSelect(p)}
                        className={`
                          relative flex flex-col items-center justify-center py-3 rounded-xl border
                          transition-all duration-200 active:scale-95
                          ${isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' 
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}
                        `}
                      >
                        <span className="font-mono font-bold text-lg">{p}</span>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full p-0.5 shadow-sm">
                            <Check className="w-3 h-3" strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 生成按钮 */}
              <div>
                <button
                  onClick={handleGenerate}
                  disabled={status === 'generating'}
                  className="w-full relative group"
                >
                  <div className={`
                    relative overflow-hidden
                    w-full py-4 rounded-xl
                    flex items-center justify-center gap-2
                    transition-all duration-300
                    ${status === 'generating' ? 'bg-slate-100 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]'}
                  `}>
                    {status === 'generating' ? (
                      <div className="flex flex-col items-center w-full px-4">
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-blue-500 transition-all duration-75 ease-out rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-white/90" />
                        <span className="text-base font-semibold text-white">
                          生成 99 个 UID ({config.prefix})
                        </span>
                      </>
                    )}
                  </div>
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  * 系统已限制单次生成数量为 99 个
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. 结果展示区域 */}
        <div className={`
          transition-all duration-500 ease-in-out
          ${status === 'idle' ? 'opacity-50 grayscale' : 'opacity-100 grayscale-0'}
        `}>
          <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden flex flex-col h-[450px]">
            {/* 头部状态栏 */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white z-20 shadow-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-sm font-medium text-slate-600">
                  {status === 'success' ? `UID 列表 (${config.prefix})` : '等待生成...'}
                </span>
              </div>
              {historyCount > 0 && (
                <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {historyCount} 个
                </div>
              )}
            </div>

            <div 
              ref={scrollContainerRef}
              className="relative flex-1 overflow-y-auto scroll-smooth bg-slate-50/30"
            >
              {resultList.length > 0 ? (
                <div className="flex flex-col min-h-full">
                  {resultList.map((num, index) => (
                    <div 
                      key={index} 
                      className="flex items-center hover:bg-blue-50/50 transition-colors group border-b border-slate-100/50 last:border-0"
                    >
                      {/* 行号 */}
                      <div className="
                        w-12 shrink-0 py-2 pr-3 
                        text-right font-mono text-xs text-slate-300 
                        select-none bg-white/50
                        group-hover:text-blue-400
                      ">
                        {index + 1}
                      </div>
                      
                      {/* UID 内容 */}
                      <div className="pl-4 py-2 font-mono text-[15px] tracking-wider text-slate-700">
                        <span className="font-bold text-blue-600">{config.prefix}</span>
                        <span className="text-slate-600">{num.substring(4)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="h-20 w-full" />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-sm">点击生成 99 个账户</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 3. 底部悬浮操作栏 */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-4 md:p-6 z-40
        bg-gradient-to-t from-white via-white/95 to-transparent
        transition-transform duration-300 ease-out
        ${resultList.length > 0 ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={handleClear}
            className="
              flex items-center justify-center w-14 h-14
              rounded-2xl bg-white border border-slate-200 shadow-sm
              text-slate-400 hover:text-red-500 hover:bg-red-50
              transition-all active:scale-95
            "
          >
            <Trash2 className="w-6 h-6" />
          </button>

          <button
            onClick={handleCopy}
            className="
              flex-1 h-14
              flex items-center justify-center gap-2
              rounded-2xl bg-slate-900 text-white font-semibold text-lg
              shadow-xl shadow-slate-900/20
              active:scale-[0.98] transition-all
            "
          >
            <Copy className="w-5 h-5" />
            <span>一键复制 (99个)</span>
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default NumberGenerator;