import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Star, Shield, Clock, ArrowRight, Sparkles, Send, Check } from "lucide-react";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";

const products = [
  {
    id: 1,
    name: "脸书白号",
    description: "企业级账号解决方案，3天质保服务，安全稳定可靠",
    price: "¥2/个",
    salesCount: "5418个",
    features: [
      "真实IP注册，账号安全有保障",
      "账号注册时长30-180天，活跃度高",
      "Cookie登录方式，即开即用",
      "购买后立即交付，无需等待"
    ],
    badge: "企业优选",
    trustBadges: [
      { label: "已服务", value: "5000+", icon: Star },
      { label: "好评率", value: "98.5%", icon: Shield },
      { label: "响应", value: "<2h", icon: Clock }
    ]
  },
];

// Refactored to Material Design 3 (Material You) Style
const Products = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <PageLayout
      // 1. 移除了 title 和 description 属性，改用下方自定义头部
      backLabel="返回首页"
    >
      {/* === 优化后的自定义头部区域 (Start) === */}
      <div className="relative z-10 mx-auto max-w-2xl text-center pt-8 pb-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
          专业服务商
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          提供高质量Facebook白号，严格质量把控，<br className="hidden sm:block" />
          完善售后保障体系，助力您的业务拓展
        </p>
      </div>
      {/* === 优化后的自定义头部区域 (End) === */}

      {/* Material 3 Style Promotion Chip */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50 text-blue-900 shadow-sm border border-blue-100">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium tracking-wide">限时优惠 · 批量购买享更多折扣</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          // Material 3 Elevated Card: Rounded-3xl, No border, Soft Shadow
          <Card 
            key={product.id} 
            className="rounded-3xl border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <CardHeader className="p-6 pb-2">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-2xl font-normal text-slate-900 tracking-tight">
                  {product.name}
                </CardTitle>
                {product.badge && (
                  <Badge className="rounded-full px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 font-medium">
                    {product.badge}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base text-slate-500 leading-relaxed">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="flex items-end justify-between mb-6">
                <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-normal text-blue-600">{product.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full inline-block mb-1">
                    库存: 999+
                  </p>
                  <p className="text-xs text-slate-400 mt-1">已售: {product.salesCount}</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center mr-3 flex-shrink-0 text-green-600">
                        <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Trust Badges - Material Container Style */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {product.trustBadges?.map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="p-2 bg-white rounded-full shadow-sm mb-1 text-blue-600">
                             <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">{badge.value}</p>
                        <p className="text-xs text-slate-500">{badge.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                <DialogTrigger asChild>
                  {/* Material 3 Filled Button: Rounded-full, Flat Blue */}
                  <Button className="w-full rounded-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium shadow-none hover:shadow-md active:scale-[0.98] transition-all duration-200">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    咨询购买
                  </Button>
                </DialogTrigger>
                
                {/* Dialog: Material 3 Alert Dialog style */}
                <DialogContent className="sm:max-w-sm rounded-[28px] p-6 bg-white shadow-2xl border-0">
                  <DialogHeader className="space-y-3 pb-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                       <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-center text-slate-800">
                      专业服务团队
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-500 text-base">
                      我们的客服团队将为您提供<br/>一对一专业咨询服务
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {[1, 2, 3].map((_, index) => (
                      <a
                        key={index}
                        href="https://t.me/Facebookkf_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50/80 border border-transparent hover:border-blue-100 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Send className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-slate-800">Telegram</div>
                          <div className="text-sm text-slate-500">@Facebookkf_bot</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Bottom Info Card - Material 3 Elevated Style */}
      <Card className="mt-10 rounded-3xl border-0 bg-white shadow-sm hover:shadow-md transition-shadow p-2">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-medium text-lg text-slate-900">安全保障</h3>
              <p className="text-slate-500">所有账号均经过严格质量检测，请放心使用</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.open('https://t.me/Facebookkf_bot', '_blank')} 
            className="rounded-full h-12 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
          >
            了解更多
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Products;
