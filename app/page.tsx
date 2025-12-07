'use client';

import { useState, useEffect, useRef } from 'react';
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 已复制`);
    } catch (e) {
      showToast('复制失败', 'error');
    }
  };

  const fetchIPInfo = async () => {
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
  };

  const generate = () => {
    const name = generateName(selectedCountry.code);
    const newData = {
      firstName: name.firstName,
      lastName: name.lastName,
      birthday: generateBirthday(),
      phone: generatePhone(selectedCountry),
      password: generatePassword(),
      email: generateEmail(name.firstName, name.lastName),
    };
    setUserInfo(newData);
  };

  useEffect(() => {
    const init = async () => {
      await fetchIPInfo();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading && selectedCountry) {
      generate();
    }
  }, [selectedCountry, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 font-mono">初始化生成器...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                脸书小助手
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 font-mono">Powered by @fang180</p>
            </div>
            {ipInfo && (
              <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-white/10 self-start sm:self-auto">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ipInfo.accurate ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                  <span className="text-xs sm:text-sm font-mono text-gray-300">{ipInfo.ip}</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="text-xs sm:text-sm text-gray-400">{ipInfo.countryName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-8">
        
        {/* Control Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Locale Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-mono text-gray-400 mb-2 uppercase tracking-wider">国家地区</label>
            <button
              onClick={() => setShowCountrySelect(true)}
              className="w-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-lg p-3 sm:p-4 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">{selectedCountry.flag}</span>
                <div className="text-left">
                  <div className="font-semibold text-white text-sm sm:text-base">{selectedCountry.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{selectedCountry.code}</div>
                </div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Generate Button */}
          <div>
            <label className="block text-xs sm:text-sm font-mono text-gray-400 mb-2 uppercase tracking-wider">操作</label>
            <button
              onClick={generate}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:scale-95 border border-white/10 rounded-lg px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              随机生成
            </button>
          </div>
        </div>

        {/* Data Display - 姓氏和名字位置交换 */}
        <div className="space-y-3 sm:space-y-4">
          <DataField label="姓氏" value={userInfo.lastName} icon="👤" onCopy={() => copyToClipboard(userInfo.lastName, '姓氏')} />
          <DataField label="名字" value={userInfo.firstName} icon="👤" onCopy={() => copyToClipboard(userInfo.firstName, '名字')} />
          <DataField label="生日" value={userInfo.birthday} icon="🎂" onCopy={() => copyToClipboard(userInfo.birthday, '生日')} />
          <DataField label="手机号" value={userInfo.phone} icon="📱" mono onCopy={() => copyToClipboard(userInfo.phone, '手机号')} />
          <DataField label="密码" value={userInfo.password} icon="🔑" mono onCopy={() => copyToClipboard(userInfo.password, '密码')} />
          
          {/* Email Field with YOPmail Link */}
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:border-purple-400/50 transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base sm:text-lg">📧</span>
                  <span className="text-[10px] sm:text-xs font-mono text-gray-400 uppercase tracking-wider">邮箱</span>
                </div>
                <div className="text-white text-sm sm:text-base lg:text-lg break-all font-mono">
                  {userInfo.email}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyToClipboard(userInfo.email, '邮箱')}
                  className="flex-1 sm:flex-none px-4 sm:px-0 sm:w-auto py-2.5 sm:py-0 sm:p-2.5 lg:p-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-lg transition-all flex items-center justify-center gap-2 sm:gap-0"
                  title="复制邮箱"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold sm:hidden">复制邮箱</span>
                </button>
                <button
                  onClick={() => copyToClipboard(`https://yopmail.com?${userInfo.email}`, '接码地址')}
                  className="flex-1 sm:flex-none px-4 sm:px-0 sm:w-auto py-2.5 sm:py-0 sm:p-2.5 lg:p-3 bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 border border-purple-400/30 rounded-lg transition-all flex items-center justify-center gap-2 sm:gap-0"
                  title="复制接码地址"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-xs font-semibold text-purple-400 sm:hidden">接码地址</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center">
          <a
            href="https://t.me/fang180"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-[#0088CC] hover:bg-[#006699] active:bg-[#005580] rounded-lg font-semibold text-sm sm:text-base transition-all"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
            </svg>
            加入 Telegram 频道
          </a>
          <p className="text-gray-500 text-[10px] sm:text-xs mt-3 sm:mt-4 font-mono">版本 1.0 • @fang180</p>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 space-y-2 max-w-[calc(100vw-2rem)] sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-black/90 backdrop-blur-xl border border-white/20 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl flex items-center gap-2 sm:gap-3 animate-slide-in"
          >
            {toast.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>}
            {toast.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>}
            <span className="text-white font-mono text-xs sm:text-sm truncate">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Country Modal */}
      {showCountrySelect && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCountrySelect(false)}></div>
          <div className="relative w-full sm:max-w-2xl bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border-t sm:border border-white/10 overflow-hidden max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold">选择地区</h3>
                <button
                  onClick={() => setShowCountrySelect(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 -m-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="搜索国家或代码..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())).map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountrySelect(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/5 active:bg-white/10 border-b border-white/5 transition-colors"
                >
                  <span className="text-xl sm:text-2xl">{country.flag}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate">{country.name}</div>
                    <div className="text-xs sm:text-sm text-gray-400 font-mono">{country.phonePrefix}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}

function DataField({ label, value, icon, mono = false, onCopy }: any) {
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:border-purple-400/50 transition-all group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base sm:text-lg">{icon}</span>
            <span className="text-[10px] sm:text-xs font-mono text-gray-400 uppercase tracking-wider">{label}</span>
          </div>
          <div className={`text-white text-base sm:text-lg truncate ${mono ? 'font-mono text-sm sm:text-base' : ''}`}>
            {value}
          </div>
        </div>
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-2.5 sm:p-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}