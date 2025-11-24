import { Info } from "lucide-react";

interface InfoBannerProps {
  message?: string;
  type?: "info" | "success" | "error" | "warning";
  visible?: boolean;
}

export const InfoBanner = ({ 
  message = "在输入框内输入包含14位Facebook账号UID的文本，每行一个，系统会自动提取14位数字进行检测。如果某行找不到14位数字，将自动跳过。检测结果仅显示14位UID。部分被锁定的账号可能被检测为失效，解锁后可恢复。",
  type = "info",
  visible = true
}: InfoBannerProps) => {
  if (!visible) return null;

  const styles = {
    info: {
      bg: "bg-secondary/60",
      icon: "bg-primary",
      iconColor: "text-primary-foreground",
      Icon: Info,
    },
    success: {
      bg: "bg-success/10",
      icon: "bg-success",
      iconColor: "text-success-foreground",
      Icon: Info,
    },
    error: {
      bg: "bg-destructive/10",
      icon: "bg-destructive",
      iconColor: "text-destructive-foreground",
      Icon: Info,
    },
    warning: {
      bg: "bg-warning/10",
      icon: "bg-warning",
      iconColor: "text-warning-foreground",
      Icon: Info,
    },
  };

  const style = styles[type];
  const IconComponent = style.Icon;

  return (
    <div className={`${style.bg} backdrop-blur-sm rounded-2xl p-4 flex gap-3 items-start mb-5 transition-smooth hover:opacity-90`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${style.icon} flex items-center justify-center mt-0.5`}>
        <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
      </div>
      <p className="text-sm leading-relaxed text-foreground">
        {message}
      </p>
    </div>
  );
};
