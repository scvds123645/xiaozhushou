'use client';

import { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { countries, CountryConfig } from '@/lib/countryData';
import {
  generateName,
  generateBirthday,
  generatePhone,
  generatePassword,
  generateEmail,
  getCountryConfig,
  getAllDomains
} from '@/lib/generator';

interface UserInfo {
  firstName: string;
  lastName: string;
  birthday: string;
  phone: string;
  password: string;
  email: string;
}

// --- 图标组件 (保持不变，样式微调) ---
const ICON_PATHS: Record<string, React.ReactElement> = {
  copy: <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>,
  check: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>,
  location: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>,
  link: <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>,
  chevronRight: <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>,
  close: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>,
  sparkles: <path d="M7 11v2l-4 1 4 1v2l1-4-1-4zm5-7v4l-3 1 3 1v4l2-5-2-5zm5.66 2.94L15 6.26l.66-2.94L18.34 6l2.66.68-2.66.68-.68 2.58-.66-2.94zM15 18l-2-3 2-3 2 3-2 3z"/>,
  search: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>,
  refresh: <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>,
  email: <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>,
  inbox: <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/>,
  copySimple: <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
};

const Icon = memo(({ name, className = "w-6 h-6" }: { name: string; className?: string }) => {
  return (<svg className={className} viewBox="0 0 24 24" fill="currentColor">{ICON_PATHS[name]}</svg>);
});
Icon.displayName = 'Icon';

const haptic = () => { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) { navigator.vibrate(10); } };

// --- 优化后的列表行组件 ---
const InfoRow = memo(({ label, value, onCopy, isLast = false, highlight = false }: {
  label: string;
  value: string;
  onCopy: () => void;
  isLast?: boolean;
  highlight?: boolean;
}) => (
  <div 
    onClick={onCopy}
    className="group relative flex items-center justify-between py-4 pl-5 pr-5 cursor-pointer active:bg-gray-50 transition-colors duration-200"
  >
    <span className="text-[15px] font-medium text-gray-400 w-20 shrink-0 tracking-tight">{label}</span>
    <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
      <span className={`text-[16px] font-medium truncate select-all tracking-tight ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {value || '---'}
      </span>
    </div>
    {!isLast && <div className="absolute bottom-0 left-5 right-0 h-[0.5px] bg-gray-100" />}
  </div>
));
InfoRow.displayName = 'InfoRow';

export default function AppleStylePage() {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(countries[0]);
  const [selectedDomain, setSelectedDomain] = useState<string>('random');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '', lastName: '', birthday: '', phone: '', password: '', email: ''
  });
  const [showCountrySheet, setShowCountrySheet] = useState(false);
  const [showDomainSheet, setShowDomainSheet] = useState(false);
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [ipInfo, setIpInfo] = useState({ ip: '...', country: 'US' });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [isButtonActive, setIsButtonActive] = useState(false);
  
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const buttonTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(false);
    setTimeout(() => {
      setToast(msg);
      setToastVisible(true);
      toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
    }, 50);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    haptic();
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 已复制`);
    } catch {
      showToast('复制失败');
    }
  }, [showToast]);

  const generate = useCallback(() => {
    if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
    setIsButtonActive(true);
    buttonTimerRef.current = setTimeout(() => setIsButtonActive(false), 150);

    haptic();
    
    try {
      const { firstName, lastName } = generateName(selectedCountry.code);
      const birthday = generateBirthday();
      const phone = generatePhone(selectedCountry);
      const password = generatePassword();
      const customDomain = selectedDomain === 'random' ? undefined : selectedDomain;
      const email = generateEmail(firstName, lastName, customDomain);
      
      setUserInfo({ firstName, lastName, birthday, phone, password, email });
      showToast('已生成新身份');
    } catch (error) {
      console.error(error);
      showToast('生成失败');
    }
  }, [selectedCountry, selectedDomain, showToast]);

  useEffect(() => {
    let isMounted = true;
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        if (!isMounted) return;
        
        setIpInfo({ ip: data.ip || '未知', country: data.country || 'US' });
        if (data.country && data.accurate) {
          const detectedCountry = getCountryConfig(data.country);
          if (detectedCountry) setSelectedCountry(detectedCountry);
        }
        setIsInitialized(true);
      } catch (error) {
        if (isMounted) {
          setIpInfo({ ip: '检测失败', country: 'US' });
          setIsInitialized(true);
        }
      }
    };
    initializeApp();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isInitialized && !userInfo.firstName) {
        try {
            const { firstName, lastName } = generateName(selectedCountry.code);
            const birthday = generateBirthday();
            const phone = generatePhone(selectedCountry);
            const password = generatePassword();
            const customDomain = selectedDomain === 'random' ? undefined : selectedDomain;
            const email = generateEmail(firstName, lastName, customDomain);
            setUserInfo({ firstName, lastName, birthday, phone, password, email });
        } catch (e) { console.error(e); }
    }
  }, [isInitialized, userInfo.firstName, selectedCountry, selectedDomain]);

  useEffect(() => {
    if (isInitialized && userInfo.firstName) generate();
  }, [selectedCountry.code]);

  const allDomains = useMemo(() => getAllDomains(), []);
  const displayDomain = selectedDomain === 'random' ? '随机' : selectedDomain;
  const filteredDomains = useMemo(() => {
    if (!domainSearchQuery) return allDomains;
    return allDomains.filter(d => d.toLowerCase().includes(domainSearchQuery.toLowerCase()));
  }, [allDomains, domainSearchQuery]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-slate-900 pb-10 selection:bg-blue-200/50">
      
      {/* 顶部导航 - 增加通透感 */}
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-white/70 backdrop-blur-xl border-b border-gray-200/60 z-40 flex items-center justify-center transition-all duration-300">
        <h1 className="text-[17px] font-semibold text-gray-900 tracking-tight">脸书小助手</h1>
        <div className="absolute right-4 flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-gray-100/80 border border-gray-200/50 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]"></div>
          <span className="text-[11px] font-medium text-gray-500 font-mono tracking-tight">{ipInfo.ip}</span>
        </div>
      </header>

      <main className="max-w-[420px] mx-auto px-5 pt-24 pb-10 space-y-6">
        
        {!isInitialized ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 核心信息卡片 - 增加阴影深度和圆角 */}
            <section className="bg-white rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 ring-1 ring-black/5">
              <InfoRow label="姓氏" value={userInfo.lastName} onCopy={() => copyToClipboard(userInfo.lastName, '姓氏')} />
              <InfoRow label="名字" value={userInfo.firstName} onCopy={() => copyToClipboard(userInfo.firstName, '名字')} />
              <InfoRow label="生日" value={userInfo.birthday} onCopy={() => copyToClipboard(userInfo.birthday, '生日')} />
              <InfoRow label="手机号" value={userInfo.phone} onCopy={() => copyToClipboard(userInfo.phone, '手机号')} />
              <InfoRow label="密码" value={userInfo.password} onCopy={() => copyToClipboard(userInfo.password, '密码')} />
              
              {/* 邮箱行 - 优化布局 */}
              <div className="relative flex flex-col py-4 pl-5 pr-5 active:bg-gray-50 transition-colors duration-200">
                <div 
                  className="flex items-center justify-between mb-3 cursor-pointer" 
                  onClick={() => copyToClipboard(userInfo.email, '邮箱')}
                >
                  <span className="text-[15px] font-medium text-gray-400 w-20 shrink-0 tracking-tight">邮箱</span>
                  <span className="text-[16px] font-medium text-gray-900 truncate select-all flex-1 text-right tracking-tight">{userInfo.email}</span>
                </div>
                
                {/* 邮箱操作栏 - 胶囊按钮风格 */}
                <div className="flex justify-end">
                  <button
                    onClick={(e) => { 
                      e.stopPropagation();
                      haptic(); 
                      const emailName = userInfo.email.split('@')[0];
                      window.open(`https://yopmail.com/?login=${emailName}`, '_blank');
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-blue-50/80 hover:bg-blue-100 text-blue-600 rounded-full text-[13px] font-medium transition-all active:scale-95 active:bg-blue-100 border border-blue-100"
                  >
                    <Icon name="inbox" className="w-3.5 h-3.5" />
                    查看收件箱
                  </button>
                </div>
              </div>
            </section>

            {/* 主要操作按钮 - 增加微渐变和发光效果 */}
            <button
              onClick={generate}
              disabled={!isInitialized}
              className={`w-full py-4 bg-gradient-to-b from-blue-500 to-blue-600 hover:to-blue-700 text-white rounded-[18px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] border-t border-white/20 transition-all duration-200 ease-out flex items-center justify-center gap-2.5 transform ${
                isButtonActive ? 'scale-[0.97] brightness-95' : 'scale-100 hover:scale-[1.01] active:scale-[0.97]'
              }`}
            >
              <Icon name="sparkles" className="w-5 h-5 text-blue-50" />
              <span className="text-[17px] font-semibold tracking-tight text-white">
                生成新身份
              </span>
            </button>

            {/* 设置区域 - iOS Grouped List 风格 */}
            <section>
              <div className="pl-5 mb-2.5 text-[13px] font-medium text-gray-400 uppercase tracking-wide">生成设置</div>
              <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100/50 ring-1 ring-black/5">
                <button
                  onClick={() => { haptic(); setShowCountrySheet(true); }}
                  className="w-full flex items-center justify-between py-4 pl-5 pr-4 active:bg-gray-50 transition-colors"
                >
                  <span className="text-[16px] font-medium text-gray-900 tracking-tight">选择地区</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px] text-gray-500 tracking-tight">{selectedCountry.name}</span>
                    <Icon name="chevronRight" className="w-4 h-4 text-gray-300/80" />
                  </div>
                </button>
                <div className="ml-5 h-[0.5px] bg-gray-100" />
                <button
                  onClick={() => { haptic(); setShowDomainSheet(true); }}
                  className="w-full flex items-center justify-between py-4 pl-5 pr-4 active:bg-gray-50 transition-colors"
                >
                  <span className="text-[16px] font-medium text-gray-900 tracking-tight">邮箱域名</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px] text-gray-500 tracking-tight">{displayDomain}</span>
                    <Icon name="chevronRight" className="w-4 h-4 text-gray-300/80" />
                  </div>
                </button>
              </div>
            </section>

            {/* 底部信息 */}
            <footer className="pt-4 pb-8 text-center space-y-4">
              <a 
                href="https://t.me/fang180" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-[14px] text-blue-600 hover:text-blue-700 font-medium transition-colors active:opacity-60"
              >
                <Icon name="link" className="w-4 h-4" />
                加入 Telegram 频道
              </a>
              <p className="text-[12px] text-gray-400 font-medium">
                支持 {countries.length} 个国家 • {allDomains.length} 个域名
              </p>
            </footer>
          </>
        )}
      </main>

      {/* Toast - 增加模糊和阴影 */}
      <div 
        className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 cubic-bezier(0.16, 1, 0.3, 1) ${
          toastVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900/85 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-2.5 min-w-[140px] justify-center border border-white/10">
          <div className="bg-green-500/20 p-0.5 rounded-full">
            <Icon name="check" className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="text-[15px] font-medium tracking-tight">{toast}</span>
        </div>
      </div>

      {/* 国家选择 Sheet - 增加顶部圆角和拖拽条 */}
      {showCountrySheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px] transition-opacity" onClick={() => setShowCountrySheet(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[24px] sm:rounded-[24px] max-h-[80vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-10">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-[17px] font-semibold text-center text-gray-900 tracking-tight">选择地区</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => { haptic(); setSelectedCountry(country); setShowCountrySheet(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                    selectedCountry.code === country.code 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-900 active:bg-gray-100'
                  }`}
                >
                  <span className="text-[16px]">{country.name}</span>
                  {selectedCountry.code === country.code && <Icon name="check" className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 域名选择 Sheet */}
      {showDomainSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px] transition-opacity" onClick={() => { setShowDomainSheet(false); setDomainSearchQuery(''); }} />
          <div className="relative w-full max-w-md bg-white rounded-t-[24px] sm:rounded-[24px] max-h-[85vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-10 space-y-4">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto"></div>
              <h3 className="text-[17px] font-semibold text-center text-gray-900 tracking-tight">选择域名</h3>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="search" className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={domainSearchQuery}
                  onChange={(e) => setDomainSearchQuery(e.target.value)}
                  placeholder="搜索域名"
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-100 border-none rounded-[12px] text-[16px] text-gray-900 placeholder-gray-500 focus:ring-0 focus:bg-gray-200/70 transition-colors caret-blue-500"
                />
                {domainSearchQuery && (
                  <button onClick={() => setDomainSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="bg-gray-300 rounded-full p-0.5"><Icon name="close" className="w-3 h-3 text-white" /></div>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {!domainSearchQuery && (
                <button
                  onClick={() => { haptic(); setSelectedDomain('random'); setShowDomainSheet(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl mb-2 transition-all ${
                    selectedDomain === 'random' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900 active:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${selectedDomain === 'random' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon name="sparkles" className={`w-4 h-4 ${selectedDomain === 'random' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <span className="text-[16px]">随机域名</span>
                  </div>
                  {selectedDomain === 'random' && <Icon name="check" className="w-5 h-5" />}
                </button>
              )}
              {filteredDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => { haptic(); setSelectedDomain(domain); setShowDomainSheet(false); setDomainSearchQuery(''); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                    selectedDomain === domain ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-900 active:bg-gray-100'
                  }`}
                >
                  <span className="text-[16px]">{domain}</span>
                  {selectedDomain === domain && <Icon name="check" className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}