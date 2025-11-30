import { useState, useEffect } from "react";
import { Search, Star, Share2, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

interface App {
  id: string;
  name: string;
  publisher: string;
  rating: number;
  reviews: number;
  downloads: string;
  ageRating: string;
  description: string;
  icon: string;
  url?: string;
}

const SoftwareDownload = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedApp, setHighlightedApp] = useState<string | null>(null);

  const apps: App[] = [
    {
      id: "facebook",
      name: "Facebook",
      publisher: "Meta",
      rating: 4.6,
      reviews: 800000,
      downloads: "1000万+",
      ageRating: "13+",
      description: "连接全球的社交媒体平台，让你与朋友和家人保持联系，分享生活中的精彩时刻，发现有趣的内容。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Facebook_icon.webp",
      url: "https://quwenjian.cc/share/download?key=b703e78f98bf6a75a8e08ce215e5fdb635803d58b049f17b99fd3232f5a1d46b&code=ULPHA"
    },
    {
      id: "gmail",
      name: "Gmail",
      publisher: "Google",
      rating: 4.8,
      reviews: 1500000,
      downloads: "5000万+",
      ageRating: "4+",
      description: "Gmail是谷歌推出的免费电子邮件服务，提供强大的搜索功能、智能分类、安全可靠的邮件管理。支持多设备同步、大容量存储。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Gmail_icon.webp",
      url: "https://quwenjian.cc/share/download?key=8c3fc56d9b8fec6fbdeb859681d1e049bb3c789cdb536995e0c609a9c727bdc7&code=WSO6N"
    },
    {
      id: "outlook",
      name: "Outlook",
      publisher: "Microsoft",
      rating: 4.7,
      reviews: 800000,
      downloads: "2000万+",
      ageRating: "4+",
      description: "Outlook是微软推出的专业邮件和日历管理应用，提供统一的收件箱、日程安排、任务管理、联系人同步等功能。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Outlook_icon.webp",
      url: "https://quwenjian.cc/share/download?key=08933905a824efbeea556cbef72061fc38d4a18699652ae99a0fbf6efac89d94&code=RZX6G"
    },
    {
      id: "zoho",
      name: "Zoho Mail",
      publisher: "Zoho",
      rating: 4.8,
      reviews: 50000,
      downloads: "500万+",
      ageRating: "3+",
      description: "专业的企业邮箱服务,提供安全可靠的电子邮件解决方案。支持自定义域名、高级安全功能和团队协作。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Zoho%20Mail_icon.webp",
      url: "https://quwenjian.cc/share/download?key=df5cd5c66b7241328f46efdc2604caf7b4363589ce1098483ff8f483ddc71938&code=13HA9"
    },
    {
      id: "via",
      name: "Via浏览器",
      publisher: "Via",
      rating: 4.7,
      reviews: 120000,
      downloads: "200万+",
      ageRating: "4+",
      description: "Via浏览器是一款轻量级的高速浏览器，具有极快的加载速度和流畅的浏览体验。支持扩展、主题定制、隐私保护等功能。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Via_6.8.0.apk_icon.webp",
      url: "https://res.viayoo.com/v1/via-release-cn.apk"
    },
    {
      id: "greentea",
      name: "绿茶VPN",
      publisher: "绿茶",
      rating: 4.6,
      reviews: 85000,
      downloads: "300万+",
      ageRating: "12+",
      description: "绿茶VPN提供安全可靠的VPN服务，帮助你保护隐私、加密数据传输、访问全球内容。支持多个节点、快速连接、稳定流畅。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/%E7%BB%BF%E8%8C%B6VPN_icon.webp",
      url: "https://quwenjian.cc/share/download?key=86241c3ad7502c7370372fdde2a1a423bb97f581ec8b7463aa9623754441e7f7&code=YIVYA"
    },
    {
      id: "discord",
      name: "Discord",
      publisher: "Discord Inc.",
      rating: 4.7,
      reviews: 5600000,
      downloads: "1亿+",
      ageRating: "13+",
      description: "Discord 是让你能够轻松沟通、聚会以及与朋友和社区建立联系的地方。无论是建立学校俱乐部、游戏群组，还是仅仅想和朋友一起打发时间，这里都是理想之选。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/Discord_icon.webp",
      url: "https://quwenjian.cc/share/download?key=29eb683c5e92e7d340bbe7cff8c830369416921513ce89de55b602257758c119&code=E3A9B"
    },
    {
      id: "fb-unlock",
      name: "脸书白号卡网",
      publisher: "脸书资源",
      rating: 4.4,
      reviews: 3500,
      downloads: "1万+",
      ageRating: "18+",
      description: "脸书白号卡网提供各类脸书账号、虚拟卡等资源，是专业的脸书账号和卡资源交易平台。",
      icon: "https://www.584136.xyz/%E5%A4%B4%E5%83%8F/telegam@fb180.jpg",
      url: "https://fh10.zmfaka.cn/item/c24vp9/"
    },
    {
      id: "fb-accounts",
      name: "3万多个未180脸书账号",
      publisher: "文件资源",
      rating: 4.5,
      reviews: 1200,
      downloads: "5000+",
      ageRating: "18+",
      description: "包含3万多个未180天的脸书账号资源文件，TXT格式，方便批量管理和使用。",
      icon: "data:image/svg+xml,%3Csvg viewBox='-4 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.151-.036c-2.803 0-5.074 2.272-5.074 5.074v53.841c0 2.803 2.271 5.074 5.074 5.074h45.774c2.801 0 5.074-2.271 5.074-5.074v-38.605l-18.902-20.31h-31.946z' fill='%23F9CA06'/%3E%3Cpath d='M56.008 20.316v1h-12.799s-6.312-1.26-6.129-6.708c0 0 .208 5.708 6.004 5.708h12.924z' fill='%23F7BC04'/%3E%3Cpath d='M37.106-.036v14.561c0 1.656 1.104 5.792 6.104 5.792h12.799l-18.903-20.353z' opacity='.5' fill='%23ffffff'/%3E%3Cpath d='M18.763 43.045h-3.277v10.047c0 .414-.324.738-.756.738-.414 0-.738-.324-.738-.738v-10.047h-3.259c-.36 0-.648-.288-.648-.684 0-.36.288-.648.648-.648h8.03c.36 0 .648.288.648.685 0 .359-.288.647-.648.647zm11.7 10.803c-.216 0-.415-.089-.541-.27l-3.727-4.97-3.745 4.97c-.126.181-.324.27-.54.27-.396 0-.72-.72 0-.144.036-.306.144-.432l3.889-5.131-3.619-4.826c-.09-.126-.144-.27-.144-.414 0-.343.288-.721.72-.721.216 0 .432.108.576.288l3.439 4.627 3.439-4.646c.126-.18.324-.27.541-.27.378 0 .738.306.738.721 0 .144-.036.288-.126.414l-3.619 4.808 3.89 5.149c.09.126.126.27.126.415 0 .396-.325.738-.721.738zm11.195-10.803h-3.277v10.047c0 .414-.323.738-.756.738-.414 0-.738-.324-.738-.738v-10.047h-3.259c-.36 0-.648-.288-.648-.684 0-.36.288-.648.648-.648h8.03c.36 0 .648.288.648.685.001.359-.287.647-.648.647z' fill='%23ffffff'/%3E%3C/svg%3E",
      url: "https://quwenjian.cc/share/download?key=0d5a04e745f8d04ae5c327f7c4ccb29232daefa6dfb37ab79b6542c57174d64f&code=53HWU"
    }
  ];

  const formatReviews = (count: number): string => {
    if (count >= 100000000) return `${(count / 100000000).toFixed(1)}亿`;
    if (count >= 10000000) return `${Math.floor(count / 10000000)}千万`;
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    return count.toString();
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async (app: App) => {
    let url = `${window.location.origin}/rj?app=${encodeURIComponent(app.name)}`;
    
    // 如果是“脸书白号卡网”，使用自定义链接
    if (app.id === "fb-unlock") {
      url = "https://www.584136.xyz/rj?app=fb";
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: app.name, text: app.description, url });
      } catch {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "链接已复制", description: "分享链接已复制到剪贴板" });
    });
  };

  // 修复了定位逻辑的 useEffect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let appName = params.get('app');

    // 修复逻辑：如果 URL 参数是 fb，手动将其映射到对应的应用名称
    if (appName === 'fb') {
      appName = '脸书白号卡网';
    }

    if (appName) {
      setHighlightedApp(appName);
      setTimeout(() => {
        const element = document.getElementById(appName as string);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setTimeout(() => setHighlightedApp(null), 3000);
    }
  }, []);

  return (
    <PageLayout
      title="软件商店"
      description="精选优质应用，一键下载安装"
      backLabel="返回首页"
      showParticles={false}
    >
      {/* Search Bar: Material Design 3 Floating Search */}
      {/* 1. 调整内边距: px-4 (Mobile) md:px-2 (Desktop) 以优化移动端对齐 */}
      <div className="mb-8 px-4 md:px-2">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6 pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="搜索应用..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-6 h-14 w-full rounded-full border-none bg-white text-lg text-slate-800 shadow-md hover:shadow-lg transition-shadow duration-300 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 text-lg font-medium">未找到匹配的应用</p>
        </div>
      ) : (
        // 2. 优化网格间距: gap-4 (Mobile) md:gap-6 (Desktop)
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              id={app.name}
              // 3. 减少移动端卡片内边距: p-4 (Mobile) md:p-6 (Desktop)
              className={`group relative p-4 md:p-6 border-none bg-white transition-all duration-300 rounded-3xl ${
                highlightedApp === app.name 
                  ? 'ring-2 ring-blue-400 shadow-xl scale-[1.02]' 
                  : 'shadow-sm hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {/* App Header */}
              <div className="flex items-start gap-5 mb-5">
                <div className="relative">
                  <img
                    src={app.icon}
                    alt={app.name}
                    // 4. 缩小移动端图标: w-14 h-14 (Mobile) md:w-[72px] (Desktop)
                    className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-[18px] object-cover shadow-sm group-hover:shadow transition-shadow"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='40'%3E?%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  {/* 5. 调整标题字号: text-lg (Mobile) md:text-xl (Desktop) */}
                  <h3 className="font-bold text-lg md:text-xl text-slate-900 truncate leading-tight mb-1">{app.name}</h3>
                  <p className="text-sm text-blue-600 font-medium truncate mb-2">{app.publisher}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-slate-700">{app.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                    </div>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-slate-500">{formatReviews(app.reviews)} 评</span>
                  </div>
                </div>
              </div>

              {/* App Stats */}
              {/* 6. 缩小 Stats 间距: gap-5 (Mobile) md:gap-8 (Desktop) 以防换行 */}
              <div className="flex gap-5 md:gap-8 mb-5 text-sm px-1">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">下载量</div>
                  <div className="font-semibold text-slate-700">{app.downloads}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">年龄分级</div>
                  <div className="font-semibold text-slate-700">{app.ageRating}</div>
                </div>
              </div>

              {/* Description */}
              {/* 7. 修复描述高度问题: h-10 -> min-h-[2.5rem] (或保持 h-auto 由 line-clamp 控制) */}
              {/* 原来的 h-10 在移动端会导致 2 行文本显示不全 (40px < 2 * 1.625 * 14px) */}
              <p className="text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed min-h-[2.5rem]">
                {app.description}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {app.url ? (
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-none hover:shadow-md transition-all font-medium text-[15px]">
                      <Download className="w-5 h-5 mr-2" />
                      下载
                    </Button>
                  </a>
                ) : (
                  <Button className="flex-1 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-none hover:shadow-md transition-all font-medium text-[15px]">
                    <Download className="w-5 h-5 mr-2" />
                    安装
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  onClick={() => handleShare(app)}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Material You Style Tip Card */}
      <div className="mt-10">
        {/* 8. 安全卡片优化: items-start (处理文字折行), p-4 (Mobile) */}
        <Card className="p-4 md:p-5 border-none bg-blue-50 rounded-3xl flex items-start gap-4 max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-0.5">安全认证</span>
              所有应用均来自官方或可信渠道，请放心下载使用。
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SoftwareDownload;
