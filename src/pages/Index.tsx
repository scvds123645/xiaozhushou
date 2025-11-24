import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============ 数据配置 ============
const MOBILE_PREFIXES = ["134","135","136","137","138","139","147","150","151","152","157","158","159","178","182","183","184","187","188","198","130","131","132","145","155","156","166","171","175","176","185","186","133","149","153","173","177","180","181","189","191","199"];

const EMAIL_SUFFIXES = ["@yopmail.com","@gmail.yopmail.com","@00two.shop","@123456.yopmail.com","@abc.yopmail.com","@ali.yopmail.com","@jetable.org","@mail.yopmail.com","@yomail.info","@cool.fr.nf","@jetable.fr.nf","@nospam.ze.tc","@nomail.xl.cx","@mega.zik.dj","@speed.1s.fr","@courriel.fr.nf","@moncourrier.fr.nf","@monmail.fr.nf","@hide.biz.st","@mymail.infos.st","@guerrillamail.com","@sharklasers.com","@grr.la","@guerrillamail.biz","@guerrillamail.de","@spam4.me","@mintemail.com","@tmails.net","@temp-mail.org","@temp-mail.io","@10minutemail.com","@mailinator.com","@dispostable.com","@throwaway.email","@maildrop.cc","@tempmail.dev","@getnada.com","@emailondeck.com","@trashmail.com","@mohmal.com","@tempinbox.com","@harakirimail.com","@mailcatch.com","@yopmail.fr","@yopmail.net","@cool.fr.nf","@jetable.fr.nf","@courriel.fr.nf","@monemail.fr.nf","@imails.info"];

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
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="flex gap-1">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-slate-100 active:scale-90 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="h-8 w-8 p-0 hover:bg-slate-100 active:scale-90 transition-all"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
    {link ? (
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-blue-600 hover:text-blue-700 underline break-all inline-block transition-colors">
        {value}
      </a>
    ) : (
      <p className="text-base font-medium text-slate-900 break-all">{value}</p>
    )}
  </div>
);

const TgBanner = ({ onCopy }: any) => (
  <Card className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-xl">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-base mb-1">🎯 神秘代码@fang180</p>
        <p className="text-blue-50 text-xs opacity-90">创号教程、工具更新和独家资源</p>
      </div>
    </div>
    <Button onClick={onCopy} className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl shadow-lg active:scale-95 transition-all" size="lg">
      复制神秘代码
    </Button>
  </Card>
);

const Welcome = () => (
  <Card className="p-6 rounded-2xl shadow-lg border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white">
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">开始创建账号</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          点击上方按钮，自动生成姓名、生日、<br/>手机号和临时邮箱地址
        </p>
      </div>
      <div className="pt-2 space-y-2 text-xs text-slate-500">
        <p>💡 所有信息随机生成，仅供合法用途</p>
        <p>📧 临时邮箱可接收验证码，10分钟有效</p>
      </div>
    </div>
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
      toast({ title: "✓ 已复制" + label, duration: 1500 });
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
    toast({ title: "🎉 生成成功", duration: 1500 });
  }, [toast]);

  const refreshEmail = useCallback(async () => {
    if (!info) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const emailData = genEmail();
    setInfo((prev: any) => ({ ...prev, ...emailData, email: emailData.email, username: emailData.username }));
    toast({ title: "✓ 邮箱已更新", duration: 1500 });
    setLoading(false);
  }, [info, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              脸书创号小助手
            </h1>
            <span className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 px-2.5 py-1 rounded-full shadow-lg">
              v2.0
            </span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generate}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          开始创号
        </Button>

        {/* Info Card */}
        {info ? (
          <Card className="p-5 space-y-4 rounded-2xl shadow-xl border-slate-200 bg-white/80 backdrop-blur">
            <InfoRow label="姓氏" value={info.lastName} onCopy={() => copy(info.lastName, "姓氏")} />
            <div className="border-t border-slate-100" />
            <InfoRow label="名字" value={info.firstName} onCopy={() => copy(info.firstName, "名字")} />
            <div className="border-t border-slate-100" />
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-600">生日</span>
              <p className="text-base font-medium text-slate-900">{info.birthday}</p>
            </div>
            <div className="border-t border-slate-100" />
            <InfoRow label="手机号" value={info.phone} onCopy={() => copy(info.phone, "手机号")} />
            <div className="border-t border-slate-100" />
            <div className="space-y-2">
              <InfoRow 
                label="邮箱" 
                value={info.email} 
                onCopy={() => copy(info.email, "邮箱")} 
                onRefresh={refreshEmail}
                link={`https://yopmail.com?${info.username}`}
                loading={loading}
              />
              <p className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                💡 点击邮箱跳转查收验证码（不要在TG打开）
              </p>
            </div>
          </Card>
        ) : (
          <Welcome />
        )}

        {/* Telegram Banner */}
        <TgBanner onCopy={() => copy("@fang180", "神秘代码")} />
      </div>
    </div>
  );
}