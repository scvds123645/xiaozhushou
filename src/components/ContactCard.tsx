import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, MessageSquare, Phone, Zap } from "lucide-react";

const ContactCard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const contactInfo = [
    {
      icon: Mail,
      label: "邮箱",
      value: "example@email.com",
      link: "mailto:example@email.com",
    },
    {
      icon: MessageSquare,
      label: "微信",
      value: "WeChat_ID",
      link: null,
    },
    {
      icon: Phone,
      label: "电话",
      value: "+86 123 4567 8900",
      link: "tel:+861234567890",
    },
  ];

  return (
    <div className="animate-slide-up relative z-10">
      {/* Decorative floating elements */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="bg-card/40 backdrop-blur-xl bg-opacity-40 rounded-2xl p-8 md:p-12 card-shadow hover:card-shadow-hover transition-all duration-500 border border-primary/20 hover:border-primary/40 relative overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/50 rounded-tl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-accent/50 rounded-br-2xl"></div>
        
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse-slow"></div>
        </div>
        
        <div className="text-center space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="inline-block">
              <div className="relative">
                <Zap className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse-slow" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-slow">
                联系我
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
              <div className="w-2 h-2 rounded-full bg-primary neon-glow"></div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary"></div>
            </div>
            
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              很高兴认识您！如有任何问题，欢迎随时与我联系。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="relative group gradient-bg text-white px-10 py-7 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg overflow-hidden border border-primary/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    立即联系
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 neon-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  联系方式
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  const content = (
                    <div className="group flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-primary/10 transition-all duration-300 border border-transparent hover:border-primary/30 backdrop-blur-sm">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 relative">
                        <Icon className="w-5 h-5 text-primary relative z-10" />
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-muted-foreground">{contact.label}</p>
                        <p className="text-base font-semibold text-foreground">{contact.value}</p>
                      </div>
                    </div>
                  );

                  return contact.link ? (
                    <a 
                      key={index} 
                      href={contact.link}
                      className="block transition-transform hover:scale-[1.02]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index} className="cursor-default">
                      {content}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/products')}
            className="relative group px-10 py-7 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300 border-2 border-primary/50 hover:border-primary bg-background/50 backdrop-blur-sm"
          >
            <span className="flex items-center gap-2">
              查看商品
            </span>
          </Button>
          </div>

          <div 
            className="flex justify-center gap-2 pt-6 cursor-pointer group/dots"
            onClick={() => navigate('/tools')}
            role="button"
            aria-label="进入工具页面"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow group-hover/dots:scale-150 transition-transform duration-300"></div>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow group-hover/dots:scale-150 transition-transform duration-300" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow group-hover/dots:scale-150 transition-transform duration-300" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
