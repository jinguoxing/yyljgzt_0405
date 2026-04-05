import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Play, ChevronRight, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SemanticApi } from '@/services/semanticApi';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cards?: any[];
}

export default function GlobalCopilot({ isOpen, onClose }: CopilotProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getContextualInfo = () => {
    const path = location.pathname;
    if (path.includes('/semantic/inbox')) {
      return {
        welcomeMsg: '你好！这里是语义治理待办箱。我可以帮你分析冲突、批量解决 MUST 阻断项，或者为你总结当前的治理进度。',
        suggestions: [
          "审查所有 MUST 阻断项",
          "显示最近的语义冲突",
          "帮我总结当前的待办任务"
        ]
      };
    } else if (path.includes('/semantic/objects')) {
      return {
        welcomeMsg: '你好！这里是对象候选生成页面。我可以帮你分析表结构，建议如何拆分或合并对象，或者解释当前的语义映射关系。',
        suggestions: [
          "分析当前表的语义结构",
          "为什么建议拆分这个对象？",
          "帮我检查是否有遗漏的属性"
        ]
      };
    } else if (path.includes('/semantic/workbench')) {
      return {
        welcomeMsg: '你好！这里是语义工作台。我可以帮你理解逻辑视图的结构，或者为你运行全面的理解计划。',
        suggestions: [
          "为当前视图运行理解计划",
          "分析上游字段的变更影响",
          "检查当前的映射逻辑"
        ]
      };
    } else if (path.includes('/semantic/releases')) {
      return {
        welcomeMsg: '你好！这里是发布管理页面。我可以帮你预览即将发布的版本，或者对比不同版本之间的语义差异。',
        suggestions: [
          "预览当前的发布版本",
          "对比上一个版本的差异",
          "检查发布前的质量门禁"
        ]
      };
    } else if (path.includes('/semantic/table-understanding')) {
      return {
        welcomeMsg: '你好！这里是表理解页面。我可以帮你分析表结构、主外键关系，或者解释 AI 的推理过程。',
        suggestions: [
          "解释 AI 为什么推荐这个表类型？",
          "帮我检查主键的质量",
          "这个表有哪些下游依赖？"
        ]
      };
    }
    return {
      welcomeMsg: '你好！我是语义治理助手。我可以帮你审查语义冲突、制定治理计划，或创建发布预览。请问有什么可以帮你？',
      suggestions: [
        "审查所有 MUST 阻断项",
        "为 t_hr_employee 运行理解计划",
        "显示最近的语义冲突",
        "预览当前的发布版本"
      ]
    };
  };

  useEffect(() => {
    if (isOpen) {
      const { welcomeMsg } = getContextualInfo();
      // Only set initial message if empty or if we want to reset on open
      // For now, let's just ensure the first message is contextual if it's empty
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: welcomeMsg,
        }]);
      }
    }
  }, [isOpen, location.pathname]);

  // Update welcome message if route changes and we only have the welcome message
  useEffect(() => {
    const { welcomeMsg } = getContextualInfo();
    if (location.pathname.includes('/semantic/table-understanding')) {
      // Always reset chat history for table understanding page to only show relevant context
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMsg,
      }]);
    } else if (messages.length === 1 && messages[0].id === 'welcome') {
       setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: welcomeMsg,
        }]);
    }
  }, [location.pathname]);

  const { suggestions } = getContextualInfo();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleCardAction = (card: any) => {
    if (card.uiHints?.openRoute) {
      navigate(card.uiHints.openRoute);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Optional: auto-submit
    // handleSubmit(new Event('submit') as any, suggestion);
  };

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const text = overrideInput || input;
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Call Mock API
      const response = await SemanticApi.copilotInterpret(userMsg.content, location.pathname);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.commands[0].explain || "根据你的请求，我找到了以下内容。",
        cards: response.commands
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "抱歉，我遇到了一些问题，请稍后再试。"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
          
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/95 backdrop-blur shrink-0">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Sparkles size={18} />
                <span className="font-semibold text-slate-100">智能助手</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={cn("flex flex-col space-y-2", msg.role === 'user' ? "items-end" : "items-start")}
                >
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-br-none" 
                      : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                  )}>
                    {msg.content}
                  </div>
                  
                  {/* Render Executable Cards */}
                  {msg.cards && msg.cards.map((card: any, idx: number) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      key={idx} 
                      className="w-full max-w-[90%] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg mt-2 group hover:border-slate-700 transition-colors"
                    >
                      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span className="text-xs font-mono text-indigo-400 font-medium">{card.command}</span>
                        </div>
                        {card.uiHints?.primaryCTA && <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="text-sm text-slate-300 space-y-2">
                          {card.payload.strategy && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-xs uppercase tracking-wider">策略</span>
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700 font-mono text-indigo-300">{card.payload.strategy}</span>
                            </div>
                          )}
                          {card.payload.scope && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-xs uppercase tracking-wider">范围</span>
                              <span className="text-slate-200 font-medium text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                {card.payload.scope.type} : {card.payload.scope.lvId || 'ALL'}
                              </span>
                            </div>
                          )}
                          {card.payload.steps && (
                            <div className="space-y-1 pt-1">
                              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">执行步骤</span>
                              {card.payload.steps.map((step: string, i: number) => (
                                <div key={i} className="flex items-center space-x-2 text-xs text-slate-400">
                                  <div className="w-1 h-1 rounded-full bg-slate-600" />
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {card.uiHints?.primaryCTA && (
                          <button 
                            onClick={() => handleCardAction(card)}
                            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 active:scale-[0.98]"
                          >
                            <Play size={14} fill="currentColor" />
                            <span>{card.uiHints.primaryCTA === 'Preview' ? '预览' : card.uiHints.primaryCTA === 'Run Understanding' ? '执行理解' : card.uiHints.primaryCTA}</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-slate-500 text-sm ml-2 bg-slate-800/50 px-4 py-3 rounded-2xl rounded-bl-none w-fit"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span>思考中...</span>
                </motion.div>
              )}
            </div>

            {/* Suggestions & Input Area */}
            <div className="bg-slate-900 border-t border-slate-800 shrink-0">
              {/* Quick Suggestions */}
              {messages.length < 3 && !isTyping && (
                <div className="px-4 pt-3 pb-1 overflow-x-auto flex space-x-2 no-scrollbar">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="flex-shrink-0 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full transition-colors flex items-center space-x-1"
                    >
                      <Lightbulb size={10} className="text-yellow-500" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4">
                <form onSubmit={(e) => handleSubmit(e)} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="让助手帮你规划、审查或修复..."
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-900/20"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
