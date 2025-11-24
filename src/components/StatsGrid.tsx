import { CheckCircle, XCircle } from "lucide-react";

interface StatsGridProps {
  aliveCount: number;
  deadCount: number;
  visible: boolean;
}

export const StatsGrid = ({ aliveCount, deadCount, visible }: StatsGridProps) => {
  if (!visible) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
      <div className="bg-card/70 glass-effect rounded-2xl p-6 shadow-sm transition-smooth hover:shadow-md hover:-translate-y-0.5">
        <CheckCircle className="w-8 h-8 text-success mb-2" />
        <div className="text-sm text-muted-foreground mb-1">存活账号</div>
        <div className="text-4xl font-bold text-foreground tracking-tight">{aliveCount}</div>
      </div>
      <div className="bg-card/70 glass-effect rounded-2xl p-6 shadow-sm transition-smooth hover:shadow-md hover:-translate-y-0.5">
        <XCircle className="w-8 h-8 text-destructive mb-2" />
        <div className="text-sm text-muted-foreground mb-1">失效账号</div>
        <div className="text-4xl font-bold text-foreground tracking-tight">{deadCount}</div>
      </div>
    </div>
  );
};
