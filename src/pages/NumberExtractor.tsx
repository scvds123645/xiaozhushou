import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Copy, Eraser, CheckCircle2, Hash, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().max(100000, { message: "输入文本不能超过100,000字符" })
});

const NumberExtractor = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const extractNumbers = useCallback(() => {
    const validation = inputSchema.safeParse({ text: inputText });
    if (!validation.success) {
      setValidationError(validation.error.errors[0].message);
      setOutputText("");
      setTotalCount(0);
      setUniqueCount(0);
      return;
    }
    setValidationError(null);

    if (!inputText.trim()) {
      setOutputText("");
      setTotalCount(0);
      setUniqueCount(0);
      return;
    }

    const regex = /\b\d{14}\b/g;
    const matches = inputText.match(regex) || [];
    const uniqueNumbers = [...new Set(matches)];

    setTotalCount(matches.length);
    setUniqueCount(uniqueNumbers.length);
    setOutputText(uniqueNumbers.join("\n"));
  }, [inputText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      extractNumbers();
    }, 300);
    return () => clearTimeout(timer);
  }, [extractNumbers]);

  const handleCopy = async () => {
    if (!outputText) {
      toast({ title: "没有内容可复制", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast({ title: "已复制到剪贴板" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "复制失败", variant: "destructive" });
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setTotalCount(0);
    setUniqueCount(0);
    setValidationError(null);
  };

  const stats = [
    { label: "找到数量", value: totalCount, icon: Hash, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "去重后", value: uniqueCount, icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "已删除", value: totalCount - uniqueCount, icon: Eraser, color: "text-orange-600", bgColor: "bg-orange-50" },
  ];

  const removedCount = totalCount - uniqueCount;

  return (
    <PageLayout
      title="14位数字提取工具"
      description="自动提取文本中的14位连续数字，智能去重"
      backTo="/tools"
      backLabel="返回工具列表"
    >
      {/* --- 统计信息卡片 --- 
          优化：手机端 gap-3 更紧凑，md 以上 gap-6
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            // 优化：手机端 p-4，桌面端 p-6
            className="relative overflow-hidden border-none bg-white p-4 md:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-2xl md:rounded-3xl"
          >
            <div className="flex items-center gap-4 md:gap-5">
              {/* 优化：手机端图标容器稍微调小，适应小屏幕布局 */}
              <div className={`flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl md:rounded-2xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 md:h-7 md:w-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">{stat.label}</p>
                <p className={`mt-0.5 md:mt-1 text-2xl md:text-3xl font-bold tracking-tight ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2">
        {/* --- 输入区域 --- */}
        <div className="space-y-3 md:space-y-4">
          <Label htmlFor="input" className="ml-1 text-sm font-semibold text-slate-700">
            输入文本
          </Label>
          <div className="relative group">
            <Textarea
              id="input"
              placeholder="粘贴包含14位数字的文本...&#10;&#10;示例：&#10;用户12345678901234注册成功&#10;订单号：98765432109876"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              // 优化关键点：min-h-[240px] 适合手机，md:min-h-[420px] 适合桌面
              className="min-h-[240px] md:min-h-[420px] resize-none rounded-2xl md:rounded-3xl border-0 bg-slate-100/80 p-4 md:p-6 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-inner"
            />
            <div className="absolute bottom-3 right-4 md:bottom-4 md:right-6 text-[10px] md:text-xs font-medium text-slate-400 bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm">
              {inputText.length.toLocaleString()} / 100,000
            </div>
          </div>
          {validationError && (
            <div className="ml-2 flex items-center gap-2 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
              <span className="block h-1.5 w-1.5 rounded-full bg-red-500" />
              {validationError}
            </div>
          )}
        </div>

        {/* --- 输出区域 --- */}
        <div className="flex flex-col space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-semibold text-slate-700">提取结果</Label>
            {removedCount > 0 && (
              <span className="animate-in fade-in zoom-in text-[10px] md:text-xs font-medium text-orange-700 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-orange-100 border border-orange-200">
                已删除 {removedCount} 个
              </span>
            )}
          </div>

          {/* 优化：Card 圆角在手机上稍微小一点，视觉更协调 */}
          <Card className="flex-1 overflow-hidden border-0 bg-slate-100/80 shadow-inner rounded-2xl md:rounded-3xl">
            {/* 优化关键点：ScrollArea 高度响应式，与输入框对齐 */}
            <ScrollArea className="h-[240px] md:h-[420px] w-full">
              <div className="p-4 md:p-6">
                {outputText ? (
                  <pre className="whitespace-pre-wrap break-all font-mono text-sm text-slate-800 leading-relaxed">
                    {outputText}
                  </pre>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-16 md:py-20 text-slate-400">
                     <Hash className="mb-3 h-8 w-8 md:h-10 md:w-10 opacity-20" />
                     <p className="text-sm">
                       {validationError ? "请修正输入错误" : "提取的号码将显示在这里..."}
                     </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          <div className="flex gap-3 md:gap-4 pt-1 md:pt-2">
            <Button 
              onClick={handleCopy} 
              disabled={!outputText}
              className="h-12 md:h-14 flex-1 rounded-full bg-blue-600 text-sm md:text-base font-medium text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
            >
              {copied ? <CheckCircle2 className="mr-2 h-4 w-4 md:h-5 md:w-5" /> : <Copy className="mr-2 h-4 w-4 md:h-5 md:w-5" />}
              {copied ? "已复制" : "复制结果"}
            </Button>
            <Button 
              onClick={handleClear} 
              variant="ghost" 
              className="h-12 md:h-14 flex-1 rounded-full border border-slate-200 bg-white text-sm md:text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <Eraser className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              清空
            </Button>
          </div>
        </div>
      </div>
      
      {/* --- 使用说明 --- 
          优化：大幅减少手机端的 Padding，避免内容被挤压
      */}
      <Card className="mt-6 md:mt-8 border-none bg-slate-50 p-5 md:p-8 rounded-2xl md:rounded-3xl">
        <div className="flex items-start gap-4 md:gap-5">
          <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-blue-600">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-base md:text-lg font-semibold text-slate-800">使用说明</h3>
            <ul className="grid gap-2 text-xs md:text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                自动识别并提取文本中所有14位连续数字
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                支持混合文本，智能分离数字和其他字符
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                自动去除重复号码，保留首次出现的号码
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                最大支持100,000字符的文本输入
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </PageLayout>
  );
};

export default NumberExtractor;
