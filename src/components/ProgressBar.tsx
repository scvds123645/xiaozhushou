interface ProgressBarProps {
  current: number;
  total: number;
  visible: boolean;
}

export const ProgressBar = ({ current, total, visible }: ProgressBarProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div
      className={`transition-all duration-300 ${
        visible ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
      }`}
    >
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>检测进度</span>
        <span>{current}/{total}</span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
