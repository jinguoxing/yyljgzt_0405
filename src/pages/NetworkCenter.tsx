import React, { useState } from 'react';
import { 
  Globe, Search, Filter, Plus, MoreHorizontal, 
  GitBranch, Clock, Users, Shield, Tag, Box, User,
  Import, Lock, AlertCircle, CheckCircle2, X, ArrowRight, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

type NetworkType = 'GKN' | 'DKN' | 'PKN';

interface Network {
  id: number;
  name: string;
  type: NetworkType;
  version: string;
  status: 'Published' | 'Draft' | 'Archived';
  updated: string;
  owner: string;
  health: {
    unknown: number;
    conflicts: number;
  };
}

export default function NetworkCenter() {
  const navigate = useNavigate();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newNetworkType, setNewNetworkType] = useState<NetworkType>('DKN');

  const networks: Network[] = [
    { 
      id: 1, name: '全球供应链', type: 'GKN', version: 'v2.4.0', status: 'Published', updated: '2小时前', owner: 'SC 团队',
      health: { unknown: 12, conflicts: 0 }
    },
    { 
      id: 2, name: '客户 360', type: 'DKN', version: 'v1.2.1', status: 'Draft', updated: '5分钟前', owner: '市场部',
      health: { unknown: 5, conflicts: 2 }
    },
    { 
      id: 3, name: '财务报表', type: 'DKN', version: 'v3.0.0', status: 'Published', updated: '1天前', owner: '财务部',
      health: { unknown: 0, conflicts: 0 }
    },
    { 
      id: 4, name: '我的研究', type: 'PKN', version: 'v0.1.0', status: 'Draft', updated: '刚刚', owner: '管理员',
      health: { unknown: 8, conflicts: 1 }
    },
  ];

  const getTypeIcon = (type: NetworkType) => {
    switch (type) {
      case 'GKN': return <Globe size={16} className="text-indigo-400" />;
      case 'DKN': return <Box size={16} className="text-emerald-400" />;
      case 'PKN': return <User size={16} className="text-amber-400" />;
    }
  };

  const getTypeColor = (type: NetworkType) => {
    switch (type) {
      case 'GKN': return 'indigo';
      case 'DKN': return 'emerald';
      case 'PKN': return 'amber';
    }
  };

  const handleCreateSubmit = () => {
    setIsCreateDrawerOpen(false);
    // If DKN or PKN, navigate to Compose Wizard
    if (newNetworkType !== 'GKN') {
      navigate('/network/compose');
    }
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">全局业务知识网络</h1>
          <p className="text-slate-400 text-sm mt-1">管理您组织的知识网络和领域。</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
            <Shield size={16} />
            <span>管理权限</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
            <Import size={16} />
            <span>导入</span>
          </button>
          <button 
            onClick={() => { setCreateStep(1); setIsCreateDrawerOpen(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span>创建网络</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="搜索网络..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-500">类型:</span>
            <select className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500">
              <option>全部类型</option>
              <option>GKN (组织级)</option>
              <option>DKN (领域级)</option>
              <option>PKN (个人级)</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-500">状态:</span>
            <select className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500">
              <option>全部状态</option>
              <option>已发布</option>
              <option>草稿</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-500">所有者:</span>
            <select className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500">
              <option>全部所有者</option>
              <option>我</option>
              <option>我的团队</option>
            </select>
          </div>
      </div>

      {/* Network Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-6">
        {networks.map((net) => (
          <div key={net.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group">
            {/* Card Header */}
            <div className="p-4 border-b border-slate-800/50">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${getTypeColor(net.type)}-500/10 flex items-center justify-center`}>
                  {getTypeIcon(net.type)}
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">{net.name}</h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{net.type}</span>
                <span>•</span>
                <span>{net.version}</span>
                <span>•</span>
                <span>{net.updated}</span>
              </div>
            </div>

            {/* Mini-Graph Preview */}
            <div className="h-32 bg-slate-950 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full">
                  <pattern id={`grid-${net.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100%" height="100%" fill={`url(#grid-${net.id})`} />
                </svg>
              </div>
              {/* Mock Nodes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className={`absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-${getTypeColor(net.type)}-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]`}></div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-800"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-slate-700"></div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="25%" y1="33%" x2="50%" y2="50%" stroke="#475569" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="75%" y2="66%" stroke="#475569" strokeWidth="1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800/50">
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className={`inline-block w-2 h-2 rounded-full ${net.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span>{net.status === 'Published' ? '已发布' : '草稿'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {net.health.conflicts > 0 && (
                    <span className="flex items-center text-rose-400" title="冲突">
                      <AlertCircle size={12} className="mr-1" />
                      {net.health.conflicts}
                    </span>
                  )}
                  {net.health.unknown > 0 && (
                    <span className="flex items-center text-amber-400" title="未知项">
                      <AlertCircle size={12} className="mr-1" />
                      {net.health.unknown}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors">
                  打开待办
                </button>
                <button 
                  onClick={() => navigate('/network/studio')}
                  className="flex items-center justify-center px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded text-xs font-medium transition-colors"
                >
                  打开工作台
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Network Drawer */}
      <AnimatePresence>
        {isCreateDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">创建新网络</h2>
                <button onClick={() => setIsCreateDrawerOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Step Indicator */}
                <div className="flex items-center mb-8">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${createStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
                  <div className={`flex-1 h-1 mx-2 ${createStep >= 2 ? 'bg-indigo-600' : 'bg-slate-800'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${createStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
                  <div className={`flex-1 h-1 mx-2 ${createStep >= 3 ? 'bg-indigo-600' : 'bg-slate-800'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${createStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>3</div>
                </div>

                {createStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white mb-4">选择网络类型</h3>
                    
                    <div 
                      onClick={() => setNewNetworkType('GKN')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${newNetworkType === 'GKN' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Globe className={newNetworkType === 'GKN' ? 'text-indigo-400' : 'text-slate-400'} />
                        <span className="font-bold text-white">GKN (全球知识网络)</span>
                      </div>
                      <p className="text-sm text-slate-400">组织范围的知识图谱。所有领域的单一事实来源。</p>
                    </div>

                    <div 
                      onClick={() => setNewNetworkType('DKN')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${newNetworkType === 'DKN' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Box className={newNetworkType === 'DKN' ? 'text-emerald-400' : 'text-slate-400'} />
                        <span className="font-bold text-white">DKN (领域知识网络)</span>
                      </div>
                      <p className="text-sm text-slate-400">特定领域的子图。专注于特定的业务场景和交付物。</p>
                    </div>

                    <div 
                      onClick={() => setNewNetworkType('PKN')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${newNetworkType === 'PKN' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <User className={newNetworkType === 'PKN' ? 'text-amber-400' : 'text-slate-400'} />
                        <span className="font-bold text-white">PKN (个人知识网络)</span>
                      </div>
                      <p className="text-sm text-slate-400">用户特定的工作空间。个性化视图、快捷方式和草稿实验。</p>
                    </div>
                  </div>
                )}

                {createStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white">基础信息</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">网络名称</label>
                        <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="例如：供应链优化" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">描述</label>
                        <textarea className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24" placeholder="描述此网络的目的..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">所有者</label>
                        <div className="flex items-center space-x-2 p-2 bg-slate-950 border border-slate-800 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">AU</div>
                          <span className="text-sm text-white">管理员 (我)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {createStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white">
                      {newNetworkType === 'DKN' ? '领域配置' : newNetworkType === 'PKN' ? '个性化配置' : 'GKN 配置'}
                    </h3>
                    
                    {newNetworkType === 'DKN' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">领域目标 (场景)</label>
                          <textarea className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24" placeholder="例如：优化第三季度的库存周转率..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">基础 GKN 版本</label>
                          <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option>GKN v2.4.0 (最新稳定版)</option>
                            <option>GKN v2.3.5</option>
                          </select>
                        </div>
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start space-x-3">
                          <Wand2 className="text-indigo-400 flex-shrink-0 mt-0.5" size={18} />
                          <div className="text-sm text-indigo-200">
                            <span className="font-bold">AI 编排:</span> 创建后，我们将启动编排向导，根据您的领域目标生成初始子图。
                          </div>
                        </div>
                      </div>
                    )}

                    {newNetworkType === 'PKN' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">基础领域 (可选)</label>
                          <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option>无 (从头开始)</option>
                            <option>全球供应链</option>
                            <option>客户 360</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">隐私</label>
                          <div className="flex items-center space-x-2">
                            <Lock size={16} className="text-slate-500" />
                            <span className="text-sm text-slate-300">仅对我可见</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-800 flex justify-between">
                {createStep > 1 ? (
                  <button 
                    onClick={() => setCreateStep(createStep - 1)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    上一步
                  </button>
                ) : (
                  <div></div>
                )}
                
                {createStep < 3 ? (
                  <button 
                    onClick={() => setCreateStep(createStep + 1)}
                    className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <span>下一步</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={handleCreateSubmit}
                    className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    <span>创建并编排</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
