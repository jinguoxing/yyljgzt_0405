import React from 'react';
import { ShieldCheck, Search, Filter, GitBranch, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const MOCK_POLICIES = [
  { id: 'pol_001', name: '默认表理解策略', version: 'v1.2.0', status: 'ACTIVE', type: 'System', updatedAt: '2026-02-20' },
  { id: 'pol_002', name: '严格主键验证策略', version: 'v2.0.1', status: 'ACTIVE', type: 'Custom', updatedAt: '2026-02-22' },
  { id: 'pol_003', name: '敏感字段脱敏规则', version: 'v1.0.5', status: 'DRAFT', type: 'Custom', updatedAt: '2026-02-25' },
];

export default function AIOpsPolicies() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">策略与版本 (Policy & Release)</h2>
          <p className="text-sm text-slate-400 mt-1">管理 AI 员工的执行策略、规则引擎和模型版本</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
          <GitBranch size={16} />
          <span>新建策略</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="搜索策略名称..." 
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
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">策略名称</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">版本</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">类型</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">状态</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">更新时间</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_POLICIES.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <FileText size={18} className="text-indigo-400" />
                      <span className="text-sm font-medium text-slate-200">{policy.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-emerald-400">{policy.version}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">{policy.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      policy.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {policy.status === 'ACTIVE' && <CheckCircle2 size={12} className="mr-1" />}
                      {policy.status === 'DRAFT' && <AlertTriangle size={12} className="mr-1" />}
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{policy.updatedAt}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">编辑策略</button>
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
