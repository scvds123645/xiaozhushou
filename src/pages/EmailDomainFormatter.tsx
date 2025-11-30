import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Copy, Eraser, CheckCircle2, AtSign, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

const EmailDomainFormatter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [addAtSymbol, setAddAtSymbol] = useState(true);
  const [addQuotes, setAddQuotes] = useState(false);
  const [domainCount, setDomainCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatDomains = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText("");
      setDomainCount(0);
      return;
    }
    const domains = inputText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item);

    const formatted = domains.map((domain) => {
      let result = domain;
      if (addAtSymbol && !domain.startsWith("@")) {
        result = `@${result}`;
      }
      if (addQuotes) {
        result = `"${result}"`;
      }
      return result;
    });

    setDomainCount(domains.length);
    setOutputText(formatted.join(", "));
  }, [inputText, addAtSymbol, addQuotes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      formatDomains();
    }, 300);
    return () => clearTimeout(timer);
  }, [formatDomains]);

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
    setDomainCount(0);
  };

  return (
    <PageLayout
      title="域名转邮箱后缀工具"
      description="输入域名列表，自动转换为邮箱后缀格式"
      backTo="/tools"
      backLabel="返回工具列表"
      // Assuming PageLayout accepts a className for the main container background
      className="bg-slate-50 min-h-screen" 
    >
      {/* 优化：p-0 md:p-2 适应不同屏幕边距 */}
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-8 p-0 md:p-2">
        
        {/* Statistics Card */}
        {/* 优化：手机端 p-4，桌面端 p-6 */}
        <Card className="p-4 md:p-6 bg-white border-none shadow-sm rounded-2xl md:rounded-3xl mb-4 md:mb-8 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <AtSign className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-slate-500 mb-0.5 md:mb-1">处理域名数量</p>
              <p className="text-3xl md:text-4xl font-normal text-slate-900 tracking-tight">{domainCount}</p>
            </div>
          </div>
        </Card>

        {/* 优化：gap-4 适应手机 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Input Section */}
          <div className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-white border-none shadow-sm rounded-2xl md:rounded-3xl h-full flex flex-col">
              <Label htmlFor="input" className="text-base md:text-lg font-normal text-slate-800 mb-3 md:mb-4 ml-1 block">
                输入域名列表
              </Label>
              
              <div className="relative flex-grow group">
                <Textarea
                  id="input"
                  placeholder="输入域名，支持逗号或换行分隔&#10;例如：&#10;gmail.com&#10;outlook.com, yahoo.com"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  // 优化：min-h-[200px] 适应手机
                  className="w-full h-full min-h-[200px] md:min-h-[320px] p-4 md:p-6 text-sm md:text-base font-normal leading-relaxed bg-slate-100/80 border-0 rounded-xl md:rounded-3xl resize-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-blue-50/50 transition-all placeholder:text-slate-400"
                />
              </div>
            </Card>
          </div>

          {/* Controls & Output Section */}
          <div className="space-y-4 md:space-y-6">
            {/* Format Options Card */}
            <Card className="p-4 md:p-6 bg-white border-none shadow-sm rounded-2xl md:rounded-3xl">
              <Label className="text-base md:text-lg font-normal text-slate-800 mb-3 md:mb-4 ml-1 block">格式选项</Label>
              <div className="space-y-2">
                {[
                  { id: "at-symbol", label: "添加 @ 前缀", checked: addAtSymbol, onChange: setAddAtSymbol },
                  { id: "quotes", label: '添加引号包裹 ""', checked: addQuotes, onChange: setAddQuotes },
                ].map((option) => (
                  <div 
                    key={option.id} 
                    // 优化：p-3 md:p-4
                    className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group"
                    onClick={() => option.onChange(!option.checked)}
                  >
                    <Checkbox
                      id={option.id}
                      checked={option.checked}
                      onCheckedChange={(checked) => option.onChange(checked === true)}
                      className="w-5 h-5 border-2 border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md transition-all"
                    />
                    <Label htmlFor={option.id} className="text-sm md:text-base font-medium text-slate-700 cursor-pointer flex-grow group-hover:text-slate-900">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Preview Pill */}
              <div className="mt-4 md:mt-6 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <p className="text-[10px] md:text-xs font-medium text-blue-400 uppercase tracking-wider mb-1 md:mb-2">预览示例</p>
                <p className="text-xs md:text-sm font-mono text-blue-700 truncate">
                  {addQuotes && '"'}{addAtSymbol && '@'}example.com{addQuotes && '"'}, {addQuotes && '"'}{addAtSymbol && '@'}domain.com{addQuotes && '"'}
                </p>
              </div>
            </Card>

            {/* Output Section Card */}
            <Card className="p-4 md:p-6 bg-white border-none shadow-sm rounded-2xl md:rounded-3xl">
              <div className="flex items-center justify-between mb-3 md:mb-4 ml-1">
                <Label className="text-base md:text-lg font-normal text-slate-800">格式化结果</Label>
                {domainCount > 0 && (
                  <span className="text-[10px] md:text-xs font-medium text-blue-600 px-2 md:px-3 py-1 rounded-full bg-blue-100">
                    {domainCount} results
                  </span>
                )}
              </div>
              
              {/* 优化：h-[150px] 适应手机 */}
              <ScrollArea className="h-[150px] md:h-[200px] w-full rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-4 md:p-6">
                  {outputText ? (
                    <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap break-all leading-relaxed">
                      {outputText}
                    </pre>
                  ) : (
                    <p className="text-slate-400 text-sm italic">等待输入...</p>
                  )}
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                <Button 
                  onClick={handleCopy} 
                  disabled={!outputText}
                  // 优化：h-12 md:h-14
                  className="flex-1 h-12 md:h-14 rounded-full bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:bg-blue-800 transition-all text-sm md:text-base font-medium tracking-wide shadow-md disabled:opacity-50 disabled:shadow-none"
                >
                  {copied ? <CheckCircle2 className="mr-2 h-4 w-4 md:h-5 md:w-5" /> : <Copy className="mr-2 h-4 w-4 md:h-5 md:w-5" />}
                  {copied ? "已复制" : "复制结果"}
                </Button>
                
                <Button 
                  onClick={handleClear} 
                  variant="outline" 
                  className="flex-1 h-12 md:h-14 rounded-full border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all text-sm md:text-base font-medium"
                >
                  <Eraser className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  清空
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Usage Tips */}
        <Card className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50/50 border-none rounded-2xl md:rounded-3xl shadow-sm">
          <div className="flex items-start gap-4 md:gap-5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-2 md:mb-3">使用说明</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-slate-600">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400"></span>支持按行或逗号分隔输入域名</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400"></span>可选择添加 @ 前缀，将域名转换为邮箱后缀格式</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400"></span>可选择添加引号包裹，适用于各种配置文件</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400"></span>输出结果以逗号+空格分隔</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EmailDomainFormatter;
