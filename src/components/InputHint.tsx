import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface InputHintProps {
  message: string;
  type: "error" | "success" | "warning" | "info";
  visible: boolean;
}

export const InputHint = ({ message, type, visible }: InputHintProps) => {
  if (!visible) return <div className="h-6" />;

  const styles = {
    error: {
      color: "text-destructive",
      Icon: AlertCircle,
    },
    success: {
      color: "text-success",
      Icon: CheckCircle,
    },
    warning: {
      color: "text-warning",
      Icon: AlertCircle,
    },
    info: {
      color: "text-primary",
      Icon: Info,
    },
  };

  const style = styles[type];
  const IconComponent = style.Icon;

  return (
    <div
      className={`flex items-center gap-2 text-sm ${style.color} mt-2 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <IconComponent className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
