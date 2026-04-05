import React, { useState } from 'react';
import { 
  User, Zap, Layout, Settings, MessageSquare, UploadCloud, 
  Plus, Play, Search, ArrowRight, Star, Clock, 
  GitPullRequest, CheckCircle2, XCircle, ChevronRight,
  Sliders, FileJson, Bookmark
} from 'lucide-react';
import { motion } from 'motion/react';

export default function NetworkPersonal() {
  const [activeTab, setActiveTab] = useState('views');

  // Mock Data
  const shortcuts = [
    { id: 's1', label: '新建分析', icon: <Plus size={16} />, color: 'bg-indigo-600' },
    { id: 's2', label: '快速修复队列', icon: <Zap size={16} />, color: 'bg-amber-600' },
    { id: 's3', label: '搜索个人库', icon: <Search size={16} />, color: 'bg-slate-700' },
  ];

  const myViews = [
    { id: 'v1', name: '我的订单分析', updated: '2 小时前', nodes: 12 },
    { id: 'v2', name: '客户分群草稿', updated: '1 天前', nodes: 8 },
    { id: 'v3', name: 'Q3 营收排障', updated: '3 天前', nodes: 24 },
  ];

  const myDefaults = [
    { id: 'd1', category: '阈值', label: '风险容忍度', value: '严格 (< 5%)' },
    { id: 'd2', category: '自动化', label: '自动确认置信度', value: '> 95%' },
    { id: 'd3', category: '视觉', label: '默认布局', value: '径向布局' },
  ];

  const myFeedback = [
    { id: 'f1', action: '已确认', target: '映射: Order -> Cust', impact: '提升血缘准确性', time: '10 分钟前' },
    { id: 'f2', action: '已拒绝', target: '规则: 金额 < 0', impact: '防止误报', time: '2 小时前' },
    { id: 'f3', action: '已覆写', target: 'PII: 邮箱', impact: '开启本地解密', time: '1 天前' },
  ];

  const promoteItems = [
    { id: 'p1', type: '视图', name: '我的订单分析', desc: '对 Q3 报表有用' },
    { id: 'p2', type: '规则', name: '自定义质量检查', desc: '校验发货代码' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
            <User size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">个人驾驶舱 (Personal Cockpit)</h1>
            <p className="text-xs text-slate-400">我的工作台 (PKN)</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-xs text-slate-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            个人叠加层已激活 (Personal Overlay Active)
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Shortcuts Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              <Zap size={16} className="mr-2" /> 我的快捷指令 (My Shortcuts)
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {shortcuts.map(s => (
                <button key={s.id} className="flex items-center p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all group">
                  <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-white mr-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    {s.icon}
                  </div>
                  <span className="font-medium text-slate-200 group-hover:text-white">{s.label}</span>
                </button>
              ))}
              <button className="flex items-center justify-center p-4 border border-slate-800 border-dashed rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors">
                <Plus size={16} className="mr-2" /> 添加快捷指令
              </button>
            </div>
          </section>

          <div className="grid grid-cols-3 gap-8">
            {/* Left Column: Views & Templates */}
            <div className="col-span-2 space-y-8">
              {/* My Views */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <Layout size={16} className="mr-2" /> 我的视图 (My Views)
                  </h2>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">管理全部</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {myViews.map(view => (
                    <div key={view.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-slate-800 rounded text-indigo-400 group-hover:text-white transition-colors">
                          <Bookmark size={18} />
                        </div>
                        <button className="text-slate-500 hover:text-white"><Star size={14} /></button>
                      </div>
                      <h3 className="font-medium text-slate-200 mb-1">{view.name}</h3>
                      <div className="flex items-center text-xs text-slate-500 space-x-3">
                        <span className="flex items-center"><Clock size={12} className="mr-1" /> {view.updated}</span>
                        <span>{view.nodes} 节点</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* My Templates */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                    <FileJson size={16} className="mr-2" /> 我的模板 (My Templates)
                  </h2>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <button className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition-colors text-left">
                      <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center mr-3">
                        <GitPullRequest size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">数据质量审计</div>
                        <div className="text-xs text-slate-500">标准质量工作流</div>
                      </div>
                    </button>
                    <button className="flex items-center p-3 hover:bg-slate-800 rounded-lg transition-colors text-left">
                      <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3">
                        <Search size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">根因分析</div>
                        <div className="text-xs text-slate-500">追踪血缘与日志</div>
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Defaults, Feedback, Promote */}
            <div className="space-y-8">
              {/* Promote Panel */}
              <section>
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <UploadCloud size={80} />
                  </div>
                  <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider mb-4 flex items-center relative z-10">
                    <UploadCloud size={16} className="mr-2" /> 沉淀到 DKN (Promote)
                  </h2>
                  <div className="space-y-3 relative z-10">
                    <p className="text-xs text-indigo-100/70 mb-2">
                      您有 2 项内容可以分享到领域层。
                    </p>
                    {promoteItems.map(item => (
                      <div key={item.id} className="bg-slate-900/80 border border-indigo-500/20 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-indigo-100">{item.name}</div>
                          <div className="text-[10px] text-indigo-300/60">{item.type}</div>
                        </div>
                        <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500" />
                      </div>
                    ))}
                    <button className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-colors flex items-center justify-center">
                      创建变更集并提交
                      <ArrowRight size={12} className="ml-1" />
                    </button>
                  </div>
                </div>
              </section>

              {/* My Defaults */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                  <Sliders size={16} className="mr-2" /> 我的默认设置 (My Defaults)
                </h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  {myDefaults.map((def, idx) => (
                    <div key={def.id} className={`p-3 flex justify-between items-center ${idx !== myDefaults.length - 1 ? 'border-b border-slate-800' : ''}`}>
                      <div>
                        <div className="text-xs text-slate-500">{def.category}</div>
                        <div className="text-sm text-slate-300">{def.label}</div>
                      </div>
                      <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                        {def.value}
                      </div>
                    </div>
                  ))}
                  <div className="p-2 bg-slate-950 border-t border-slate-800 text-center">
                    <button className="text-xs text-slate-500 hover:text-white flex items-center justify-center w-full">
                      <Settings size={12} className="mr-1" /> 配置
                    </button>
                  </div>
                </div>
              </section>

              {/* My Feedback */}
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                  <MessageSquare size={16} className="mr-2" /> 我的反馈 (My Feedback)
                </h2>
                <div className="space-y-3">
                  {myFeedback.map(fb => (
                    <div key={fb.id} className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {fb.action === '已确认' && <CheckCircle2 size={14} className="text-emerald-400" />}
                        {fb.action === '已拒绝' && <XCircle size={14} className="text-red-400" />}
                        {fb.action === '已覆写' && <GitPullRequest size={14} className="text-amber-400" />}
                      </div>
                      <div>
                        <div className="text-xs text-slate-300">
                          <span className={`font-medium ${
                            fb.action === '已确认' ? 'text-emerald-400' :
                            fb.action === '已拒绝' ? 'text-red-400' : 'text-amber-400'
                          }`}>{fb.action}</span> {fb.target}
                        </div>
                        <div className="text-[10px] text-slate-500">{fb.impact} • {fb.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
