import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MessageCircle, Github, ArrowRight, Copy, Check, Twitter } from 'lucide-react';

const ContactPage = () => {
  const [showContact, setShowContact] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 模拟复制功能
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 联系方式数据
  const contactInfo = [
    { 
      id: 'email', 
      icon: <Mail className="w-5 h-5" />, 
      label: 'Email', 
      value: 'hello@example.com',
      action: () => handleCopy('hello@example.com', 'email')
    },
    { 
      id: 'wechat', 
      icon: <MessageCircle className="w-5 h-5" />, 
      label: 'WeChat', 
      value: 'wx_username',
      action: () => handleCopy('wx_username', 'wechat')
    },
    {
      id: 'github',
      icon: <Github className="w-5 h-5" />,
      label: 'GitHub',
      value: 'github.com/username',
      isLink: true,
      url: 'https://github.com'
    }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4 font-sans text-slate-100 selection:bg-purple-500 selection:text-white">
      
      {/* 装饰性背景元素 */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />

      {/* 主卡片 */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-10 text-center">
          
          {/* 标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200 mb-4">
              Get in Touch
            </h1>
            <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed">
              无论是项目合作、技术交流，还是只是想打个招呼，<br/>我都随时欢迎您的来信。
            </p>
          </motion.div>

          {/* 交互区域 */}
          <div className="min-h-[180px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {!showContact ? (
                // 初始状态：主要按钮
                <motion.button
                  key="main-btn"
                  layoutId="contact-wrapper"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowContact(true)}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                >
                  <span>联系我</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ) : (
                // 点击后状态：联系方式列表
                <motion.div
                  key="contact-list"
                  layoutId="contact-wrapper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full space-y-3"
                >
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full"
                    >
                      {item.isLink ? (
                        // 链接类型
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-200 group-hover:text-white transition-colors">
                              {item.icon}
                            </div>
                            <span className="font-medium text-slate-200">{item.value}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white -rotate-45 transition-colors" />
                        </a>
                      ) : (
                        // 复制类型
                        <button
                          onClick={item.action}
                          className="flex items-center justify-between w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-200 group-hover:text-white transition-colors">
                              {item.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-400">{item.label}</span>
                              <span className="font-medium text-slate-200">{item.value}</span>
                            </div>
                          </div>
                          <div className="text-slate-400">
                            {copiedField === item.id ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check className="w-5 h-5 text-green-400" />
                              </motion.div>
                            ) : (
                              <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </button>
                      )}
                    </motion.div>
                  ))}
                  
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setShowContact(false)}
                    className="mt-4 text-sm text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4"
                  >
                    返回
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        
        {/* 底部装饰条 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      </motion.div>

      {/* 社交媒体图标 (可选 - 放在卡片外部底部) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 flex gap-6"
      >
        <a href="#" className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200"><Twitter size={20} /></a>
        <a href="#" className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200"><Github size={20} /></a>
      </motion.div>

    </div>
  );
};

export default ContactPage;