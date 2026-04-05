import React from 'react';
import { BarChart3, Activity, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';

export default function AIOpsMetrics() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">指标与成本 (KPI/Cost)</h2>
          <p className="text-sm text-slate-400 mt-1">监控 AI 运营效率、资源消耗和成本 ROI</p>
        </div>
        <div className="flex space-x-2">
          <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
            <option>最近 7 天</option>
            <option>最近 30 天</option>
            <option>本季度</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center space-x-2">
              <Zap size={16} className="text-emerald-400" />
              <span>自动化率 (Automation Rate)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">+5.2%</span>
          </div>
          <div className="text-3xl font-bold text-slate-100 mb-1">87.4%</div>
          <p className="text-xs text-slate-500">本周共处理 12,450 个任务，其中 10,881 个由 AI 自动完成</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center space-x-2">
              <Clock size={16} className="text-blue-400" />
              <span>平均处理耗时 (Avg Processing Time)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">-12%</span>
          </div>
          <div className="text-3xl font-bold text-slate-100 mb-1">14.2s</div>
          <p className="text-xs text-slate-500">相比上周减少 1.9s，主要得益于模型推理优化</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center space-x-2">
              <DollarSign size={16} className="text-indigo-400" />
              <span>Token 消耗成本 (Token Cost)</span>
            </h3>
            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">+2.1%</span>
          </div>
          <div className="text-3xl font-bold text-slate-100 mb-1">$452.80</div>
          <p className="text-xs text-slate-500">本周累计消耗 12.5M Tokens，平均成本 $0.036/任务</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
            <Activity size={16} className="text-slate-400" />
            <span>任务处理趋势</span>
          </h3>
          <div className="flex-1 border border-slate-800/50 rounded-lg bg-slate-950/50 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">图表加载中...</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center space-x-2">
            <TrendingUp size={16} className="text-slate-400" />
            <span>成本与 ROI 分析</span>
          </h3>
          <div className="flex-1 border border-slate-800/50 rounded-lg bg-slate-950/50 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">图表加载中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
