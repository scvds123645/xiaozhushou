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
      description: "自动提取并去重14位连续数字", // 文字精简适配手机
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
    
    // 触觉反馈 (如果有 Haptic API 支持可以加，这里仅用 UI 动画)
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
      description="选择下方工具，快速完成数据处理"
      backLabel="返回"
    >
      {/* 背景装饰：手机端更淡雅的背景 */}
      <div className="fixed inset-0 bg-gray-50/80 -z-20 pointer-events-none" />
      
      {/* Main Grid: 手机端 gap 紧凑 (gap-3)，桌面端宽松 (gap-6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 p-2 sm:p-4 pb-24">
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
                /* 手机端点击缩放动画 */
                transition-transform duration-200 ease-out
                ${isLoading ? 'scale-[0.98]' : 'active:scale-[0.97] sm:hover:scale-[1.02] sm:hover:-translate-y-1'}
              `}
              // 移除手机端高亮，防止点击残留
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`
                relative z-10 overflow-hidden
                /* 手机端: 横向 Flex 布局; 桌面端: 纵向 Flex */
                flex flex-row sm:flex-col items-center sm:items-start
                /* 手机端圆角稍小 (20px), 桌面端大圆角 (32px) */
                rounded-[20px] sm:rounded-[32px]
                border
                backdrop-blur-xl
                transition-all duration-300
                /* 手机端内边距紧凑 (p-3.5), 桌面端宽松 (p-6) */
                p-3.5 sm:p-6
                h-full
                ${isLoading 
                  ? 'bg-white/90 border-blue-300 shadow-none' 
                  : 'bg-white/70 border-white/60 shadow-sm sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:hover:shadow-xl'
                }
              `}>
                
                {/* 1. 图标容器 */}
                <div className={`
                  relative shrink-0
                  /* 手机端图标: 48px (w-12); 桌面端: 60px */
                  w-12 h-12 sm:w-[60px] sm:h-[60px]
                  rounded-xl sm:rounded-[20px]
                  flex items-center justify-center
                  shadow-sm sm:shadow-md
                  bg-gradient-to-br ${tool.color}
                  transition-all duration-300
                  mr-3.5 sm:mr-0 sm:mb-6
                `}>
                  {/* 高光层 */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-[20px] bg-gradient-to-b from-white/30 to-transparent opacity-100 pointer-events-none" />
                  
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 sm:w-8 sm:h-8 text-white animate-spin" />
                  ) : (
                    <IconComponent className="w-5 h-5 sm:w-8 sm:h-8 text-white drop-shadow-sm" strokeWidth={2} />
                  )}
                </div>

                {/* 2. 文本内容区 */}
                <div className="flex-1 min-w-0 flex flex-col justify-center sm:justify-start h-full">
                  <div className="flex items-center">
                    <h3 className={`
                      text-[16px] sm:text-[19px] font-semibold tracking-tight leading-tight
                      truncate pr-2
                      ${isLoading ? 'text-blue-600' : 'text-slate-800'}
                    `}>
                      {tool.title}
                    </h3>
                  </div>
                  <p className={`
                    text-[13px] sm:text-[14px] font-medium leading-snug mt-0.5 sm:mt-2 line-clamp-1 sm:line-clamp-2
                    ${isLoading ? 'text-blue-400' : 'text-slate-500'}
                  `}>
                    {tool.description}
                  </p>
                </div>

                {/* 3. 手机端右侧指示器 (桌面端隐藏) */}
                <div className="sm:hidden shrink-0 text-slate-300 pl-2">
                  {isLoading ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  ) : (
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  )}
                </div>

                {/* 4. 桌面端底部 Action (手机端隐藏) */}
                <div className="hidden sm:flex w-full items-center justify-between pt-4 mt-auto border-t border-slate-100/50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {tool.external ? 'Open' : 'Start'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                     <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* 底部 Tips - 手机端简化显示 */}
      <div className="px-4 pb-10 sm:px-6 sm:pb-16 max-w-4xl mx-auto">
        <div className="
          relative overflow-hidden
          rounded-[24px] sm:rounded-[32px]
          bg-white/50 backdrop-blur-lg
          border border-white/60
          p-5 sm:p-8
        ">
          <div className="flex flex-col gap-4 sm:gap-8">
            {/* 标题行 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-sm sm:text-lg font-bold text-slate-800">使用小贴士</span>
            </div>

            {/* 内容 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="flex gap-3 items-start">
                <ShieldCheck className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  数据<span className="font-semibold">本地处理</span>，不上传服务器。
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  大文件建议使用 <span className="font-semibold">Chrome</span> 浏览器。
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <ExternalLink className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  外部工具可能需要特殊网络环境。
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
