import React, { useState, useRef } from 'react';
import { Users, CheckCircle, XCircle, Loader2, Copy, Check } from 'lucide-react';

class CheckFbLive {
  live_count: number = 0;
  die_count: number = 0;
  content: string;

  constructor(content: string) {
    this.content = content;
  }

  objIds(): string[] {
    return this.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  async checkLive(uid: string | number): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${uid}/picture?type=normal`,
        {
          method: 'GET',
          redirect: 'follow'
        }
      );
      
      const url = response.url;
      return !url.includes('static');
    } catch (error) {
      return false;
    }
  }

  async checkLives(
    arrayIds: string[],
    callback?: (uid: string, live: boolean) => void
  ): Promise<void> {
    for (const rawId of arrayIds) {
      let uid = rawId.trim();
      
      // 跳过空行
      if (!uid) {
        continue;
      }
      
      // 格式验证：必须是纯数字，否则提取14位数字
      if (!/^\d+$/.test(uid)) {
        const match = uid.match(/\d{14,}/);
        if (match) {
          uid = match[0].substring(0, 14);
        } else {
          // 格式不正确，跳过这个ID
          continue;
        }
      }

      const isLive = await this.checkLive(uid);
      
      if (isLive) {
        this.live_count++;
      } else {
        this.die_count++;
      }

      if (callback) {
        callback(uid, isLive);
      }
    }
  }

  async checkLiveWithThreads(
    threads: number = 50,
    callbackCheckLive: (uid: string, live: boolean) => void,
    onDone: () => void
  ): Promise<void> {
    const ids = this.objIds();
    const chunkSize = Math.ceil(ids.length / threads);
    const chunks: string[][] = [];

    for (let i = 0; i < ids.length; i += chunkSize) {
      chunks.push(ids.slice(i, i + chunkSize));
    }

    const promises = chunks.map(chunk => 
      this.checkLives(chunk, callbackCheckLive)
    );

    await Promise.all(promises);
    onDone();
  }
}

export default function App() {
  const [inputIds, setInputIds] = useState('');
  const [liveUsers, setLiveUsers] = useState<string[]>([]);
  const [dieUsers, setDieUsers] = useState<string[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [dieCount, setDieCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedDie, setCopiedDie] = useState(false);
  const [ripple, setRipple] = useState<{x: number, y: number, show: boolean}>({x: 0, y: 0, show: false});
  const checkerRef = useRef<CheckFbLive | null>(null);

  const handleCopy = async (users: string[], type: 'live' | 'die') => {
    if (users.length === 0) {
      alert('沒有可複製的內容');
      return;
    }

    try {
      await navigator.clipboard.writeText(users.join('\n'));
      if (type === 'live') {
        setCopiedLive(true);
        setTimeout(() => setCopiedLive(false), 2000);
      } else {
        setCopiedDie(true);
        setTimeout(() => setCopiedDie(false), 2000);
      }
    } catch (err) {
      alert('複製失敗，請手動選擇複製');
    }
  };

  const handleCheck = async () => {
    if (!inputIds.trim()) {
      alert('請輸入用戶 ID 列表');
      return;
    }

    // 重置状态
    setLiveUsers([]);
    setDieUsers([]);
    setLiveCount(0);
    setDieCount(0);
    setIsChecking(true);

    // 创建检查器实例
    checkerRef.current = new CheckFbLive(inputIds);

    // 开始检查（使用100个线程）
    await checkerRef.current.checkLiveWithThreads(
      100,
      (uid: string, live: boolean) => {
        // 实时更新回调
        if (live) {
          setLiveUsers(prev => [...prev, uid]);
          setLiveCount(prev => prev + 1);
        } else {
          setDieUsers(prev => [...prev, uid]);
          setDieCount(prev => prev + 1);
        }
      },
      () => {
        // 完成回调
        setIsChecking(false);
      }
    );
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({x, y, show: true});
    setTimeout(() => setRipple({x: 0, y: 0, show: false}), 600);
  };

  return (
    <div className="min-h-screen bg-[#0e1621] font-sans" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
      {/* Telegram 顶部导航栏 */}
      <div className="bg-[#17212b] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button className="p-2 hover:bg-[#1f2b36] rounded-lg transition-colors mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1 className="text-[15px] font-medium text-white flex-1 text-center pr-12">
            用戶狀態檢查
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        {/* 输入区域卡片 */}
        <div className="bg-[#17212b] rounded-xl shadow-lg p-4 mb-4">
          <div className="mb-3">
            <label className="block text-[12px] font-medium text-[#aaaaaa] mb-2">
              輸入用戶 ID 列表
            </label>
            <textarea
              value={inputIds}
              onChange={(e) => setInputIds(e.target.value)}
              className="w-full h-32 sm:h-40 px-3 py-2.5 bg-[#0e1621] text-white border border-[#2b3843] rounded-lg focus:outline-none focus:border-[#3390ec] transition-all resize-none font-mono text-[14px]"
              placeholder="100012345678901&#10;100098765432109&#10;100011122233344"
              disabled={isChecking}
              style={{caretColor: '#3390ec'}}
            />
          </div>

          <button
            onClick={(e) => {
              createRipple(e);
              handleCheck();
            }}
            disabled={isChecking}
            className="relative overflow-hidden w-full bg-[#3390ec] hover:bg-[#2481cc] disabled:bg-[#2b3843] text-white font-medium py-2.5 px-4 rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-md text-[14px]"
          >
            {ripple.show && (
              <span 
                className="absolute bg-white opacity-30 rounded-full animate-ping"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: '20px',
                  height: '20px',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
            {isChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                檢查中...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                開始檢查
              </>
            )}
          </button>
        </div>

        {/* 结果卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 活跃用户卡片 */}
          <div className="bg-[#17212b] rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2b3843]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-medium text-white">活躍用戶</h2>
                  <span className="text-[12px] text-[#aaaaaa]">{liveCount} 個用戶</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(liveUsers, 'live')}
                disabled={liveUsers.length === 0}
                className="p-2 bg-[#4CAF50] hover:bg-[#45a049] disabled:bg-[#2b3843] rounded-lg transition-all"
                title="複製活躍用戶列表"
              >
                {copiedLive ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
            <div className="h-64 sm:h-96 overflow-y-auto custom-scrollbar">
              {liveUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#aaaaaa]">
                  <Users className="w-12 h-12 mb-2 opacity-30" />
                  <p className="text-[14px]">暫無活躍用戶</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {liveUsers.filter(uid => uid && uid.trim()).map((uid, index) => (
                    <div
                      key={index}
                      className="bg-[#2481cc] text-white px-3 py-2 rounded-[10px] font-mono text-[14px] break-all hover:bg-[#2175b8] transition-colors cursor-default"
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {uid}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 非活跃用户卡片 */}
          <div className="bg-[#17212b] rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2b3843]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#f44336] rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-medium text-white">非活躍用戶</h2>
                  <span className="text-[12px] text-[#aaaaaa]">{dieCount} 個用戶</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(dieUsers, 'die')}
                disabled={dieUsers.length === 0}
                className="p-2 bg-[#f44336] hover:bg-[#da3a2f] disabled:bg-[#2b3843] rounded-lg transition-all"
                title="複製非活躍用戶列表"
              >
                {copiedDie ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
            <div className="h-64 sm:h-96 overflow-y-auto custom-scrollbar">
              {dieUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#aaaaaa]">
                  <Users className="w-12 h-12 mb-2 opacity-30" />
                  <p className="text-[14px]">暫無非活躍用戶</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {dieUsers.filter(uid => uid && uid.trim()).map((uid, index) => (
                    <div
                      key={index}
                      className="bg-[#182533] text-white px-3 py-2 rounded-[10px] font-mono text-[14px] break-all hover:bg-[#1f2b36] transition-colors cursor-default"
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      {uid}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2b3843;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a4c5e;
        }
      `}</style>
    </div>
  );
}