import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
  showParticles?: boolean;
  className?: string;
}

const PageLayout = ({
  children,
  title,
  description,
  showBack = true,
  backTo = "/",
  backLabel = "返回首页",
  showParticles = true,
  className = "",
}: PageLayoutProps) => {
  const navigate = useNavigate();

  // Set document title
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = "联系我";
    };
  }, [title]);

  return (
    <main className={`min-h-screen bg-background relative overflow-hidden ${className}`}>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="max-w-[680px] mx-auto mb-4">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(backTo)}
              className="mb-3 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary group rounded-full"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Button>
          )}
          
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground text-[15px] max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[680px] mx-auto">
          {children}
        </div>
      </div>
    </main>
  );
};

export default PageLayout;
