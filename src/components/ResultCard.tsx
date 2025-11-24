import { useState } from "react";
import { CheckCircle, XCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultCardProps {
  type: "alive" | "dead";
  count: number;
  uids: string[];
}

export const ResultCard = ({ type, count, uids }: ResultCardProps) => {
  const [copied, setCopied] = useState(false);
  const [copyHint, setCopyHint] = useState("");
  
  const isAlive = type === "alive";
  const title = isAlive ? "存活账号" : "失效账号";
  const Icon = isAlive ? CheckCircle : XCircle;
  const iconColor = isAlive ? "text-success" : "text-destructive";
  const buttonColor = isAlive ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90";

  const handleCopy = async () => {
    if (uids.length === 0) {
      setCopyHint(`没有${title}可复制`);
      setTimeout(() => setCopyHint(""), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(uids.join("\n"));
      setCopied(true);
      setCopyHint(`已复制 ${count} 个UID`);
      setTimeout(() => {
        setCopied(false);
        setCopyHint("");
      }, 3000);
    } catch (error) {
      setCopyHint("复制失败，请手动复制");
      setTimeout(() => setCopyHint(""), 3000);
    }
  };

  return (
    <div className="bg-card/70 glass-effect rounded-2xl overflow-hidden shadow-sm transition-smooth hover:shadow-md">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="font-semibold text-lg">{title}</span>
        </div>
        <div className="bg-secondary px-3 py-1 rounded-full text-sm font-semibold">
          {count}
        </div>
      </div>
      <div className="p-5">
        <textarea
          className="w-full min-h-[150px] p-4 bg-secondary/60 rounded-xl font-mono text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          value={uids.join("\n")}
          readOnly
          aria-label={`${title}列表`}
        />
        <Button
          onClick={handleCopy}
          className={`w-full mt-3 ${buttonColor} text-white font-semibold h-11 rounded-xl transition-smooth`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              复制{isAlive ? "存活" : "失效"}UID
            </>
          )}
        </Button>
        {copyHint && (
          <div className="flex items-center gap-2 text-sm text-success mt-2 transition-all duration-300">
            <Check className="w-4 h-4" />
            <span>{copyHint}</span>
          </div>
        )}
      </div>
    </div>
  );
};
