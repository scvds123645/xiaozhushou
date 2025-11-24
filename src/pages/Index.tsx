import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============ 数据配置 ============
const MOBILE_PREFIXES = ["134","135","136","137","138","139","147","150","151","152","157","158","159","178","182","183","184","187","188","198","130","131","132","145","155","156","166","171","175","176","185","186","133","149","153","173","177","180","181","189","191","199"];
const EMAIL_SUFFIXES = [
 "@yopmail.com","@00two.shop"
 ];
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
      <label className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)' }}>{label}</label>
      <div className="flex gap-1">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 transition-all border border-white/40 shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 text-white drop-shadow-lg ${loading ? 'animate-spin' : ''}`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
          </button>
        )}
        <button
          onClick={onCopy}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all border border-white/40 shadow-lg"
        >
          <Copy className="h-4 w-4 text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
        </button>
      </div>
    </div>
    <div className="bg-white/25 backdrop-blur-md border-2 border-white/40 rounded-xl px-4 py-3.5 shadow-2xl shadow-black/30">
      {link ? (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-bold text-white hover:text-blue-100 hover:underline break-all transition-colors select-all"
          style={{ 
            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-bold text-white break-all select-all" style={{ 
          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          letterSpacing: '0.02em'
        }}>{value}</p>
      )}
    </div>
  </div>
);

const TgBanner = ({ onCopy }: any) => (
  <Card className="p-4 rounded-2xl bg-white/25 backdrop-blur-lg border-2 border-white/40 shadow-2xl shadow-black/30">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500/40 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 shadow-lg">
        <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-extrabold text-sm select-none" style={{ 
          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}>神秘代码 @fang180</p>
        <p className="text-white/95 font-semibold text-xs select-none" style={{ 
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}>创号教程、工具更新和独家资源</p>
      </div>
    </div>
    <Button 
      onClick={onCopy} 
      className="w-full bg-white/25 hover:bg-white/35 backdrop-blur-sm text-white font-extrabold rounded-xl h-10 shadow-2xl shadow-black/30 border-2 border-white/40 transition-all select-none"
      style={{ 
        textShadow: '0 2px 4px rgba(0,0,0,0.9)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
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
    toast({ title: "创号成功(没有180天🥰)", duration: 1500 });
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
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(https://www.584136.xyz/%E5%A4%B4%E5%83%8F/%E8%83%8C%E6%99%AF89.jpg)' }}>
      {/* 增强清晰度的顶部导航栏 */}
      <div className="bg-white/20 backdrop-blur-lg border-b-2 border-white/40 shadow-2xl shadow-black/30 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <svg className="w-10 h-10 text-blue-300 drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.9))' }}>
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xl font-extrabold text-white select-none" style={{ 
              textShadow: '0 3px 6px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.7)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              letterSpacing: '0.03em'
            }}>创号小助手</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* 增强清晰度的生成按钮 */}
        <Button
          onClick={generate}
          className="w-full h-12 text-base font-extrabold rounded-2xl bg-blue-600/90 hover:bg-blue-600 backdrop-blur-md text-white shadow-2xl shadow-black/40 border-2 border-white/40 transition-all select-none"
          style={{ 
            textShadow: '0 2px 6px rgba(0,0,0,0.9)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            letterSpacing: '0.05em'
          }}
        >
          <Sparkles className="w-5 h-5 mr-2 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
          开始创号
        </Button>

        {/* 增强清晰度的信息卡片 */}
        {info && (
          <Card className="p-5 space-y-4 rounded-2xl bg-white/25 backdrop-blur-lg border-2 border-white/40 shadow-2xl shadow-black/30">
            <InfoRow label="姓氏" value={info.lastName} onCopy={() => copy(info.lastName, "姓氏")} />
            <InfoRow label="名字" value={info.firstName} onCopy={() => copy(info.firstName, "名字")} />
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)' }}>生日</label>
              <div className="bg-white/25 backdrop-blur-md border-2 border-white/40 rounded-xl px-4 py-3.5 shadow-2xl shadow-black/30">
                <p className="text-sm font-bold text-white select-all" style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '0.02em'
                }}>{info.birthday}</p>
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
              <div className="bg-blue-500/30 backdrop-blur-sm border-2 border-blue-300/50 rounded-xl px-3.5 py-2.5 shadow-2xl shadow-black/20">
                <p className="text-xs text-white font-bold select-none" style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '0.01em'
                }}>
                  💡 点击邮箱跳转查收验证码（不要在TG打开）
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* 增强清晰度的Telegram横幅 */}
        <TgBanner onCopy={() => copy("@fang180", "神秘代码")} />
      </div>
    </div>
  );
}