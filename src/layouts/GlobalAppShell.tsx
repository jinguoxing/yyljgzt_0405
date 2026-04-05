import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Globe, LayoutGrid, Wand2, Inbox, Package, Activity, Shield, Database,
  Building2, Box, User, Search, Command, ChevronRight, ChevronDown,
  GitBranch, Play, AlertCircle, CheckCircle2, XCircle, FileText,
  Settings, Bell, Menu, X, ChevronLeft, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

type NetworkMode = 'GKN' | 'DKN' | 'PKN';

export default function GlobalAppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [networkMode, setNetworkMode] = useState<NetworkMode>('GKN');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState('Plan');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { name: '全局业务知识网络', icon: Globe, path: '/network/center' },
    { name: '业务网络工作台', icon: LayoutGrid, path: '/network/studio' },
    { name: 'AI 编排', icon: Wand2, path: '/network/compose' },
    { name: '待办队列', icon: Inbox, path: '/network/inbox', badge: 3 },
    { name: '交付包', icon: Package, path: '/network/packages' },
    { name: '运行历史', icon: Activity, path: '/network/runs' },
    { name: '策略中心', icon: Shield, path: '/network/policy' },
    { name: '本体管理', icon: Database, path: '/network/ontology' },
  ];

  const rightTabs = ['计划', '草稿', '解释', '差异', '运行', '修复'];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Left Navigation */}
      <div className={cn(
        "flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col transition-all duration-300 relative z-20",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors z-50 shadow-sm"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={cn(
          "h-14 flex items-center border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors",
          isSidebarCollapsed ? "justify-center px-0" : "px-4"
        )} onClick={() => navigate('/')}>
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-lg">
            <Globe size={24} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span>BKN</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <button
            onClick={() => navigate('/')}
            className={cn(
              "w-full flex items-center py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors mb-2 group relative",
              isSidebarCollapsed ? "justify-center px-0" : "px-4"
            )}
          >
            <Home size={18} className={cn("text-slate-500 flex-shrink-0", !isSidebarCollapsed && "mr-3")} />
            {!isSidebarCollapsed && <span>首页</span>}
            
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                首页
              </div>
            )}
          </button>
          
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center py-2 text-sm font-medium transition-colors relative group",
                  isActive 
                    ? 'text-white bg-slate-800/50 border-r-2 border-indigo-500' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30',
                  isSidebarCollapsed ? "justify-center px-0" : "px-4"
                )}
              >
                <item.icon size={18} className={cn("flex-shrink-0", isActive ? 'text-indigo-400' : 'text-slate-500', !isSidebarCollapsed && "mr-3")} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                {!isSidebarCollapsed && item.badge && (
                  <span className="ml-auto bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                )}
                
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity flex items-center">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className={cn(
            "flex items-center",
            isSidebarCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 cursor-pointer group relative">
              <User size={16} />
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  管理员 (admin@example.com)
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">管理员</div>
                  <div className="text-xs text-slate-500 truncate">admin@example.com</div>
                </div>
                <Settings size={16} className="text-slate-500 cursor-pointer hover:text-slate-300 flex-shrink-0" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4 flex-1">
            {/* Network Switcher */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setNetworkMode('GKN')}
                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  networkMode === 'GKN' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Building2 size={14} className="mr-1.5" />
                组织 (GKN)
              </button>
              <button
                onClick={() => setNetworkMode('DKN')}
                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  networkMode === 'DKN' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Box size={14} className="mr-1.5" />
                领域 (DKN)
              </button>
              <button
                onClick={() => setNetworkMode('PKN')}
                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  networkMode === 'PKN' 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <User size={14} className="mr-1.5" />
                个人 (PKN)
              </button>
            </div>

            <div className="h-6 w-px bg-slate-800 mx-2" />

            {/* Namespace Picker */}
            <div className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <span className="text-slate-500">命名空间:</span>
              <span className="font-medium">
                {networkMode === 'GKN' ? 'org/global' : networkMode === 'DKN' ? 'domain/supply-chain' : 'user/admin'}
              </span>
              <ChevronDown size={14} className="text-slate-500 ml-1" />
            </div>

            <div className="h-6 w-px bg-slate-800 mx-2" />

            {/* Permission Scope */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/30 px-2.5 py-1 rounded border border-slate-700/30">
              <Shield size={12} className={networkMode === 'GKN' ? 'text-indigo-400' : networkMode === 'DKN' ? 'text-emerald-400' : 'text-amber-400'} />
              <span>
                {networkMode === 'GKN' ? '组织公开' : networkMode === 'DKN' ? '团队可见' : '私有'}
              </span>
            </div>

            {/* Command Bar */}
            <div className="flex-1 max-w-xl mx-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Command size={14} className="text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="询问 AI 生成、分析或修复..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <button className="text-slate-400 hover:text-white transition-colors">
              <Search size={18} />
            </button>

            {/* Publish Status */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">草稿</span>
            </div>

            <button 
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`p-1.5 rounded-lg transition-colors ${isRightPanelOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <ChevronLeft size={20} className={`transform transition-transform ${isRightPanelOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative flex">
          <div className="flex-1 overflow-y-auto bg-slate-950 p-6">
            <Outlet context={{ networkMode }} />
          </div>

          {/* Right Panel (AI Native Core) */}
          <AnimatePresence>
            {isRightPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="border-l border-slate-800 bg-slate-900 flex flex-col flex-shrink-0"
              >
                <div className="flex border-b border-slate-800">
                  {rightTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveRightTab(tab)}
                      className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
                        activeRightTab === tab
                          ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
                          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="bg-slate-800/30 rounded-lg border border-slate-800 p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2 text-indigo-400">
                      <Wand2 size={16} />
                      <span className="text-sm font-semibold">AI 上下文分析</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      基于您在 {networkMode} 图谱中的选择，我发现了 3 个潜在的架构定义不一致。
                    </p>
                  </div>

                  {/* Placeholder Content based on Tab */}
                  <div className="space-y-3">
                    {activeRightTab === '计划' && (
                      <div className="text-sm text-slate-400">
                        <h4 className="font-medium text-slate-200 mb-2">建议操作</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2 p-2 rounded hover:bg-slate-800 cursor-pointer">
                            <div className="mt-0.5 w-4 h-4 rounded border border-slate-600 flex items-center justify-center flex-shrink-0"></div>
                            <span>重构 "Order" 实体以包含 "ShippingAddress"</span>
                          </li>
                          <li className="flex items-start space-x-2 p-2 rounded hover:bg-slate-800 cursor-pointer">
                            <div className="mt-0.5 w-4 h-4 rounded border border-slate-600 flex items-center justify-center flex-shrink-0"></div>
                            <span>创建新关系 "Customer -&gt; Orders"</span>
                          </li>
                        </ul>
                      </div>
                    )}
                    {/* Add other tab placeholders as needed */}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="使用 AI 优化..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
                      <Wand2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
