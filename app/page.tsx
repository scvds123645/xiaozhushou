'use client';

import { useState, useEffect, useRef } from 'react';
import { countries, CountryConfig } from '@/lib/countryData';
import { generateName, generateBirthday, generatePhone, generatePassword, generateEmail } from '@/lib/generator';

interface UserInfo {
  firstName: string;
  lastName: string;
  birthday: string;
  phone: string;
  password: string;
  email: string;
}

interface LocationInfo {
  country: string;
  ip: string;
  city: string;
  region: string;
  source?: string;
  accurate?: boolean;
  countryName?: string;
  timezone?: string;
  latitude?: number | null;
  longitude?: number | null;
  error?: string;
}

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(countries[0]);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    birthday: '',
    phone: '',
    password: '',
    email: ''
  });
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const countryListRef = useRef<HTMLDivElement>(null);

  // 生成函数
  const generate = () => {
    console.log('Generating for country:', selectedCountry.code);
    const name = generateName(selectedCountry.code);
    console.log('Generated name:', name);
    
    const info: UserInfo = {
      firstName: name.firstName,
      lastName: name.lastName,
      birthday: generateBirthday(),
      phone: generatePhone(selectedCountry),
      password: generatePassword(),
      email: generateEmail(name.firstName, name.lastName),
    };
    
    console.log('Generated info:', info);
    setUserInfo(info);
  };

  // IP 检测
  useEffect(() => {
    setIsLoading(true);
    
    fetch('/api/ip-info')
      .then(res => res.json())
      .then(data => {
        console.log('Location data:', data);
        setLocationInfo(data);
        const detectedCountry = countries.find(c => c.code === data.country);
        if (detectedCountry) {
          console.log('Detected country:', detectedCountry);
          setSelectedCountry(detectedCountry);
        } else {
          console.log('Country not found, using default');
          setSelectedCountry(countries[0]);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('IP 检测失败:', error);
        if (retryCount < 2) {
          setRetryCount(retryCount + 1);
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setLocationInfo({ 
            country: 'US', 
            ip: '检测失败', 
            city: '', 
            region: '', 
            accurate: false, 
            source: 'fallback',
            error: '无法连接到 IP 检测服务'
          });
          setSelectedCountry(countries[0]);
          setIsLoading(false);
        }
      });
  }, [retryCount]);

  // 国家变化时生成
  useEffect(() => {
    if (selectedCountry && !isLoading) {
      console.log('Country changed, generating new info');
      generate();
    }
  }, [selectedCountry, isLoading]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage(`${label} 已复制`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEmail = () => {
    if (!userInfo || !userInfo.email) return;
    window.open(`https://yopmail.com?${userInfo.email}`, '_blank');
  };

  useEffect(() => {
    if (showCountrySelect && countryListRef.current) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const selectedElement = countryListRef.current?.querySelector(`[data-country="${selectedCountry.code}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCountrySelect, selectedCountry.code]);

  const retryDetection = () => {
    setRetryCount(0);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sf-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="apple-spinner mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-600 text-base sm:text-lg font-sf-medium px-4">正在检测您的位置...</p>
          <p className="text-gray-500 text-sm mt-2">这可能需要几秒钟</p>
          {retryCount > 0 && (
            <p className="text-sf-orange text-sm mt-2">重试中 ({retryCount}/2)...</p>
          )}
        </div>
      </div>
    );
  }

  // 确保 userInfo 有值
  if (!userInfo.firstName || !userInfo.email) {
    console.warn('UserInfo is empty, showing loading...');
    return (
      <div className="min-h-screen bg-sf-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="apple-spinner mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-600 text-base sm:text-lg font-sf-medium px-4">正在生成身份信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sf-gray-50 py-4 sm:py-8 px-3 sm:px-4 font-sf">
      <div className="max-w-3xl mx-auto">
        {/* 导航栏 - 移动端优化 */}
        <header className="mb-4 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-sf-bold text-gray-900 mb-1 sm:mb-2 tracking-tight">随机身份生成器</h1>
          <p className="text-sm sm:text-base text-gray-600">测试专用 · 安全可靠</p>
        </header>

        {/* IP 信息卡片 - 移动端优化 */}
        {locationInfo && (
          <div className={`apple-card mb-4 sm:mb-6 ${locationInfo.error ? 'bg-gradient-to-br from-sf-orange/10 to-sf-red/10' : 'bg-gradient-to-br from-sf-blue/5 to-sf-purple/5'}`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-3xl sm:text-5xl">{selectedCountry?.flag || '🌍'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-2xl font-sf-semibold mb-1 text-gray-900 truncate">
                  {selectedCountry?.name || '检测中...'}
                </h3>
                <p className="text-gray-600 font-sf-mono text-xs sm:text-sm truncate">
                  IP: {locationInfo.ip}
                </p>
              </div>
            </div>

            {locationInfo.error && (
              <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-white/60 backdrop-blur-xl rounded-xl border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-700">⚠️ {locationInfo.error}</p>
                <button
                  onClick={retryDetection}
                  className="apple-button-secondary mt-2 sm:mt-3 text-xs sm:text-sm"
                >
                  重试检测
                </button>
              </div>
            )}
          </div>
        )}

        {/* 国家选择 - 移除搜索框 */}
        <div className="apple-card mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-sf-semibold text-gray-900 mb-2 sm:mb-3">
            选择国家/地区
          </label>
          
          <button
            onClick={() => setShowCountrySelect(!showCountrySelect)}
            className="apple-input flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <span className="text-xl sm:text-2xl">{selectedCountry.flag}</span>
              <span className="font-sf-semibold text-gray-900 text-sm sm:text-base truncate">{selectedCountry.name}</span>
              <span className="text-gray-600 text-xs sm:text-sm font-sf-mono whitespace-nowrap">({selectedCountry.phonePrefix})</span>
            </div>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCountrySelect && (
            <>
              <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 apple-fade-in"
                onClick={() => {
                  setShowCountrySelect(false);
                  setSearchQuery('');
                }}
              />
              
              <div className="fixed left-3 right-3 sm:left-4 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-apple-xl z-50 overflow-hidden max-w-2xl mx-auto apple-scale-in border border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-xl font-sf-bold text-gray-900">选择国家/地区</h3>
                    <button 
                      onClick={() => {
                        setShowCountrySelect(false);
                        setSearchQuery('');
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="搜索国家..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="apple-search w-full text-sm sm:text-base"
                  />
                </div>
                <div className="max-h-60 sm:max-h-96 overflow-y-auto" ref={countryListRef}>
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      data-country={country.code}
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountrySelect(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 active:bg-gray-100 transition-all border-b border-gray-100 last:border-b-0 ${
                        selectedCountry.code === country.code ? 'bg-sf-blue/5 border-l-4 border-l-sf-blue' : ''
                      }`}
                    >
                      <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{country.flag}</span>
                      <span className="font-sf-semibold text-gray-900 text-sm sm:text-base">{country.name}</span>
                      <span className="text-gray-600 ml-2 font-sf-mono text-xs sm:text-sm">({country.phonePrefix})</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 生成的信息 - 移动端优化 */}
        <div className="apple-card mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-base sm:text-xl font-sf-bold text-gray-900">生成的身份信息</h2>
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">基于 {selectedCountry.flag} {selectedCountry.name}</span>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <InfoField label="姓名" value={`${userInfo.lastName} ${userInfo.firstName}`} onCopy={copyToClipboard} />
            <InfoField label="生日" value={userInfo.birthday} onCopy={copyToClipboard} />
            <InfoField label="手机号" value={userInfo.phone} onCopy={copyToClipboard} />
            <InfoField label="密码" value={userInfo.password} onCopy={copyToClipboard} />
            <div className="space-y-2 sm:space-y-3">
              <InfoField label="邮箱" value={userInfo.email} onCopy={copyToClipboard} />
              <button onClick={openEmail} className="apple-button-success w-full text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                打开邮箱
              </button>
            </div>
          </div>

          <button onClick={generate} className="apple-button-primary w-full mt-4 sm:mt-6 text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重新生成
          </button>
        </div>

        {/* Telegram 推广 - 移动端优化 */}
        <div className="apple-card bg-gradient-to-br from-sf-blue/10 to-sf-purple/10 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-sf-bold text-gray-900 mb-1">加入 Telegram 频道</h3>
              <p className="text-xs sm:text-sm text-gray-600">获取更多实用工具</p>
            </div>
            <span className="text-2xl sm:text-3xl">✨</span>
          </div>
          <a
            href="https://t.me/fang180"
            target="_blank"
            rel="noopener noreferrer"
            className="apple-button-telegram w-full text-sm sm:text-base"
          >
            @fang180
          </a>
        </div>

        {/* 神秘代码 - 移动端优化 */}
        <div className="apple-card bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-sf-bold text-gray-900 mb-1 text-sm sm:text-base">神秘代码</h3>
              <p className="text-xs sm:text-sm text-gray-600">复制解锁特殊功能</p>
            </div>
            <button
              onClick={() => copyToClipboard('FANG180-VIP', '神秘代码')}
              className="apple-button-secondary text-xs sm:text-sm whitespace-nowrap"
            >
              复制代码
            </button>
          </div>
        </div>

        {/* 底部说明 - 移动端优化 */}
        <div className="mt-4 sm:mt-8 text-center text-xs sm:text-sm text-gray-600 space-y-1 px-2">
          <p>⚠️ 此工具仅用于测试和开发目的</p>
          <p>所有数据随机生成,不对应真实个人信息</p>
        </div>
      </div>

      {/* Toast 提示 - 移动端优化 */}
      {showToast && (
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 apple-toast z-50 text-sm sm:text-base mx-3">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, onCopy }: { label: string; value: string; onCopy: (text: string, label: string) => void }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-sf-semibold text-gray-900 mb-1.5 sm:mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          readOnly
          className="flex-1 apple-input-readonly text-xs sm:text-sm min-w-0"
        />
        <button
          onClick={() => onCopy(value, label)}
          className="apple-button-copy text-xs sm:text-sm whitespace-nowrap px-3 sm:px-5"
        >
          复制
        </button>
      </div>
    </div>
  );
}