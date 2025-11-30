import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 animate-fade-in max-w-2xl mx-auto">
        {/* Error icon */}
        <div className="inline-flex mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
          </div>
        </div>
        
        {/* 404 Text */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black mb-3 sm:mb-4 text-foreground">
          404
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-2">
          页面未找到
        </p>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto px-2">
          抱歉，您访问的页面不存在或已被移除
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-lg fb-transition text-sm sm:text-base w-full sm:w-auto"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            返回首页
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-2 border-border hover:bg-secondary px-6 sm:px-8 py-5 sm:py-6 rounded-lg fb-transition text-sm sm:text-base w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            返回上页
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
