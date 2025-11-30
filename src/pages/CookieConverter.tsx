import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Copy, Eraser, AlertCircle, CheckCircle2, KeyRound, Cookie, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageLayout from "@/components/PageLayout";

type FormatType = "format1" | "format2";
type PasswordMode = "default" | "custom";

const CookieConverter = () => {
  const [inputCookies, setInputCookies] = useState("");
  
  // 修改：分离密码模式和自定义密码内容
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("default");
  const [customPassword, setCustomPassword] = useState("");
  
  const [formatType, setFormatType] = useState<FormatType>("format1");
  const [outputText, setOutputText] = useState("");
  const [resultCount, setResultCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // 获取当前实际使用的密码
  const getCurrentPassword = useCallback(() => {
    return passwordMode === "default" ? "qwwwww" : customPassword;
  }, [passwordMode, customPassword]);

  const extractCUser = (cookieString: string): string | null => {
    const match = cookieString.match(/c_user=([^;]+)/);
    return match ? match[1] : null;
  };

  const convertCookies = useCallback(() => {
    const activePassword = getCurrentPassword();

    // 校验逻辑更新：如果是自定义模式，必须输入密码
    if (!inputCookies.trim() || (passwordMode === "custom" && !activePassword.trim())) {
      setShowError(true);
      setOutputText("");
      setResultCount(0);
      setErrorCount(0);
      return;
    }

    setShowError(false);

    const lines = inputCookies.split("\n").filter((line) => line.trim());
    const results: string[] = [];
    let errors = 0;

    lines.forEach((line) => {
      const cUser = extractCUser(line);
      if (!cUser) {
        results.push(`[错误] 未找到 c_user: ${line.substring(0, 50)}...`);
        errors++;
      } else {
        if (formatType === "format1") {
          results.push(`${cUser}--${activePassword}--${line}`);
        } else {
          results.push(`${cUser}---${activePassword}`);
        }
      }
    });

    setOutputText(results.join("\n"));
    setResultCount(results.length - errors);
    setErrorCount(errors);
  }, [inputCookies, passwordMode, customPassword, formatType, getCurrentPassword]); // 依赖项更新

  useEffect(() => {
    const timer = setTimeout(() => {
      const activePassword = getCurrentPassword();
      // 只有当有cookie且（是默认密码 或 自定义密码已输入）时才执行
      if (inputCookies && activePassword) {
        convertCookies();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [convertCookies, inputCookies, getCurrentPassword]);

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
    setInputCookies("");
    setCustomPassword("");
    // 可以选择重置回默认密码模式，或者保持当前选择
    // setPasswordMode("default"); 
    setOutputText("");
    setResultCount(0);
    setErrorCount(0);
    setShowError(false);
  };

  return (
    <PageLayout
      title="Cookie 格式转换工具"
      description="输入Cookie字符串，自动拼接密码和UID"
      backTo="/tools"
      backLabel="返回工具列表"
    >
      {/* 优化：padding 和 gap 适应移动端 */}
      <div className="max-w-6xl mx-auto font-sans text-slate-800 p-0 md:p-2">
        
        {showError && (
          <Alert variant="destructive" className="mb-4 md:mb-6 rounded-2xl border-none bg-red-50 text-red-900">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="ml-2 font-medium text-xs md:text-sm">
              {passwordMode === "custom" && !customPassword 
                ? "请输入自定义密码" 
                : "请输入 Cookie 内容"}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* --- Input Section --- */}
          <div className="space-y-4 md:space-y-6">
            {/* Cookie Input Card */}
            <Card className="p-4 md:p-6 rounded-2xl md:rounded-3xl border-transparent shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-3 md:mb-4 text-blue-600">
                <Cookie className="h-5 w-5" />
                <Label htmlFor="cookies" className="text-base md:text-lg font-medium text-slate-700">
                  输入 Cookie 字符串
                </Label>
              </div>
              
              <Textarea
                id="cookies"
                placeholder="粘贴cookie字符串，支持多行输入..."
                value={inputCookies}
                onChange={(e) => setInputCookies(e.target.value)}
                // 优化：min-h 响应式
                className="min-h-[200px] md:min-h-[250px] rounded-xl md:rounded-2xl border-slate-200 bg-slate-50 p-4 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none shadow-inner"
              />
            </Card>

            {/* Password Configuration Card (UPDATED) */}
            <Card className="p-4 md:p-6 rounded-2xl md:rounded-3xl border-transparent shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-3 md:mb-4 text-blue-600">
                <KeyRound className="h-5 w-5" />
                <Label className="text-base md:text-lg font-medium text-slate-700">
                  密码设置
                </Label>
              </div>

              <div className="space-y-4">
                {/* Password Mode Selection */}
                <RadioGroup 
                  value={passwordMode} 
                  onValueChange={(v) => setPasswordMode(v as PasswordMode)}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    passwordMode === "default" 
                      ? "bg-blue-50 border-blue-500" 
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}>
                    <RadioGroupItem value="default" id="pm-default" className="sr-only" />
                    <Label htmlFor="pm-default" className="cursor-pointer text-center w-full">
                      <span className={`block text-sm font-bold ${passwordMode === "default" ? "text-blue-700" : "text-slate-700"}`}>默认密码</span>
                      <span className="text-xs text-slate-400 font-mono mt-1">qwwwww</span>
                    </Label>
                    {passwordMode === "default" && (
                      <div className="absolute top-2 right-2 text-blue-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    passwordMode === "custom" 
                      ? "bg-blue-50 border-blue-500" 
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}>
                    <RadioGroupItem value="custom" id="pm-custom" className="sr-only" />
                    <Label htmlFor="pm-custom" className="cursor-pointer text-center w-full">
                      <span className={`block text-sm font-bold ${passwordMode === "custom" ? "text-blue-700" : "text-slate-700"}`}>自定义</span>
                      <span className="text-xs text-slate-400 mt-1">手动输入</span>
                    </Label>
                    {passwordMode === "custom" && (
                      <div className="absolute top-2 right-2 text-blue-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </RadioGroup>

                {/* Custom Password Input - Conditionally Rendered with Animation */}
                {passwordMode === "custom" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                      type="text"
                      placeholder="请输入自定义密码"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Output Format Card */}
            <Card className="p-4 md:p-6 rounded-2xl md:rounded-3xl border-transparent shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-3 md:mb-4 text-blue-600">
                <Settings2 className="h-5 w-5" />
                <Label className="text-base md:text-lg font-medium text-slate-700">输出格式</Label>
              </div>
              <RadioGroup 
                value={formatType} 
                onValueChange={(value) => setFormatType(value as FormatType)}
                className="gap-3"
              >
                {[
                  { value: "format1", label: "UID--密码--Cookie", desc: "完整拼接" },
                  { value: "format2", label: "UID---密码", desc: "仅提取账号" },
                ].map((format) => (
                  <div 
                    key={format.value} 
                    className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl md:rounded-2xl border cursor-pointer transition-all ${
                      formatType === format.value 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <RadioGroupItem value={format.value} id={format.value} className="text-blue-600" />
                    <div className="flex flex-col">
                      <Label htmlFor={format.value} className="text-sm cursor-pointer text-slate-700 font-bold">
                        {format.desc}
                      </Label>
                      <span className="text-xs text-slate-400 font-mono mt-0.5">{format.label}</span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </Card>
          </div>

          {/* --- Output Section --- */}
          <div className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 h-full flex flex-col rounded-2xl md:rounded-3xl border-transparent shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <Label className="text-base md:text-lg font-medium text-slate-700">转换结果</Label>
                <div className="flex gap-2 text-[10px] md:text-xs font-medium">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {resultCount} 成功
                  </span>
                  {errorCount > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      {errorCount} 错误
                    </span>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 w-full rounded-xl md:rounded-2xl border border-slate-100 bg-slate-50 min-h-[250px] md:min-h-[350px]">
                <div className="p-4 md:p-6">
                  {outputText ? (
                    <pre className="font-mono text-sm whitespace-pre-wrap break-all">
                      {outputText.split("\n").map((line, index) => (
                        <div
                          key={index}
                          className={`py-1 ${
                            line.startsWith("[错误]") 
                              ? "text-red-600 bg-red-50/50 px-2 rounded" 
                              : "text-slate-600"
                          }`}
                        >
                          {line}
                        </div>
                      ))}
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-16 md:py-20">
                      <Cookie className="h-8 w-8 md:h-10 md:w-10 opacity-20" />
                      <p className="text-xs md:text-sm">
                        {showError ? "等待输入..." : "转换结果将显示在这里"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                <Button
                  onClick={handleCopy}
                  className="flex-1 h-12 md:h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-sm md:text-base"
                  disabled={!outputText || showError}
                >
                  {copied ? <CheckCircle2 className="mr-2 h-4 w-4 md:h-5 md:w-5" /> : <Copy className="mr-2 h-4 w-4 md:h-5 md:w-5" />}
                  {copied ? "已复制" : "复制结果"}
                </Button>
                
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 h-12 md:h-14 rounded-full border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all text-sm md:text-base"
                >
                  <Eraser className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  清空
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CookieConverter;
