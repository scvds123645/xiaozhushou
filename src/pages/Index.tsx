import React, { useState } from 'react';
import { Search, Share, Star } from 'lucide-react';

// 更新后的数据列表
const MOCK_APPS = [
  {
    id: 1,
    name: "Facebook",
    category: "Social Networking",
    rating: 4.2,
    reviews: "180M+",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Facebook_icon.webp",
    downloadUrl: "https://quwenjian.cc/share/download?key=b703e78f98bf6a75a8e08ce215e5fdb635803d58b049f17b99fd3232f5a1d46b&code=ULPHA",
    description: "Connect with friends, family and the world."
  },
  {
    id: 2,
    name: "Gmail",
    category: "Productivity",
    rating: 4.8,
    reviews: "10M+",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Gmail_icon.webp",
    downloadUrl: "https://quwenjian.cc/share/download?key=8c3fc56d9b8fec6fbdeb859681d1e049bb3c789cdb536995e0c609a9c727bdc7&code=WSO6N",
    description: "Secure, smart, and easy to use email."
  },
  {
    id: 3,
    name: "Outlook",
    category: "Productivity",
    rating: 4.6,
    reviews: "5M+",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Outlook_icon.webp",
    downloadUrl: "https://quwenjian.cc/share/download?key=08933905a824efbeea556cbef72061fc38d4a18699652ae99a0fbf6efac89d94&code=RZX6G",
    description: "Connect, organize, and get things done."
  },
  {
    id: 4,
    name: "Zoho Mail",
    category: "Business",
    rating: 4.5,
    reviews: "500K",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Zoho%20Mail_icon.webp",
    downloadUrl: "https://quwenjian.cc/share/download?key=df5cd5c66b7241328f46efdc2604caf7b4363589ce1098483ff8f483ddc71938&code=13HA9",
    description: "Secure business email and calendar."
  },
  {
    id: 5,
    name: "Via浏览器",
    category: "Utilities",
    rating: 4.9,
    reviews: "2M",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Via_6.8.0.apk_icon.webp",
    downloadUrl: "https://res.viayoo.com/v1/via-release-cn.apk",
    description: "Fast, light, and geeky browser choice."
  },
  {
    id: 6,
    name: "绿茶VPN",
    category: "Utilities",
    rating: 4.7,
    reviews: "850K",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/%E7%BB%BF%E8%8C%B6VPN_icon.webp",
    downloadUrl: "https://quwenjian.cc/share/download?key=86241c3ad7502c7370372fdde2a1a423bb97f581ec8b7463aa9623754441e7f7&code=YIVYA",
    description: "Secure, fast and private internet access."
  },
  {
    id: 7,
    name: "Discord",
    category: "Social",
    rating: 4.8,
    reviews: "5M+",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Discord_icon.webp",
    downloadUrl: "https://quwenjian.cc/share/download?key=29eb683c5e92e7d340bbe7cff8c830369416921513ce89de55b602257758c119&code=E3A9B",
    description: "Talk, chat, and hang out with friends."
  },
  {
    id: 8,
    name: "脸书白号卡网",
    category: "Marketplace",
    rating: 4.4,
    reviews: "10K",
    icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/telegam@fb180.jpg",
    downloadUrl: "https://fh10.zmfaka.cn/item/c24vp9/",
    description: "Premium account marketplace."
  },
  {
    id: 9,
    name: "3万多个未180脸书账号",
    category: "Data Resource",
    rating: 5.0,
    reviews: "2K",
    // 使用了一个通用的文件图标 SVG
    icon: "https://api.dicebear.com/7.x/initials/svg?seed=TXT&backgroundColor=7f8c8d&textColor=white",
    downloadUrl: "https://quwenjian.cc/share/download?key=0d5a04e745f8d04ae5c327f7c4ccb29232daefa6dfb37ab79b6542c57174d64f&code=53HWU",
    description: "Large collection of account data."
  },
];

const SoftwareDownload = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // 简单的搜索过滤逻辑
  const filteredApps = MOCK_APPS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // 1. pb-safe: 预留底部安全区
    // 2. -webkit-tap-highlight-color: transparent: 移除原生点击高亮，使用自定义 active 效果
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1d1d1f] pb-20 selection:bg-[#0071e3] selection:text-white cursor-default">
      
      {/* 顶部导航区域 (Sticky Header 效果可按需添加) */}
      <div className="px-5 pt-12 pb-6 md:pt-16 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:items-center md:gap-8">
          
          {/* iOS Large Title: 手机左对齐，桌面可能居中或保持左对齐 */}
          <h1 className="text-[34px] leading-[41px] md:text-5xl font-bold tracking-tight text-[#1d1d1f] text-left md:text-center">
            Resources
          </h1>
          {/* iOS 风格搜索栏 */}
          <div className="relative w-full md:max-w-lg group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-[18px] w-[18px] text-[#86868b] group-focus-within:text-[#1d1d1f] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search apps & files"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // text-[17px] 防止 iOS Safari 输入时自动放大
              className="w-full bg-[#E5E5EA] text-[#1d1d1f] placeholder-[#86868b] rounded-[10px] py-2.5 pl-9 pr-4 text-[17px] leading-none focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 主要内容列表 */}
      {/* px-4: 手机端边距减小，grid-cols-1: 手机端单列 */}
      <div className="px-4 md:px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {filteredApps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};

const AppCard = ({ app }) => {
  return (
    // active:scale-[0.96] 提供更明显的手机端点击反馈
    <div className="group relative bg-white rounded-[20px] md:rounded-[2rem] p-5 md:p-6 flex flex-col 
      shadow-[0_2px_10px_rgb(0,0,0,0.03)] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)]
      transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
      hover:md:scale-[1.02] hover:md:shadow-[0_20px_40px_rgb(0,0,0,0.08)]
      active:scale-[0.96]">
      
      <div className="flex items-start gap-4">
        {/* App Icon: 手机端稍小 (w-16), 桌面端正常 (w-20) */}
        <div className="w-[64px] h-[64px] md:w-20 md:h-20 rounded-[14px] md:rounded-[22px] overflow-hidden border border-black/5 shadow-sm shrink-0 relative z-10 bg-gray-50">
          <img 
            src={app.icon} 
            alt={app.name} 
            className="w-full h-full object-cover"
            onError={(e) => {e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=Fallback"}} // 简单的错误回退
          />
        </div>
        
        {/* Info Section */}
        <div className="flex flex-col flex-1 pt-0.5 min-w-0">
          <div className="flex justify-between items-start">
            <div className="pr-2">
              <h3 className="text-[17px] md:text-xl font-semibold text-[#1d1d1f] leading-tight tracking-tight truncate">
                {app.name}
              </h3>
              <p className="text-[13px] md:text-sm text-[#86868b] font-medium truncate mt-0.5">
                {app.category}
              </p>
            </div>
            
            {/* Get Button (Mobile Compact): 改为 Link 以支持直接下载 */}
            <a 
              href={app.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#eff0f2] text-[#0071e3] font-bold rounded-full px-5 py-1.5 text-[13px] md:text-sm uppercase tracking-wide
              md:bg-[#0071e3] md:text-white md:shadow-md md:shadow-[#0071e3]/20
              active:bg-[#0071e3]/10 md:active:bg-[#0071e3] md:active:brightness-90
              transition-all transform active:scale-95 shrink-0 no-underline text-center"
            >
              Get
            </a>
          </div>
          
          {/* Rating Row */}
          <div className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-[#86868b] mt-1.5">
            <Star className="w-3 h-3 fill-[#86868b] text-[#86868b]" />
            <span className="tabular-nums">{app.rating}</span>
            <span className="mx-1 text-[#d1d1d6]">•</span>
            <span className="tabular-nums">{app.reviews}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[#f5f5f7] flex items-center justify-between">
        {/* Description: line-clamp-1 在手机端保持整洁 */}
        <p className="text-[#1d1d1f]/70 text-[13px] md:text-sm font-medium line-clamp-1 mr-4">
          {app.description}
        </p>
        {/* Share Button */}
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] text-[#0071e3] 
          transition-transform active:scale-90 hover:bg-[#E5E5EA]"
          aria-label="Share"
          onClick={() => {
              if (navigator.share) {
                  navigator.share({
                      title: app.name,
                      url: app.downloadUrl
                  }).catch(console.error);
              } else {
                  // Fallback logic can be added here
                  alert("Link copied: " + app.downloadUrl);
              }
          }}
        >
          <Share className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

export default SoftwareDownload;
