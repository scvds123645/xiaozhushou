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
  CalendarDays // 新增：引入日历图标
} from "lucide-react";
import PageLayout from "@/components/PageLayout";

const Tools = () => {
  const navigate = useNavigate();
  // 状态：用于追踪当前哪个路径正在跳转中，实现"排他性"的加载状态
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const tools = [
    {
      path: "/14",
      icon: Hash,
      title: "14位数字提取",
      description: "自动从文本中提取并去重14位连续数字",
      external: false,
    },
    {
      path: "/14d",
      icon: Binary,
      title: "FB UID 生成器",
      description: "批量生成 99 个 Facebook 账户 ID",
      external: false,
    },
    {
      path: "/discord",
      icon: FileText,
      title: "账号格式化",
      description: "批量格式化账号信息为标准格式",
      external: false,
    },
    {
      path: "/jh",
      icon: Cookie,
      title: "Cookie 筛选",
      description: "快速筛选指定的Cookie字段",
      external: false,
    },
    {
      path: "/cookie",
      icon: RefreshCw,
      title: "Cookie 转换",
      description: "提取c_user并转换为指定格式",
      external: false,
    },
    {
      path: "/qc",
      icon: ListFilter,
      title: "文本去重",
      description: "快速去除文本中的重复行",
      external: false,
    },
    {
      path: "/yopmail",
      icon: AtSign,
      title: "邮箱后缀转换",
      description: "批量格式化域名为邮箱后缀",

      external: false,
    },
    {
      path: "/rj",
      icon: Store,
      title: "软件商店",
      description: "浏览并下载常用软件工具",
      external: false,
    },
    {
      path: "https://3.584136.xyz",
      icon: UserCheck,
      title: "账号状态检查",
      description: "Facebook 账号状态在线检测",
      external: true,
    },
    {
      path: "https://1.584136.xyz",
      icon: KeyRound,
      title: "Cookie 注入",
      description: "Facebook Cookie 快速注入",
      external: true,
    },
    // --- 新增部分 ---
    {
      path: "https://4.584136.xyz",
      icon: CalendarDays,
      title: "春节倒计时",
      description: "精确计算距离农历新年的剩余时间",
      external: true,
    },
  ];

  const handleNavigation = (path: string, isExternal: boolean) => {
    // 1. 防抖：如果已经有任务在处理中，忽略新的点击
    if (loadingPath) return;

    // 2. 设置当前点击的卡片进入 Loading 态
    setLoadingPath(path);

    // 3. 添加 250ms 延迟，让用户看清点击反馈动画
    setTimeout(() => {
      if (isExternal) {
        window.open(path, '_blank');
        setLoadingPath(null); // 外部链接跳转后需重置状态
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 p-1 sm:p-2">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const isLoading = loadingPath === tool.path;
          
          return (
            <Card
              key={tool.path}
              onClick={() => handleNavigation(tool.path, tool.external)}
              className={`
                group relative cursor-pointer overflow-hidden
                bg-white border
                rounded-2xl sm:rounded-3xl
                transition-all duration-200 ease-out
                p-4 sm:p-6
                
                /* 动态样式逻辑 */
                ${isLoading 
                  ? 'border-blue-400/50 bg-blue-50/50 scale-[0.98] shadow-inner' 
                  : 'border-slate-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-8px_rgba(59,130,246,0.12)] hover:border-blue-400/30 hover:-translate-y-[2px]'
                }
              `}
            >
              {/* 装饰：Hover 极光条 */}
              {!isLoading && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400/0 via-blue-500/40 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              <div className="relative flex flex-row items-center sm:flex-col sm:items-start sm:h-full gap-4 sm:gap-5 z-10">
                
                {/* 图标容器 */}
                <div className={`
                  shrink-0 flex items-center justify-center
                  rounded-xl sm:rounded-2xl 
                  w-12 h-12 sm:w-14 sm:h-14 
                  border
                  transition-all duration-300
                  ${isLoading 
                    ? 'bg-blue-100 border-blue-200 text-blue-600 scale-95'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-100/60 text-blue-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] group-hover:scale-105'
                  }
                `}>
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" strokeWidth={2} />
                  ) : (
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 opacity-90" strokeWidth={1.5} />
                  )}
                </div>

                {/* 文本区域 */}
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-[15px] sm:text-lg truncate tracking-tight transition-colors ${isLoading ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-700'}`}>
                      {tool.title}
                    </h3>
                    {tool.external && (
                      <ExternalLink className="w-3 h-3 text-slate-400 sm:hidden" />
                    )}
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-snug line-clamp-2 font-normal">
                    {tool.description}
                  </p>
                </div>

                {/* 操作区域 */}
                <div className="shrink-0 sm:mt-auto sm:w-full sm:pt-3">
                  <div className={`sm:hidden transition-all ${isLoading ? 'text-blue-600 translate-x-1' : 'text-slate-300 group-hover:text-blue-500'}`}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                  <div className={`
                    hidden sm:flex items-center gap-2 text-sm font-medium transition-colors duration-300
                    ${isLoading ? 'text-blue-700' : 'text-blue-600/90 group-hover:text-blue-700'}
                  `}>
                    <span className="relative">
                      {tool.external ? '访问链接' : '立即使用'}
                      {!isLoading && <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-blue-600 transition-all duration-300 group-hover:w-full" />}
                    </span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isLoading ? 'translate-x-1 opacity-50' : 'group-hover:translate-x-1'}`} />
                  </div>
                  
                  {tool.external && (
                    <div className="hidden sm:block absolute top-6 right-6 text-slate-300 group-hover:text-blue-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 底部提示卡片 */}
      <div className="mt-8 sm:mt-12 pb-8">
        <Card className="
          relative overflow-hidden
          border border-indigo-100/50
          rounded-2xl sm:rounded-3xl 
          bg-gradient-to-br from-slate-50/80 to-indigo-50/30
          backdrop-blur-sm
          p-6 sm:p-8
        ">
          <div className="relative z-10 flex flex-col md:flex-row items-start gap-5 sm:gap-8">
            {/* 图标 */}
            <div className="
              w-10 h-10 sm:w-12 sm:h-12 
              rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-white/50
              flex items-center justify-center shrink-0 text-blue-600
            ">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-blue-50" />
            </div>

            {/* 内容区域 */}
            <div className="flex-1 w-full space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight">
                使用小贴士
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">数据隐私安全</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      本站所有文本处理（如去重、提取）均在本地浏览器完成，数据不会上传至服务器。
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">提升处理效率</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      对于包含大量行数的文本，建议使用 Chrome 或 Edge 浏览器以获得最佳的 JS 运行性能。
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">外部工具网络</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      带有 <ExternalLink className="inline w-3 h-3 mx-0.5" /> 图标的工具为第三方服务，可能需要特定的网络环境才能正常访问。
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Cookie className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-700">Cookie 格式</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      使用 Cookie 相关工具时，请确保输入格式为标准的 Netscape 格式或 JSON 格式。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Tools;
