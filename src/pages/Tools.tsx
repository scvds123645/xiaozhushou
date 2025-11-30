import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CalendarDays,
  ArrowUpRight
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
      description: "自动提取并去重14位连续数字",
      external: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      path: "/14d",
      icon: Binary,
      title: "FB UID 生成器",
      description: "批量生成 99 个账户 ID",
      external: false,
      color: "from-indigo-500 to-purple-500",
    },
    {
      path: "/discord",
      icon: FileText,
      title: "账号格式化",
      description: "格式化账号为标准格式",
      external: false,
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      path: "/jh",
      icon: Cookie,
      title: "Cookie 筛选",
      description: "快速筛选指定字段",
      external: false,
      color: "from-amber-400 to-orange-500",
    },
    {
      path: "/cookie",
      icon: RefreshCw,
      title: "Cookie 转换",
      description: "提取 c_user 并转换格式",
      external: false,
      color: "from-orange-400 to-red-500",
    },
    {
      path: "/qc",
      icon: ListFilter,
      title: "文本去重",
      description: "快速去除重复行",
      external: false,
      color: "from-emerald-400 to-teal-500",
    },
    {
      path: "/yopmail",
      icon: AtSign,
      title: "邮箱后缀转换",
      description: "批量格式化为邮箱后缀",
      external: false,
      color: "from-sky-400 to-blue-500",
    },
    {
      path: "/rj",
      icon: Store,
      title: "软件商店",
      description: "下载常用软件工具",
      external: false,
      color: "from-pink-500 to-rose-500",
    },
    {
      path: "https://3.584136.xyz",
      icon: UserCheck,
      title: "账号检查",
      description: "Facebook 账号状态检测",
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
      description: "计算距离农历新年时间",
      external: true,
      color: "from-red-500 to-rose-600",
    },
  ];

  const handleNavigation = (path: string, isExternal: boolean) => {
    if (loadingPath) return;
    setLoadingPath(path);

    // Simulating iOS "Spring" delay for visual feedback
    setTimeout(() => {
      if (isExternal) {
        window.open(path, "_blank");
        setLoadingPath(null);
      } else {
        navigate(path);
        setLoadingPath(null);
      }
    }, 300);
  };

  return (
    <PageLayout
      title="实用工具"
      description="选择下方工具，快速完成数据处理"
      backLabel="返回"
    >
      {/* Global Background: Apple System Gray 6 equivalent */}
      <div className="fixed inset-0 bg-[#F5F5F7] -z-50" />
      
      {/* Subtle Gradient Mesh for Glass Depth (Optional, adds that premium feel) */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent -z-40 pointer-events-none" />

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 p-4 sm:p-6 pb-32 max-w-7xl mx-auto">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const isLoading = loadingPath === tool.path;

          return (
            <div
              key={tool.path}
              onClick={() => handleNavigation(tool.path, tool.external)}
              className={`
                group relative w-full
                cursor-pointer select-none
                /* Physics: Spring Animation */
                transform transition-all duration-300 ease-out
                ${isLoading ? 'scale-[0.96] opacity-80' : 'active:scale-[0.96] sm:hover:scale-[1.02] sm:hover:-translate-y-1'}
              `}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`
                relative z-10 overflow-hidden
                h-full w-full
                
                /* Layout: Mobile List vs Desktop Card */
                flex flex-row sm:flex-col items-center sm:items-start
                
                /* Glass Material */
                backdrop-blur-2xl saturate-150
                ${isLoading 
                  ? 'bg-white/90 ring-2 ring-blue-500/20' 
                  : 'bg-white/70 hover:bg-white/80 sm:bg-white/60 sm:hover:bg-white/90'
                }
                
                /* Borders & Depth - The "Apple" Ring */
                border border-white/40
                ring-1 ring-black/5
                
                /* Soft Shadows */
                shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]
                sm:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]
                
                /* Shape */
                rounded-[20px] sm:rounded-[30px]
                
                /* Spacing */
                p-3.5 sm:p-6
                
                transition-all duration-300
              `}>
                
                {/* 1. Icon Container (iOS App Icon Style) */}
                <div className={`
                  relative shrink-0
                  
                  /* Dimensions */
                  w-[48px] h-[48px] sm:w-[64px] sm:h-[64px]
                  
                  /* Squircle-ish Shape */
                  rounded-[14px] sm:rounded-[18px]
                  
                  /* Centering */
                  flex items-center justify-center
                  
                  /* Gradient & Shadow */
                  bg-gradient-to-br ${tool.color}
                  shadow-inner
                  
                  mr-4 sm:mr-0 sm:mb-5
                  transition-transform duration-300 group-active:scale-90
                `}>
                  {/* Glossy Sheen Overlay */}
                  <div className="absolute inset-0 rounded-[14px] sm:rounded-[18px] bg-gradient-to-b from-white/25 to-transparent opacity-100 pointer-events-none" />
                  
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin drop-shadow-md" />
                  ) : (
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-md" strokeWidth={2.5} />
                  )}
                </div>

                {/* 2. Text Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center sm:justify-start h-full">
                  <div className="flex items-center justify-between w-full">
                    <h3 className={`
                      text-[17px] sm:text-[20px] font-semibold tracking-tight
                      truncate pr-2
                      ${isLoading ? 'text-blue-600' : 'text-gray-900'}
                    `}>
                      {tool.title}
                    </h3>
                    
                    {/* External Link Indicator (Mobile Only) */}
                    {tool.external && (
                       <ArrowUpRight className="w-4 h-4 text-gray-400 sm:hidden opacity-50" />
                    )}
                  </div>
                  
                  <p className={`
                    text-[13px] sm:text-[15px] font-medium leading-snug mt-0.5 sm:mt-2 
                    line-clamp-1 sm:line-clamp-2
                    text-gray-500 group-hover:text-gray-600
                    transition-colors
                  `}>
                    {tool.description}
                  </p>
                </div>

                {/* 3. Mobile Navigation Arrow */}
                <div className="sm:hidden shrink-0 text-gray-300 pl-2">
                  {!tool.external && !isLoading && (
                    <ChevronRight className="w-5 h-5 opacity-40" strokeWidth={2.5} />
                  )}
                </div>

                {/* 4. Desktop Footer Action */}
                <div className="hidden sm:flex w-full items-center justify-between pt-4 mt-auto border-t border-gray-200/30">
                  <span className={`
                    text-[11px] font-bold uppercase tracking-widest
                    transition-colors duration-300
                    ${tool.external ? 'text-gray-400' : 'text-gray-400 group-hover:text-blue-500'}
                  `}>
                    {tool.external ? 'Open External' : 'Application'}
                  </span>
                  
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300
                    bg-gray-100/50 group-hover:bg-blue-50
                  `}>
                     {tool.external ? (
                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                     ) : (
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                     )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Tips Section - iOS Widget Style */}
      <div className="px-4 pb-12 sm:px-6 sm:pb-20 max-w-4xl mx-auto">
        <div className="
          relative overflow-hidden
          rounded-[24px] sm:rounded-[36px]
          bg-white/60 backdrop-blur-xl saturate-150
          border border-white/40 ring-1 ring-black/5
          shadow-lg
          p-6 sm:p-10
        ">
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">使用小贴士</h4>
                <p className="text-sm text-gray-500 font-medium">Tips for better efficiency</p>
              </div>
            </div>

            {/* Tips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>隐私安全</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  所有数据仅在<span className="text-gray-700 font-medium">本地浏览器</span>处理，绝不会上传至云端服务器。
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>性能建议</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  处理大量数据时，建议使用 <span className="text-gray-700 font-medium">Chrome</span> 或 Edge 以获得最佳速度。
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span>网络环境</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  部分外部工具可能需要特定的网络环境才能正常访问。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Tools;
