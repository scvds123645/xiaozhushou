import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Hash,
  FileText,
  Cookie,
  UserCheck,
  ExternalLink,
  KeyRound,
  RefreshCw,
  ListFilter,
  AtSign,
  Sparkles,
  Store,
  ArrowRight,
  ChevronRight,
  Binary,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
  CalendarDays
} from "lucide-react";
import PageLayout from "@/components/PageLayout";

const Tools = () => {
  const navigate = useNavigate();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const tools = [
    {
      path: "/14",
      icon: Hash,
      title: "14位数字提取",
      description: "自动从文本中提取并去重14位连续数字",
      external: false,
      color: "from-blue-500 to-cyan-500", // Custom gradient for icon
    },
    {
      path: "/14d",
      icon: Binary,
      title: "FB UID 生成器",
      description: "批量生成 99 个 Facebook 账户 ID",
      external: false,
      color: "from-indigo-500 to-purple-500",
    },
    {
      path: "/discord",
      icon: FileText,
      title: "账号格式化",
      description: "批量格式化账号信息为标准格式",
      external: false,
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      path: "/jh",
      icon: Cookie,
      title: "Cookie 筛选",
      description: "快速筛选指定的Cookie字段",
      external: false,
      color: "from-amber-400 to-orange-500",
    },
    {
      path: "/cookie",
      icon: RefreshCw,
      title: "Cookie 转换",
      description: "提取c_user并转换为指定格式",
      external: false,
      color: "from-orange-400 to-red-500",
    },
    {
      path: "/qc",
      icon: ListFilter,
      title: "文本去重",
      description: "快速去除文本中的重复行",
      external: false,
      color: "from-emerald-400 to-teal-500",
    },
    {
      path: "/yopmail",
      icon: AtSign,
      title: "邮箱后缀转换",
      description: "批量格式化域名为邮箱后缀",
      external: false,
      color: "from-sky-400 to-blue-500",
    },
    {
      path: "/rj",
      icon: Store,
      title: "软件商店",
      description: "浏览并下载常用软件工具",
      external: false,
      color: "from-pink-500 to-rose-500",
    },
    {
      path: "https://3.584136.xyz",
      icon: UserCheck,
      title: "账号状态检查",
      description: "Facebook 账号状态在线检测",
      external: true,
      color: "from-slate-500 to-slate-700",
    },
    {
      path: "https://1.584136.xyz",
      icon: KeyRound,
      title: "Cookie 注入",
      description: "Facebook Cookie 快速注入",
      external: true,
      color: "from-slate-600 to-gray-800",
    },
    {
      path: "https://4.584136.xyz",
      icon: CalendarDays,
      title: "春节倒计时",
      description: "精确计算距离农历新年的剩余时间",
      external: true,
      color: "from-red-500 to-rose-600",
    },
  ];

  const handleNavigation = (path: string, isExternal: boolean) => {
    if (loadingPath) return;
    setLoadingPath(path);
    setTimeout(() => {
      if (isExternal) {
        window.open(path, "_blank");
        setLoadingPath(null);
      } else {
        navigate(path);
        setLoadingPath(null);
      }
    }, 250);
  };

  return (
    <PageLayout
      title="实用工具"
      description="选择下方工具，快速完成各种数据处理任务"
      backLabel="返回首页"
    >
      {/* 
        Apple Style Background Hint 
        (Optional: Ensures glassmorphism works if parent bg is plain)
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-gray-100/50 -z-10 pointer-events-none" />

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const isLoading = loadingPath === tool.path;

          return (
            <div
              key={tool.path}
              onClick={() => handleNavigation(tool.path, tool.external)}
              className={`
                group relative 
                h-full w-full
                cursor-pointer 
                select-none
                transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                ${isLoading ? 'scale-[0.98] opacity-90' : 'hover:scale-[1.02] hover:-translate-y-1 active:scale-95'}
              `}
            >
              {/* Card Surface (Glassmorphism) */}
              <div className={`
                relative z-10 flex flex-col h-full
                overflow-hidden
                rounded-[32px] 
                backdrop-blur-xl 
                border 
                transition-colors duration-300
                ${isLoading 
                  ? 'bg-white/80 border-blue-200/50 shadow-none' 
                  : 'bg-white/60 border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-white/60'
                }
              `}>
                
                {/* Inner Content Layout */}
                <div className="p-5 sm:p-6 flex flex-row sm:flex-col gap-5 sm:gap-6 items-center sm:items-start h-full">
                  
                  {/* App Icon Style Container */}
                  <div className={`
                    relative shrink-0
                    w-[52px] h-[52px] sm:w-[60px] sm:h-[60px]
                    rounded-2xl sm:rounded-[20px]
                    flex items-center justify-center
                    shadow-md
                    bg-gradient-to-br ${tool.color}
                    transition-all duration-300
                    ${isLoading ? 'scale-90 opacity-80' : 'group-hover:shadow-lg group-hover:scale-105'}
                  `}>
                    {/* Inner Reflection/Gloss (Top Highlight) */}
                    <div className="absolute inset-0 rounded-2xl sm:rounded-[20px] bg-gradient-to-b from-white/30 to-transparent opacity-100 pointer-events-none" />
                    
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
                    ) : (
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-md" strokeWidth={2} />
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center sm:justify-start">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[17px] sm:text-[19px] font-semibold text-gray-900 tracking-tight leading-snug">
                        {tool.title}
                      </h3>
                      {tool.external && (
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 sm:hidden ml-2 opacity-60" />
                      )}
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium leading-relaxed line-clamp-2 mt-1 sm:mt-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Action Arrow (Mobile: Chevron, Desktop: Bottom Row) */}
                  <div className="sm:w-full sm:mt-auto sm:pt-2">
                     {/* Mobile Arrow */}
                    <div className="sm:hidden text-gray-300">
                      {isLoading ? <span className="block w-2 h-2 bg-gray-400 rounded-full animate-pulse"/> : <ChevronRight className="w-6 h-6 opacity-40" />}
                    </div>

                    {/* Desktop Action Row */}
                    <div className="hidden sm:flex items-center justify-between pt-4 border-t border-gray-100/50 mt-auto">
                      <span className={`
                        text-xs font-semibold tracking-wide uppercase
                        transition-colors duration-300
                        ${isLoading ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-600'}
                      `}>
                        {tool.external ? 'Open Link' : 'Open Tool'}
                      </span>
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        bg-gray-100/50 group-hover:bg-blue-50
                        transition-all duration-300
                        ${isLoading ? 'translate-x-1' : 'group-hover:translate-x-1'}
                      `}>
                        <ArrowRight className={`w-3.5 h-3.5 ${isLoading ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-600'}`} />
                      </div>
                    </div>
                  </div>

                </div>
                
                {/* External Link Badge (Desktop) */}
                {tool.external && (
                  <div className="hidden sm:block absolute top-4 right-4">
                    <div className="bg-gray-100/80 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <ExternalLink className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 
        Tips Section - "Widget" Style 
        Designed to look like an iOS Widget Stack
      */}
      <div className="mt-10 sm:mt-16 pb-12 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="
            relative overflow-hidden border-0
            rounded-[32px]
            bg-white/40 backdrop-blur-xl
            shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]
            ring-1 ring-white/60
          ">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-indigo-50/20 pointer-events-none" />
            
            <div className="relative p-8 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                
                {/* Header / Icon Column */}
                <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-6 shrink-0">
                  <div className="
                    w-14 h-14 sm:w-16 sm:h-16 
                    rounded-[20px] bg-gradient-to-br from-indigo-500 to-blue-600
                    shadow-lg shadow-indigo-500/20
                    flex items-center justify-center text-white
                  ">
                    <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                      Tips
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">使用指南</p>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                  {/* Tip Item 1 */}
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-[15px] font-semibold text-gray-800">隐私安全</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      所有文本处理均在<span className="text-gray-700 font-medium">本地浏览器</span>完成，数据绝不会上传至云端服务器。
                    </p>
                  </div>

                  {/* Tip Item 2 */}
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="text-[15px] font-semibold text-gray-800">性能优化</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      处理超大数据量时，推荐使用 <span className="text-gray-700 font-medium">Chrome</span> 或 Edge 浏览器以获得最佳性能。
                    </p>
                  </div>

                  {/* Tip Item 3 */}
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h4 className="text-[15px] font-semibold text-gray-800">外部链接</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      带有箭头的工具为第三方服务，可能需要特定的网络环境。
                    </p>
                  </div>

                  {/* Tip Item 4 */}
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                        <Cookie className="w-4 h-4" />
                      </div>
                      <h4 className="text-[15px] font-semibold text-gray-800">Cookie 格式</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      请确保输入格式为标准的 <span className="text-gray-700 font-medium">Netscape</span> 或 JSON 格式。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Tools;
