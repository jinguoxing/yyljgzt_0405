import React, { useState } from 'react';
import { 
  Search, Filter, AlertTriangle, CheckCircle2, 
  Clock, X, ChevronRight, Database, Table as TableIcon, 
  Columns, User, Zap, RefreshCw, AlertCircle, EyeOff, ArrowRight, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_TASKS = [
  {
    task_id: 'TRG-2026-001',
    asset_ref: 'mysql/hr_db/t_employee',
    field_ref: 'ssn_number',
    route: 'NEEDS_CONFIRM',
    priority: 'HIGH',
    status: 'OPEN',
    assignee: 'Unassigned',
    sla_due: '2h',
    created_at: '2026-02-27 01:15:00',
    details: {
      topK: [
        { type: 'STRING', role: 'PII_SSN', jointScore: 0.85, confType: 0.99, confRole: 0.86, gap: 0.15, completeness: 0.9, ignoreScore: 0.05 },
        { type: 'STRING', role: 'ID_CARD', jointScore: 0.70, confType: 0.99, confRole: 0.71, gap: 0.15, completeness: 0.9, ignoreScore: 0.05 }
      ],
      evidence: [
        { dim: 'D1 (Metadata)', desc: 'Column name matches pattern %ssn%' },
        { dim: 'D3 (Data Profile)', desc: 'Format matches XXX-XX-XXXX in 98% of rows' },
        { dim: 'D5 (Lineage)', desc: 'Upstream source is labeled as PII' }
      ],
      recommendation: '确认 (Confirm Candidate 1)'
    }
  },
  {
    task_id: 'TRG-2026-002',
    asset_ref: 'hive/dw_core/fact_sales',
    field_ref: '',
    route: 'CONFLICT',
    priority: 'CRITICAL',
    status: 'ASSIGNED',
    assignee: 'Zhang San',
    sla_due: '30m',
    created_at: '2026-02-27 01:30:00',
    details: {
      topK: [
        { type: 'TABLE', role: 'FACT', jointScore: 0.65, confType: 0.9, confRole: 0.72, gap: 0.05, completeness: 0.8, ignoreScore: 0.1 },
        { type: 'TABLE', role: 'DIMENSION', jointScore: 0.60, confType: 0.9, confRole: 0.66, gap: 0.05, completeness: 0.8, ignoreScore: 0.1 }
      ],
      evidence: [
        { dim: 'D2 (DDL)', desc: 'Contains many foreign keys, typical of FACT' },
        { dim: 'D4 (Query Logs)', desc: 'Frequently joined as a dimension table' }
      ],
      recommendation: '人工介入 (Human Review Required)'
    }
  },
  {
    task_id: 'TRG-2026-003',
    asset_ref: 'snowflake/sales_mart/v_revenue',
    field_ref: 'revenue_ytd',
    route: 'ANOMALY',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Unassigned',
    sla_due: '12h',
    created_at: '2026-02-26 22:00:00',
    details: {
      topK: [
        { type: 'DECIMAL', role: 'METRIC_REVENUE', jointScore: 0.45, confType: 0.99, confRole: 0.45, gap: 0.3, completeness: 0.6, ignoreScore: 0.2 }
      ],
      evidence: [
        { dim: 'D3 (Data Profile)', desc: 'Values dropped by 90% compared to last week' }
      ],
      recommendation: '重跑 (Rerun/Refresh Data)'
    }
  },
  {
    task_id: 'TRG-2026-004',
    asset_ref: 'mysql/log_db/app_events',
    field_ref: 'raw_payload',
    route: 'IGNORE_CANDIDATE',
    priority: 'LOW',
    status: 'OPEN',
    assignee: 'Unassigned',
    sla_due: '24h',
    created_at: '2026-02-26 18:00:00',
    details: {
      topK: [
        { type: 'JSON', role: 'UNKNOWN', jointScore: 0.15, confType: 0.99, confRole: 0.15, gap: 0.8, completeness: 0.2, ignoreScore: 0.95 }
      ],
      evidence: [
        { dim: 'D1 (Metadata)', desc: 'Column name indicates raw dump' },
        { dim: 'D8 (Heuristics)', desc: 'High entropy, unstructured JSON, no clear business value' }
      ],
      recommendation: '标记忽略 (Mark IGNORE)'
    }
  }
];

const GROUPS = [
  { id: 'AUTO_PASS', label: 'AUTO_PASS', count: 12450, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', isStatsOnly: true },
  { id: 'NEEDS_CONFIRM', label: 'NEEDS_CONFIRM', count: 45, icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'CONFLICT', label: 'CONFLICT', count: 12, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'ANOMALY', label: 'ANOMALY', count: 3, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'IGNORE_CANDIDATE', label: 'IGNORE_CANDIDATE', count: 89, icon: EyeOff, color: 'text-slate-400', bg: 'bg-slate-500/10' },
];

export default function AIOpsTasks() {
  const [activeGroup, setActiveGroup] = useState('NEEDS_CONFIRM');
  const [selectedTask, setSelectedTask] = useState<typeof MOCK_TASKS[0] | null>(null);

  const filteredTasks = MOCK_TASKS.filter(t => t.route === activeGroup);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950">
      {/* Left Sidebar Groups */}
      <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-slate-800 shrink-0">
          <h2 className="font-bold text-slate-100">待办分组 (Routes)</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {GROUPS.map(group => (
            <button
              key={group.id}
              onClick={() => !group.isStatsOnly && setActiveGroup(group.id)}
              disabled={group.isStatsOnly}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors",
                activeGroup === group.id 
                  ? "bg-slate-800 text-slate-100 shadow-sm" 
                  : group.isStatsOnly 
                    ? "opacity-60 cursor-default hover:bg-transparent" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn("p-1.5 rounded-lg", group.bg)}>
                  <group.icon size={16} className={group.color} />
                </div>
                <div className="flex flex-col items-start">
                  <span>{group.label}</span>
                  {group.isStatsOnly && <span className="text-[10px] text-slate-500 font-normal">仅统计，不进队列</span>}
                </div>
              </div>
              <span className={cn(
                "font-mono",
                activeGroup === group.id ? "text-slate-200" : "text-slate-500"
              )}>
                {group.count.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="搜索 Task ID 或资产..." 
                className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>
            <button className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
              <Filter size={16} />
            </button>
          </div>
          <div className="text-sm text-slate-400">
            共 <span className="font-bold text-slate-200">{filteredTasks.length}</span> 个待办
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Task ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">资产引用 (Asset/Field)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">优先级</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">状态</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">处理人</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">SLA Due</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      <CheckCircle2 size={32} className="mx-auto mb-3 text-slate-600" />
                      <p>当前分组没有待处理任务</p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr 
                      key={task.task_id} 
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-indigo-400">{task.task_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1.5 text-sm text-slate-200">
                            <TableIcon size={14} className="text-slate-500" />
                            <span className="truncate max-w-[200px]" title={task.asset_ref}>{task.asset_ref}</span>
                          </div>
                          {task.field_ref ? (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                              <Columns size={12} />
                              <span className="font-mono">{task.field_ref}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded w-max">表级异常</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase border",
                          task.priority === 'CRITICAL' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          task.priority === 'HIGH' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                          task.priority === 'MEDIUM' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase border",
                          task.status === 'OPEN' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          task.status === 'ASSIGNED' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                          "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2 text-sm text-slate-300">
                          <User size={14} className="text-slate-500" />
                          <span>{task.assignee}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-red-400">{task.sla_due}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{task.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Detail Drawer */}
        <AnimatePresence>
          {selectedTask && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTask(null)}
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-20"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 bottom-0 w-[600px] bg-slate-900 border-l border-slate-800 z-30 flex flex-col shadow-2xl"
              >
                {/* Drawer Header */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-950/50">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-bold text-slate-100">任务详情</h2>
                    <span className="font-mono text-sm text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {selectedTask.task_id}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Context */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">资产上下文 (Asset Context)</div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-slate-200">
                          <Database size={16} className="text-slate-400" />
                          <span className="font-mono">{selectedTask.asset_ref}</span>
                        </div>
                        <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">
                          {selectedTask.route}
                        </span>
                      </div>
                      {selectedTask.field_ref && (
                        <div className="flex items-center space-x-2 text-sm text-slate-300 pl-6 border-l-2 border-slate-800 ml-2">
                          <Columns size={14} className="text-slate-500" />
                          <span className="font-mono text-indigo-400">{selectedTask.field_ref}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TopK Candidates */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TopK 联合候选 (Joint Candidates)</div>
                    <div className="space-y-3">
                      {selectedTask.details.topK.map((cand, idx) => (
                        <div key={idx} className={cn(
                          "border rounded-xl p-4 transition-colors",
                          idx === 0 ? "bg-indigo-900/10 border-indigo-500/30" : "bg-slate-950 border-slate-800"
                        )}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-300">
                                #{idx + 1}
                              </span>
                              <span className="font-mono text-sm font-bold text-slate-200">{cand.type}</span>
                              <ArrowRight size={14} className="text-slate-600" />
                              <span className="font-mono text-sm font-bold text-emerald-400">{cand.role}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-bold font-mono text-indigo-400">{(cand.jointScore * 100).toFixed(1)}</span>
                              <span className="text-[9px] text-slate-500 uppercase">Joint Score</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2">
                            <div className="bg-slate-900 p-2 rounded border border-slate-800/50 text-center">
                              <div className="text-[9px] text-slate-500 mb-1">ConfType</div>
                              <div className="text-xs font-mono text-slate-300">{cand.confType}</div>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800/50 text-center">
                              <div className="text-[9px] text-slate-500 mb-1">ConfRole</div>
                              <div className="text-xs font-mono text-slate-300">{cand.confRole}</div>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800/50 text-center">
                              <div className="text-[9px] text-slate-500 mb-1">Gap</div>
                              <div className="text-xs font-mono text-yellow-500">{cand.gap}</div>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800/50 text-center">
                              <div className="text-[9px] text-slate-500 mb-1">Completeness</div>
                              <div className="text-xs font-mono text-slate-300">{cand.completeness}</div>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800/50 text-center">
                              <div className="text-[9px] text-slate-500 mb-1">IgnoreScore</div>
                              <div className="text-xs font-mono text-slate-300">{cand.ignoreScore}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Chain */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">证据链 (Evidence Chain)</div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      {selectedTask.details.evidence.map((ev, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="px-2 py-1 bg-slate-800 rounded text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                            {ev.dim}
                          </div>
                          <div className="text-sm text-slate-300 leading-relaxed">
                            {ev.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">推荐动作 (Recommendation)</div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center space-x-3">
                      <Zap size={20} className="text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">{selectedTask.details.recommendation}</span>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-6 border-t border-slate-800 bg-slate-950/50 shrink-0 space-y-3">
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20">
                      确认并写回
                    </button>
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20">
                      改判并写回
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                      标记忽略
                    </button>
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center space-x-2">
                      <RefreshCw size={14} />
                      <span>重跑 (刷新证据)</span>
                    </button>
                    <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/20">
                      升级冲突
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
