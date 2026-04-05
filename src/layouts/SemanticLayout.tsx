import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, History, MessageSquareText, Settings, Bell, Search, User, Box, BrainCircuit, ChevronDown, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlobalCopilot from '@/components/copilot/GlobalCopilot';

export default function SemanticLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
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
          "h-14 flex items-center border-b border-slate-800 relative cursor-pointer hover:bg-slate-800/50 transition-colors",
          isSidebarCollapsed ? "justify-center px-0" : "px-4"
        )} onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-white">S</span>
          </div>
          
          {!isSidebarCollapsed && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsAppMenuOpen(!isAppMenuOpen); }}
              className="ml-3 flex-1 flex items-center justify-between hover:bg-slate-800 px-2 py-1 rounded transition-colors"
            >
              <span className="font-semibold text-slate-100 truncate">语义治理平台</span>
              <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
            </button>
          )}

          {isAppMenuOpen && !isSidebarCollapsed && (
            <div className="absolute top-12 left-4 right-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <button 
                onClick={() => { navigate('/'); setIsAppMenuOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <Home size={16} className="text-slate-400" />
                <span>返回首页</span>
              </button>
              <button 
                onClick={() => setIsAppMenuOpen(false)}
                className="w-full text-left px-4 py-3 bg-slate-700/50 text-sm font-medium text-white transition-colors flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">S</span>
                </div>
                <span>语义治理平台</span>
              </button>
              <button 
                onClick={() => { navigate('/aiops/employees'); setIsAppMenuOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">AI</span>
                </div>
                <span>AI 运营中心</span>
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          <NavItem to="/" icon={<Home size={20} />} label="返回首页" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/semantic/inbox" icon={<ListTodo size={20} />} label="语义待办" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/semantic/releases" icon={<History size={20} />} label="版本发布" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/semantic/workbench" icon={<LayoutDashboard size={20} />} label="工作台" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/semantic/table-understanding/lv_005" icon={<BrainCircuit size={20} />} label="表理解" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/semantic/objects/lv_005" icon={<Box size={20} />} label="对象生成" isCollapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
          <button className={cn(
            "flex items-center px-2 py-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors group relative",
            isSidebarCollapsed ? "justify-center w-full" : "w-full"
          )}>
            <Settings size={20} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3 text-sm">设置</span>}
            
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                设置
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Top Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-slate-100">
              {location.pathname.includes('inbox') ? '语义待办箱' : 
               location.pathname.includes('releases') ? '版本发布管理' : '语义工作台'}
            </h1>
            <div className="h-4 w-px bg-slate-700 mx-2" />
            <div className="hidden md:flex items-center text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
              <Search size={12} className="mr-2" />
              <span>搜索资产、表...</span>
              <span className="ml-4 text-slate-600">⌘K</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={cn(
                "p-2 rounded-full transition-colors relative",
                isCopilotOpen ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              <MessageSquareText size={20} />
              {!isCopilotOpen && <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 border border-slate-600">
              OU
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <Outlet context={{ setIsCopilotOpen }} />
        </div>

        {/* Global Copilot Overlay */}
        <GlobalCopilot isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, isCollapsed }: { to: string; icon: React.ReactNode; label: string; isCollapsed: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors group relative",
          isActive
            ? "bg-indigo-600/10 text-indigo-400"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
          isCollapsed ? "justify-center" : ""
        )
      }
    >
      <span className="group-hover:scale-110 transition-transform duration-200 flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="ml-3 truncate">{label}</span>}
      
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </div>
      )}
    </NavLink>
  );
}
