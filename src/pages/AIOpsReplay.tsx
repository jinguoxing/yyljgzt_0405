import React from 'react';
import { PlayCircle, Search, Filter, History, ChevronRight, Eye } from 'lucide-react';

const MOCK_REPLAYS = [
  { id: 'rep_001', runId: 'run_901', task: '表理解: t_hr_employee', date: '2026-02-25', events: 12, size: '2.4 MB' },
  { id: 'rep_002', runId: 'run_902', task: '对象生成: lv_005', date: '2026-02-25', events: 45, size: '8.1 MB' },
  { id: 'rep_003', runId: 'run_903', task: '质量巡检: 销售域', date: '2026-02-24', events: 102, size: '15.6 MB' },
];

export default function AIOpsReplay() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">审计回放 (Replay)</h2>
          <p className="text-sm text-slate-400 mt-1">回放 AI 员工的推理过程和操作步骤，用于审计和调试</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="搜索回放记录..." 
                className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>
            <button className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">回放 ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">关联运行</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">任务名称</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">事件数</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">大小</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">日期</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_REPLAYS.map((replay) => (
                <tr key={replay.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-mono text-sm text-emerald-400 flex items-center space-x-2">
                    <PlayCircle size={16} className="text-emerald-500" />
                    <span>{replay.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-indigo-400">{replay.runId}</td>
                  <td className="px-6 py-4 text-sm text-slate-200">{replay.task}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-300">{replay.events}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">{replay.size}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{replay.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ml-auto">
                      <Eye size={14} />
                      <span>查看回放</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
