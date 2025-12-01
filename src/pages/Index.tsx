import React, { useState } from 'react';
import { Search, Share, Star, Download, MoreHorizontal } from 'lucide-react'; // Assuming lucide-react for icons

// Mock data to demonstrate the UI
const MOCK_APPS = [
  {
    id: 1,
    name: "Flowstate",
    category: "Productivity",
    rating: 4.8,
    reviews: "12K",
    icon: "https://api.dicebear.com/7.x/shapes/svg?seed=Flowstate&backgroundColor=0071e3",
    description: "Focus on what matters."
  },
  {
    id: 2,
    name: "Velvet",
    category: "Design",
    rating: 4.9,
    reviews: "8.5K",
    icon: "https://api.dicebear.com/7.x/shapes/svg?seed=Velvet&backgroundColor=FF2D55",
    description: "Silky smooth editing."
  },
  {
    id: 3,
    name: "Nebula",
    category: "Utilities",
    rating: 4.7,
    reviews: "4K",
    icon: "https://api.dicebear.com/7.x/shapes/svg?seed=Nebula&backgroundColor=5856D6",
    description: "Space management."
  },
];

const SoftwareDownload = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1d1d1f] p-6 md:p-10 selection:bg-[#0071e3] selection:text-white">
      
      {/* Header & Search Section */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col items-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f]">
          Apps
        </h1>

        {/* iOS-style Search Bar */}
        <div className="relative group w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#86868b] group-focus-within:text-[#1d1d1f] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#E5E5EA] text-[#1d1d1f] placeholder-[#86868b] rounded-[12px] py-3 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {MOCK_APPS.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};

const AppCard = ({ app }) => {
  return (
    <div className="group relative bg-white rounded-[2rem] p-6 flex flex-col 
      shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
      transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
      hover:scale-[1.02] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]
      active:scale-[0.98]">
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          {/* App Icon - Squircle with subtle border */}
          <div className="w-20 h-20 rounded-[22px] overflow-hidden border border-black/5 shadow-sm shrink-0">
            <img 
              src={app.icon} 
              alt={app.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* App Info */}
          <div className="flex flex-col pt-1">
            <h3 className="text-xl font-bold text-[#1d1d1f] leading-tight tracking-tight">
              {app.name}
            </h3>
            <p className="text-sm text-[#86868b] font-medium mb-1">
              {app.category}
            </p>
            {/* Rating (Monospaced numbers) */}
            <div className="flex items-center gap-1 text-xs font-medium text-[#86868b]">
              <Star className="w-3 h-3 fill-[#86868b] text-[#86868b]" />
              <span className="tabular-nums">{app.rating}</span>
              <span className="mx-1">•</span>
              <span className="tabular-nums">{app.reviews}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between">
        {/* Description */}
        <p className="text-[#1d1d1f]/80 text-sm font-medium line-clamp-2 mr-4">
          {app.description}
        </p>

        <div className="flex items-center gap-3 shrink-0">
          {/* Share Button - Secondary */}
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F7] text-[#0071e3] 
            transition-transform active:scale-95 hover:bg-[#E5E5EA]"
            aria-label="Share"
          >
            <Share className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Get Button - Primary */}
          <button className="bg-[#0071e3] text-white font-bold rounded-full px-7 py-1.5 text-sm uppercase tracking-wide
            shadow-md shadow-[#0071e3]/20
            transition-transform active:scale-95 hover:brightness-110">
            Get
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoftwareDownload;
