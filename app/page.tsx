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
    const birthday = generateBirthday();
    const phone = generatePhone(selectedCountry);
    const password = generatePassword();
    const email = generateEmail(name.firstName, name.lastName);
    
    const newData = {
      firstName: name.firstName,
      lastName: name.lastName,
      birthday: birthday,
      phone: phone,
      password: password,
      email: email,
    };
    
    console.log('生成新数据:', newData); // 调试日志
    
    // 使用函数式更新确保状态正确设置
    setUserInfo(prev => {
      console.log('上一个状态:', prev);
      console.log('新状态:', newData);
      return newData;
    });
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-indigo-400 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/40 border-b border-white/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                脸书小助手
              </h1>
              <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">@fang180</p>
            </div>
            {ipInfo && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/50 shadow-sm flex-shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full ${ipInfo.accurate ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-[10px] sm:text-xs text-gray-600 max-w-[80px] sm:max-w-none truncate">{ipInfo.ip}</span>
                <div className="w-px h-2.5 sm:h-3 bg-gray-300 hidden sm:block"></div>
                <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">{ipInfo.countryName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 relative z-10 pb-20 sm:pb-8">
        
        {/* 控制面板 */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
          
          {/* 国家选择 */}
          <div>
            <label className="block text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium px-1">地区</label>
            <button
              onClick={() => setShowCountrySelect(true)}
              className="w-full bg-white/60 backdrop-blur-md hover:bg-white/80 active:bg-white/90 border border-white/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-between transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="text-xl sm:text-2xl flex-shrink-0">{selectedCountry.flag}</span>
                <div className="text-left min-w-0">
                  <div className="font-medium text-gray-800 text-sm sm:text-sm truncate">{selectedCountry.name}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{selectedCountry.code}</div>
                </div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* 生成按钮 */}
          <div>
            <label className="block text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium px-1">操作</label>
            <button
              onClick={generate}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 active:scale-[0.98] text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3 font-medium text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              随机生成
            </button>
          </div>
        </div>

        {/* 数据展示区 */}
        <div className="space-y-2.5 sm:space-y-3" key={userInfo.email}>
          <DataField label="姓氏" value={userInfo.lastName} icon="👤" onCopy={() => copyToClipboard(userInfo.lastName, '姓氏')} />
          <DataField label="名字" value={userInfo.firstName} icon="👤" onCopy={() => copyToClipboard(userInfo.firstName, '名字')} />
          <DataField label="生日" value={userInfo.birthday} icon="🎂" onCopy={() => copyToClipboard(userInfo.birthday, '生日')} />
          <DataField label="手机号" value={userInfo.phone} icon="📱" mono onCopy={() => copyToClipboard(userInfo.phone, '手机号')} />
          <DataField label="密码" value={userInfo.password} icon="🔑" mono onCopy={() => copyToClipboard(userInfo.password, '密码')} />
          
          {/* 邮箱字段 */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                  <span className="text-base sm:text-lg">📧</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium">邮箱</span>
                </div>
                <div className="text-gray-800 text-xs sm:text-sm break-all font-mono leading-relaxed min-h-[2.5rem] sm:min-h-[3rem] flex items-center">
                  {userInfo.email || '请点击生成按钮'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(userInfo.email, '邮箱')}
                  disabled={!userInfo.email}
                  className="flex-1 px-3 py-2 bg-white/80 hover:bg-white active:bg-white border border-white/50 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">复制邮箱</span>
                </button>
                <button
                  onClick={() => copyToClipboard(`https://yopmail.com?${userInfo.email}`, '接码地址')}
                  disabled={!userInfo.email}
                  className="flex-1 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 active:bg-indigo-500/30 border border-indigo-500/20 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-xs font-medium text-indigo-600">接码地址</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <a
            href="https://t.me/fang180"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2.5 bg-[#0088CC] hover:bg-[#006BA8] active:bg-[#005C91] text-white rounded-xl font-medium text-sm sm:text-base transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
            </svg>
            加入 Telegram 频道
          </a>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-2.5 sm:mt-3">版本 1.0 • @fang180</p>
        </div>
      </main>

      {/* Toast 通知 */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50 space-y-2 max-w-[calc(100vw-1.5rem)] sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white/90 backdrop-blur-xl border border-white/50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg flex items-center gap-2 animate-slide-in"
          >
            {toast.type === 'success' && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></div>}
            {toast.type === 'error' && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 flex-shrink-0"></div>}
            <span className="text-gray-700 text-xs sm:text-sm truncate">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* 国家选择弹窗 */}
      {showCountrySelect && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCountrySelect(false)}></div>
          <div className="relative w-full sm:max-w-xl bg-white/90 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/50 overflow-hidden max-h-[80vh] sm:max-h-[85vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-gray-200/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">选择地区</h3>
                <button
                  onClick={() => setShowCountrySelect(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="搜索国家..."
                className="w-full bg-white/60 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())).map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountrySelect(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-gray-50/80 active:bg-gray-100/80 border-b border-gray-100/50 transition-colors"
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0">{country.flag}</span>
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

function DataField({ label, value, icon, mono = false, onCopy }: any) {
  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{icon}</span>
            <span className="text-xs text-gray-500 font-medium">{label}</span>
          </div>
          <div className={`text-gray-800 truncate ${mono ? 'font-mono text-sm' : 'text-base'}`}>
            {value}
          </div>
        </div>
        <button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2.5 bg-white/80 hover:bg-white border border-white/50 rounded-xl"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}