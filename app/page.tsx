'use client';

import { useState, useEffect } from 'react';
import { countries, CountryConfig } from '@/lib/countryData';
import { generateName, generateBirthday, generatePhone, generatePassword, generateEmail, getCountryConfig } from '@/lib/generator';

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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showCountrySelect, setShowCountrySelect] = useState(false);

  // 检测用户国家和 IP
  useEffect(() => {
    setIsLoading(true);
    
    fetch('/api/ip-info')
      .then(res => res.json())
      .then(data => {
        console.log('=== IP 检测结果 ===');
        console.log('返回的数据:', data);
        console.log('国家代码:', data.country);
        
        setLocationInfo(data);
        
        const detectedCountry = countries.find(c => c.code === data.country);
        
        if (detectedCountry) {
          console.log('找到匹配的国家:', detectedCountry.name, detectedCountry.code);
          setSelectedCountry(detectedCountry);
        } else {
          console.warn('未找到国家代码:', data.country, '使用默认(中国)');
          setSelectedCountry(countries[0]);
        }
        
        setIsLoading(false);
      })
      .catch(error => {
        console.error('IP 检测失败:', error);
        
        if (retryCount < 2) {
          console.log(`重试 IP 检测 (${retryCount + 1}/2)...`);
          setRetryCount(retryCount + 1);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setLocationInfo({ 
            country: 'CN', 
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

  // 生成用户信息
  const generate = () => {
    const name = generateName(selectedCountry.code);
    const info: UserInfo = {
      firstName: name.firstName,
      lastName: name.lastName,
      birthday: generateBirthday(),
      phone: generatePhone(selectedCountry),
      password: generatePassword(),
      email: generateEmail(name.firstName, name.lastName),
    };
    setUserInfo(info);
  };

  // 初始生成
  useEffect(() => {
    if (selectedCountry) {
      generate();
    }
  }, [selectedCountry]);

  // 复制到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage(`${label} 已复制!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  // 过滤国家
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 打开邮箱
  const openEmail = () => {
    if (!userInfo) return;
    const domain = userInfo.email.split('@')[1];
    const url = domain === 'yopmail.com' 
      ? `https://yopmail.com/?${userInfo.email.split('@')[0]}`
      : `https://${domain}`;
    window.open(url, '_blank');
  };

  // 手动重新检测 IP
  const retryDetection = () => {
    setRetryCount(0);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg font-medium px-4">正在检测您的位置...</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">这可能需要几秒钟</p>
          {retryCount > 0 && (
            <p className="text-orange-600 text-xs sm:text-sm mt-2">重试中 ({retryCount}/2)...</p>
          )}
        </div>
      </div>
    );
  }

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">🎲 随机身份生成器</h1>
          <p className="text-xs sm:text-base text-gray-600">智能检测您的位置</p>
        </div>

        {/* IP 地址信息卡片 - 移动端优化 */}
        {locationInfo && (
          <div className={`rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white ${
            locationInfo.error 
              ? 'bg-gradient-to-r from-orange-500 to-red-500' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="text-4xl sm:text-6xl">{selectedCountry?.flag || '🌍'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 truncate">
                  {selectedCountry?.name || '检测中...'}
                </h3>
                <p className="text-blue-100 text-sm sm:text-lg font-mono truncate">
                  IP: {locationInfo.ip}
                </p>
              </div>
            </div>

            {locationInfo.error ? (
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
                <p className="text-xs sm:text-sm">⚠️ {locationInfo.error}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={retryDetection}
                    className="px-3 py-1.5 sm:py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium active:scale-95 transition-transform"
                  >
                    🔄 重试检测
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
                <p className="text-xs sm:text-sm text-blue-100">
                  💡 生成的身份信息将基于 <span className="font-bold">{selectedCountry?.name || '检测到的国家'}</span> 的格式
                </p>
              </div>
            )}
          </div>
        )}

        {/* 国家选择 - 移动端优化 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            选择国家 <span className="text-gray-500 text-xs">(可手动更改)</span>
          </label>
          
          {/* 当前选中的国家 - 点击展开 */}
          <button
            onClick={() => setShowCountrySelect(!showCountrySelect)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-left flex items-center justify-between active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{selectedCountry.flag}</span>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{selectedCountry.name}</span>
              <span className="text-gray-600 text-xs sm:text-sm font-medium">({selectedCountry.phonePrefix})</span>
            </div>
            <span className="text-gray-400">{showCountrySelect ? '▲' : '▼'}</span>
          </button>

          {/* 展开的国家列表 */}
          {showCountrySelect && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="🔍 搜索国家..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
              />
              <div className="max-h-48 sm:max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country);
                      setShowCountrySelect(false);
                      setSearchQuery('');
                      console.log('手动选择国家:', country.name, country.code);
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-indigo-50 active:bg-indigo-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedCountry.code === country.code ? 'bg-indigo-100 border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <span className="text-lg sm:text-2xl mr-2 sm:mr-3">{country.flag}</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{country.name}</span>
                    <span className="text-gray-600 ml-2 font-medium text-xs sm:text-sm">({country.phonePrefix})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 生成的信息 - 移动端优化 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-800">🆔 生成的身份信息</h2>
            <span className="text-xs sm:text-sm text-gray-500">基于 {selectedCountry.flag} {selectedCountry.name}</span>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <InfoField label="姓名" value={`${userInfo.lastName} ${userInfo.firstName}`} onCopy={copyToClipboard} />
            <InfoField label="生日" value={userInfo.birthday} onCopy={copyToClipboard} />
            <InfoField label="手机号" value={userInfo.phone} onCopy={copyToClipboard} />
            <InfoField label="密码" value={userInfo.password} onCopy={copyToClipboard} />
            <div className="space-y-2">
              <InfoField label="邮箱" value={userInfo.email} onCopy={copyToClipboard} />
              <button
                onClick={openEmail}
                className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-all text-sm font-medium"
              >
                📬 打开邮箱
              </button>
            </div>
          </div>

          <button
            onClick={generate}
            className="w-full mt-4 sm:mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all font-medium text-base sm:text-lg shadow-md"
          >
            🔄 重新生成
          </button>
        </div>

        {/* 推广卡片 - 移动端优化 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-xl font-bold mb-1">📱 加入 Telegram 频道</h3>
              <p className="text-purple-100 text-xs sm:text-sm">获取更多实用工具</p>
            </div>
            <span className="text-3xl sm:text-4xl">✨</span>
          </div>
          <a
            href="https://t.me/fang180"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-6 py-2.5 sm:py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 active:scale-95 transition-all font-medium shadow-md text-sm sm:text-base"
          >
            @fang180
          </a>
        </div>

        {/* 神秘代码 - 移动端优化 */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">🎁 神秘代码</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">复制解锁特殊功能</p>
            </div>
            <button
              onClick={() => copyToClipboard('FANG180-VIP', '神秘代码')}
              className="px-4 sm:px-6 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 active:scale-95 transition-all font-medium shadow-md text-xs sm:text-sm whitespace-nowrap"
            >
              复制代码
            </button>
          </div>
        </div>

        {/* 底部说明 - 移动端优化 */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 px-2">
          <p>⚠️ 此工具仅用于测试和开发目的</p>
          <p className="mt-1">所有数据随机生成,不对应真实个人信息</p>
          <p className="mt-2 text-xs text-gray-500">IP 检测使用第三方 API</p>
        </div>
      </div>

      {/* Toast 提示 - 移动端优化 */}
      {showToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-gray-800 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50 text-sm sm:text-base text-center">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
}

// 信息字段组件 - 移动端优化
function InfoField({ label, value, onCopy }: { label: string; value: string; onCopy: (text: string, label: string) => void }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5 sm:mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          readOnly
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-xs sm:text-base font-medium min-w-0"
        />
        <button
          onClick={() => onCopy(value, label)}
          className="px-3 sm:px-5 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all text-xs sm:text-sm font-semibold shadow-sm whitespace-nowrap"
        >
          复制
        </button>
      </div>
    </div>
  );
}