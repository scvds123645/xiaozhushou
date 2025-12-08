'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  generateName, 
  generateBirthday, 
  generatePhone, 
  generatePassword, 
  generateEmail,
  getCountryConfig 
} from '@/lib/generator';
import { countries, CountryConfig } from '@/lib/countryData';

interface UserInfo {
  firstName: string;
  lastName: string;
  birthday: string;
  phone: string;
  password: string;
  email: string;
}

interface ToastConfig {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface IPInfo {
  ip: string;
  country: string;
  countryName: string;
  city: string;
  region: string;
  accurate: boolean;
}

export default function FakerGenerator() {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(countries[0]);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '', lastName: '', birthday: '', phone: '', password: '', email: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const toastIdRef = useRef(0);
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);

  // 使用 useCallback 优化函数
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 已复制`);
    } catch (e) {
      showToast('复制失败', 'error');
    }
  }, [showToast]);

  const fetchIPInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/ip-info');
      const data = await response.json();
      
      setIpInfo({
        ip: data.ip || 'Unknown',
        country: data.country || 'US',
        countryName: data.countryName || 'Unknown',
        city: data.city || '',
        region: data.region || '',
        accurate: data.accurate || false,
      });

      if (data.country) {
        const matchedCountry = countries.find(c => c.code === data.country);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
        }
      }
    } catch (error) {
      console.error('IP detection failed:', error);
    }
  }, []);

  const generate = useCallback(() => {
    const name = generateName(selectedCountry.code);
    const birthday = generateBirthday();
    const phone = generatePhone(selectedCountry);
    const password = generatePassword();
    const email = generateEmail(name.firstName, name.lastName);
    
    setUserInfo({
      firstName: name.firstName,
      lastName: name.lastName,
      birthday,
      phone,
      password,
      email,
    });
  }, [selectedCountry]);

  // 使用 useMemo 优化国家列表过滤
  const filteredCountries = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return countries.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  useEffect(() => {
    const init = async () => {
      await fetchIPInfo();
      setIsLoading(false);
    };
    init();
  }, [fetchIPInfo]);

  useEffect(() => {
    if (!isLoading && selectedCountry) {
      generate();
    }
  }, [selectedCountry, isLoading, generate]);

  // 优化国家选择关闭
  const handleCloseCountrySelect = useCallback(() => {
    setShowCountrySelect(false);
    setSearchQuery('');
  }, []);

  // 优化国家选择
  const handleSelectCountry = useCallback((country: CountryConfig) => {
    setSelectedCountry(country);
    handleCloseCountrySelect();
  }, [handleCloseCountrySelect]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-indigo-400 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 text-xs">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      
      {/* 背景装饰 - 使用 transform 代替 position 优化性能 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl will-change-transform"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl will-change-transform"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/40 border-b border-white/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800">脸书小助手</h1>
              <p className="text-gray-500 text-xs mt-0.5">@fang180</p>
            </div>
            {ipInfo && (
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/50 shadow-sm flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${ipInfo.accurate ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-xs text-gray-600 max-w-[90px] truncate">{ipInfo.ip}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4 relative z-10 pb-20">
        
        {/* 控制面板 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          {/* 国家选择 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium px-0.5">地区</label>
            <button
              onClick={() => setShowCountrySelect(true)}
              className="w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-2.5 flex items-center justify-between transition-all shadow-sm active:scale-[0.98] active:bg-white/80 touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl flex-shrink-0">{selectedCountry.flag}</span>
                <div className="text-left min-w-0">
                  <div className="font-medium text-gray-800 text-sm truncate">{selectedCountry.name}</div>
                  <div className="text-xs text-gray-500">{selectedCountry.code}</div>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* 生成按钮 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium px-0.5">操作</label>
            <button
              onClick={generate}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl px-4 py-2.5 font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.97] active:from-indigo-600 active:to-purple-600 h-[58px] touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              随机生成
            </button>
          </div>
        </div>

        {/* 数据展示区 */}
        <div className="space-y-2.5">
          <DataField label="姓氏" value={userInfo.lastName} icon="👤" onCopy={() => copyToClipboard(userInfo.lastName, '姓氏')} />
          <DataField label="名字" value={userInfo.firstName} icon="👤" onCopy={() => copyToClipboard(userInfo.firstName, '名字')} />
          <DataField label="生日" value={userInfo.birthday} icon="🎂" onCopy={() => copyToClipboard(userInfo.birthday, '生日')} />
          <DataField label="手机号" value={userInfo.phone} icon="📱" mono onCopy={() => copyToClipboard(userInfo.phone, '手机号')} />
          <DataField label="密码" value={userInfo.password} icon="🔑" mono onCopy={() => copyToClipboard(userInfo.password, '密码')} />
          
          {/* 邮箱字段 */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-3 shadow-sm">
            <div className="flex flex-col gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">📧</span>
                  <span className="text-xs text-gray-500 font-medium">邮箱</span>
                </div>
                <div className="text-gray-800 text-sm break-all font-mono leading-relaxed">
                  {userInfo.email || '请点击生成按钮'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(userInfo.email, '邮箱')}
                  disabled={!userInfo.email}
                  className="flex-1 px-3 py-2.5 bg-white/80 border border-white/50 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] active:bg-white touch-manipulation"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">复制邮箱</span>
                </button>
                <button
                  onClick={() => copyToClipboard(`https://yopmail.com?${userInfo.email}`, '接码地址')}
                  disabled={!userInfo.email}
                  className="flex-1 px-3 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] active:bg-indigo-500/20 touch-manipulation"
                >
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-xs font-medium text-indigo-600">接码地址</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="https://t.me/fang180"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0088CC] text-white rounded-xl font-medium text-sm transition-all shadow-md active:scale-[0.97] active:bg-[#006BA8] touch-manipulation"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
            </svg>
            Telegram 频道
          </a>
          <p className="text-gray-400 text-xs mt-2.5">版本 1.0 • @fang180</p>
        </div>
      </main>

      {/* Toast 通知 */}
      <div className="fixed top-3 right-3 z-50 space-y-2 max-w-[calc(100vw-1.5rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white/90 backdrop-blur-xl border border-white/50 px-3 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-slide-in"
          >
            {toast.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>}
            {toast.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>}
            <span className="text-gray-700 text-sm truncate">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* 国家选择弹窗 - 优化滚动性能 */}
      {showCountrySelect && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleCloseCountrySelect}></div>
          <div className="relative w-full bg-white/90 backdrop-blur-2xl rounded-t-2xl shadow-2xl border border-white/50 overflow-hidden max-h-[75vh] flex flex-col">
            <div className="p-4 border-b border-gray-200/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">选择地区</h3>
                <button
                  onClick={handleCloseCountrySelect}
                  className="text-gray-400 p-2 rounded-lg transition-colors active:bg-gray-100/50 active:text-gray-600 touch-manipulation"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="搜索国家..."
                className="w-full bg-white/60 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain" style={{WebkitOverflowScrolling: 'touch'}}>
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleSelectCountry(country)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 border-b border-gray-100/50 transition-colors active:bg-gray-50/80 touch-manipulation"
                >
                  <span className="text-2xl flex-shrink-0">{country.flag}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{country.name}</div>
                    <div className="text-xs text-gray-500">{country.phonePrefix}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// 使用 React.memo 优化组件渲染
const DataField = ({ label, value, icon, mono = false, onCopy }: any) => {
  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-3 shadow-sm transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <span className="text-xs text-gray-500 font-medium">{label}</span>
          </div>
          <div className={`text-gray-800 truncate ${mono ? 'font-mono text-sm' : 'text-sm'}`}>
            {value}
          </div>
        </div>
        <button
          onClick={onCopy}
          className="p-2.5 bg-white/80 border border-white/50 rounded-xl transition-all active:scale-95 active:bg-white flex-shrink-0 touch-manipulation"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};