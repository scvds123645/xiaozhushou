import { useState, useCallback, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw, Sparkles, CheckCircle, XCircle } from "lucide-react";

// ============ 数据配置 / Data Configuration ============

const MOBILE_PREFIXES = [
  "134", "135", "136", "137", "138", "139", "147", "150", "151", "152",
  "157", "158", "159", "178", "182", "183", "184", "187", "188", "198",
  "130", "131", "132", "145", "155", "156", "166", "171", "175", "176",
  "185", "186", "133", "149", "153", "173", "177", "180", "181", "189",
  "191", "199"
];

const EMAIL_SUFFIXES = ["@yopmail.com", "@00two.shop"];

const NAME_PARTS = [
  "john", "mike", "alex", "david", "chris", "james", "robert", "michael",
  "william", "daniel", "smith", "brown", "jones", "wilson", "taylor",
  "davis", "miller", "moore", "anderson", "jackson", "white", "harris",
  "martin", "lee", "walker", "sam", "tom", "ben", "joe", "max"
];

// ============ 工具函数 / Utility Functions ============

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n, len = 2) => String(n).padStart(len, "0");

const genName = (vowelStart) => {
  const v = "aeiou", c = "bcdfghjklmnpqrstvwxyz";
  let name = "";
  for (let i = 0; i < 8; i++) {
    const useVowel = vowelStart ? i % 2 === 0 : i % 2 !== 0;
    name += random([...(useVowel ? v : c)]);
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const genEmail = () => {
  let username = Array.from({ length: randomInt(2, 3) }, () => random(NAME_PARTS)).join("");
  while (username.length < 10) {
    username += Math.random() > 0.5 && (15 - username.length) >= 3 
      ? pad(randomInt(0, 999), 3) 
      : random([..."abcdefghijklmnopqrstuvwxyz"]);
  }
  username = username.substring(0, 15);
  return { email: username + random(EMAIL_SUFFIXES), username };
};

const genPhone = () => "86" + random(MOBILE_PREFIXES) + pad(randomInt(0, 99999999), 8);

const genBirthday = () => {
  const year = new Date().getFullYear() - randomInt(18, 25);
  return `${year}年${pad(randomInt(1, 12))}月${pad(randomInt(1, 28))}日`;
};

const genPassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = uppercase + lowercase + numbers + special;
  
  let password = "";
  // 确保至少包含一个大写、小写、数字和特殊字符
  password += random([...uppercase]);
  password += random([...lowercase]);
  password += random([...numbers]);
  password += random([...special]);
  
  // 填充到12位
  for (let i = 4; i < 12; i++) {
    password += random([...all]);
  }
  
  // 打乱顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ============ Toast Component (Mobile Optimized) ============

const Toast = memo(({ message, type }) => (
  <div
    className="flex items-center gap-3 bg-white/95 backdrop-blur rounded-full shadow-xl px-5 py-3 border border-gray-100 max-w-[90vw]"
    style={{
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      animation: 'slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }}
  >
    {type === 'success' ? (
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    )}
    <span className="text-sm text-gray-800 font-medium whitespace-nowrap">{message}</span>
  </div>
));

Toast.displayName = 'Toast';

// ============ InfoRow Component (Touch Optimized) ============

const InfoRow = memo(({ label, value, onCopy, onRefresh, link, loading }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider select-none">{label}</label>
      <div className="flex gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 active:bg-gray-200 active:scale-90 transition-all touch-manipulation"
            title="刷新"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
        <button
          onClick={onCopy}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-50 active:bg-gray-200 active:scale-90 transition-all touch-manipulation"
          title="复制"
        >
          <Copy className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm active:border-blue-400 transition-colors">
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-medium text-blue-600 truncate block"
        >
          {value}
        </a>
      ) : (
        <p className="text-base font-medium text-gray-900 break-all select-all font-mono tracking-tight">{value}</p>
      )}
    </div>
  </div>
));

InfoRow.displayName = 'InfoRow';

// ============ Telegram Banner Component ============

const TgBanner = memo(({ onCopy }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-bold text-sm">神秘代码 @fang180</p>
        <p className="text-gray-500 text-xs mt-0.5">创号教程、工具更新和独家资源</p>
      </div>
    </div>
    <Button
      onClick={onCopy}
      className="w-full bg-white text-blue-600 hover:bg-gray-50 border border-blue-200 font-bold rounded-lg h-10 shadow-sm active:scale-[0.98] transition-all"
    >
      复制神秘代码
    </Button>
  </div>
));

TgBanner.displayName = 'TgBanner';

// ============ Main Component ============

export default function AccountGenerator() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);

  // 初始化加载背景图
  useEffect(() => {
    const img = new Image();
    img.src = "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/%E8%83%8C%E6%99%AF89.jpg";
    img.onload = () => setBgLoaded(true);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  const copy = useCallback(async (text, label) => {
    if (!text) return;
    try {
      // 兼容移动端剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(`已复制${label}`, 'success');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(`已复制${label}`, 'success');
      }
    } catch {
      showToast("复制失败，请长按手动复制", 'error');
    }
  }, [showToast]);

  const generate = useCallback(() => {
    // 增加触觉反馈 (如果设备支持)
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    const emailData = genEmail();

    setInfo({
      lastName: genName(false),
      firstName: genName(true),
      phone: genPhone(),
      password: genPassword(),
      email: emailData.email,
      username: emailData.username,
      birthday: genBirthday(),
    });

    showToast("新身份已生成", 'success');
  }, [showToast]);

  const refreshEmail = useCallback(async () => {
    if (!info) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const emailData = genEmail();
    setInfo((prev) => ({ ...prev, ...emailData }));
    showToast("邮箱已刷新", 'success');
    setLoading(false);
  }, [info, showToast]);

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-gray-50"
      style={{
        backgroundImage: bgLoaded ? 'url(https://www.584136.xyz/%E5%A4%B4%E5%83%8F/%E8%83%8C%E6%99%AF89.jpg)' : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay with more blur for readability */}
      <div className="min-h-screen w-full absolute inset-0 bg-white/80 backdrop-blur-sm overflow-y-auto">
        {/* Header - Sticky */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 rounded-lg p-1">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">创号小助手</h1>
            </div>
            <div className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-bold text-gray-500">v2.0</div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-md mx-auto px-4 py-6 space-y-6 pb-24">
          <Button
            onClick={generate}
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl transition-all active:scale-[0.98] active:shadow-none flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            开始创号
          </Button>

          {info && (
            <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
              <Card className="p-5 space-y-5 bg-white shadow-sm border border-gray-100 rounded-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow
                    label="姓氏"
                    value={info.lastName}
                    onCopy={() => copy(info.lastName, "姓氏")}
                  />
                  <InfoRow
                    label="名字"
                    value={info.firstName}
                    onCopy={() => copy(info.firstName, "名字")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">生日</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <p className="text-base font-medium text-gray-900 font-mono">{info.birthday}</p>
                  </div>
                </div>

                <InfoRow
                  label="手机号 (CN)"
                  value={info.phone}
                  onCopy={() => copy(info.phone, "手机号")}
                />

                <InfoRow
                  label="密码"
                  value={info.password}
                  onCopy={() => copy(info.password, "密码")}
                />

                <div className="space-y-3 pt-3 border-t border-gray-100 border-dashed">
                  <InfoRow
                    label="临时邮箱"
                    value={info.email}
                    onCopy={() => copy(info.email, "邮箱")}
                    onRefresh={refreshEmail}
                    link={`https://yopmail.com?${info.username}`}
                    loading={loading}
                  />

                  <div className="bg-blue-50 rounded-lg px-3 py-2.5 flex gap-3 items-start">
                    <span className="text-blue-500 text-sm mt-0.5">💡</span>
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                      点击邮箱链接可直达收件箱。建议使用 Chrome 或 Safari 外部浏览器打开。
                    </p>
                  </div>
                </div>
              </Card>

              <TgBanner onCopy={() => copy("@fang180", "神秘代码")} />
            </div>
          )}

          {!info && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">点击上方按钮开始生成</p>
            </div>
          )}
        </main>
      </div>

      {/* Styles for animation */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Toast Container - Centered Top */}
      <div className="fixed top-16 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
}