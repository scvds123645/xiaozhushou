import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============ 数据配置 ============
const MOBILE_PREFIXES = ["134","135","136","137","138","139","147","150","151","152","157","158","159","178","182","183","184","187","188","198","130","131","132","145","155","156","166","171","175","176","185","186","133","149","153","173","177","180","181","189","191","199"];
const EMAIL_SUFFIXES = ["@yopmail.com","@gmail.yopmail.com"];
const NAME_PARTS = ["john","mike","alex","david","chris","james","robert","michael","william","daniel","smith","brown","jones","wilson","taylor","davis","miller","moore","anderson","jackson","white","harris","martin","lee","walker","sam","tom","ben","joe","max"];

// ============ 工具函数 ============
const random = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n: number, len = 2) => String(n).padStart(len, "0");

const genName = (vowelStart: boolean) => {
  const v = "aeiou", c = "bcdfghjklmnpqrstvwxyz";
  let name = "";
  for (let i = 0; i < 15; i++) {
    const useVowel = vowelStart ? i % 2 === 0 : i % 2 !== 0;
    name += random([...(useVowel ? v : c)]);
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const genEmail = () => {
  let username = Array.from({ length: randomInt(2, 3) }, () => random(NAME_PARTS)).join("");
  while (username.length < 20) {
    username += Math.random() > 0.5 && (20 - username.length) >= 3
      ? pad(randomInt(0, 999), 3)
      : random([..."abcdefghijklmnopqrstuvwxyz"]);
  }
  username = username.substring(0, 20);
  return { email: username + random(EMAIL_SUFFIXES), username };
};

const genPhone = () => "86" + random(MOBILE_PREFIXES) + pad(randomInt(0, 99999999), 8);

const genBirthday = () => {
  const year = new Date().getFullYear() - randomInt(18, 25);
  return `${year}年${pad(randomInt(1, 12))}月${pad(randomInt(1, 28))}日`;
};

// ============ 组件 ============
const InfoRow = ({ label, value, onCopy, onRefresh, link, loading }: any) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex gap-1">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
        <button
          onClick={onCopy}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
        >
          <Copy className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
    <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
      {link ? (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-normal text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-normal text-gray-900 break-all">{value}</p>
      )}
    </div>
  </div>
);

const TgBanner = ({ onCopy }: any) => (
  <Card className="p-4 rounded-lg bg-white border border-gray-300 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-semibold text-sm">神秘代码 @fang180</p>
        <p className="text-gray-500 text-xs">创号教程、工具更新和独家资源</p>
      </div>
    </div>
    <Button 
      onClick={onCopy} 
      className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold rounded-md h-9 shadow-none"
    >
      复制神秘代码
    </Button>
  </Card>
);

// ============ 主组件 ============
export default function Index() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const copy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "已复制" + label, duration: 1500 });
    } catch {
      toast({ title: "复制失败", description: "请手动复制", duration: 2000 });
    }
  }, [toast]);

  const generate = useCallback(() => {
    const emailData = genEmail();
    setInfo({
      lastName: genName(false),
      firstName: genName(true),
      phone: genPhone(),
      email: emailData.email,
      username: emailData.username,
      birthday: genBirthday(),
    });
    toast({ title: "生成成功", duration: 1500 });
  }, [toast]);

  const refreshEmail = useCallback(async () => {
    if (!info) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const emailData = genEmail();
    setInfo((prev: any) => ({ ...prev, ...emailData, email: emailData.email, username: emailData.username }));
    toast({ title: "邮箱已更新", duration: 1500 });
    setLoading(false);
  }, [info, toast]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Facebook风格顶部导航栏 */}
      <div className="bg-white border-b border-gray-300 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xl font-bold text-blue-600">创号小助手</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* 生成按钮 */}
        <Button
          onClick={generate}
          className="w-full h-11 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          开始创号
        </Button>

        {/* 信息卡片 */}
        {info && (
          <Card className="p-4 space-y-4 rounded-lg bg-white border border-gray-300 shadow-sm">
            <InfoRow label="姓氏" value={info.lastName} onCopy={() => copy(info.lastName, "姓氏")} />
            <InfoRow label="名字" value={info.firstName} onCopy={() => copy(info.firstName, "名字")} />
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">生日</label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
                <p className="text-sm font-normal text-gray-900">{info.birthday}</p>
              </div>
            </div>

            <InfoRow label="手机号" value={info.phone} onCopy={() => copy(info.phone, "手机号")} />
            
            <div className="space-y-2">
              <InfoRow 
                label="邮箱" 
                value={info.email} 
                onCopy={() => copy(info.email, "邮箱")} 
                onRefresh={refreshEmail}
                link={`https://yopmail.com?${info.username}`}
                loading={loading}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-900">
                  💡 点击邮箱跳转查收验证码（不要在TG打开）
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Telegram横幅 */}
        <TgBanner onCopy={() => copy("@fang180", "神秘代码")} />
      </div>
    </div>
  );
}