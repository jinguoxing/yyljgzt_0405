import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Clock, MessageSquare, PlayCircle, 
  CheckCircle2, AlertTriangle, MoreVertical, LayoutDashboard,
  Library, ChevronDown, Database, Bot, ShieldAlert, Play,
  Archive, ExternalLink, CheckSquare, X, Activity, AlertCircle, FileText, User, ChevronRight,
  ListTodo, Package, RotateCcw, MoreHorizontal, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIOpsWorkbenchRequestCreateModal from '@/components/AIOpsWorkbenchRequestCreateModal';
import AIOpsTemplateLibraryModal from '@/components/AIOpsTemplateLibraryModal';

const MOCK_TASKS = [
  { id: 'TASK-20260406-001', title: '寻找近30天订单 GMV 分析数据', status: 'COMPLETED', category: '最近完成', type: '找数', blockers: { hard: 0, soft: 0 }, lastUpdated: '10 分钟前更新' },
  { id: 'REQ-20260227-001', title: '解析 HR 域表结构与语义', status: 'RUNNING', category: '进行中', type: '语义治理', blockers: { hard: 0, soft: 3 }, lastUpdated: '10 分钟前更新' },
  { id: 'REQ-20260226-042', title: '确认 Sales 数据血缘', status: 'PENDING', category: '待确认', type: '血缘分析', blockers: { hard: 0, soft: 1 }, lastUpdated: '2 小时前更新' },
  { id: 'REQ-20260225-089', title: '生成财务指标定义', status: 'BLOCKED', category: '阻塞中', type: '指标生成', blockers: { hard: 1, soft: 0 }, lastUpdated: '1 天前更新' },
  { id: 'REQ-20260225-090', title: '用户行为日志异常检测', status: 'SUCCEEDED', category: '最近完成', type: '异常检测', blockers: { hard: 0, soft: 0 }, lastUpdated: '2 天前更新' },
  { id: 'REQ-20260224-005', title: '构建营销大宽表', status: 'SUCCEEDED', category: '最近完成', type: '数据建模', blockers: { hard: 0, soft: 0 }, lastUpdated: '3 天前更新' },
];

const getStatusConfig = (status: string) => {
  switch(status) {
    case 'RUNNING': return { label: '运行中', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    case 'BLOCKED': return { label: '已阻塞', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    case 'PENDING': return { label: '待确认', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    case 'SUCCEEDED': return { label: '已成功', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    case 'FAILED': return { label: '已失败', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    case 'PAUSED': return { label: '已暂停', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    default: return { label: status, color: 'text-slate-400 bg-slate-800 border-slate-700' };
  }
};

export default function AIOpsWorkbench() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('run'); // run, todo, deliverable, replay
  const [activeTaskId, setActiveTaskId] = useState<string | null>('REQ-20260227-001');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  // New state for post-initiation confirmation bar
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastCreatedTask, setLastCreatedTask] = useState<any>(null);
  const navTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCreateRequest = (start: boolean) => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);

    const newId = `REQ-20260227-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const newTask = {
      id: newId,
      title: inputText || '新创建的任务',
      status: 'RUNNING',
      category: '进行中',
      type: '语义治理',
      blockers: { hard: 0, soft: 0 },
      lastUpdated: '刚刚'
    };
    
    setLastCreatedTask(newTask);
    setShowConfirmation(true);
    
    // Auto-navigate after 1.5 seconds unless user stays
    navTimerRef.current = setTimeout(() => {
      navigate(`/aiops/workbench/requests/${newId}`);
    }, 1500);
  };

  const handleStayOnHomepage = () => {
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    setShowConfirmation(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const handleSelectTemplate = (template: any) => {
    setIsTemplateLibraryOpen(false);
    setSelectedTemplate(template);
    setIsCreateModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedTemplate(null);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
      {/* 1. TopBar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors mr-2"
            title={isLeftPanelOpen ? "收起左侧栏" : "展开左侧栏"}
          >
            {isLeftPanelOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </button>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-100">AI 工作台</h1>
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              placeholder="搜索任务 / 请求 / 数据源 / 表 / 对象 / 员工 / 状态..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsTemplateLibraryOpen(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <Library size={16} />
            <span>模板库</span>
          </button>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Plus size={16} />
            <span>新建任务</span>
          </button>
          <div className="relative">
            <button className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
              <MessageSquare size={16} className="text-slate-300" />
            </button>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
            <User size={16} className="text-slate-300" />
          </div>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button 
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors ml-2"
            title={isRightPanelOpen ? "收起右侧栏" : "展开右侧栏"}
          >
            {isRightPanelOpen ? <PanelRightClose size={20} /> : <PanelRight size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Left Rail (Task Pool) */}
        <div className={cn(
          "border-slate-800 bg-slate-900/30 flex flex-col shrink-0 transition-all duration-300 overflow-hidden",
          isLeftPanelOpen ? "w-80 border-r" : "w-0 border-r-0"
        )}>
          <div className="w-80 flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 font-medium text-slate-200 flex items-center justify-between shrink-0">
              <span>任务池</span>
              <button className="text-slate-400 hover:text-slate-200"><Filter size={14}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
              {['进行中', '待确认', '阻塞中', '最近完成', '我的任务'].map(category => {
                const tasksInCategory = MOCK_TASKS.filter(t => t.category === category);
                if (tasksInCategory.length === 0 && category === '我的任务') return null; // Skip empty 'My Tasks' for now

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-3 px-1">
                      <span>{category}</span>
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{tasksInCategory.length}</span>
                    </div>
                    <div className="space-y-2">
                      {tasksInCategory.map(task => {
                        const statusConfig = getStatusConfig(task.status);
                        return (
                          <div 
                            key={task.id} 
                            onClick={() => setActiveTaskId(task.id)}
                            className={cn(
                              "p-3 rounded-xl border transition-all cursor-pointer group relative", 
                              activeTaskId === task.id 
                                ? "bg-slate-800/80 border-indigo-500/50 shadow-sm" 
                                : "bg-slate-900/50 border-transparent hover:bg-slate-800/50 hover:border-slate-700"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[10px] font-mono text-slate-500">{task.id}</span>
                              <button 
                                className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" 
                                onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === task.id ? null : task.id); }}
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              {/* Dropdown Menu */}
                              {dropdownOpenId === task.id && (
                                <div className="absolute right-2 top-8 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => navigate(task.type === '找数' ? `/aiops/workbench/find-data/${task.id}` : `/aiops/workbench/requests/${task.id}`)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"><ExternalLink size={12} className="mr-2"/> 查看详情</button>
                                  <button onClick={() => setDropdownOpenId(null)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"><Play size={12} className="mr-2"/> 重新运行</button>
                                  <button onClick={() => setDropdownOpenId(null)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"><Archive size={12} className="mr-2"/> 归档</button>
                                  <div className="h-px bg-slate-700 my-1"></div>
                                  <button onClick={() => setDropdownOpenId(null)} className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-slate-700 transition-colors flex items-center"><CheckSquare size={12} className="mr-2"/> 标记完成</button>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-sm font-medium text-slate-200 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                              {task.title}
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border", statusConfig.color)}>
                                {statusConfig.label}
                              </span>
                              <span className="text-xs text-slate-400">｜ {task.type}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center space-x-2">
                                <span className={cn(
                                  "font-medium",
                                  task.blockers.hard > 0 ? "text-red-400" : task.blockers.soft > 0 ? "text-amber-400" : "text-slate-500"
                                )}>
                                  Hard {task.blockers.hard} / Soft {task.blockers.soft}
                                </span>
                              </div>
                              <span className="text-slate-500">{task.lastUpdated}</span>
                            </div>
                          </div>
                        );
                      })}
                      {tasksInCategory.length === 0 && (
                        <div className="text-xs text-slate-600 px-1 py-2 italic">暂无任务</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* 3. Unified Launcher */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/20 shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-transparent text-slate-200 p-4 min-h-[100px] resize-none focus:outline-none"
                  placeholder="直接告诉我你想完成什么，例如：帮我解析订单表结构，或找支持 GMV 分析的数据..."
                />
                
                <div className="px-4 pb-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">上下文:</span>
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded border border-indigo-500/20 flex items-center">
                      <Database size={12} className="mr-1" />
                      public.orders
                      <button className="ml-1 hover:text-indigo-300"><X size={12}/></button>
                    </span>
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded border border-indigo-500/20 flex items-center">
                      <Bot size={12} className="mr-1" />
                      HR 域
                      <button className="ml-1 hover:text-indigo-300"><X size={12}/></button>
                    </span>
                    <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">清空</button>
                  </div>
                  
                  <div className="w-px h-4 bg-slate-700 mx-1"></div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">快捷模板:</span>
                    <button onClick={() => setInputText('一键运行全流程')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">一键运行全流程</button>
                    <button onClick={() => setInputText('只跑扫描')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">只跑扫描</button>
                    <button onClick={() => setInputText('查找支持 GMV 的数据')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">查找支持 GMV 的数据</button>
                  </div>
                </div>
                
                <div className="absolute bottom-3 right-3">
                  <button 
                    onClick={() => handleCreateRequest(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20 flex items-center space-x-1"
                  >
                    <Play size={14} />
                    <span>发起</span>
                  </button>
                </div>
              </div>

              {/* Post-Initiation Confirmation Bar */}
              {showConfirmation && lastCreatedTask && (
                <div className="mt-4 bg-indigo-600/10 border border-indigo-500/30 rounded-lg p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-indigo-400" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium text-slate-200 truncate">已创建任务：{lastCreatedTask.title}</div>
                      <div className="text-xs text-slate-400 truncate">系统理解为：语义治理任务，将自动完成扫描与规则草案生成，冲突项待人工确认</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4 shrink-0">
                    <button 
                      onClick={() => navigate(`/aiops/workbench/requests/${lastCreatedTask.id}`)}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      进入详情
                    </button>
                    <button 
                      onClick={handleStayOnHomepage}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors"
                    >
                      留在首页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Main Workspace (Summary Only) */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTaskId ? (
              <div className="max-w-5xl mx-auto space-y-8">
                {/* Block A: Task Title + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-slate-100">
                      {MOCK_TASKS.find(t => t.id === activeTaskId)?.title || '任务摘要'}
                    </h2>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium border",
                      getStatusConfig(MOCK_TASKS.find(t => t.id === activeTaskId)?.status || '').color
                    )}>
                      {getStatusConfig(MOCK_TASKS.find(t => t.id === activeTaskId)?.status || '').label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => {
                        const activeTask = MOCK_TASKS.find(t => t.id === activeTaskId);
                        navigate(activeTask?.type === '找数' ? `/aiops/workbench/find-data/${activeTaskId}` : `/aiops/workbench/requests/${activeTaskId}`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20"
                    >
                      进入详情
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                      修改配置
                    </button>
                  </div>
                </div>

                {/* Block B: System Understanding Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center">
                    <Bot size={16} className="mr-2 text-indigo-400"/> 
                    系统理解
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    系统已理解为：语义治理任务，目标是完成 hr_core_db.employees 的结构理解、字段语义判定，并生成候选业务对象。
                  </p>
                  <div className="mt-4 flex items-center space-x-4">
                    <button className="text-xs text-indigo-400 hover:underline">查看完整理解</button>
                    <button className="text-xs text-indigo-400 hover:underline">修改任务配置</button>
                  </div>
                </div>

                {/* Block C: Closed-loop Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <h3 className="text-sm font-medium text-slate-200 flex items-center">
                        <Activity size={16} className="mr-2 text-emerald-400"/> 
                        闭环摘要
                      </h3>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-slate-400">已完成 <span className="text-slate-200 font-medium">3/5</span></span>
                        <span className="text-slate-400">待确认 <span className="text-slate-200 font-medium">2</span></span>
                        <span className="text-slate-400">Hard-block <span className="text-slate-200 font-medium">0</span></span>
                        <span className="text-slate-400">Soft-task <span className="text-slate-200 font-medium">3</span></span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-medium">
                      当前不可正式交付
                    </span>
                  </div>
                </div>

                {/* Block D: Top 2 Important Tasks */}
                <div>
                  <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center">
                    <AlertCircle size={16} className="mr-2 text-amber-400"/> 
                    当前最重要任务
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Task 1 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">FIELD_SEMANTIC_UNRESOLVED</span>
                          <span className="text-[10px] text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">非阻塞</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mb-1">字段语义冲突待确认</h4>
                      <p className="text-xs text-slate-400 mb-4">发现 3 个字段存在语义冲突</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                        <span className="text-xs text-indigo-400">推荐动作：进入字段语义裁决</span>
                        <button 
                          onClick={() => {
                            const activeTask = MOCK_TASKS.find(t => t.id === activeTaskId);
                            navigate(activeTask?.type === '找数' ? `/aiops/workbench/find-data/${activeTaskId}` : `/aiops/workbench/requests/${activeTaskId}`);
                          }}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          立即处理
                        </button>
                      </div>
                    </div>

                    {/* Task 2 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">DUPLICATE_OBJECT</span>
                          <span className="text-[10px] text-red-400 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded">阻塞交付</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mb-1">候选对象存在合并建议</h4>
                      <p className="text-xs text-slate-400 mb-4">发现 2 个候选对象可能表达同一业务语义</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                        <span className="text-xs text-indigo-400">推荐动作：进入对象合并对比</span>
                        <button 
                          onClick={() => {
                            const activeTask = MOCK_TASKS.find(t => t.id === activeTaskId);
                            navigate(activeTask?.type === '找数' ? `/aiops/workbench/find-data/${activeTaskId}` : `/aiops/workbench/requests/${activeTaskId}`);
                          }}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          立即处理
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">查看全部待处理</button>
                  </div>
                </div>

                {/* Block E: Recommended Next Steps */}
                <div>
                  <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center">
                    <PlayCircle size={16} className="mr-2 text-emerald-400"/> 
                    推荐下一步
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        const activeTask = MOCK_TASKS.find(t => t.id === activeTaskId);
                        navigate(activeTask?.type === '找数' ? `/aiops/workbench/find-data/${activeTaskId}` : `/aiops/workbench/requests/${activeTaskId}`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                      进入详情继续处理 <ChevronRight size={16} className="ml-1" />
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                      处理字段冲突
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                      预览当前交付物
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
                  <Bot size={40} className="text-indigo-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">
                  告诉我你想完成什么
                </h2>
                <p className="text-slate-400 mb-8">
                  我会帮你创建任务，并在详情页推进执行。你可以尝试解析表结构、查找指标数据或解释业务变化。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  {[
                    '解析表结构与语义',
                    '查找支持某指标分析的数据',
                    '解释某指标变化原因'
                  ].map((tpl, i) => (
                    <button 
                      key={i}
                      onClick={() => setInputText(tpl)}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all text-sm text-slate-300"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Right Console */}
        <div className={cn(
          "border-slate-800 bg-slate-900/30 flex flex-col shrink-0 transition-all duration-300 overflow-hidden",
          isRightPanelOpen ? "w-80 border-l" : "w-0 border-l-0"
        )}>
          <div className="w-80 flex flex-col h-full">
            <div className="flex border-b border-slate-800 shrink-0">
              {[
                { id: 'run', label: '运行摘要', icon: Activity },
                { id: 'todo', label: '待处理', icon: ListTodo },
                { id: 'deliverable', label: '交付物', icon: Package },
                { id: 'replay', label: '回放', icon: RotateCcw }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 py-3 text-xs font-medium flex flex-col items-center justify-center space-y-1 border-b-2 transition-colors",
                    activeTab === tab.id ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  )}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'run' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                    <h4 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">运行摘要</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">当前 Run ID</span>
                        <span className="text-xs font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">RUN-8A9B2C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">执行时长</span>
                        <span className="text-xs text-slate-300">00:12:45</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Token / Tool Call</span>
                        <span className="text-xs text-slate-300">12.5k / 42</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">当前阶段</span>
                        <span className="text-xs text-indigo-400 font-medium">语义推断中</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'todo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                    <h4 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">待处理摘要</h4>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-red-400 mb-1">0</div>
                        <div className="text-[10px] text-slate-500">Hard-block 数</div>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-amber-400 mb-1">3</div>
                        <div className="text-[10px] text-slate-500">Soft-task 数</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-2">最近待处理项</span>
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                        <div className="text-xs font-medium text-slate-200 mb-1 truncate">3 个字段语义冲突待确认</div>
                        <div className="text-[10px] text-slate-500">10 分钟前</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'deliverable' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                    <h4 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">交付物摘要</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">当前交付物数量</span>
                        <span className="text-lg font-bold text-emerald-400">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">最近交付物名称</span>
                        <span className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded truncate">候选对象清单</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800/50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">当前状态</span>
                          <span className="text-xs text-amber-400">可预览，不可正式交付</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'replay' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                    <h4 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">回放摘要</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">最近回放版本</span>
                        <span className="text-xs font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">v1.2 vs v1.1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">差异项</span>
                        <span className="text-xs font-bold text-amber-400">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">时间</span>
                        <span className="text-xs text-slate-300">10 分钟前</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AIOpsWorkbenchRequestCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRequest}
        initialTemplate={selectedTemplate}
      />

      <AIOpsTemplateLibraryModal
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}

