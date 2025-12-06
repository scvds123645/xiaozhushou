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

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(countries[1]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 检测用户国家
  useEffect(() => {
    fetch('/api/country')
      .then(res => res.json())
      .then(data => {
        const country = getCountryConfig(data.country);
        setSelectedCountry(country);
      })
      .catch(() => {
        // 默认使用美国
        setSelectedCountry(countries[1]);
      });
  }, []);

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

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎲 随机身份生成器</h1>
          <p className="text-gray-600">快速生成逼真的身份信息</p>
        </div>

        {/* 国家选择 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择国家
          </label>
          <input
            type="text"
            placeholder="搜索国家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors ${
                  selectedCountry.code === country.code ? 'bg-indigo-100' : ''
                }`}
              >
                <span className="text-2xl mr-2">{country.flag}</span>
                <span className="font-medium">{country.name}</span>
                <span className="text-gray-500 ml-2">({country.phonePrefix})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 生成的信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <InfoField label="姓名" value={`${userInfo.lastName} ${userInfo.firstName}`} onCopy={copyToClipboard} />
            <InfoField label="生日" value={userInfo.birthday} onCopy={copyToClipboard} />
            <InfoField label="手机号" value={userInfo.phone} onCopy={copyToClipboard} />
            <InfoField label="密码" value={userInfo.password} onCopy={copyToClipboard} />
            <div className="flex gap-2">
              <InfoField label="邮箱" value={userInfo.email} onCopy={copyToClipboard} />
              <button
                onClick={openEmail}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium whitespace-nowrap"
              >
                打开邮箱
              </button>
            </div>
          </div>

          <button
            onClick={generate}
            className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
          >
            🔄 重新生成
          </button>
        </div>

        {/* 推广卡片 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">加入我们的 Telegram 频道</h3>
              <p className="text-purple-100">获取更多实用工具和资源</p>
            </div>
            <span className="text-4xl">📱</span>
          </div>
          <a
            href="https://t.me/fang180"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
          >
            @fang180
          </a>
        </div>

        {/* 神秘代码 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">🎁 神秘代码</h3>
              <p className="text-sm text-gray-600 mt-1">复制此代码解锁特殊功能</p>
            </div>
            <button
              onClick={() => copyToClipboard('FANG180-VIP', '神秘代码')}
              className="px-6 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              复制代码
            </button>
          </div>
        </div>
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
}

// 信息字段组件
function InfoField({ label, value, onCopy }: { label: string; value: string; onCopy: (text: string, label: string) => void }) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          readOnly
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
        />
        <button
          onClick={() => onCopy(value, label)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          复制
        </button>
      </div>
    </div>
  );
}