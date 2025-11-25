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
      
      // 格式验证：必须是纯数字，否则提取14位数字
      if (!/^\d+$/.test(uid)) {
        const match = uid.match(/\d{14,}/);
        if (match) {
          uid = match[0].substring(0, 14);
        } else {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Facebook 用戶狀態檢查工具
            </h1>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              輸入用戶 ID 列表（每行一個）
            </label>
            <textarea
              id="list_uid"
              value={inputIds}
              onChange={(e) => setInputIds(e.target.value)}
              className="w-full h-32 sm:h-40 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-xs sm:text-sm"
              placeholder="100012345678901&#10;100098765432109&#10;100011122233344"
              disabled={isChecking}
            />
          </div>

          <button
            id="btn-check"
            onClick={handleCheck}
            disabled={isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                <h2 className="text-base sm:text-xl font-bold text-gray-800 truncate">活躍用戶</h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span id="live_count" className="text-xl sm:text-2xl font-bold text-green-600">
                  {liveCount}
                </span>
                <button
                  onClick={() => handleCopy(liveUsers, 'live')}
                  disabled={liveUsers.length === 0}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
                  title="複製活躍用戶列表"
                >
                  {copiedLive ? (
                    <>
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">複製</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div
              id="list_live"
              className="bg-green-50 rounded-lg p-3 sm:p-4 h-64 sm:h-96 overflow-y-auto border-2 border-green-200"
            >
              {liveUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm sm:text-base">暫無活躍用戶</p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {liveUsers.map((uid, index) => (
                    <div
                      key={index}
                      className="bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-green-300 font-mono text-xs sm:text-sm break-all"
                    >
                      {uid}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <h2 className="text-base sm:text-xl font-bold text-gray-800 truncate">非活躍用戶</h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span id="die_count" className="text-xl sm:text-2xl font-bold text-red-600">
                  {dieCount}
                </span>
                <button
                  onClick={() => handleCopy(dieUsers, 'die')}
                  disabled={dieUsers.length === 0}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
                  title="複製非活躍用戶列表"
                >
                  {copiedDie ? (
                    <>
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">複製</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div
              id="list_die"
              className="bg-red-50 rounded-lg p-3 sm:p-4 h-64 sm:h-96 overflow-y-auto border-2 border-red-200"
            >
              {dieUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm sm:text-base">暫無非活躍用戶</p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {dieUsers.map((uid, index) => (
                    <div
                      key={index}
                      className="bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-red-300 font-mono text-xs sm:text-sm break-all"
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
    </div>
  );
}