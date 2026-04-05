import React from 'react';
import { Activity, Search, Filter, PlayCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

const MOCK_RUNS = [
  { id: 'run_901', task: '表理解: t_hr_employee', status: 'SUCCESS', duration: '12.4s', time: '10:42:15', employee: '语义建模助手' },
  { id: 'run_902', task: '对象生成: lv_005', status: 'SUCCESS', duration: '45.1s', time: '10:35:02', employee: '语义建模助手' },
  { id: 'run_903', task: '质量巡检: 销售域', status: 'FAILED', duration: '120.5s', time: '09:15:00', employee: '数据质量巡检员' },
  { id: 'run_904', task: '血缘分析: ods_orders', status: 'RUNNING', duration: '...', time: '10:45:00', employee: '血缘分析专员' },
];

export default function AIOpsRuns() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">运行记录 (Runs)</h2>
          <p className="text-sm text-slate-400 mt-1">查看 AI 员工执行任务的历史记录和实时状态</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="搜索运行 ID 或任务..." 
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
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">运行 ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">任务名称</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">执行员工</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">状态</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">耗时</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_RUNS.map((run) => (
                <tr key={run.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-mono text-sm text-indigo-400">{run.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-200">{run.task}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{run.employee}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      run.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      run.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {run.status === 'SUCCESS' && <CheckCircle2 size={12} className="mr-1" />}
                      {run.status === 'FAILED' && <XCircle size={12} className="mr-1" />}
                      {run.status === 'RUNNING' && <Clock size={12} className="mr-1 animate-spin" />}
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">{run.duration}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{run.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
