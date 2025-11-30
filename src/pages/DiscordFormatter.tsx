import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Wand2, CheckCircle2, Sparkles, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

interface FormattedResult {
  email: string;
  key: string;
  formatted: string;
}

const DiscordFormatter = () => {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<FormattedResult[]>([]);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const { toast } = useToast();

  const handleFormat = () => {
    if (!inputText.trim()) {
      toast({ title: "请输入账号信息！", variant: "destructive" });
      return;
    }

    const lines = inputText.split("\n").filter((line) => line.trim());
    const formattedResults: FormattedResult[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const parts = line.split(/\s+/);

      if (parts.length !== 2) {
        toast({
          title: `第 ${i + 1} 行格式错误`,
          description: '应为 "账号@域名.xyz 密钥" 格式',
          variant: "destructive",
        });
        return;
      }

      const [email, key] = parts;

      if (!email.includes("@")) {
        toast({
          title: `第 ${i + 1} 行格式错误`,
          description: "邮箱必须包含 @ 符号",
          variant: "destructive",
        });
        return;
      }

      const formatted = `账号 ${email} 密码 ${email} 接码地址 https://2.584136.xyz/${key}`;
      formattedResults.push({ email, key, formatted });
    }
    setResults(formattedResults);
  };

  const handleCopyAll = async () => {
    if (results.length === 0) {
      toast({ title: "没有内容可复制", variant: "destructive" });
      return;
    }

    const allText = results.map((r) => r.formatted).join("\n");
    try {
      await navigator.clipboard.writeText(allText);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch {
      toast({ title: "复制失败", variant: "destructive" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleFormat();
    }
  };

  return (
    <PageLayout
      title="账号信息格式化工具"
      description="输入账号信息，自动格式化为标准格式"
      backTo="/tools"
      backLabel="返回工具列表"
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Input Section - Material Elevated Card */}
        <Card className="p-6 md:p-8 bg-white rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <label className="text-lg font-medium text-slate-800">
              输入账号信息
            </label>
          </div>

          <div className="relative group">
            <Textarea
              placeholder="example@domain.xyz abc123&#10;user@site.com key456&#10;...&#10;&#10;提示：可以按 Ctrl+Enter 快速格式化"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              // Material Design Filled Text Field style
              className="min-h-[240px] w-full rounded-3xl bg-slate-100 border-transparent px-6 py-5 font-mono text-sm text-slate-700 placeholder:text-slate-400 focus:bg-slate-50 focus:border-blue-600 focus:ring-0 transition-all duration-200 resize-none"
            />
            <div className="absolute bottom-4 right-6 text-xs text-slate-400 pointer-events-none bg-slate-100/80 px-2 py-1 rounded-md">
              每行一条
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleFormat}
              size="lg"
              className="rounded-full bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 text-white px-8 h-12 font-medium transition-all duration-300"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              格式化
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-normal text-slate-800">
                格式化结果
                <span className="ml-3 inline-flex items-center justify-center bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                  {results.length}
                </span>
              </h2>

              <Button
                onClick={handleCopyAll}
                variant="outline"
                className={`rounded-full px-6 h-10 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all duration-300 ${
                  showCopySuccess ? "border-green-500 text-green-600 bg-green-50" : ""
                }`}
              >
                {showCopySuccess ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {showCopySuccess ? "已复制" : "复制全部"}
              </Button>
            </div>

            {/* Staggered List of Cards */}
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card
                  key={index}
                  className="group p-5 bg-white rounded-[1.5rem] border-none shadow-sm hover:shadow-md hover:bg-blue-50/50 transition-all duration-300 cursor-default"
                >
                  <div className="flex gap-4 items-start">
                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-mono shrink-0">
                      {index + 1}
                    </div>
                    <pre className="font-mono text-sm text-slate-600 whitespace-pre-wrap break-all leading-relaxed pt-1.5">
                      {result.formatted}
                    </pre>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions - Material Outline/Tonal Card */}
        <Card className="p-6 bg-slate-50 border-none rounded-[2rem] text-slate-600">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-3 pt-1">
              <h3 className="font-medium text-slate-900 text-lg">使用说明</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  格式要求：账号@域名.xyz 密钥
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  分隔方式：账号和密钥之间用空格分隔
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  注意事项：邮箱必须包含 @ 符号
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  快捷操作：Ctrl+Enter 快速格式化
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DiscordFormatter;
