import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Sparkles, ArrowRight, Package, Wrench, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Google Material Design 3 (Material You) Refactor for "Contact Me" Page

const Index = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "联系我";
  }, []);

  return (
    // Material 3 Background: Very light surface color (often #f8f9fa or slate-50)
    <main className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-blue-200">
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        
        {/* Content Container - centered with generous spacing */}
        <div className="max-w-md w-full mx-auto text-center space-y-8">

          {/* Badge: Material 3 "Assist Chip" or "Tonal" style */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-sm animate-in fade-in zoom-in duration-500">
            <Sparkles className="w-4 h-4 fill-blue-200" />
            <span className="text-sm font-medium tracking-wide">专业服务 · 品质保障</span>
          </div>

          {/* Hero Icon: Material 3 uses reduced tonal palettes, but we keep the brand Blue */}
          <div className="relative inline-flex group">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative w-24 h-24 rounded-[2rem] bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-200 transition-transform duration-300 group-hover:scale-105">
              <Mail className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Typography: Material 3 Display Styles */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
              联系我
            </h1>
            <p className="text-lg text-slate-500 max-w-sm mx-auto leading-relaxed">
              很高兴认识您！如有任何问题，欢迎随时与我联系。
            </p>
          </div>

          {/* Actions: Material 3 Buttons (Fully Rounded) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            
            <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
              <DialogTrigger asChild>
                {/* Primary Action: Filled Button (Rounded Full) */}
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 text-base"
                >
                  <Send className="w-5 h-5 mr-2.5" />
                  立即联系
                  <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                </Button>
              </DialogTrigger>

              {/* Dialog: Material 3 Alert Dialog style (Extra rounded corners) */}
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

            {/* Secondary Action: Outlined Button (Rounded Full) */}
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/products')}
              className="rounded-full px-8 py-6 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 text-base"
            >
              <Package className="w-5 h-5 mr-2.5" />
              查看商品
            </Button>
          </div>

          {/* FAB-like Action (Small tool button) */}
          <div className="pt-8">
             <button
              onClick={() => navigate('/tools')}
              className="group relative p-4 rounded-2xl hover:bg-slate-100 transition-all duration-300"
              aria-label="实用工具"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm group-hover:shadow-md flex items-center justify-center transition-all">
                    <Wrench className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">工具箱</span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Index;
