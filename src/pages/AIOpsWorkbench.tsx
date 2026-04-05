import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Clock, MessageSquare, PlayCircle, 
  CheckCircle2, AlertTriangle, MoreVertical, LayoutDashboard,
  Library, ChevronDown, Database, Bot, ShieldAlert, Play,
  Archive, ExternalLink, CheckSquare, X, Activity, AlertCircle, FileText, User, ChevronRight,
  ListTodo, Package, RotateCcw, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIOpsWorkbenchRequestCreateModal from '@/components/AIOpsWorkbenchRequestCreateModal';
import AIOpsTemplateLibraryModal from '@/components/AIOpsTemplateLibraryModal';

const MOCK_TASKS = [
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
  const [activeTaskId, setActiveTaskId] = useState<string>('REQ-20260227-001');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const handleCreateRequest = (start: boolean) => {
    setIsCreateModalOpen(false);
    const newId = `REQ-20260227-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    navigate(`/aiops/workbench/requests/${newId}`);
  };

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
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
            <User size={16} className="text-slate-300" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Left Rail (Task Pool) */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 font-medium text-slate-200 flex items-center justify-between">
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
                          onMouseLeave={() => setDropdownOpenId(null)}
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
                                <button className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"><ExternalLink size={12} className="mr-2"/> 查看详情</button>
                                <button className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"><Play size={12} className="mr-2"/> 重新运行</button>
                                <button className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center"><Archive size={12} className="mr-2"/> 归档</button>
                                <div className="h-px bg-slate-700 my-1"></div>
                                <button className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-slate-700 transition-colors flex items-center"><CheckSquare size={12} className="mr-2"/> 标记完成</button>
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* 3. Unified Input Bar */}
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
                    <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">清空</button>
                  </div>
                  
                  <div className="w-px h-4 bg-slate-700 mx-1"></div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">快捷模板:</span>
                    <button className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">一键运行全流程</button>
                    <button className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">只跑扫描</button>
                    <button className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">查找支持 GMV 的数据</button>
                  </div>
                </div>
                
                <div className="absolute bottom-3 right-3">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20 flex items-center space-x-1">
                    <Play size={14} />
                    <span>发起</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Main Workspace */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* A. System Understanding Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-200 flex items-center">
                    <Bot size={16} className="mr-2 text-indigo-400"/> 
                    系统理解
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-800">修改配置</button>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-indigo-500/10">查看详情</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-slate-500">任务类型</span>
                    <span className="text-slate-300">语义治理</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-slate-500">AI 员工</span>
                    <span className="text-slate-300 flex items-center">数据语义理解专家 <span className="ml-2 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1 rounded">L2</span></span>
                  </div>
                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <span className="text-xs text-slate-500">当前目标</span>
                    <span className="text-slate-300">完成 hr_core_db.employees 的结构理解、字段语义判定，并生成候选业务对象</span>
                  </div>
                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <span className="text-xs text-slate-500">当前范围</span>
                    <span className="text-slate-300">HR 域 / hr_core_db / employees</span>
                  </div>
                  <div className="flex flex-col space-y-1 md:col-span-2">
                    <span className="text-xs text-slate-500">执行策略</span>
                    <span className="text-slate-300">系统自动完成扫描、画像和规则草案生成；语义冲突与对象合并建议转人工确认</span>
                  </div>
                </div>
              </div>
              
              {/* B. Closed-loop Status Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium text-slate-200 flex items-center">
                    <Activity size={16} className="mr-2 text-emerald-400"/> 
                    闭环状态
                  </h3>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-slate-400">已完成 <span className="text-slate-200 font-medium">3/5</span></span>
                    <span className="text-slate-400">待确认 <span className="text-slate-200 font-medium">2</span></span>
                    <span className="text-slate-400">Hard-block <span className="text-slate-200 font-medium">0</span></span>
                    <span className="text-slate-400">Soft-task <span className="text-slate-200 font-medium">3</span></span>
                    <span className="text-slate-400">当前交付物 <span className="text-slate-200 font-medium">2</span></span>
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-medium">暂不可正式交付</span>
                  </div>
                </div>
                <div className="flex items-center justify-between relative px-4">
                  <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-indigo-500 z-0"></div>
                  
                  {[
                    { label: '需求解析', status: 'done' },
                    { label: '方案生成', status: 'done' },
                    { label: '执行中', status: 'active' },
                    { label: '待确认', status: 'pending' },
                    { label: '完成', status: 'pending' }
                  ].map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-slate-900",
                        step.status === 'done' ? "border-indigo-500 text-indigo-500" :
                        step.status === 'active' ? "border-indigo-400 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" :
                        "border-slate-700 text-slate-500"
                      )}>
                        {step.status === 'done' ? <CheckCircle2 size={14} /> : idx + 1}
                      </div>
                      <span className={cn(
                        "text-xs mt-2 font-medium absolute top-8 whitespace-nowrap",
                        step.status === 'done' ? "text-slate-300" :
                        step.status === 'active' ? "text-indigo-400" :
                        "text-slate-500"
                      )}>{step.label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-6"></div> {/* Spacer for absolute labels */}
              </div>

              {/* C. Top 3 Important Tasks */}
              <div>
                <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center">
                  <AlertCircle size={16} className="mr-2 text-amber-400"/> 
                  当前最重要任务
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Task 1 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">FIELD_SEMANTIC_UNRESOLVED</span>
                        <span className="text-[10px] text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">阻塞交付: 否</span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center"><Clock size={12} className="mr-1"/> 10分钟前</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mb-2">字段语义冲突待确认</h4>
                    <div className="text-xs text-slate-300 mb-1"><span className="text-slate-500">问题：</span>发现 3 个字段存在语义冲突</div>
                    <div className="text-xs text-slate-400 mb-4 line-clamp-2"><span className="text-slate-500">原因：</span>department_id / manager_id 的 Top1 与 Top2 候选差异过小</div>
                    
                    <div className="mt-auto pt-3 border-t border-slate-800/50 flex items-center justify-between">
                      <div className="text-xs text-indigo-400 flex items-center">
                        <span className="text-slate-500 mr-1">推荐动作：</span>进入字段语义裁决
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs text-slate-400 hover:text-slate-200 transition-colors">稍后处理</button>
                        <button className="text-xs text-slate-400 hover:text-slate-200 transition-colors">查看原因</button>
                        <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors">立即处理</button>
                      </div>
                    </div>
                  </div>

                  {/* Task 2 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">DUPLICATE_OBJECT</span>
                        <span className="text-[10px] text-red-400 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded">阻塞交付: 是</span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center"><Clock size={12} className="mr-1"/> 2小时前</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mb-2">候选对象存在合并建议</h4>
                    <div className="text-xs text-slate-300 mb-1"><span className="text-slate-500">问题：</span>发现 2 个候选对象可能表达同一业务语义</div>
                    <div className="text-xs text-slate-400 mb-4 line-clamp-2"><span className="text-slate-500">原因：</span>主键与核心属性高度重叠</div>
                    
                    <div className="mt-auto pt-3 border-t border-slate-800/50 flex items-center justify-between">
                      <div className="text-xs text-indigo-400 flex items-center">
                        <span className="text-slate-500 mr-1">推荐动作：</span>进入对象合并对比
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs text-slate-400 hover:text-slate-200 transition-colors">稍后处理</button>
                        <button className="text-xs text-slate-400 hover:text-slate-200 transition-colors">查看原因</button>
                        <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors">立即处理</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* D. Recent Outputs / Recommended Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center">
                    <FileText size={16} className="mr-2 text-blue-400"/> 
                    最近产物
                  </h3>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="divide-y divide-slate-800/50">
                      {[
                        { title: '语义结果草案', desc: '包含 45 个字段的语义推断结果', time: '10分钟前' },
                        { title: '质量规则草案', desc: '基于字段特征生成的 12 条基础规则', time: '1小时前' },
                        { title: '候选对象清单', desc: '提取出 3 个潜在业务对象', time: '2小时前' }
                      ].map((item, i) => (
                        <div key={i} className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                              <Package size={14} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center">
                    <PlayCircle size={16} className="mr-2 text-emerald-400"/> 
                    推荐下一步
                  </h3>
                  <div className="space-y-2">
                    {[
                      { title: '去处理冲突字段', action: '立即前往', primary: true },
                      { title: '打开候选对象工作台', action: '打开', primary: false },
                      { title: '重新运行 Stage D', action: '运行', primary: false },
                      { title: '转入问数验证', action: '转入', primary: false }
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors flex items-center justify-between group cursor-pointer">
                        <span className="text-sm text-slate-300 group-hover:text-slate-200">{item.title}</span>
                        <button className={cn(
                          "text-xs px-3 py-1.5 rounded transition-colors flex items-center",
                          item.primary 
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        )}>
                          {item.action} <ChevronRight size={14} className="ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 5. Right Console */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/30 flex flex-col shrink-0">
          <div className="flex border-b border-slate-800">
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
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <h4 className="text-xs font-medium text-slate-300 mb-2">当前运行概况</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">活跃任务</div>
                      <div className="text-lg font-bold text-indigo-400">12</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500">今日消耗</div>
                      <div className="text-lg font-bold text-slate-200">45.2k</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <h4 className="text-xs font-medium text-slate-300 mb-2">最近动态</h4>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-3 h-3 rounded-full border border-slate-700 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2 rounded border border-slate-800 bg-slate-950 shadow-sm">
                          <div className="text-[10px] text-slate-500 mb-1">10:42 AM</div>
                          <div className="text-xs text-slate-300">Data Steward AI 完成了 employees 表的扫描。</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'todo' && (
              <div className="text-sm text-slate-400 text-center py-8">
                待处理摘要内容
              </div>
            )}
            {activeTab === 'deliverable' && (
              <div className="text-sm text-slate-400 text-center py-8">
                交付物摘要内容
              </div>
            )}
            {activeTab === 'replay' && (
              <div className="text-sm text-slate-400 text-center py-8">
                回放摘要内容
              </div>
            )}
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

