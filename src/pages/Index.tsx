import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";

// ============ 数据配置 ============
const MOBILE_PREFIXES = [
  "134","135","136","137","138","139","147","150","151","152","157","158","159","178","182","183","184","187","188","198",
  "130","131","132","145","155","156","166","171","175","176","185","186",
  "133","149","153","173","177","180","181","189","191","199"
];

const EMAIL_SUFFIXES = ["@yopmail.com","@00two.shop","@00two.site"];

const NAME_FRAGMENTS = [
  "john","mike","alex","david","chris","james","robert","michael","william","daniel",
  "matthew","joseph","thomas","charles","mark","paul","steven","brian","kevin","jason",
  "jeff","ryan","eric","smith","brown","jones","wilson","taylor","davis","miller",
  "moore","anderson","jackson","white","harris","martin","thompson","garcia","lee",
  "walker","hall","allen","young","king","wright","lopez","sam","tom","ben","joe","max"
];

// ============ 工具函数 ============
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const padZero = (num: number, length: number = 2) => num.toString().padStart(length, "0");

const generateName = (startWithVowel: boolean): string => {
  const vowels = "aeiou", consonants = "bcdfghjklmnpqrstvwxyz";
  let name = "";
  for (let i = 0; i < 15; i++) {
    const useVowel = startWithVowel ? i % 2 === 0 : i % 2 !== 0;
    const char = randomChoice([...(useVowel ? vowels : consonants)]);
    name += i === 0 ? char.toUpperCase() : char;
  }
  return name;
};

const generateEmailUsername = (): string => {
  const fragmentCount = randomInt(2, 3);
  let username = Array.from({ length: fragmentCount }, () => randomChoice(NAME_FRAGMENTS)).join("");
  
  while (username.length < 20) {
    username += Math.random() > 0.5 && (20 - username.length) >= 3
      ? padZero(randomInt(0, 999), 3)
      : randomChoice([..."abcdefghijklmnopqrstuvwxyz"]);
  }
  return username.substring(0, 20).toLowerCase();
};

const generateEmail = () => {
  const username = generateEmailUsername();
  return { email: username + randomChoice(EMAIL_SUFFIXES), emailUsername: username };
};

const generatePhoneNumber = () => "86" + randomChoice(MOBILE_PREFIXES) + padZero(randomInt(0, 99999999), 8);

const generateBirthday = () => {
  const age = randomInt(18, 25);
  const birthYear = new Date().getFullYear() - age;
  return `${birthYear}年${padZero(randomInt(1, 12))}月${padZero(randomInt(1, 28))}日`;
};

// ============ 类型定义 ============
interface UserInfo {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  emailUsername: string;
  birthday: string;
}

// ============ Facebook Logo ============
const FacebookLogo = () => (
  <svg className="w-8 h-8" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ============ 子组件 ============
const InfoField = memo(({ 
  label, 
  value, 
  onCopy, 
  onRefresh, 
  isLink, 
  linkHref, 
  copying 
}: {
  label: string;
  value: string;
  onCopy: () => void;
  onRefresh?: () => void;
  isLink?: boolean;
  linkHref?: string;
  copying: boolean;
}) => (
  <div className="bg-[#F0F2F5] rounded-lg p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold text-[#65676B]">{label}</span>
      <div className="flex gap-1">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={copying}
            className="h-7 w-7 p-0 hover:bg-[#E4E6EB] rounded-full transition-all disabled:opacity-50"
            title="重新生成"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#65676B]" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          disabled={copying}
          className="h-7 w-7 p-0 hover:bg-[#E4E6EB] rounded-full transition-all disabled:opacity-50"
        >
          <Copy className="h-3.5 w-3.5 text-[#65676B]" />
        </Button>
      </div>
    </div>
    {isLink && linkHref ? (
      <a
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base font-semibold text-[#1877F2] hover:underline break-all"
      >
        {value}
      </a>
    ) : (
      <p className="text-base font-semibold text-[#050505] break-all">{value}</p>
    )}
  </div>
));

const TelegramCard = memo(({ onCopy, copying }: { onCopy: () => void; copying: boolean }) => (
  <Card className="p-4 rounded-lg border-[#CED0D4] bg-white shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#050505] font-bold text-sm mb-0.5">🎯 神秘代码@fang180</p>
        <p className="text-[#65676B] text-xs">创号教程、工具更新和独家资源</p>
      </div>
    </div>
    <Button 
      onClick={onCopy}
      disabled={copying}
      className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-lg h-9 transition-colors disabled:opacity-50"
    >
      复制神秘代码
    </Button>
  </Card>
));

// ============ 主组件 ============
const Index = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [copying, setCopying] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const showToast = useCallback((message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    if (copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      showToast(`已复制${label}`);
    } catch {
      showToast("复制失败，请手动复制");
    } finally {
      setTimeout(() => setCopying(false), 300);
    }
  }, [copying, showToast]);

  const handleGenerate = useCallback(() => {
    const emailData = generateEmail();
    setUserInfo({
      lastName: generateName(false),
      firstName: generateName(true),
      phone: generatePhoneNumber(),
      email: emailData.email,
      emailUsername: emailData.emailUsername,
      birthday: generateBirthday(),
    });
    showToast("生成成功");
  }, [showToast]);

  const regenerateEmail = useCallback(() => {
    if (!userInfo) return;
    const emailData = generateEmail();
    setUserInfo(prev => prev ? { ...prev, ...emailData } : null);
    showToast("邮箱已更新");
  }, [userInfo, showToast]);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 自定义 Toast 提示 */}
      {toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white rounded-lg shadow-lg border border-[#CED0D4] px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-[#050505]">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Facebook 风格顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-[#CED0D4] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FacebookLogo />
            <h1 className="text-lg font-bold text-[#050505]">账号生成器</h1>
          </div>
          <span className="text-xs font-semibold text-white bg-[#1877F2] px-2 py-1 rounded-full">v2.0</span>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        {/* 生成按钮 */}
        <Button
          onClick={handleGenerate}
          className="w-full h-11 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-lg shadow-sm transition-colors text-base"
        >
          开始创号
        </Button>

        {/* 信息展示卡片 */}
        {userInfo && (
          <Card className="p-4 space-y-3 rounded-lg border-[#CED0D4] bg-white shadow-sm">
            <InfoField label="姓氏" value={userInfo.lastName} onCopy={() => copyToClipboard(userInfo.lastName, "姓氏")} copying={copying} />
            <InfoField label="名字" value={userInfo.firstName} onCopy={() => copyToClipboard(userInfo.firstName, "名字")} copying={copying} />
            
            <div className="bg-[#F0F2F5] rounded-lg p-3">
              <span className="text-sm font-semibold text-[#65676B] block mb-2">生日</span>
              <p className="text-base font-semibold text-[#050505]">{userInfo.birthday}</p>
            </div>
            
            <InfoField label="手机号" value={userInfo.phone} onCopy={() => copyToClipboard(userInfo.phone, "手机号")} copying={copying} />
            
            <div>
              <InfoField 
                label="邮箱" 
                value={userInfo.email} 
                onCopy={() => copyToClipboard(userInfo.email, "邮箱")} 
                onRefresh={regenerateEmail}
                isLink
                linkHref={`https://yopmail.com?${userInfo.emailUsername}`}
                copying={copying}
              />
              <p className="text-xs text-[#65676B] mt-2 px-1">💡 点击邮箱地址可跳转查收验证码 不要在TG打开</p>
            </div>
          </Card>
        )}

        {/* Telegram 频道引流 */}
        <TelegramCard onCopy={() => copyToClipboard("@fang180", "神秘代码")} copying={copying} />
      </div>
    </div>
  );
};

export default Index;