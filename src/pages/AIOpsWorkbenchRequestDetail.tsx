import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, PlayCircle, CheckSquare, FileText, 
  Settings, Search, ShieldCheck, BrainCircuit, Database, X,
  Clock, Activity, AlertTriangle, CheckCircle2, ChevronRight,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Send, Bot, User, Plus,
  RotateCcw, XCircle, ExternalLink, Download, Box, Play, ArrowUpCircle, Info,
  Share2, ChevronLeft, Zap, Pause
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
          </div>
        </div>

        {/* ContextBar */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 text-slate-300 rounded text-xs border border-slate-700 whitespace-nowrap">
              <Database size={12} className="text-indigo-400" />
              <span>零售业务域</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 text-slate-300 rounded text-xs border border-slate-700 whitespace-nowrap">
              <Database size={12} className="text-emerald-400" />
              <span>PostgreSQL 生产库 01</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 text-slate-300 rounded text-xs border border-slate-700 whitespace-nowrap">
              <FileText size={12} className="text-amber-400" />
              <span>public.orders +3</span>
            </div>
            
            <div className="h-4 w-px bg-slate-700 mx-2 shrink-0" />
            
            <div className="flex items-center space-x-1 px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded text-xs border border-indigo-500/20 whitespace-nowrap">
              <Bot size={12} className="mr-1" />
              <span className="font-medium">数据语义理解 (L2)</span>
              <span className="text-[10px] bg-indigo-500/20 px-1 rounded ml-1">v1.2</span>
            </div>

            <div className="flex items-center space-x-2 ml-2">
              <button className="p-1 text-slate-500 hover:text-slate-300">
                <Share2 size={14} />
              </button>
              <span className="text-[10px] text-slate-500">设置默认版本</span>
              <button className="flex items-center space-x-1 text-[10px] text-indigo-400 hover:text-indigo-300">
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

        {/* Chat Area (MessageStream) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/50">
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

        {/* Composer (Input Area) */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col space-y-4">
            {/* Quick Actions Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-1 no-scrollbar">
              {[
                { label: '一键运行全流程 (L2)', icon: Zap },
                { label: '只跑扫描', icon: Database },
                { label: '只跑语义理解', icon: Bot },
                { label: '生成候选对象', icon: FileText },
                { label: '生成质量规则草案', icon: Settings },
              ].map((action, idx) => (
                <button 
                  key={idx} 
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] rounded-lg whitespace-nowrap transition-colors border border-slate-700/50"
                >
                  <action.icon size={12} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
            
            <div className="relative flex flex-col bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 transition-colors shadow-2xl">
              {requestStatus === 'COMPLETED' ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <CheckCircle2 size={24} className="mb-2 text-emerald-500/50" />
                  <p className="text-sm">需求已交付，当前会话已结束</p>
                </div>
              ) : requestStatus === 'PAUSED' ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Pause size={24} className="mb-2 text-amber-500/50" />
                  <p className="text-sm">需求已暂停，点击右上角「恢复需求」继续</p>
                </div>
              ) : (
                <>
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入指令或提问，例如：'生成成本阶段报告'..."
                    className="w-full bg-transparent border-none resize-none px-6 py-5 text-sm text-slate-200 focus:outline-none min-h-[100px] max-h-40 custom-scrollbar"
                  />
                  
                  <div className="flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-300 transition-colors">
                        <Info size={14} className="text-indigo-400" />
                        <span className="text-xs">上下文</span>
                      </button>
                      <div className="flex items-center space-x-4 text-[10px] text-slate-500">
                        <span className="flex items-center"><kbd className="bg-slate-800 px-1 rounded mr-1">Enter</kbd> 发送</span>
                        <span className="flex items-center"><kbd className="bg-slate-800 px-1 rounded mr-1">Shift + Enter</kbd> 换行</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setRequestStatus('PAUSED')}
                        className="flex items-center space-x-2 px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-colors"
                      >
                        <Pause size={14} />
                        <span className="text-xs font-bold">暂停执行</span>
                      </button>
                      
                      <button 
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  { id: 'actions', label: '待处理', icon: AlertTriangle },
                  { id: 'deliverables', label: '交付物', icon: FileText },
                  { id: 'replay', label: '执行回放', icon: Activity },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRightTab(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center space-x-2 py-4 text-xs font-medium border-b-2 transition-colors",
                      rightTab === tab.id 
                        ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" 
                        : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                  >
                    <tab.icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
          {rightTab === 'runs' && (
            <div className="flex flex-col h-full">
              {/* RunHeader */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono font-bold text-slate-200">RUN-8924</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">
                      软阻塞
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={handleResume}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" 
                      title="恢复执行"
                    >
                      <PlayCircle size={14} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors" title="重试阶段">
                      <RotateCcw size={14} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="取消">
                      <XCircle size={14} />
                    </button>
                    <button onClick={() => setRightTab('replay')} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors" title="打开回放">
                      <Activity size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-500">开始时间</span>
                    <span className="text-slate-300 font-mono">2026-02-28 00:15:00</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-500">耗时</span>
                    <span className="text-slate-300 font-mono">10m 24s</span>
                  </div>
                  <div className="flex flex-col space-y-1 col-span-2 mt-1">
                    <span className="text-slate-500">消耗</span>
                    <span className="text-slate-300 font-mono">12.4k tokens / 8 tool calls</span>
                  </div>
                </div>
              </div>

              {/* StageStepper & StageCards */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                {/* Vertical Line for Stepper */}
                <div className="absolute left-8 top-8 bottom-8 w-px bg-slate-800 z-0" />
                
                {[...STAGES].reverse().map((stage, index) => (
                  <div key={stage.id} className="relative z-10 flex items-start space-x-4">
                    {/* Stepper Node */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 mt-2 bg-slate-950",
                      stage.status === 'COMPLETED' ? "border-emerald-500 text-emerald-400" :
                      stage.status === 'IN_PROGRESS' ? "border-blue-500 text-blue-400" :
                      stage.status === 'SOFT_BLOCKED' ? "border-yellow-500 text-yellow-500" :
                      stage.status === 'HARD_BLOCKED' ? "border-red-500 text-red-400" :
                      "border-slate-700 text-slate-500"
                    )}>
                      {stage.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : 
                       stage.status === 'SOFT_BLOCKED' ? <AlertTriangle size={14} /> :
                       <span className="text-xs font-bold">{stage.id}</span>}
                    </div>
                    
                    {/* Stage Card */}
                    <div className={cn(
                      "flex-1 bg-slate-900 border rounded-xl overflow-hidden transition-all",
                      stageId === stage.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-800 hover:border-slate-700"
                    )}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <stage.icon size={14} className="text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-200">阶段 {stage.id}: {stage.name}</h3>
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            stage.status === 'COMPLETED' ? "text-emerald-500" :
                            stage.status === 'IN_PROGRESS' ? "text-blue-400" :
                            stage.status === 'SOFT_BLOCKED' ? "text-yellow-500" :
                            stage.status === 'HARD_BLOCKED' ? "text-red-400" :
                            "text-slate-500"
                          )}>
                            {stage.status === 'COMPLETED' ? '已完成' : stage.status === 'IN_PROGRESS' ? '运行中' : stage.status === 'SOFT_BLOCKED' ? '软阻塞' : stage.status === 'HARD_BLOCKED' ? '硬阻塞' : '未开始'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-400 mb-3">{stage.summary}</p>
                        
                        {/* Metrics */}
                        {stage.metrics && stage.metrics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {stage.metrics.map((metric, i) => (
                              <div key={i} className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[10px]">
                                <span className="text-slate-500">{metric.label}:</span>
                                <span className={cn(
                                  "font-mono font-medium",
                                  metric.status === 'success' ? "text-emerald-400" :
                                  metric.status === 'warning' ? "text-yellow-400" :
                                  metric.status === 'error' ? "text-red-400" :
                                  "text-slate-300"
                                )}>{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                          <span className="text-xs text-slate-500 flex items-center"><Clock size={12} className="mr-1"/> {stage.time}</span>
                          <button 
                            onClick={() => openStage(stage.id)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rightTab === 'actions' && (
            <div className="p-4 space-y-6">
              {/* Hard Blocks */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  硬阻塞 (Hard-block)
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">1</span>
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-red-500/30 hover:border-red-500/50 rounded-xl p-4 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-red-500/10 text-red-400 border-red-500/20">
                          CREDENTIAL_REQUIRED
                        </span>
                        <span className="text-xs font-mono text-slate-500">阶段 A</span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">hr_core_db</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 shrink-0 ml-2">TSK-001</span>
                    </div>
                    
                    <p className="text-sm mb-4 text-slate-200">
                      数据源连接失败，需检查凭证
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openStage('A')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors"
                        >
                          立即处理
                        </button>
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors border border-slate-700">
                          重试
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">10分钟前</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soft Tasks */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                  软任务 (Soft-task)
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">2</span>
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-4 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          SEMANTIC_CONFLICT
                        </span>
                        <span className="text-xs font-mono text-slate-500">阶段 D</span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">employees.salary</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 shrink-0 ml-2">TSK-002</span>
                    </div>
                    
                    <p className="text-sm mb-4 text-slate-200">
                      发现语义冲突：salary 字段可能包含敏感信息，建议添加脱敏规则
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            openStage('D');
                            setSelectedField('salary');
                            setIsFieldDrawerOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors"
                        >
                          立即处理
                        </button>
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors border border-slate-700">
                          标记已解决
                        </button>
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors border border-slate-700">
                          重试
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">刚刚</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors opacity-60">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-slate-800 text-slate-400 border-slate-700">
                          MISSING_DESCRIPTION
                        </span>
                        <span className="text-xs font-mono text-slate-500">阶段 B</span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">employees.department_id</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 shrink-0 ml-2">TSK-003</span>
                    </div>
                    
                    <p className="text-sm mb-4 text-slate-400 line-through">
                      字段 department_id 缺少业务描述，建议补充
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                      <span className="text-emerald-400 flex items-center text-xs">
                        <CheckCircle2 size={14} className="mr-1"/> 已解决
                      </span>
                      <span className="text-xs text-slate-500">1小时前</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {rightTab === 'deliverables' && (
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar h-full pb-20">
              {/* SemanticResultsCard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center">
                    <Database size={16} className="mr-2 text-indigo-400" />
                    语义结果 (Semantic Results)
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">READY</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">自动确认字段</div>
                    <div className="text-lg font-bold text-slate-200">142</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">草案字段</div>
                    <div className="text-lg font-bold text-slate-200">28</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">未知占比</div>
                    <div className="text-lg font-bold text-yellow-500">5.2%</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Route 分布</div>
                    <div className="text-xs font-medium text-slate-300">
                      <div className="flex justify-between mb-1"><span>DIM:</span> <span>60%</span></div>
                      <div className="flex justify-between"><span>FACT:</span> <span>40%</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center">
                    <ExternalLink size={14} className="mr-1.5" />
                    打开语义工作台
                  </button>
                  <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                    <Download size={14} className="mr-1.5" />
                    导出 JSON
                  </button>
                </div>
              </div>

              {/* QualityDraftCard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center">
                    <ShieldCheck size={16} className="mr-2 text-indigo-400" />
                    质量规则草案 (Quality Drafts)
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">READY</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1 bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">规则总数</div>
                    <div className="text-lg font-bold text-slate-200">45</div>
                  </div>
                  <div className="flex-1 bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">P1 / P2</div>
                    <div className="text-lg font-bold text-slate-200">12 <span className="text-slate-500 text-sm">/ 33</span></div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-medium text-slate-500 mb-2">Top Violations (预测)</div>
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800/50">
                    <span className="text-xs text-slate-300 truncate pr-2">NULL_CHECK on salary</span>
                    <span className="text-xs font-mono text-red-400">High</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800/50">
                    <span className="text-xs text-slate-300 truncate pr-2">FORMAT_CHECK on email</span>
                    <span className="text-xs font-mono text-yellow-500">Med</span>
                  </div>
                </div>
                
                <button className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                  <ExternalLink size={14} className="mr-1.5" />
                  打开质量草案
                </button>
              </div>

              {/* ObjectCandidatesCard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center">
                    <Box size={16} className="mr-2 text-indigo-400" />
                    候选对象 (Object Candidates)
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">READY</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">发现对象总数</span>
                  <span className="text-lg font-bold text-slate-200">12</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-medium text-slate-500 mb-2">Top 5 Objects</div>
                  {['Employee', 'Department', 'Salary', 'Attendance', 'Performance'].map((obj, i) => (
                    <div key={obj} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800/50">
                      <span className="text-xs text-slate-300">{obj}</span>
                      <span className="text-xs font-mono text-indigo-400">{(0.98 - i * 0.05).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <button className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                  <ExternalLink size={14} className="mr-1.5" />
                  查看候选对象
                </button>
              </div>
            </div>
          )}

          {rightTab === 'replay' && (
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar h-full pb-20">
              {/* Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Run ID</label>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                    <option>RUN-20231024-001</option>
                    <option>RUN-20231023-042</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Version A (Baseline)</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                      <option>v1.0.0</option>
                      <option>v0.9.5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Version B (Compare)</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                      <option>v1.1.0-draft</option>
                      <option>v1.0.1</option>
                    </select>
                  </div>
                </div>
                <button className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center mt-2">
                  <Play size={14} className="mr-1.5" />
                  运行对比
                </button>
              </div>

              {/* DiffSummaryCard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-200 mb-4">对比摘要 (Diff Summary)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Route Diff</div>
                    <div className="text-lg font-bold text-yellow-500">12</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Top Fields</div>
                    <div className="text-lg font-bold text-slate-200">5</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                    <div className="text-xs text-slate-500 mb-1">Evidence</div>
                    <div className="text-lg font-bold text-slate-200">34</div>
                  </div>
                </div>
              </div>

              {/* DiffTable */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200">字段差异详情 (Diff Table)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="px-4 py-2 font-medium">field_name</th>
                        <th className="px-4 py-2 font-medium">A.top1</th>
                        <th className="px-4 py-2 font-medium">B.top1</th>
                        <th className="px-4 py-2 font-medium">routeA</th>
                        <th className="px-4 py-2 font-medium">routeB</th>
                        <th className="px-4 py-2 font-medium">reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      <tr className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-indigo-400">emp_id</td>
                        <td className="px-4 py-3">EmployeeID</td>
                        <td className="px-4 py-3 text-emerald-400">Employee_ID</td>
                        <td className="px-4 py-3">DIM</td>
                        <td className="px-4 py-3">DIM</td>
                        <td className="px-4 py-3 text-slate-500">Naming standard update</td>
                      </tr>
                      <tr className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-indigo-400">dept_code</td>
                        <td className="px-4 py-3">Department</td>
                        <td className="px-4 py-3 text-emerald-400">DeptCode</td>
                        <td className="px-4 py-3">DIM</td>
                        <td className="px-4 py-3 text-yellow-500">FACT</td>
                        <td className="px-4 py-3 text-slate-500">Route logic changed</td>
                      </tr>
                      <tr className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-indigo-400">base_sal</td>
                        <td className="px-4 py-3">Salary</td>
                        <td className="px-4 py-3 text-emerald-400">BaseSalary</td>
                        <td className="px-4 py-3">FACT</td>
                        <td className="px-4 py-3">FACT</td>
                        <td className="px-4 py-3 text-slate-500">Better context match</td>
                      </tr>
                    </tbody>
                  </table>
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

      <FieldSemanticDrawer 
        isOpen={isFieldDrawerOpen}
        onClose={() => setIsFieldDrawerOpen(false)}
        fieldName={selectedField}
      />
    </div>
  );
}
