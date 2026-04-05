import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Users, ListTodo, Activity, PlayCircle, ShieldCheck, BarChart3, Settings, Bell, Search, MessageSquareText, ChevronDown, LayoutDashboard, Bot, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlobalCopilot from '@/components/copilot/GlobalCopilot';

export default function AIOpsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getPageTitle = () => {
    if (location.pathname.includes('dashboard')) return '统一看板';
    if (location.pathname.includes('employee-workbench')) return 'AI 员工工作台';
    if (location.pathname.includes('workbench')) return '工作台';
    if (location.pathname.includes('employees')) return '数字员工台账';
    if (location.pathname.includes('tasks')) return '待办队列';
    if (location.pathname.includes('runs')) return '运行记录';
    if (location.pathname.includes('replay')) return '审计回放';
    if (location.pathname.includes('policies')) return '策略与版本';
    if (location.pathname.includes('metrics')) return '指标与成本';
    return 'AI 运营中心';
  };

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
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-white">AI</span>
          </div>
          
          {!isSidebarCollapsed && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsAppMenuOpen(!isAppMenuOpen); }}
              className="ml-3 flex-1 flex items-center justify-between hover:bg-slate-800 px-2 py-1 rounded transition-colors"
            >
              <span className="font-semibold text-slate-100 truncate">AI 运营中心</span>
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
                onClick={() => { navigate('/semantic/inbox'); setIsAppMenuOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                  <span className="font-bold text-white text-xs">S</span>
                </div>
                <span>语义治理平台</span>
              </button>
              <button 
                onClick={() => setIsAppMenuOpen(false)}
                className="w-full text-left px-4 py-3 bg-slate-700/50 text-sm font-medium text-white transition-colors flex items-center space-x-2"
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
          <NavItem to="/aiops/dashboard" icon={<LayoutDashboard size={20} />} label="统一看板" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/workbench" icon={<LayoutDashboard size={20} />} label="工作台" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/employee-workbench" icon={<Bot size={20} />} label="AI 员工工作台" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/employees" icon={<Users size={20} />} label="数字员工台账" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/tasks" icon={<ListTodo size={20} />} label="待办队列" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/runs" icon={<Activity size={20} />} label="运行记录" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/replay" icon={<PlayCircle size={20} />} label="审计回放" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/policies" icon={<ShieldCheck size={20} />} label="策略与版本" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/aiops/metrics" icon={<BarChart3 size={20} />} label="指标与成本" isCollapsed={isSidebarCollapsed} />
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
              {getPageTitle()}
            </h1>
            <div className="h-4 w-px bg-slate-700 mx-2" />
            <div className="hidden md:flex items-center text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
              <Search size={12} className="mr-2" />
              <span>搜索员工、任务...</span>
              <span className="ml-4 text-slate-600">⌘K</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={cn(
                "p-2 rounded-full transition-colors relative",
                isCopilotOpen ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              <MessageSquareText size={20} />
              {!isCopilotOpen && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
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
            ? "bg-emerald-600/10 text-emerald-400"
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
