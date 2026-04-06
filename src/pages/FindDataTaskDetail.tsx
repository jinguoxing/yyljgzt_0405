import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Database, Brain, Activity, Clock, ChevronRight, 
  CheckCircle2, AlertTriangle, FileText, Settings, PlayCircle,
  Pause, Send, ChevronLeft, User, Bot, X, Maximize2, Minimize2,
  Save, MessageSquare, Check, GitBranch, Layers, Target,
  Filter, Tag, BarChart2, Table, Info, Download, Star, ExternalLink,
  Briefcase, Zap, HelpCircle, ArrowRight, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function FindDataTaskDetail() {
  const [isLeftRailOpen, setIsLeftRailOpen] = useState(true);
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'runs' | 'actions' | 'deliverables' | 'replay'>('runs');
  const [requestStatus, setRequestStatus] = useState<'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'>('COMPLETED');
  const [input, setInput] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <Link to="/aiops" className="text-slate-400 hover:text-slate-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-inner">
              <Search size={16} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-slate-100 tracking-wide">寻找近30天订单 GMV 分析数据</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  COMPLETED
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">TASK-20260406-001 • Created 10m ago</div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors border border-slate-700 flex items-center">
            <Save size={14} className="mr-1.5" />
            保存为模板
          </button>
          <button className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium rounded-md transition-colors border border-indigo-500/30 flex items-center">
            <MessageSquare size={14} className="mr-1.5" />
            转入问数
          </button>
          <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md transition-colors shadow-lg shadow-emerald-900/20 flex items-center">
            <Check size={14} className="mr-1.5" />
            完成任务
          </button>
        </div>
      </header>

      {/* Context Bar */}
      <div className="h-10 border-b border-slate-800 bg-slate-900/30 flex items-center px-4 shrink-0 text-xs">
        <div className="flex items-center space-x-6 text-slate-400">
          <div className="flex items-center">
            <Briefcase size={14} className="mr-1.5 text-slate-500" />
            <span className="text-slate-500 mr-1">业务域:</span>
            <span className="font-medium text-slate-300">零售域 (Retail)</span>
          </div>
          <div className="flex items-center">
            <GitBranch size={14} className="mr-1.5 text-slate-500" />
            <span className="text-slate-500 mr-1">DKN:</span>
            <span className="font-medium text-slate-300">Sales DKN v1.2</span>
          </div>
          <div className="flex items-center">
            <Target size={14} className="mr-1.5 text-slate-500" />
            <span className="text-slate-500 mr-1">当前意图:</span>
            <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Order_GMV_Analysis</span>
          </div>
          <div className="flex items-center">
            <Bot size={14} className="mr-1.5 text-slate-500" />
            <span className="text-slate-500 mr-1">AI 员工:</span>
            <span className="font-medium text-slate-300">Data Finder Agent</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail - Recent Tasks */}
        <AnimatePresence initial={false}>
          {isLeftRailOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-slate-800 bg-slate-900/30 flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">最近找数任务</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {[
                  { title: '寻找近30天订单 GMV 分析数据', time: '10m ago', active: true },
                  { title: '查找用户留存率指标定义', time: '2h ago', active: false },
                  { title: '获取 Q1 营销活动 ROI 数据表', time: '1d ago', active: false },
                  { title: '查找商品库存预警相关模型', time: '2d ago', active: false },
                ].map((task, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-2.5 rounded-lg text-xs cursor-pointer transition-colors border",
                      task.active 
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                        : "bg-transparent border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-300"
                    )}
                  >
                    <div className="font-medium truncate mb-1">{task.title}</div>
                    <div className="text-[10px] opacity-70 flex items-center">
                      <Clock size={10} className="mr-1" /> {task.time}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Content - Main Detail Narrative */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-y-auto custom-scrollbar">
          {/* Toggle Left Rail Button */}
          <button 
            onClick={() => setIsLeftRailOpen(!isLeftRailOpen)}
            className="absolute left-0 top-4 z-10 p-1 bg-slate-800 border border-slate-700 rounded-r-md text-slate-400 hover:text-slate-200 shadow-md"
          >
            {isLeftRailOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          <div className="max-w-4xl mx-auto w-full p-6 space-y-8 pb-32">
            
            {/* A. 系统理解卡 (System Understanding Card) */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <Brain size={18} className="text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-200">系统理解 (System Understanding)</h2>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">任务类型</div>
                    <div className="text-sm font-medium text-slate-200 flex items-center">
                      <Search size={14} className="mr-1.5 text-indigo-400" /> 找数 (Find Data)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">解析意图</div>
                    <div className="text-sm font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded inline-block border border-indigo-500/20">
                      Order_GMV_Analysis
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-500 mb-1">当前目标</div>
                    <div className="text-sm text-slate-300">寻找支持“近30天订单 GMV 分析”的可用数据资产</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-500 mb-1">当前范围</div>
                    <div className="text-sm text-slate-300 flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs">零售域</span>
                      <span className="text-slate-600">/</span>
                      <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs">Sales DKN</span>
                      <span className="text-slate-600">/</span>
                      <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs font-mono">v1.2</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-500 mb-1">策略</div>
                    <div className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/50 leading-relaxed">
                      优先召回已发布对象和标准指标，缺失映射项转治理任务。
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* B. 参数与意图区 (Parameters & Intent Area) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-200">参数与意图 (Parameters & Intent)</h2>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors border border-slate-700 flex items-center">
                    <Settings size={12} className="mr-1.5" /> 修改参数
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium rounded transition-colors border border-indigo-500/30 flex items-center">
                    <RotateCcw size={12} className="mr-1.5" /> 重新召回
                  </button>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">主题 (Subject)</span>
                    <span className="text-sm font-medium text-slate-200">订单</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">指标意图 (Metric Intent)</span>
                    <span className="text-sm font-medium text-slate-200">GMV</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">时间范围 (Time Range)</span>
                    <span className="text-sm font-medium text-slate-200">近30天</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">用途 (Purpose)</span>
                    <span className="text-sm font-medium text-slate-200">分析</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">业务域 (Domain)</span>
                    <span className="text-sm font-medium text-slate-200">零售</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-2">可编辑参数 (Editable Parameters)</div>
                  <div className="flex flex-wrap gap-2">
                    {['时间: 近30天', '区域: 全国', '粒度: 日', '主题: 订单', '指标: GMV'].map((chip, idx) => (
                      <div key={idx} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 flex items-center group cursor-pointer hover:border-slate-500 transition-colors">
                        <Tag size={12} className="mr-1.5 text-slate-500 group-hover:text-slate-400" />
                        {chip}
                        <button className="ml-2 text-slate-500 hover:text-slate-300"><X size={12} /></button>
                      </div>
                    ))}
                    <button className="px-3 py-1.5 border border-dashed border-slate-700 rounded-full text-xs text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors flex items-center">
                      + 添加参数
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* C. 推荐对象 / 指标 / 表 (Recommended Objects / Metrics / Tables) */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <Star size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold text-slate-200">推荐资产 (Recommended Assets)</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Column 1: Objects */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center space-x-2">
                    <Layers size={14} className="text-blue-400" />
                    <h3 className="text-xs font-bold text-slate-300">推荐对象 (Objects)</h3>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="bg-slate-950 border border-indigo-500/30 rounded-lg p-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="font-bold text-slate-200">Order</div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          94% 匹配
                        </span>
                      </div>
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">状态</span>
                          <span className="text-emerald-400 flex items-center"><CheckCircle2 size={10} className="mr-1" />已发布</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">口径</span>
                          <span className="text-slate-300">标准</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">风险</span>
                          <span className="text-slate-400">无</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Metrics */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center space-x-2">
                    <BarChart2 size={14} className="text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-300">推荐指标 (Metrics)</h3>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="bg-slate-950 border border-indigo-500/30 rounded-lg p-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="font-bold text-slate-200">GMV (总交易额)</div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          98% 匹配
                        </span>
                      </div>
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">状态</span>
                          <span className="text-emerald-400 flex items-center"><CheckCircle2 size={10} className="mr-1" />已发布</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">口径</span>
                          <span className="text-slate-300">标准 (含退款)</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">风险</span>
                          <span className="text-slate-400">无</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Tables */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center space-x-2">
                    <Table size={14} className="text-amber-400" />
                    <h3 className="text-xs font-bold text-slate-300">推荐数据表 (Tables)</h3>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="bg-slate-950 border border-indigo-500/30 rounded-lg p-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="font-mono text-xs font-bold text-slate-200 truncate pr-2">dwd_trade_order_df</div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                          最优
                        </span>
                      </div>
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">类型</span>
                          <span className="text-slate-300">Hive / 离线</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">更新</span>
                          <span className="text-emerald-400">T+1 (02:00)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* D. 推荐理由与口径说明 (Recommendation Reasons & Definition Explanation) */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <Info size={18} className="text-blue-400" />
                <h2 className="text-sm font-bold text-slate-200">推荐理由与口径说明 (Reasoning & Definitions)</h2>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-2">推荐理由</h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                      推荐 <span className="font-mono text-indigo-400">Order</span> / <span className="font-mono text-emerald-400">GMV</span>，是因为该意图命中了零售域 DKN 中的 <span className="font-mono text-slate-400 bg-slate-800 px-1 rounded">Order_GMV_Analysis</span> 模板；对象与指标均为已发布状态，且近30天时间范围、按日粒度均已配置标准查询模板。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 mb-2">DKN 映射</h4>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">意图模板:</span>
                          <span className="text-slate-300 font-mono">Order_GMV_Analysis</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">关联实体:</span>
                          <span className="text-slate-300 font-mono">Retail.Order</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 mb-2">限制与风险</h4>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50 text-xs space-y-2">
                        <div className="flex items-start text-slate-300">
                          <AlertTriangle size={12} className="text-amber-500 mr-1.5 mt-0.5 shrink-0" />
                          <span>当前表数据更新延迟为 T+1，无法支持实时分析。</span>
                        </div>
                        <div className="flex items-start text-slate-300">
                          <CheckCircle2 size={12} className="text-emerald-500 mr-1.5 mt-0.5 shrink-0" />
                          <span>无其他已知风险。</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* E. 下一步动作 (Next Steps) */}
            <section className="space-y-3 pt-4 border-t border-slate-800/50">
              <div className="flex items-center space-x-2 mb-4">
                <ArrowRight size={18} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-200">下一步动作 (Next Steps)</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-900/20 flex items-center">
                  <MessageSquare size={16} className="mr-2" />
                  进入问数
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center">
                  <Save size={16} className="mr-2 text-slate-400" />
                  保存为模板
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center">
                  <Star size={16} className="mr-2 text-amber-400" />
                  加入收藏
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center">
                  <GitBranch size={16} className="mr-2 text-slate-400" />
                  转治理任务
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center">
                  <Download size={16} className="mr-2 text-slate-400" />
                  导出推荐结果
                </button>
              </div>
            </section>

          </div>
        </div>

        {/* Right Console */}
        <AnimatePresence initial={false}>
          {isRightRailOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0 overflow-hidden relative"
            >
              {/* Toggle Right Rail Button */}
              <button 
                onClick={() => setIsRightRailOpen(false)}
                className="absolute -left-3 top-4 z-10 p-1 bg-slate-800 border border-slate-700 rounded-l-md text-slate-400 hover:text-slate-200 shadow-md"
              >
                <ChevronRight size={14} />
              </button>

              {/* Console Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/50 shrink-0 px-2 pt-2">
                {[
                  { id: 'runs', label: '运行进度', icon: Activity },
                  { id: 'actions', label: '待确认', icon: AlertTriangle, count: 0 },
                  { id: 'deliverables', label: '交付物', icon: FileText, count: 3 },
                  { id: 'replay', label: '回放', icon: PlayCircle },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRightTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors relative",
                      rightTab === tab.id 
                        ? "border-indigo-500 text-indigo-400" 
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700"
                    )}
                  >
                    <tab.icon size={12} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="absolute top-1.5 right-1 w-3.5 h-3.5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[8px]">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Console Content */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {rightTab === 'runs' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">执行链路 (Stepper)</h4>
                      <div className="space-y-0 pl-2">
                        {[
                          { stage: '1', name: '意图解析', status: 'COMPLETED', time: '1.2s' },
                          { stage: '2', name: '槽位补齐', status: 'COMPLETED', time: '0.8s' },
                          { stage: '3', name: '对象召回', status: 'COMPLETED', time: '2.4s' },
                          { stage: '4', name: '指标匹配', status: 'COMPLETED', time: '1.5s' },
                          { stage: '5', name: '模板选择', status: 'COMPLETED', time: '0.5s' },
                        ].map((s, idx, arr) => (
                          <div key={s.stage} className="relative flex items-start space-x-4 pb-6">
                            {idx !== arr.length - 1 && (
                              <div className="absolute left-[11px] top-7 w-0.5 h-full bg-emerald-500/30"></div>
                            )}
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10 border",
                              s.status === 'COMPLETED' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                              "bg-slate-800 border-slate-700 text-slate-500"
                            )}>
                              {s.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : s.stage}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-200">{s.name}</span>
                                <span className="text-[10px] text-slate-500">{s.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {rightTab === 'actions' && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-3">
                      <CheckCircle2 size={32} className="text-emerald-500/50" />
                      <p className="text-xs">当前无待确认事项</p>
                    </div>
                    {/* Example of items if they existed:
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="text-xs font-medium text-slate-200 mb-1">指标是否存在歧义</div>
                        <div className="text-[10px] text-slate-500 mb-3">发现多个名为 GMV 的指标，请确认。</div>
                        <button className="w-full py-1.5 bg-indigo-600/20 text-indigo-400 text-[10px] font-bold rounded">去确认</button>
                      </div>
                    </div>
                    */}
                  </div>
                )}

                {rightTab === 'deliverables' && (
                  <div className="space-y-4">
                    {[
                      { title: '推荐对象列表', type: 'JSON', size: '2.4 KB', status: 'ready' },
                      { title: '推荐模板', type: 'SQL', size: '1.1 KB', status: 'ready' },
                      { title: '当前召回摘要', type: 'MD', size: '4.5 KB', status: 'ready' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-3 group hover:border-slate-700 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-400 transition-colors">
                          <FileText size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-200 truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-2">
                            <span className="bg-slate-800 px-1 rounded">{item.type}</span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                        <button className="p-1.5 text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {rightTab === 'replay' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">召回 Trace</span>
                        <button className="text-[10px] text-indigo-400">查看完整日志</button>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-950 p-2 rounded border border-slate-800/50 h-32 overflow-y-auto custom-scrollbar">
                        <div>[00:00.00] Start intent parsing...</div>
                        <div>[00:00.12] Intent identified: Order_GMV_Analysis</div>
                        <div>[00:00.15] Extracting slots: time=30d, domain=retail</div>
                        <div>[00:00.80] Querying DKN for candidates...</div>
                        <div className="text-emerald-400">[00:01.20] Found 3 matching objects</div>
                        <div>[00:01.50] Calculating match scores...</div>
                        <div>[00:02.40] Top match: Order (0.94)</div>
                        <div className="text-amber-400">[00:02.45] Filtered: Order_Archive (Score too low)</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toggle Right Rail Button (when closed) */}
        <AnimatePresence>
          {!isRightRailOpen && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRightRailOpen(true)}
              className="absolute right-0 top-4 z-10 p-1 bg-slate-800 border border-slate-700 rounded-l-md text-slate-400 hover:text-slate-200 shadow-md"
            >
              <ChevronLeft size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
