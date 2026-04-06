import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, PlayCircle, CheckSquare, FileText, 
  Settings, Search, ShieldCheck, BrainCircuit, Database, X,
  Clock, Activity, AlertTriangle, CheckCircle2, ChevronRight,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Send, Bot, User, Plus,
  RotateCcw, XCircle, ExternalLink, Download, Box, Play, ArrowUpCircle, Info,
  Share2, ChevronLeft, Zap, Pause, RefreshCw, MoreVertical, History, FileSearch, GitCompare, Layers, ShieldAlert, ListTodo, Package, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import AIOpsWorkbenchRequestCreateModal from '@/components/AIOpsWorkbenchRequestCreateModal';
import { FieldSemanticDrawer } from '@/components/FieldSemanticDrawer';

const STAGES = [
  { 
    id: 'A', name: '数据源配置', icon: Settings, status: 'COMPLETED', time: '2m 15s',
    summary: '已成功连接到 db-prod-hr.internal',
    metrics: [{ label: 'Connection', value: 'OK', status: 'success' }]
  },
  { 
    id: 'B', name: '扫描与画像', icon: Search, status: 'COMPLETED', time: '5m 30s',
    summary: '完成 128 张表的扫描与画像提取',
    metrics: [{ label: 'Completeness', value: '98%', status: 'success' }]
  },
  { 
    id: 'C', name: '质量规则与检测', icon: ShieldCheck, status: 'COMPLETED', time: '1m 45s',
    summary: '生成 45 条规则，发现 15 处违规',
    metrics: [
      { label: 'Rules', value: '45', status: 'neutral' },
      { label: 'Violations', value: '15', status: 'warning' }
    ]
  },
  { 
    id: 'D', name: '语义理解结果', icon: BrainCircuit, status: 'SOFT_BLOCKED', time: 'Running...',
    summary: '发现 3 个语义冲突需要人工确认',
    metrics: [{ label: 'Routes', value: '3 Conflicted', status: 'warning' }]
  },
  { 
    id: 'E', name: '候选对象', icon: Database, status: 'PENDING', time: '--',
    summary: '等待上游阶段完成',
    metrics: [{ label: 'Candidates', value: '--', status: 'neutral' }]
  },
];

const MOCK_REQUESTS = [
  { id: 'REQ-20260227-001', title: '解析 HR 域表结构与语义', status: 'IN_PROGRESS' },
  { id: 'REQ-20260226-042', title: '梳理 Sales 数据血缘', status: 'PENDING' },
  { id: 'REQ-20260225-089', title: '生成财务指标定义', status: 'COMPLETED' },
  { id: 'REQ-20260225-090', title: '用户行为日志异常检测', status: 'FAILED' },
];

type MessageType = 'user' | 'plan' | 'progress' | 'blocker' | 'result' | 'deliverable';

interface Message {
  id: string;
  type: MessageType;
  content?: string;
  role?: 'user' | 'ai';
  stages?: any[];
  stageId?: string;
  stageName?: string;
  status?: string;
  summary?: string;
  blockerType?: 'hard' | 'soft';
  taskId?: string;
  deliverables?: any[];
}

export default function AIOpsWorkbenchRequestDetail() {
  const { requestId, stageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLeftRailOpen, setIsLeftRailOpen] = useState(true);
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rightTab, setRightTab] = useState('runs');
  const [isGateExpanded, setIsGateExpanded] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'user', role: 'user', content: '帮我解析 hr_core_db.employees 表的结构，并推断其业务语义。' },
    { id: '2', type: 'plan', role: 'ai', stages: STAGES },
    { id: '3', type: 'progress', role: 'ai', stageId: 'A', stageName: '数据源配置', status: 'COMPLETED', summary: '成功连接到 MySQL 8.0 (db-prod-hr.internal)' },
    { id: '4', type: 'progress', role: 'ai', stageId: 'B', stageName: '扫描与画像', status: 'COMPLETED', summary: '完成扫描，共发现 128 张表，4592 个字段。' },
    { id: '5', type: 'blocker', role: 'ai', blockerType: 'soft', taskId: 'TSK-002', summary: '发现 3 个语义冲突需要人工确认。' },
    { id: '6', type: 'progress', role: 'ai', stageId: 'D', stageName: '语义理解结果', status: 'IN_PROGRESS', summary: '大模型正在进行语义推断...' },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [requestStatus, setRequestStatus] = useState<'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'>('IN_PROGRESS');

  useEffect(() => {
    if (location.pathname.includes('/stages/')) {
      setRightTab('runs');
    }
  }, [location.pathname]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const closeDrawer = () => {
    navigate(`/aiops/workbench/requests/${requestId}`);
  };

  const openStage = (id: string) => {
    navigate(`/aiops/workbench/requests/${requestId}/stages/${id}`);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'progress', 
        role: 'ai',
        stageId: 'D',
        stageName: '语义理解结果',
        status: 'IN_PROGRESS',
        summary: '收到您的反馈，已调整推断策略，正在重新生成...' 
      }]);
    }, 1000);
  };

  const handleQuickAction = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', role: 'user', content: text }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'progress', 
        role: 'ai',
        stageId: 'A',
        stageName: '系统初始化',
        status: 'IN_PROGRESS',
        summary: `收到指令：${text}，正在准备执行...` 
      }]);
    }, 1000);
  };

  const handleApprovePlan = () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', role: 'user', content: '批准执行计划' }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'progress', 
        role: 'ai',
        stageId: 'C',
        stageName: '语义推断',
        status: 'IN_PROGRESS',
        summary: '计划已批准，正在启动语义推断阶段...' 
      }]);
    }, 800);
  };

  const handleModifyConfig = () => {
    setIsRightRailOpen(true);
    setRightTab('actions');
    // In a real app, this might open a specific config modal
  };

  const handleIgnoreBlocker = (taskId: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', role: 'user', content: `忽略任务 ${taskId}` }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'progress', 
        role: 'ai',
        status: 'COMPLETED',
        summary: `已忽略任务 ${taskId}，继续后续流程。` 
      }]);
    }, 800);
  };

  const handleResume = () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', role: 'user', content: '继续执行' }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'progress', 
        role: 'ai',
        stageId: 'D',
        stageName: '语义理解结果',
        status: 'IN_PROGRESS',
        summary: '正在恢复执行...' 
      }]);
    }, 1000);
  };

  const handleCreateRequest = (start: boolean) => {
    setIsCreateModalOpen(false);
    const newId = `REQ-20260227-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    navigate(`/aiops/workbench/requests/${newId}`);
  };

  return (
    <div className="flex-1 flex bg-slate-950 overflow-hidden relative">
      
      {/* Left Rail: Request Mini List */}
      <AnimatePresence initial={false}>
        {isLeftRailOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0 overflow-hidden z-10"
          >
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
              <span className="font-bold text-slate-200 text-sm">最近需求</span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title="新建需求"
                >
                  <Plus size={18} />
                </button>
                <button 
                  onClick={() => setIsLeftRailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <PanelLeftClose size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {MOCK_REQUESTS.map(req => (
                <div 
                  key={req.id}
                  onClick={() => navigate(`/aiops/workbench/requests/${req.id}`)}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-colors border",
                    req.id === requestId 
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-100" 
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <div className="text-xs font-mono mb-1 opacity-70">{req.id}</div>
                  <div className="text-sm font-medium truncate">{req.title}</div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      req.status === 'COMPLETED' ? "bg-emerald-500" :
                      req.status === 'IN_PROGRESS' ? "bg-blue-500 animate-pulse" :
                      req.status === 'FAILED' ? "bg-red-500" : "bg-yellow-500"
                    )} />
                    <span className="text-[10px] uppercase tracking-wider opacity-70">{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Column: Chat & Plan */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Header */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center px-6 shrink-0 z-10">
          {!isLeftRailOpen && (
            <button 
              onClick={() => setIsLeftRailOpen(true)}
              className="p-1.5 mr-4 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-slate-100 truncate">零售业务域语义建模</h1>
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 border",
              requestStatus === 'IN_PROGRESS' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              requestStatus === 'PAUSED' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
              "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            )}>
              {requestStatus === 'IN_PROGRESS' ? '进行中' : requestStatus === 'PAUSED' ? '已暂停' : '已完成'}
            </span>
          </div>
          
          <div className="ml-auto flex items-center space-x-3">
            {requestStatus === 'IN_PROGRESS' && (
              <button 
                onClick={() => setRequestStatus('PAUSED')}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                暂停需求
              </button>
            )}
            {requestStatus === 'PAUSED' && (
              <button 
                onClick={() => setRequestStatus('IN_PROGRESS')}
                className="px-4 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-500 text-xs font-medium rounded-lg transition-colors border border-amber-500/30 flex items-center"
              >
                <PlayCircle size={14} className="mr-1.5" />
                恢复需求
              </button>
            )}
            {requestStatus !== 'COMPLETED' && (
              <button 
                onClick={() => setRequestStatus('COMPLETED')}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                完成交付
              </button>
            )}
            {requestStatus === 'COMPLETED' && (
              <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 flex items-center">
                <CheckCircle2 size={14} className="mr-1.5" />
                已交付
              </div>
            )}

            <div className="relative">
              <button 
                onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              >
                <MoreVertical size={18} />
              </button>
              {isMoreActionsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                  {[
                    { label: '重新运行', icon: RotateCcw },
                    { label: '复制为新任务', icon: Plus },
                    { label: '导出任务报告', icon: Download },
                    { label: '查看审计记录', icon: ShieldCheck },
                    { label: '删除草稿', icon: XCircle, danger: true },
                  ].map((item, idx) => (
                    <button 
                      key={idx}
                      className={cn(
                        "w-full px-4 py-2 text-xs flex items-center space-x-3 hover:bg-slate-800 transition-colors",
                        item.danger ? "text-red-400" : "text-slate-300"
                      )}
                    >
                      <item.icon size={14} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ContextBar */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 text-slate-300 rounded text-xs border border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors">
              <Database size={12} className="text-indigo-400" />
              <span>零售业务域</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 text-slate-300 rounded text-xs border border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors">
              <Database size={12} className="text-emerald-400" />
              <span>PostgreSQL 生产库 01</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 text-slate-300 rounded text-xs border border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-colors">
              <FileText size={12} className="text-amber-400" />
              <span>public.orders +3</span>
            </div>
            
            <div className="h-4 w-px bg-slate-700 mx-2 shrink-0" />
            
            <div className="flex items-center space-x-1 px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded text-xs border border-indigo-500/20 whitespace-nowrap cursor-pointer hover:bg-indigo-500/20 transition-colors">
              <Bot size={12} className="mr-1" />
              <span className="font-medium">数据语义理解 (L2)</span>
              <span className="text-[10px] bg-indigo-500/20 px-1 rounded ml-1">v1.2</span>
            </div>

            <div className="flex items-center space-x-2 ml-2">
              <button className="p-1 text-slate-500 hover:text-slate-300">
                <Share2 size={14} />
              </button>
              <span className="text-[10px] text-slate-500">设置默认版本</span>
              <button className="flex items-center space-x-1 text-[10px] text-indigo-400 hover:text-indigo-300 ml-2">
                <ExternalLink size={12} />
                <span>查看台账</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Rail Toggle Handle (Pill style from image) */}
        <div 
          className={cn(
            "fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300",
            isRightRailOpen ? "right-[400px]" : "right-0"
          )}
        >
          <button
            onClick={() => setIsRightRailOpen(!isRightRailOpen)}
            className="flex items-center justify-center w-6 h-24 bg-slate-800 border border-slate-700 rounded-l-2xl text-slate-400 hover:text-slate-200 shadow-2xl group"
          >
            <div className="flex flex-col items-center space-y-1">
              {isRightRailOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              <div className="w-1 h-8 bg-slate-600 rounded-full group-hover:bg-slate-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* Main Column: Detail Narrative */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-950/50">
          
          {/* A. 系统理解卡 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-200 flex items-center">
                <BrainCircuit size={18} className="mr-2 text-indigo-400" />
                系统理解
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500">请求编号:</span>
                <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">REQ-20260227-001</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">当前目标</label>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    完成 <span className="text-indigo-400 font-mono">hr_core_db.employees</span> 的结构理解、字段语义判定，并生成候选业务对象。
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">当前范围</label>
                  <div className="flex flex-wrap gap-2">
                    {['HR 域', 'hr_core_db', 'employees'].map(chip => (
                      <span key={chip} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700">{chip}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">任务拆解</label>
                  <div className="space-y-2">
                    {[
                      { id: 1, text: '数据源配置验证', done: true },
                      { id: 2, text: '扫描与画像', done: true },
                      { id: 3, text: '质量规则草案生成', done: true },
                      { id: 4, text: '字段语义理解', current: true },
                      { id: 5, text: '候选对象生成' },
                    ].map(step => (
                      <div key={step.id} className="flex items-center space-x-3 text-xs">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center border shrink-0",
                          step.done ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                          step.current ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse" :
                          "bg-slate-800 border-slate-700 text-slate-500"
                        )}>
                          {step.done ? <CheckCircle2 size={12} /> : step.id}
                        </div>
                        <span className={cn(
                          step.done ? "text-slate-500 line-through" :
                          step.current ? "text-slate-200 font-medium" :
                          "text-slate-400"
                        )}>{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">执行策略</label>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      系统自动完成扫描、画像和规则草案生成；针对 <span className="text-amber-400">语义冲突</span> 与 <span className="text-amber-400">对象合并建议</span> 将转由人工确认。
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">目标交付物</label>
                  <div className="flex flex-wrap gap-2">
                    {['语义结果', '质量规则草案', '候选对象'].map(d => (
                      <div key={d} className="flex items-center space-x-1.5 px-2 py-1 bg-indigo-500/5 text-indigo-300 rounded text-xs border border-indigo-500/10">
                        <Package size={12} />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">AI 员工</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
                      <Bot size={14} />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">数据语义理解专家 L2</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex space-x-3">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center">
                <FileSearch size={14} className="mr-2" />
                查看完整理解
              </button>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center">
                <Settings size={14} className="mr-2" />
                修改配置
              </button>
            </div>
          </div>

          {/* B. 闭环状态条 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between overflow-x-auto custom-scrollbar">
              <div className="flex items-center space-x-4 text-sm whitespace-nowrap">
                <div className="flex items-center space-x-1"><span className="text-slate-500">阶段完成：</span><span className="text-slate-200 font-medium">3/5</span></div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center space-x-1"><span className="text-slate-500">Task 完成：</span><span className="text-slate-200 font-medium">4/7</span></div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center space-x-1"><span className="text-slate-500">待确认：</span><span className="text-slate-200 font-medium">2</span></div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center space-x-1"><span className="text-slate-500">Hard-block：</span><span className="text-red-400 font-medium">0</span></div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center space-x-1"><span className="text-slate-500">Soft-task：</span><span className="text-yellow-500 font-medium">3</span></div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center space-x-1"><span className="text-slate-500">当前状态：</span><span className="text-yellow-500 font-medium">可预览，不可正式交付</span></div>
              </div>
              <button 
                onClick={() => setIsGateExpanded(!isGateExpanded)}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center space-x-1 ml-4"
              >
                <span>门禁说明</span>
                <ChevronDown size={14} className={cn("transition-transform", isGateExpanded && "rotate-180")} />
              </button>
            </div>
            
            <AnimatePresence>
              {isGateExpanded && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-slate-950/50 border-t border-slate-800"
                >
                  <div className="p-4">
                    <div className="text-xs font-medium text-slate-400 mb-3 flex items-center">
                      <ShieldAlert size={14} className="mr-2 text-amber-500" />
                      当前不可正式交付，原因：
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                        <span>仍有 2 个语义冲突待确认，影响核心字段准确性</span>
                      </li>
                      <li className="flex items-start space-x-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                        <span>1 个候选对象存在合并建议，可能导致对象冗余</span>
                      </li>
                    </ul>
                    <p className="mt-4 text-[10px] text-slate-500 italic">处理完以上任务后，系统将自动重新校验交付门禁。</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* C. 当前主任务区 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200">当前最需要处理的任务</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center">
                查看全部任务 <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                    <h4 className="text-lg font-bold text-slate-100">发现 3 个语义冲突需要人工确认</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-amber-500/10 text-amber-500 border-amber-500/20">FIELD_SEMANTIC_UNRESOLVED</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center text-[10px] text-red-400 font-bold uppercase tracking-wider">
                      <ShieldAlert size={12} className="mr-1" /> 优先级: HIGH
                    </span>
                    <span className="w-px h-3 bg-slate-800"></span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">非阻塞交付</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-600">TSK-2026-042</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">问题摘要</label>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="text-indigo-400 font-mono">department_id</span>、<span className="text-indigo-400 font-mono">manager_id</span>、<span className="text-indigo-400 font-mono">salary_band</span> 存在语义冲突。
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">原因摘要</label>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Top1 与 Top2 候选差距过小，且部分元数据证据（如空值率）与历史推断不一致。"
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">影响范围</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">候选对象生成</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">质量规则草案</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">推荐动作</label>
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2.5">
                      <p className="text-xs text-indigo-300/80">
                        进入字段语义裁决抽屉，优先处理冲突字段，或批量进入冲突工作台。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                <div className="flex space-x-3">
                  <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center">
                    <Zap size={14} className="mr-2" />
                    立即处理
                  </button>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700">查看证据</button>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700">批量处理</button>
                </div>
                <button className="text-xs text-slate-500 hover:text-slate-400 transition-colors">稍后提醒</button>
              </div>
            </div>
          </div>

          {/* D. 执行阶段摘要 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200">执行阶段摘要 (Execution View)</h3>
              <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center">
                <History size={14} className="mr-1" /> 运行历史
              </button>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
              {STAGES.map(stage => (
                <div key={stage.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-w-[280px] flex-shrink-0 flex flex-col hover:border-slate-700 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                        stage.status === 'COMPLETED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        stage.status === 'SOFT_BLOCKED' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                        stage.status === 'IN_PROGRESS' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                        "bg-slate-800 border-slate-700 text-slate-500"
                      )}>
                        <stage.icon size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">STAGE {stage.id}</span>
                        <span className="text-sm font-bold text-slate-200">{stage.name}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      stage.status === 'COMPLETED' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                      stage.status === 'IN_PROGRESS' ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                      stage.status === 'SOFT_BLOCKED' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                      "bg-slate-700"
                    )}></div>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 line-clamp-2 flex-1 leading-relaxed">{stage.summary}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                    <div className="flex space-x-2">
                      {stage.metrics?.map((m, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[8px] text-slate-500 uppercase">{m.label}</span>
                          <span className={cn(
                            "text-[10px] font-mono font-bold",
                            m.status === 'success' ? "text-emerald-400" : "text-slate-300"
                          )}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openStage(stage.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* E. 事件流 */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-4">事件流</h3>
            <div className="space-y-6">
              {messages.map((msg) => {
                if (msg.type === 'user') {
                  return (
                    <div key={msg.id} className="flex space-x-3 max-w-[85%] ml-auto flex-row-reverse space-x-reverse">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 bg-slate-700 text-slate-300">
                        <User size={18} />
                      </div>
                      <div className="p-4 rounded-2xl text-sm leading-relaxed shadow-sm bg-indigo-600 text-white rounded-tr-sm">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex space-x-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 bg-indigo-600 text-white shadow-lg shadow-indigo-900/20">
                      <Bot size={18} />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      {msg.type === 'plan' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-5 shadow-sm max-w-md">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-200 flex items-center">
                              <Activity size={16} className="mr-2 text-indigo-400" />
                              执行计划
                            </h4>
                            <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                              <Clock size={12} />
                              <span>预计 15M</span>
                            </div>
                          </div>
                          <div className="space-y-3 mb-4">
                            {msg.stages?.map((stage, idx) => (
                              <div 
                                key={stage.id} 
                                className="flex items-center space-x-3 group cursor-pointer"
                                onClick={() => openStage(stage.id)}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center border text-xs shrink-0 transition-colors",
                                  stage.status === 'COMPLETED' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                                  stage.status === 'IN_PROGRESS' ? "bg-blue-500/20 border-blue-500 text-blue-400" :
                                  "bg-slate-800 border-slate-700 text-slate-500 group-hover:border-slate-500"
                                )}>
                                  {stage.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : idx + 1}
                                </div>
                                <div className="flex-1 flex items-center justify-between bg-slate-950/50 border border-slate-800/50 rounded-xl px-4 py-3 hover:bg-slate-900 transition-colors">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-300">{stage.name}</span>
                                    {idx === 0 && <span className="text-[10px] text-slate-500">扫描所选 4 张表的结构与元数据</span>}
                                    {idx === 1 && <span className="text-[10px] text-slate-500">分析字段分布、空值率与唯一性</span>}
                                  </div>
                                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center space-x-3 pt-3 border-t border-slate-800/50">
                            <button 
                              onClick={handleApprovePlan}
                              className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors flex items-center justify-center"
                            >
                              <CheckCircle2 size={14} className="mr-1.5" />
                              批准计划
                            </button>
                            <button 
                              onClick={handleModifyConfig}
                              className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors border border-slate-700 flex items-center justify-center"
                            >
                              <Settings size={14} className="mr-1.5" />
                              修改配置
                            </button>
                          </div>
                        </div>
                      )}

                      {msg.type === 'progress' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-start space-x-3">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            msg.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                          )}>
                            {msg.status === 'COMPLETED' ? <CheckCircle2 size={16} /> : <Activity size={16} className="animate-pulse" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs font-bold text-slate-400">阶段 {msg.stageId}: {msg.stageName}</div>
                              {msg.status === 'COMPLETED' && (
                                <button 
                                  onClick={() => {
                                    if (msg.stageId) openStage(msg.stageId);
                                  }}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center"
                                >
                                  查看详情 <ChevronRight size={12} className="ml-0.5" />
                                </button>
                              )}
                            </div>
                            <div className="text-sm text-slate-200">{msg.summary}</div>
                            <div className="mt-3 flex space-x-2">
                              <button className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">定位阶段</button>
                              <button className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">重放</button>
                              <button className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">附加说明</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.type === 'blocker' && (
                        <div className={cn(
                          "border rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-start space-x-3",
                          msg.blockerType === 'hard' ? "bg-red-500/5 border-red-500/20" : "bg-yellow-500/5 border-yellow-500/20"
                        )}>
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            msg.blockerType === 'hard' ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-500"
                          )}>
                            <AlertTriangle size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className={cn(
                                "text-xs font-bold",
                                msg.blockerType === 'hard' ? "text-red-400" : "text-yellow-500"
                              )}>
                                {msg.blockerType === 'hard' ? '硬阻塞' : '软任务'}
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">{msg.taskId}</span>
                            </div>
                            <div className="text-sm text-slate-200 mb-3">{msg.summary}</div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {
                                  setIsRightRailOpen(true);
                                  setRightTab('actions');
                                }}
                                className={cn(
                                  "text-xs px-3 py-1.5 rounded-lg font-medium transition-colors",
                                  msg.blockerType === 'hard' ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                                )}
                              >
                                去处理 (Resolve)
                              </button>
                              <button 
                                onClick={() => handleIgnoreBlocker(msg.taskId || '')}
                                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 rounded-lg font-medium transition-colors border border-slate-700"
                              >
                                忽略
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.type === 'result' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-slate-400">阶段 {msg.stageId} 结果摘要</div>
                            <button 
                              onClick={() => {
                                if (msg.stageId) openStage(msg.stageId);
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center"
                            >
                              查看详情 <ChevronRight size={12} className="ml-0.5" />
                            </button>
                          </div>
                          <div className="text-sm text-slate-200">{msg.summary}</div>
                        </div>
                      )}

                      {msg.type === 'deliverable' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                           <div className="flex items-center space-x-2 mb-3">
                             <FileText size={16} className="text-indigo-400" />
                             <span className="text-sm font-bold text-slate-200">交付物已生成</span>
                           </div>
                           <div className="space-y-2">
                             {msg.deliverables?.map((d, i) => (
                               <div key={i} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-2 rounded-lg">
                                 <span className="text-xs text-slate-300">{d.name}</span>
                                 <button 
                                   onClick={() => {
                                     setIsRightRailOpen(true);
                                     setRightTab('deliverables');
                                   }}
                                   className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded"
                                 >
                                   查看
                                 </button>
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        {/* Composer (Input Area) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md sticky bottom-0 z-20">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: '一键运行全流程', icon: PlayCircle, color: 'text-emerald-400' },
                { label: '只跑扫描', icon: Search, color: 'text-blue-400' },
                { label: '查看语义冲突', icon: ShieldAlert, color: 'text-amber-400' },
                { label: '导出当前结果', icon: Download, color: 'text-slate-400' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-full text-xs font-medium text-slate-300 transition-all group"
                >
                  <chip.icon size={12} className={cn("group-hover:scale-110 transition-transform", chip.color)} />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className={cn(
                "relative flex items-end space-x-3 p-3 bg-slate-950 border rounded-2xl transition-all shadow-2xl",
                requestStatus === 'COMPLETED' ? "border-emerald-500/30 bg-emerald-500/5" :
                requestStatus === 'PAUSED' ? "border-amber-500/30 bg-amber-500/5" :
                "border-slate-800 group-focus-within:border-indigo-500/50 group-focus-within:ring-1 group-focus-within:ring-indigo-500/20"
              )}>
                <div className="flex-1 min-w-0">
                  {requestStatus === 'COMPLETED' ? (
                    <div className="py-2 px-1 flex items-center space-x-2 text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-medium">任务已完成，你可以继续提问或发起新任务</span>
                    </div>
                  ) : requestStatus === 'PAUSED' ? (
                    <div className="py-2 px-1 flex items-center space-x-2 text-amber-400">
                      <Pause size={16} />
                      <span className="text-sm font-medium">任务已暂停，等待你的指令</span>
                    </div>
                  ) : null}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={requestStatus === 'IN_PROGRESS' ? "输入指令以微调当前执行..." : "继续对话或发起新指令..."}
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 text-sm py-2 resize-none max-h-32 custom-scrollbar"
                    rows={1}
                  />
                </div>
                <div className="flex items-center space-x-2 pb-1">
                  {requestStatus === 'IN_PROGRESS' && (
                    <button 
                      onClick={() => setRequestStatus('PAUSED')}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all"
                      title="暂停执行"
                    >
                      <Pause size={20} />
                    </button>
                  )}
                  {requestStatus === 'PAUSED' && (
                    <button 
                      onClick={() => setRequestStatus('IN_PROGRESS')}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                      title="恢复执行"
                    >
                      <PlayCircle size={20} />
                    </button>
                  )}
                  <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className={cn(
                      "p-2 rounded-xl transition-all shadow-lg",
                      input.trim() 
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95" 
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4 text-[10px] text-slate-500">
              <span className="flex items-center"><Zap size={10} className="mr-1 text-amber-500" /> 响应速度: 极快</span>
              <span className="flex items-center"><ShieldCheck size={10} className="mr-1 text-emerald-500" /> 安全审计: 已开启</span>
              <span className="flex items-center"><BrainCircuit size={10} className="mr-1 text-indigo-500" /> 模型: Gemini 3.1 Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Detail Drawer */}
      <FieldSemanticDrawer 
        isOpen={isFieldDrawerOpen}
        onClose={() => setIsFieldDrawerOpen(false)}
        fieldName={selectedField}
      />

      {/* Right Panel: Console Tabs */}
      <AnimatePresence initial={false}>
        {isRightRailOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-slate-800 bg-slate-900/30 flex flex-col shrink-0 z-10 overflow-hidden"
          >
            <div className="flex items-center border-b border-slate-800 shrink-0 bg-slate-900/80 backdrop-blur-sm">
              <div className="flex-1 flex items-center pr-10">
                {[
                  { id: 'runs', label: '运行进度', icon: PlayCircle },
                  { id: 'actions', label: '待处理', icon: ListTodo },
                  { id: 'deliverables', label: '交付物', icon: Package },
                  { id: 'replay', label: '执行回放', icon: RotateCcw },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRightTab(tab.id)}
                    className={cn(
                      "flex-1 py-4 text-xs font-medium flex flex-col items-center justify-center space-y-1 border-b-2 transition-all",
                      rightTab === tab.id 
                        ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" 
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    )}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="absolute right-2">
                <button 
                  onClick={() => setIsRightRailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title="收起控制台"
                >
                  <PanelRightClose size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {rightTab === 'runs' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">当前 Run 详情</h4>
                      <span className="text-[10px] font-mono text-slate-500">RUN-8924</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">状态</span>
                        <span className="text-amber-400 font-medium">软阻塞 (Soft-blocked)</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">开始时间</span>
                        <span className="text-slate-300">2026-02-28 00:15:00</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">已执行耗时</span>
                        <span className="text-slate-300">10m 24s</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">资源消耗</span>
                        <span className="text-slate-300">12.4k tokens / 8 calls</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">执行链路 (Stepper)</h4>
                    <div className="space-y-0 pl-2">
                      {[
                        { stage: 'E', name: '候选对象生成', status: 'PENDING', time: '--' },
                        { stage: 'D', name: '语义理解结果', status: 'SOFT_BLOCKED', time: '2m 14s' },
                        { stage: 'C', name: '质量规则与检测', status: 'COMPLETED', time: '1m 45s' },
                        { stage: 'B', name: '扫描与画像', status: 'COMPLETED', time: '5m 30s' },
                        { stage: 'A', name: '数据源配置', status: 'COMPLETED', time: '2m 15s' },
                      ].map((s, idx, arr) => (
                        <div key={s.stage} className="relative flex items-start space-x-4 pb-6">
                          {idx !== arr.length - 1 && (
                            <div className="absolute left-[11px] top-7 w-0.5 h-full bg-slate-800"></div>
                          )}
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10 border",
                            s.status === 'COMPLETED' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                            s.status === 'SOFT_BLOCKED' ? "bg-amber-500/20 border-amber-500 text-amber-500" :
                            s.status === 'PENDING' ? "bg-slate-800 border-slate-700 text-slate-500" :
                            "bg-blue-500/20 border-blue-500 text-blue-400"
                          )}>
                            {s.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : s.stage}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-200">{s.name}</span>
                              <span className="text-[10px] text-slate-500">{s.time}</span>
                            </div>
                            <div className="mt-1 flex items-center space-x-2">
                              <button className="text-[10px] text-indigo-400 hover:text-indigo-300">查看详情</button>
                              {s.status === 'SOFT_BLOCKED' && <button className="text-[10px] text-amber-400 hover:text-amber-300">重试</button>}
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
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider px-1">Hard-block (0)</h4>
                    <div className="text-xs text-slate-500 italic px-1">当前无硬阻塞任务</div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider px-1">Soft-task (3)</h4>
                    <div className="space-y-3">
                      {[
                        { type: 'FIELD_SEMANTIC_UNRESOLVED', stage: '阶段 D', title: '3 个字段语义冲突待确认', time: '10 分钟前' },
                        { type: 'DUPLICATE_OBJECT', stage: '阶段 E', title: '发现 2 个候选对象可能重复', time: '2 小时前' },
                        { type: 'MISSING_DESC', stage: '阶段 B', title: '12 个字段缺少业务描述', time: '3 小时前' },
                      ].map((task, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{task.type}</span>
                            <span className="text-[10px] text-slate-500">{task.time}</span>
                          </div>
                          <div className="text-xs font-medium text-slate-200 mb-1">{task.title}</div>
                          <div className="text-[10px] text-slate-500 mb-3">{task.stage} ｜ 非阻塞交付</div>
                          <div className="flex items-center space-x-2">
                            <button className="flex-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-[10px] font-bold rounded transition-colors">立即处理</button>
                            <button className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors"><CheckSquare size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {rightTab === 'deliverables' && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">当前交付物 (2)</h4>
                  <div className="space-y-4">
                    {[
                      { name: '候选对象清单', type: '对象产物', status: '预览版', summary: '已生成 2 个候选对象，1 个存在合并建议' },
                      { name: '质量规则草案', type: '规则产物', status: '草案', summary: '生成 45 条规则，发现 15 处违规' },
                    ].map((d, idx) => (
                      <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Package size={16} className="text-indigo-400" />
                            <span className="text-sm font-bold text-slate-200">{d.name}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">{d.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mb-2">{d.type}</div>
                        <p className="text-xs text-slate-400 mb-4">{d.summary}</p>
                        <div className="flex items-center space-x-2 pt-3 border-t border-slate-800/50">
                          <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded border border-slate-700 transition-colors">预览</button>
                          <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded border border-slate-700 transition-colors">工作台</button>
                          <button className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700 transition-colors"><Download size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rightTab === 'replay' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">执行回放摘要</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">比较版本</span>
                        <span className="text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">v1.2 vs v1.1</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">差异项总数</span>
                        <span className="text-amber-400 font-bold">12</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center">
                          <span className="text-lg font-bold text-slate-200">5</span>
                          <span className="text-[8px] text-slate-500">字段差异</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center">
                          <span className="text-lg font-bold text-slate-200">2</span>
                          <span className="text-[8px] text-slate-500">对象差异</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col items-center">
                          <span className="text-lg font-bold text-slate-200">5</span>
                          <span className="text-[8px] text-slate-500">规则差异</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">差异详情</h4>
                    <div className="space-y-2">
                      {[
                        { type: '字段', name: 'salary', old: '薪资', new: '月薪(税前)', reason: '语义推断优化' },
                        { type: '规则', name: '空值检测', old: '禁用', new: '启用(10%)', reason: '画像特征匹配' },
                      ].map((diff, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-[10px]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500">[{diff.type}] {diff.name}</span>
                            <button className="text-indigo-400 hover:text-indigo-300">详情</button>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-red-400/70 line-through">{diff.old}</span>
                            <ChevronRight size={10} className="text-slate-600" />
                            <span className="text-emerald-400">{diff.new}</span>
                          </div>
                          <div className="text-slate-500 italic">原因: {diff.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Drawer for Stage Details */}
      <AnimatePresence>
        {stageId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-950/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    {STAGES.find(s => s.id === stageId)?.icon && React.createElement(STAGES.find(s => s.id === stageId)!.icon, { size: 16 })}
                  </div>
                  <h2 className="text-base font-bold text-slate-100">
                    阶段 {stageId}: {STAGES.find(s => s.id === stageId)?.name}
                  </h2>
                </div>
                <button 
                  onClick={closeDrawer}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Stage Specific Content Mock */}
                {stageId === 'A' && (
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">Stage A - 数据源配置与启用</h3>
                        <p className="text-xs text-slate-500 mt-1">最后更新: 10分钟前</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20 flex items-center">
                        <CheckCircle2 size={14} className="mr-1.5" />
                        COMPLETED
                      </span>
                    </div>

                    {/* Section 1: Connection Status */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                        <h4 className="text-sm font-bold text-slate-300">连接状态 (Connection Status)</h4>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Connected</div>
                            <div className="text-sm font-medium text-emerald-400 flex items-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                              True
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Auth Mode</div>
                            <div className="text-sm font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded inline-block">
                              vault
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Last Test Time</div>
                          <div className="text-sm text-slate-300">2026-02-28 01:20:00</div>
                        </div>
                        {/* Example of error state (hidden by default since it's COMPLETED)
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mt-2">
                          <div className="text-xs font-bold text-red-400 mb-1 flex items-center">
                            <AlertTriangle size={12} className="mr-1" /> Error
                          </div>
                          <div className="text-xs text-red-300 font-mono">Connection timed out after 30000ms</div>
                        </div>
                        */}
                      </div>
                    </div>

                    {/* Section 2: Scope & Budget */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                        <h4 className="text-sm font-bold text-slate-300">范围与预算 (Scope & Budget)</h4>
                      </div>
                      <div className="p-4 space-y-5">
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-2">Include 规则</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-xs font-mono">
                              ^hr_.*
                            </span>
                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-xs font-mono">
                              .*_employees$
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-2">Exclude 规则</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-xs font-mono">
                              .*_backup$
                            </span>
                            <span className="px-2 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-xs font-mono">
                              temp_.*
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-800/50">
                          <div className="text-xs font-medium text-slate-400 mb-3">Scan Budget</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 rounded p-2 border border-slate-800/50">
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">max_rows</div>
                              <div className="text-sm font-mono text-slate-300">10,000</div>
                            </div>
                            <div className="bg-slate-950 rounded p-2 border border-slate-800/50">
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">qps</div>
                              <div className="text-sm font-mono text-slate-300">50</div>
                            </div>
                            <div className="bg-slate-950 rounded p-2 border border-slate-800/50">
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">concurrency</div>
                              <div className="text-sm font-mono text-slate-300">5</div>
                            </div>
                            <div className="bg-slate-950 rounded p-2 border border-slate-800/50">
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">timeout</div>
                              <div className="text-sm font-mono text-slate-300">30s</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Actions */}
                    <div className="pt-4 flex items-center space-x-3">
                      <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                        <Database size={16} className="mr-2 text-slate-400" />
                        查看数据源设置
                      </button>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                        <RotateCcw size={16} className="mr-2" />
                        重试
                      </button>
                    </div>
                  </div>
                )}
                {stageId === 'B' && (
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">Stage B - 扫描与画像/血缘/Usage</h3>
                        <p className="text-xs text-slate-500 mt-1">最后更新: 5分钟前</p>
                      </div>
                      <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded border border-yellow-500/20 flex items-center">
                        <AlertTriangle size={14} className="mr-1.5" />
                        DEGRADED
                      </span>
                    </div>

                    {/* Degraded Notice */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex items-start">
                        <AlertTriangle size={16} className="text-yellow-500 mt-0.5 mr-2 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-yellow-500 mb-1">发生降级 (Degraded)</h4>
                          <p className="text-xs text-yellow-500/80 mb-2">
                            降级原因: <span className="font-mono bg-yellow-500/20 px-1 rounded">timeout</span> 在扫描大表 `employee_logs` 时发生。
                          </p>
                          <p className="text-xs text-slate-400">
                            影响: Profile completeness 下降，可能导致 D 阶段 Route 预测准确率降低。
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Metrics (四象限) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-2">Schema Coverage</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-slate-200">4,592</span>
                          <span className="text-xs text-slate-500">字段</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-1">PK/FK 识别完成</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-2">Profile Completeness</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-yellow-500">85%</span>
                        </div>
                        <div className="text-[10px] text-yellow-500/70 mt-1">部分大表超时跳过</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-2">Usage Coverage</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-slate-200">92%</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">基于最近30天查询日志</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-2">Lineage Coverage</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-slate-200">100%</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">解析成功</div>
                      </div>
                    </div>

                    {/* Drilldown: Fields Profile Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-300">字段画像 (Fields Profile)</h4>
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center">
                          <ExternalLink size={12} className="mr-1" />
                          打开扫描详情页
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400">
                            <tr>
                              <th className="px-4 py-2 font-medium">field_name</th>
                              <th className="px-4 py-2 font-medium">nonNull</th>
                              <th className="px-4 py-2 font-medium">unique</th>
                              <th className="px-4 py-2 font-medium">distinct</th>
                              <th className="px-4 py-2 font-medium">top_values</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50 text-slate-300">
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-mono text-indigo-400">id</td>
                              <td className="px-4 py-3">100%</td>
                              <td className="px-4 py-3">100%</td>
                              <td className="px-4 py-3">10,000</td>
                              <td className="px-4 py-3 text-slate-500 truncate max-w-[100px]">-</td>
                            </tr>
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-mono text-indigo-400">status</td>
                              <td className="px-4 py-3">98%</td>
                              <td className="px-4 py-3">0.05%</td>
                              <td className="px-4 py-3">5</td>
                              <td className="px-4 py-3 text-slate-500 truncate max-w-[100px]">ACTIVE, INACTIVE, PENDING</td>
                            </tr>
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-mono text-indigo-400">department_id</td>
                              <td className="px-4 py-3">95%</td>
                              <td className="px-4 py-3">0.12%</td>
                              <td className="px-4 py-3">12</td>
                              <td className="px-4 py-3 text-slate-500 truncate max-w-[100px]">D01, D02, D05</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs text-slate-500">
                        <span>显示 1-3，共 4,592 条</span>
                        <div className="flex space-x-1">
                          <button className="px-2 py-1 hover:bg-slate-800 rounded disabled:opacity-50" disabled>&lt;</button>
                          <button className="px-2 py-1 hover:bg-slate-800 rounded">&gt;</button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex items-center space-x-3">
                      <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center">
                        <RotateCcw size={16} className="mr-2" />
                        降低采样率重试
                      </button>
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                        <Settings size={16} className="mr-2" />
                        调整扫描策略
                      </button>
                    </div>
                  </div>
                )}
                {stageId === 'C' && (
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">Stage C - 质量规则草案与检测</h3>
                        <p className="text-xs text-slate-500 mt-1">最后更新: 刚刚</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20 flex items-center">
                        <CheckCircle2 size={14} className="mr-1.5" />
                        COMPLETED
                      </span>
                    </div>

                    {/* Section 1: Rules Draft Summary */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-300">规则草案摘要 (Rules Draft Summary)</h4>
                        <span className="text-xs font-mono bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">Total: 45</span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-2">按类型分布 (By Type)</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs">
                              not_null: <span className="font-mono text-indigo-400">18</span>
                            </span>
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs">
                              unique: <span className="font-mono text-indigo-400">5</span>
                            </span>
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs">
                              range: <span className="font-mono text-indigo-400">8</span>
                            </span>
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs">
                              regex: <span className="font-mono text-indigo-400">10</span>
                            </span>
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs">
                              fk: <span className="font-mono text-indigo-400">3</span>
                            </span>
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs">
                              volatility: <span className="font-mono text-indigo-400">1</span>
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-800/50">
                          <div className="text-xs text-slate-500 mb-2">按级别分布 (By Level)</div>
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                              <span className="text-sm text-slate-300">P1: <span className="font-mono font-bold">12</span></span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                              <span className="text-sm text-slate-300">P2 (默认): <span className="font-mono font-bold">33</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Top Findings */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-300">检测结果发现 (Top Findings)</h4>
                        <span className="text-xs font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Violations: 15</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="text-xs font-medium text-slate-400 mb-2">Top 3 Violated Rules</div>
                        
                        <div className="bg-slate-950 border border-slate-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-slate-200">NULL_CHECK</span>
                            <span className="text-xs font-mono text-red-400">8 violations</span>
                          </div>
                          <div className="text-xs text-slate-500 mb-2">Rule: salary must not be null</div>
                          <div className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded inline-block">
                            Affected: <span className="font-mono text-indigo-400">hr_core_db.employees.salary</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-slate-200">FORMAT_CHECK</span>
                            <span className="text-xs font-mono text-yellow-500">5 violations</span>
                          </div>
                          <div className="text-xs text-slate-500 mb-2">Rule: email must match regex ^[^@]+@[^@]+\.[^@]+$</div>
                          <div className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded inline-block">
                            Affected: <span className="font-mono text-indigo-400">hr_core_db.employees.email</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-slate-200">RANGE_CHECK</span>
                            <span className="text-xs font-mono text-yellow-500">2 violations</span>
                          </div>
                          <div className="text-xs text-slate-500 mb-2">Rule: age between 18 and 65</div>
                          <div className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded inline-block">
                            Affected: <span className="font-mono text-indigo-400">hr_core_db.employees.age</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Actions */}
                    <div className="pt-4 flex flex-col space-y-3">
                      <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center">
                        <ShieldCheck size={16} className="mr-2" />
                        打开质量草案工作台
                      </button>
                      <div className="flex space-x-3">
                        <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                          <ArrowUpCircle size={16} className="mr-2" />
                          提升规则级别
                        </button>
                        <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                          <Download size={16} className="mr-2" />
                          导出规则
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {stageId === 'D' && (
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">Stage D - 语义理解结果</h3>
                        <p className="text-xs text-slate-500 mt-1">最后更新: 2分钟前</p>
                      </div>
                      <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded border border-yellow-500/20 flex items-center">
                        <AlertTriangle size={14} className="mr-1.5" />
                        SOFT_BLOCKED
                      </span>
                    </div>

                    {/* D.1 Table Summary */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                        <h4 className="text-sm font-bold text-slate-300">表级摘要 (Table Summary)</h4>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Table Type</div>
                          <div className="text-sm font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded inline-block">FACT</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Grain Suggestion</div>
                          <div className="text-sm text-slate-300">employee_id, record_date</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Primary Entity</div>
                          <div className="text-sm text-slate-300">Employee</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Time Field</div>
                          <div className="text-sm text-slate-300">created_at</div>
                        </div>
                      </div>
                    </div>

                    {/* D.2 Route Distribution */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-300">字段路由分布 (Route Distribution)</h4>
                        <div className="flex space-x-3 text-xs">
                          <span className="text-slate-400">Auto-confirmed: <span className="text-emerald-400 font-mono">85%</span></span>
                          <span className="text-slate-400">Unknown: <span className="text-slate-300 font-mono">2%</span></span>
                        </div>
                      </div>
                      <div className="p-4">
                        {/* Stacked Bar */}
                        <div className="h-4 w-full flex rounded-full overflow-hidden mb-3">
                          <div className="bg-emerald-500" style={{ width: '85%' }} title="AUTO_PASS: 85%"></div>
                          <div className="bg-yellow-500" style={{ width: '8%' }} title="NEEDS_CONFIRM: 8%"></div>
                          <div className="bg-red-500" style={{ width: '3%' }} title="CONFLICT: 3%"></div>
                          <div className="bg-orange-500" style={{ width: '2%' }} title="ANOMALY: 2%"></div>
                          <div className="bg-slate-500" style={{ width: '2%' }} title="IGNORE_CANDIDATE: 2%"></div>
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 text-[10px]">
                          <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div><span className="text-slate-400">AUTO_PASS (85%)</span></div>
                          <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div><span className="text-slate-400">NEEDS_CONFIRM (8%)</span></div>
                          <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div><span className="text-slate-400">CONFLICT (3%)</span></div>
                          <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></div><span className="text-slate-400">ANOMALY (2%)</span></div>
                          <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-500 mr-1.5"></div><span className="text-slate-400">IGNORE (2%)</span></div>
                        </div>
                      </div>
                    </div>

                    {/* D.3 Hotspots */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                        <h4 className="text-sm font-bold text-slate-300">热点关注 (Hotspots)</h4>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-red-400 mb-2 flex items-center">
                            <AlertTriangle size={12} className="mr-1" /> Top Conflicts
                          </div>
                          <div className="text-xs text-slate-300 bg-slate-950 px-2 py-1.5 rounded border border-slate-800/50 truncate cursor-pointer hover:bg-slate-800" onClick={() => { setSelectedField('department_id'); setIsFieldDrawerOpen(true); }}>department_id</div>
                          <div className="text-xs text-slate-300 bg-slate-950 px-2 py-1.5 rounded border border-slate-800/50 truncate cursor-pointer hover:bg-slate-800" onClick={() => { setSelectedField('manager_id'); setIsFieldDrawerOpen(true); }}>manager_id</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-orange-400 mb-2 flex items-center">
                            <AlertTriangle size={12} className="mr-1" /> Top Anomalies
                          </div>
                          <div className="text-xs text-slate-300 bg-slate-950 px-2 py-1.5 rounded border border-slate-800/50 truncate cursor-pointer hover:bg-slate-800" onClick={() => { setSelectedField('salary_band'); setIsFieldDrawerOpen(true); }}>salary_band</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-slate-400 mb-2 flex items-center">
                            <Info size={12} className="mr-1" /> Ignore Candidates
                          </div>
                          <div className="text-xs text-slate-300 bg-slate-950 px-2 py-1.5 rounded border border-slate-800/50 truncate cursor-pointer hover:bg-slate-800" onClick={() => { setSelectedField('temp_flag'); setIsFieldDrawerOpen(true); }}>temp_flag</div>
                          <div className="text-xs text-slate-300 bg-slate-950 px-2 py-1.5 rounded border border-slate-800/50 truncate cursor-pointer hover:bg-slate-800" onClick={() => { setSelectedField('backup_date'); setIsFieldDrawerOpen(true); }}>backup_date</div>
                        </div>
                      </div>
                    </div>

                    {/* D.4 Fields Decision Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-300">字段决策表 (Fields Decision)</h4>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1.5 text-slate-500" />
                            <input 
                              type="text" 
                              placeholder="搜索字段..." 
                              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400">
                            <tr>
                              <th className="px-4 py-2 font-medium">field_name</th>
                              <th className="px-4 py-2 font-medium">Top1 Type/Role</th>
                              <th className="px-4 py-2 font-medium">Scores (Conf/Gap/Comp/Ign)</th>
                              <th className="px-4 py-2 font-medium">Route</th>
                              <th className="px-4 py-2 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50 text-slate-300">
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-mono text-indigo-400">department_id</td>
                              <td className="px-4 py-3">STRING / DIMENSION</td>
                              <td className="px-4 py-3 font-mono text-slate-400">0.82 / 0.15 / 0.95 / 0.01</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded border border-red-500/20">
                                  CONFLICT
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => { setSelectedField('department_id'); setIsFieldDrawerOpen(true); }}
                                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                                >
                                  处理
                                </button>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-mono text-indigo-400">status</td>
                              <td className="px-4 py-3">STRING / DIMENSION</td>
                              <td className="px-4 py-3 font-mono text-slate-400">0.95 / 0.40 / 0.98 / 0.00</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">
                                  AUTO_PASS
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => { setSelectedField('status'); setIsFieldDrawerOpen(true); }}
                                  className="text-slate-500 hover:text-slate-300 font-medium"
                                >
                                  查看
                                </button>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-mono text-indigo-400">temp_flag</td>
                              <td className="px-4 py-3">BOOLEAN / UNKNOWN</td>
                              <td className="px-4 py-3 font-mono text-slate-400">0.40 / 0.05 / 0.20 / 0.85</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded border border-slate-700">
                                  IGNORE_CANDIDATE
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => { setSelectedField('temp_flag'); setIsFieldDrawerOpen(true); }}
                                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                                >
                                  处理
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {stageId === 'E' && (
                  <div className="space-y-6">
                    {/* E.1 Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-sm text-slate-400 mb-1">候选对象总数</div>
                        <div className="text-2xl font-bold text-slate-200">24</div>
                        <div className="text-xs text-slate-500 mt-1">基于当前语义生成</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-sm text-slate-400 mb-1">评分分布</div>
                        <div className="flex items-end space-x-4 mt-1">
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-emerald-400">15</div>
                            <div className="text-[10px] text-slate-500 uppercase">高</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-yellow-400">7</div>
                            <div className="text-[10px] text-slate-500 uppercase">中</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-red-400">2</div>
                            <div className="text-[10px] text-slate-500 uppercase">低</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-sm text-slate-400 mb-1">合并/拆分建议</div>
                        <div className="text-2xl font-bold text-indigo-400">5</div>
                        <div className="text-xs text-slate-500 mt-1">待人工确认</div>
                      </div>
                    </div>

                    {/* E.2 Candidate List */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-200">Top 候选对象 (Candidates)</h4>
                        <span className="text-xs text-slate-500">按综合评分排序</span>
                      </div>
                      <div className="divide-y divide-slate-800">
                        {[
                          { 
                            name: 'Customer', 
                            score: 0.92, 
                            metrics: { identity: 0.95, cohesion: 0.88, separation: 0.90, relationship: 0.94 },
                            suggestion: null
                          },
                          { 
                            name: 'Order_Transaction', 
                            score: 0.85, 
                            metrics: { identity: 0.82, cohesion: 0.85, separation: 0.80, relationship: 0.92 },
                            suggestion: 'Split'
                          },
                          { 
                            name: 'Product_Catalog', 
                            score: 0.78, 
                            metrics: { identity: 0.75, cohesion: 0.80, separation: 0.72, relationship: 0.85 },
                            suggestion: 'Merge'
                          }
                        ].map((candidate, idx) => (
                          <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-bold text-slate-200">{candidate.name}</div>
                                  {candidate.suggestion && (
                                    <span className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                      candidate.suggestion === 'Split' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                    )}>
                                      {candidate.suggestion} Suggestion
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-xs text-slate-500">Score</span>
                                    <span className={cn(
                                      "text-xs font-mono font-bold",
                                      candidate.score >= 0.9 ? "text-emerald-400" : candidate.score >= 0.8 ? "text-yellow-400" : "text-red-400"
                                    )}>{candidate.score.toFixed(2)}</span>
                                  </div>
                                  <div className="h-3 w-px bg-slate-700"></div>
                                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
                                    <span title="Identity Strength">ID: {candidate.metrics.identity.toFixed(2)}</span>
                                    <span title="Cohesion">COH: {candidate.metrics.cohesion.toFixed(2)}</span>
                                    <span title="Separation">SEP: {candidate.metrics.separation.toFixed(2)}</span>
                                    <span title="Relationship Support">REL: {candidate.metrics.relationship.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {candidate.suggestion && (
                                  <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors border border-slate-700">
                                    Review {candidate.suggestion}
                                  </button>
                                )}
                                <button className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium rounded transition-colors border border-indigo-500/30">
                                  Open in Modeler
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* E.3 Actions */}
                    <div className="flex items-center space-x-3 pt-2">
                      <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center">
                        <Box size={16} className="mr-2" />
                        Open Object Candidates
                      </button>
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                        <Download size={16} className="mr-2" />
                        Export Candidates
                      </button>
                      <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                        <RotateCcw size={16} className="mr-2" />
                        Rebuild Candidates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AIOpsWorkbenchRequestCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRequest}
      />
    </div>
  );
}
