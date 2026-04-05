import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, CheckCircle2, AlertTriangle, Activity, 
  ArrowUpRight, Filter, MoreHorizontal, Eye, ExternalLink, X, ArrowRight, Check, Trash2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SemanticApi, Task } from '@/services/semanticApi';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'motion/react';

export default function SemanticInbox() {
  const [summary, setSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isBatchIgnoreModalOpen, setIsBatchIgnoreModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial data
    SemanticApi.getInboxSummary().then(setSummary);
    SemanticApi.getInboxTasks({ quickFilter: activeFilter }).then(res => {
      setTasks(res.items);
      setSelectedTaskIds(new Set()); // Reset selection on filter change
    });
  }, [activeFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(new Set(tasks.map(t => t.taskId)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTaskIds);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTaskIds(newSelected);
  };

  const handleBatchIgnore = () => {
    setTasks(prev => prev.filter(t => !selectedTaskIds.has(t.taskId)));
    if (selectedTask && selectedTaskIds.has(selectedTask.taskId)) {
      setSelectedTask(null);
    }
    setSelectedTaskIds(new Set());
    setIsBatchIgnoreModalOpen(false);
  };

  const handleAcceptCandidate = (taskId: string, candidateIdx: number) => {
    // Mock logic: remove task from list to simulate resolution
    setTasks(prev => prev.filter(t => t.taskId !== taskId));
    setSelectedTask(null);
  };

  const handleIgnoreCandidate = (taskId: string, candidateIdx: number) => {
    console.log(`Ignored candidate ${candidateIdx} for task ${taskId}`);
  };

  const handleTaskClick = async (task: Task) => {
    const detail = await SemanticApi.getTaskDetail(task.taskId);
    setSelectedTask(detail as Task);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 lg:p-6 bg-slate-950">
      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard 
          title="待处理阻断 (Must)" 
          value={summary?.open.must || 0} 
          icon={<AlertCircle className="text-red-500" />} 
          trend="high"
        />
        <KPICard 
          title="语义冲突" 
          value={summary?.open.conflict || 0} 
          icon={<AlertTriangle className="text-orange-500" />} 
        />
        <KPICard 
          title="异常检测" 
          value={summary?.open.anomaly || 0} 
          icon={<Activity className="text-yellow-500" />} 
        />
        <KPICard 
          title="覆盖率缺口" 
          value={summary?.coverageGapCount || 0} 
          icon={<ArrowUpRight className="text-slate-400" />} 
          subtext="距离阈值差值"
        />
        <KPICard 
          title="高影响任务" 
          value={summary?.highImpactCount || 0} 
          icon={<ArrowUpRight className="text-slate-400" />} 
          subtext="> 10 个下游依赖"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        
        {/* Left Filters */}
        <div className="w-48 hidden md:flex flex-col border-r border-slate-800 p-4 space-y-6 bg-slate-900/30">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">快速筛选</h3>
            <div className="space-y-1">
              {[
                { key: 'ALL', label: '全部' },
                { key: 'MUST', label: '阻断 (Must)' },
                { key: 'CONFLICT', label: '冲突' },
                { key: 'ANOMALY', label: '异常' },
                { key: 'HIGH_IMPACT', label: '高影响' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    activeFilter === filter.key 
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">严重程度</h3>
            <div className="space-y-2">
              {['MUST', 'REVIEW', 'INFO'].map(sev => (
                <label key={sev} className="flex items-center space-x-2 text-sm text-slate-400 cursor-pointer hover:text-slate-200">
                  <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50" />
                  <span>{sev}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/20 relative">
          {/* Toolbar (Visible when items selected) */}
          {selectedTaskIds.size > 0 && (
            <div className="absolute top-0 left-0 right-0 h-10 bg-indigo-900/90 backdrop-blur-sm border-b border-indigo-500/30 flex items-center justify-between px-4 z-10 shadow-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-indigo-100">已选择 {selectedTaskIds.size} 项</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedTaskIds(new Set())}
                  className="px-3 py-1 text-xs text-indigo-200 hover:text-white hover:bg-indigo-800/50 rounded transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => setIsBatchIgnoreModalOpen(true)}
                  className="px-3 py-1 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 border border-red-500/30 rounded flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>批量忽略</span>
                </button>
              </div>
            </div>
          )}

          {/* Table Header */}
          <div className="h-10 border-b border-slate-800 flex items-center px-4 text-xs font-medium text-slate-500 bg-slate-900/50">
            <div className="w-10 flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={tasks.length > 0 && selectedTaskIds.size === tasks.length}
                onChange={handleSelectAll}
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50"
              />
            </div>
            <div className="w-32">逻辑视图 (LV)</div>
            <div className="w-24">范围</div>
            <div className="flex-1">问题描述</div>
            <div className="w-24">严重程度</div>
            <div className="w-24 text-right">更新时间</div>
            <div className="w-20"></div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {tasks.map(task => (
              <div 
                key={task.taskId}
                onClick={() => handleTaskClick(task)}
                className={cn(
                  "flex items-center px-4 py-3 border-b border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-800/50",
                  selectedTask?.taskId === task.taskId ? "bg-indigo-900/20 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent",
                  selectedTaskIds.has(task.taskId) && "bg-indigo-900/10"
                )}
              >
                <div className="w-10 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedTaskIds.has(task.taskId)}
                    onChange={(e) => handleSelectTask(task.taskId, e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="w-32 text-sm text-slate-300 truncate font-mono">{task.lvName}</div>
                <div className="w-24 text-xs text-slate-400 truncate">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{task.scope.type}</span>
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-sm text-slate-200 font-medium truncate">{task.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                    <span>{task.taskType}</span>
                    <span>•</span>
                    <span>影响: {task.impact.downstreams} 个下游</span>
                  </div>
                </div>
                <div className="w-24">
                  <SeverityBadge severity={task.severity} />
                </div>
                <div className="w-24 text-right text-xs text-slate-500 font-mono">
                  {new Date(task.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="w-20 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-slate-700 rounded text-slate-400">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel (Details) */}
        <AnimatePresence mode="wait">
          {selectedTask && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden shadow-xl"
            >
              <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
                <span className="font-semibold text-slate-200">任务详情</span>
                <button onClick={() => setSelectedTask(null)} className="text-slate-500 hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Header Info */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <SeverityBadge severity={selectedTask.severity} />
                    <span className="text-xs text-slate-500 font-mono">{selectedTask.taskId}</span>
                  </div>
                  <h2 className="text-lg font-medium text-slate-100 leading-snug">{selectedTask.title}</h2>
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm text-slate-300">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-slate-500">范围 (Scope)</div>
                      <div className="text-right font-mono">{selectedTask.scope.name}</div>
                      <div className="text-slate-500">阶段 (Phase)</div>
                      <div className="text-right capitalize">{selectedTask.phase}</div>
                    </div>
                  </div>
                </div>

                {/* Evidence & Candidates */}
                {(selectedTask as any).candidates && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">推荐建议</h3>
                    {(selectedTask as any).candidates.map((cand: any, idx: number) => (
                      <div key={idx} className={cn(
                        "p-3 rounded-lg border transition-all cursor-pointer group",
                        idx === 0 
                          ? "bg-indigo-900/20 border-indigo-500/50 hover:bg-indigo-900/30" 
                          : "bg-slate-800/30 border-slate-700 hover:bg-slate-800"
                      )}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", idx === 0 ? "bg-indigo-500 text-white" : "bg-slate-600 text-slate-200")}>
                            {cand.label === 'Recommended' ? '推荐' : '备选'}
                          </span>
                          <span className="text-xs font-mono text-green-400">{(cand.confidence * 100).toFixed(0)}% 置信度</span>
                        </div>
                        <div className="text-sm text-slate-200 font-medium">
                          {cand.fieldSemanticType} <span className="text-slate-500">作为</span> {cand.fieldRole}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cand.evidenceRefs.map((ref: string) => (
                            <span key={ref} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                              {ref}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleIgnoreCandidate(selectedTask.taskId, idx); }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                            title="忽略此建议"
                          >
                            <X size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAcceptCandidate(selectedTask.taskId, idx); }}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm shadow-indigo-900/20"
                            title="采纳此建议"
                          >
                            <Check size={14} />
                            <span>采纳</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Impact Card */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">影响分析</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-lg font-bold text-slate-200">{selectedTask.impact.downstreams}</div>
                      <div className="text-[10px] text-slate-500 uppercase">下游依赖</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-lg font-bold text-slate-200">{selectedTask.impact.objects}</div>
                      <div className="text-[10px] text-slate-500 uppercase">关联对象</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                      <div className="text-lg font-bold text-red-400">{selectedTask.impact.sensitiveFields}</div>
                      <div className="text-[10px] text-slate-500 uppercase">敏感字段</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur space-y-2">
                <button 
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye size={16} />
                  <span>预览修复批次</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                    忽略
                  </button>
                  <button 
                    onClick={() => navigate(`/semantic/table-understanding/${selectedTask.taskId}`)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center space-x-2"
                  >
                    <span>前往表理解</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal (Simplified) */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100">预览决策批次</h2>
              <p className="text-slate-400 text-sm mt-1">正在审查任务 {selectedTask?.taskId} 的变更</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm">
                <div className="flex items-center space-x-4 text-slate-400 mb-2 pb-2 border-b border-slate-800">
                  <span className="w-24">字段</span>
                  <span className="flex-1">变更内容</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="w-24 text-slate-300">employee_id</span>
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-red-400 line-through">UNKNOWN</span>
                    <ArrowRight size={14} className="text-slate-600" />
                    <span className="text-green-400 font-bold">IDENTIFIER (PK)</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase">门禁影响</div>
                  <div className="text-green-400 font-medium mt-1">Must 计数 -1</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase">覆盖率</div>
                  <div className="text-green-400 font-medium mt-1">+6.0%</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase">风险等级</div>
                  <div className="text-yellow-400 font-medium mt-1">HIGH → MED</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  // Trigger commit logic
                  setSelectedTask(null);
                  setTasks(prev => prev.filter(t => t.taskId !== selectedTask?.taskId));
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-lg shadow-green-900/20 transition-colors"
              >
                提交变更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Ignore Confirmation Modal */}
      {isBatchIgnoreModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">确认批量忽略</h2>
                <p className="text-slate-400 text-sm mt-1">您即将忽略 {selectedTaskIds.size} 个任务</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-300 leading-relaxed">
                被忽略的任务将不会在当前的待办箱中显示，且不会计入当前的质量评分。您确定要执行此操作吗？
              </p>
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsBatchIgnoreModalOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button 
                onClick={handleBatchIgnore}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-900/20 transition-colors"
              >
                确认忽略
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, trend, subtext }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        {subtext && <div className="text-[10px] text-slate-500 mt-1">{subtext}</div>}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles = {
    MUST: "bg-red-500/10 text-red-400 border-red-500/20",
    REVIEW: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    INFO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide", (styles as any)[severity])}>
      {severity}
    </span>
  );
}
