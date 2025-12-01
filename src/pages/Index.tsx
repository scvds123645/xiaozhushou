import React, { useState, useCallback, useEffect } from "react";
import { Copy, RefreshCw, Sparkles, Check, CheckCircle2 } from "lucide-react";

// ============ Data Configuration & Utilities ============

const MOBILE_PREFIXES = [
  "134", "135", "136", "137", "138", "139", "147", "150", "151", "152",
  "157", "158", "159", "178", "182", "183", "184", "187", "188", "198",
  "130", "131", "132", "145", "155", "156", "166", "171", "175", "176",
  "185", "186", "133", "149", "153", "173", "177", "180", "181", "189",
  "191", "199"
];

const EMAIL_SUFFIXES = ["@00two.shop", "@00two.site"];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n, len = 2) => String(n).padStart(len, "0");

const genName = (vowelStart) => {
  const v = "aeiou", c = "bcdfghjklmnpqrstvwxyz";
  let name = "";
  for (let i = 0; i < randomInt(4, 7); i++) {
    const useVowel = vowelStart ? i % 2 === 0 : i % 2 !== 0;
    name += random([...(useVowel ? v : c)]);
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const genEmail = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let username = "";
  const len = randomInt(8, 12);
  for (let i = 0; i < len; i++) username += random([...chars]);
  return { email: username + random(EMAIL_SUFFIXES), username };
};

const genPhone = () => "86 " + random(MOBILE_PREFIXES) + " " + pad(randomInt(0, 9999), 4) + " " + pad(randomInt(0, 9999), 4);

const genBirthday = () => {
  const year = new Date().getFullYear() - randomInt(18, 35);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  const date = new Date(year, month - 1, day);
  // Format: MMM DD, YYYY (e.g., Oct 24, 1995)
  return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
};

// ============ UI Components ============

const Row = ({ label, value, onCopy, isLast }) => (
  <div className={`group flex items-center justify-between py-4 px-1 ${!isLast ? 'border-b border-gray-400/10' : ''}`}>
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8 flex-1 min-w-0">
      <span className="text-sm font-normal text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-[17px] font-medium text-gray-900 truncate font-sans tracking-tight">{value}</span>
    </div>
    <button
      onClick={() => onCopy(value, label)}
      className="ml-4 p-2 rounded-full text-[#007AFF] opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-90 transition-all duration-200 hover:bg-blue-50"
      aria-label={`Copy ${label}`}
    >
      <Copy size={18} strokeWidth={2.5} />
    </button>
  </div>
);

const Toast = ({ message, visible }) => (
  <div
    className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 
    bg-white/90 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full border border-black/5
    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
    ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}
  >
    <CheckCircle2 size={18} className="text-[#00C805]" strokeWidth={2.5} />
    <span className="text-[13px] font-semibold text-gray-900/90 tracking-wide">{message}</span>
  </div>
);

// ============ Main Application ============

export default function IdentityGenerator() {
  const [identity, setIdentity] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Generate initial identity on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
  };

  const handleCopy = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${label}`);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(`Copied ${label}`);
    }
  };

  const handleGenerate = () => {
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
    
    const emailData = genEmail();
    const firstName = genName(true);
    const lastName = genName(false);

    setIdentity({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: emailData.email,
      phone: genPhone(),
      birthday: genBirthday(),
      password: Math.random().toString(36).slice(-10) + "Aa1!",
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F2F2F7] p-4 sm:p-6 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Subtle Background Texture/Noise can be added via CSS here if desired, currently using clean Apple gray */}
      
      {/* Toast Notification */}
      <Toast message={toast.msg} visible={toast.show} />

      <div className="w-full max-w-[420px] flex flex-col gap-8 animate-[fadeIn_0.6s_ease-out]">
        
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-white/70 backdrop-blur-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] ring-1 ring-white/40">
          
          {/* Header */}
          <div className="pt-8 pb-2 text-center">
            <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Identity Generator</h1>
          </div>

          {/* Content List */}
          <div className="px-6 py-2">
            {identity ? (
              <div className="flex flex-col">
                <Row 
                  label="Full Name" 
                  value={identity.fullName} 
                  onCopy={handleCopy} 
                />
                 <Row 
                  label="First Name" 
                  value={identity.firstName} 
                  onCopy={handleCopy} 
                />
                <Row 
                  label="Last Name" 
                  value={identity.lastName} 
                  onCopy={handleCopy} 
                />
                <Row 
                  label="Email" 
                  value={identity.email} 
                  onCopy={handleCopy} 
                />
                <Row 
                  label="Phone" 
                  value={identity.phone} 
                  onCopy={handleCopy} 
                />
                <Row 
                  label="Birthday" 
                  value={identity.birthday} 
                  onCopy={handleCopy}
                  isLast 
                />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                 <Sparkles className="animate-pulse w-8 h-8 opacity-20" />
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="p-6 bg-gradient-to-b from-transparent to-white/50">
            <button
              onClick={handleGenerate}
              className="w-full h-12 bg-[#000000] hover:bg-[#1a1a1a] active:scale-[0.98] text-white text-[17px] font-semibold rounded-full shadow-lg shadow-black/10 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Generate</span>
            </button>
            <p className="mt-4 text-center text-[11px] font-medium text-gray-400 uppercase tracking-widest opacity-60">
              Secure & Random
            </p>
          </div>

        </div>

        {/* Optional: Footer Links / Credits could go here in a minimal style */}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
