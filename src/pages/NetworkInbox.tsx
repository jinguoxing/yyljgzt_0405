import React, { useState } from 'react';
import { 
  Filter, Search, CheckCircle2, XCircle, AlertTriangle, 
  Clock, ChevronRight, MoreHorizontal, Layers, 
  ArrowUpCircle, Shield, Database, FileText, Sparkles,
  ThumbsUp, ThumbsDown, GitMerge, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type InboxItemType = 'semantic_field' | 'dq_check' | 'object_candidate' | 'mapping_suggestion';
type InboxStatus = 'unknown' | 'needs_review' | 'conflict';

interface InboxItem {
  id: string;
  type: InboxItemType;
  target: string;
  suggestion: string;
  confidence: number;
  risk: 'Low' | 'Medium' | 'High';
  status: InboxStatus;
  timestamp: string;
  evidence: { source: string; score: number; desc: string }[];
  similarCount?: number;
}

export default function NetworkInbox() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>('1');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock Data
  const items: InboxItem[] = [
    {
      id: '1',
      type: 'semantic_field',
      target: '表: ORDERS.c_email',
      suggestion: '映射到对象: Customer.email',
      confidence: 0.92,
      risk: 'Low',
      status: 'needs_review',
      timestamp: '10 分钟前',
      similarCount: 12,
      evidence: [
        { source: '列名相似度', score: 0.95, desc: '匹配 "email" 模式' },
        { source: '数据内容画像', score: 0.88, desc: '99% 符合邮箱格式' },
        { source: '上游血缘', score: 0.60, desc: '源自 CRM 系统' }
      ]
    },
    {
      id: '2',
      type: 'dq_check',
      target: '表: TRANSACTIONS.amount',
      suggestion: '应用规则: 金额 > 0',
      confidence: 0.75,
      risk: 'Medium',
      status: 'conflict',
      timestamp: '1 小时前',
      evidence: [
        { source: '统计分布', score: 0.80, desc: '最近 100 万行中无负值' },
        { source: '业务术语表', score: 0.40, desc: '定义暗示应为正值' }
      ]
    },
    {
      id: '3',
      type: 'object_candidate',
      target: '簇: Shipping_Logistics',
      suggestion: '提升为对象: Shipment',
      confidence: 0.65,
      risk: 'High',
      status: 'unknown',
      timestamp: '3 小时前',
      evidence: [
        { source: '表共现率', score: 0.70, desc: '这些表经常被关联查询' },
        { source: '查询模式', score: 0.60, desc: '在报表中作为核心实体使用' }
      ]
    }
  ];

  const selectedItem = items.find(i => i.id === selectedItemId);

  const getTypeIcon = (type: InboxItemType) => {
    switch (type) {
      case 'semantic_field': return <Database size={16} className="text-indigo-400" />;
      case 'dq_check': return <Shield size={16} className="text-emerald-400" />;
      case 'object_candidate': return <Layers size={16} className="text-amber-400" />;
      case 'mapping_suggestion': return <GitMerge size={16} className="text-blue-400" />;
    }
  };

  const getStatusColor = (status: InboxStatus) => {
    switch (status) {
      case 'needs_review': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'conflict': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'unknown': return 'bg-slate-700/50 text-slate-400 border-slate-600';
    }
  };

  const getStatusLabel = (status: InboxStatus) => {
    switch (status) {
      case 'needs_review': return '待评审';
      case 'conflict': return '冲突';
      case 'unknown': return '未知';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Header & FilterBar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white">
            <CheckCircle2 size={18} />
          </div>
          <h1 className="text-lg font-semibold text-white">待办队列 (Inbox / Triage)</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="搜索队列..." 
              className="w-64 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <select 
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">全部类型</option>
            <option value="semantic_field">语义字段</option>
            <option value="dq_check">质量检查</option>
            <option value="object_candidate">对象候选</option>
          </select>
          <select 
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="needs_review">待评审</option>
            <option value="conflict">冲突</option>
            <option value="unknown">未知</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Queue List (Left) */}
        <div className="w-96 border-r border-slate-800 bg-slate-900/30 flex flex-col">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center text-xs text-slate-500 uppercase tracking-wider font-semibold">
            <span>待处理项 ({items.length})</span>
            <button className="hover:text-white"><Filter size={12} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {items.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`p-4 border-b border-slate-800 cursor-pointer transition-colors hover:bg-slate-800/50 ${
                  selectedItemId === item.id ? 'bg-indigo-900/10 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{item.timestamp}</span>
                </div>
                <h3 className="text-sm font-medium text-slate-200 mb-1 truncate">{item.target}</h3>
                <p className="text-xs text-slate-400 mb-2">{item.suggestion}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Sparkles size={10} className="text-indigo-400" />
                      <span className="text-xs font-mono text-indigo-300">{Math.round(item.confidence * 100)}%</span>
                    </div>
                    {item.similarCount && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                        +{item.similarCount} 相似
                      </span>
                    )}
                  </div>
                  {item.risk === 'High' && <AlertTriangle size={12} className="text-amber-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Panel (Right) */}
        <div className="flex-1 bg-slate-950 flex flex-col relative">
          {selectedItem ? (
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    {getTypeIcon(selectedItem.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedItem.target}</h2>
                    <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
                      <span>ID: {selectedItem.id}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedItem.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={100} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-indigo-100 mb-2">AI 建议 (Suggestion)</h3>
                    <p className="text-xl text-white font-medium mb-4">{selectedItem.suggestion}</p>
                    <div className="flex items-center space-x-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-indigo-300 uppercase tracking-wider mb-1">置信度</span>
                        <span className="text-2xl font-bold text-white">{Math.round(selectedItem.confidence * 100)}%</span>
                      </div>
                      <div className="h-8 w-px bg-indigo-500/30" />
                      <div className="flex flex-col">
                        <span className="text-xs text-indigo-300 uppercase tracking-wider mb-1">风险等级</span>
                        <span className={`text-lg font-bold ${
                          selectedItem.risk === 'High' ? 'text-amber-400' : 
                          selectedItem.risk === 'Medium' ? 'text-yellow-200' : 'text-emerald-400'
                        }`}>{selectedItem.risk === 'High' ? '高' : selectedItem.risk === 'Medium' ? '中' : '低'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Panel */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                      <FileText size={16} className="mr-2" />
                      证据链 (Evidence)
                    </h3>
                    <div className="space-y-3">
                      {selectedItem.evidence.map((ev, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-slate-200">{ev.source}</span>
                            <span className="text-xs font-mono text-emerald-400">+{Math.round(ev.score * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mb-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${ev.score * 100}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-400">{ev.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similar Items Cluster */}
                  {selectedItem.similarCount && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                          <Layers size={16} className="mr-2" />
                          相似项聚类 (Similar Items)
                        </h3>
                        <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                          {selectedItem.similarCount} 项
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        检测到 {selectedItem.similarCount} 个具有相似命名模式和数据画像的其他字段。
                        确认此项将同时应用规则到所有相似项。
                      </p>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center">
                        查看所有项 <ChevronRight size={12} className="ml-1" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-4">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">操作</h3>
                    
                    <button className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium shadow-lg shadow-emerald-500/20 mb-3 transition-all">
                      <ThumbsUp size={18} />
                      <span>确认 (Confirm)</span>
                    </button>
                    
                    <button className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg font-medium border border-slate-700 mb-3 transition-all">
                      <ThumbsDown size={18} />
                      <span>拒绝 (Reject)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-400 py-2 rounded-lg text-xs border border-slate-700 transition-all">
                        <Clock size={14} />
                        <span>推迟 (Defer)</span>
                      </button>
                      <button className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-400 py-2 rounded-lg text-xs border border-slate-700 transition-all">
                        <MoreHorizontal size={14} />
                        <span>覆写 (Override)</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-800 pt-4 mt-2">
                      <label className="flex items-start space-x-3 cursor-pointer group">
                        <div className="mt-0.5">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <span className="text-sm text-slate-300 font-medium group-hover:text-white">推广到上层 (Promote)</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            将此裁决作为全局规则应用到组织级网络 (GKN)。
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Minimal Fix Suggestion */}
                  {selectedItem.risk === 'High' && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-amber-400 mb-2">
                        <HelpCircle size={16} />
                        <span className="text-xs font-bold uppercase">缺少证据</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-3">
                        由于缺少数据样本，置信度较低。
                      </p>
                      <button className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded border border-amber-500/30 transition-colors">
                        请求样本扫描
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <CheckCircle2 size={48} className="mb-4 opacity-20" />
              <p>从队列中选择一项进行评审</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
