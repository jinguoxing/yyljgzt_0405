import React, { useState } from 'react';
import { 
  Inbox, MessageSquare, LayoutList, PlayCircle, FileSearch, 
  CheckSquare, History, Send, Bot, User, Clock, ChevronRight,
  FileText, Database, Activity, GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const REQUESTS = [
  { id: 'REQ-001', title: '解析 HR 域表结构', status: '处理中', time: '10分钟前', active: true },
  { id: 'REQ-002', title: '梳理 Sales 数据血缘', status: '等待中', time: '2小时前', active: false },
  { id: 'REQ-003', title: '生成财务指标定义', status: '已完成', time: '1天前', active: false },
];

const TABS = [
  { id: 'plan', label: '执行计划', icon: LayoutList },
  { id: 'run', label: '运行日志', icon: PlayCircle },
  { id: 'evidence', label: '证据上下文', icon: FileSearch },
  { id: 'deliverables', label: '交付物', icon: FileText },
  { id: 'tasks', label: '子任务', icon: CheckSquare },
  { id: 'replay', label: '审计回放', icon: History },
];

export default function AIOpsEmployeeWorkbench() {
  const [activeTab, setActiveTab] = useState('plan');
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-950 text-slate-200">
      
      {/* Left: Request Inbox */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50 shrink-0">
        <div className="h-14 border-b border-slate-800 flex items-center px-4 space-x-2 shrink-0">
          <Inbox size={18} className="text-emerald-400" />
          <span className="font-bold text-slate-100">请求收件箱</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {REQUESTS.map(req => (
            <div 
              key={req.id} 
              className={cn(
                "p-3 rounded-xl border cursor-pointer transition-colors",
                req.active 
                  ? "bg-slate-800 border-slate-700 shadow-sm" 
                  : "bg-slate-950/50 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-500">{req.id}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                  req.status === '处理中' ? "bg-emerald-500/10 text-emerald-400" :
                  req.status === '等待中' ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-slate-800 text-slate-400"
                )}>
                  {req.status}
                </span>
              </div>
              <h3 className={cn("text-sm font-medium mb-2", req.active ? "text-slate-100" : "text-slate-300")}>
                {req.title}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Clock size={12} />
                <span>{req.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Conversation Timeline */}
      <div className="flex-1 border-r border-slate-800 flex flex-col bg-slate-950 min-w-0">
        <div className="h-14 border-b border-slate-800 flex items-center px-6 space-x-3 shrink-0 bg-slate-900/30">
          <MessageSquare size={18} className="text-indigo-400" />
          <span className="font-bold text-slate-100">对话时间线</span>
          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400 border border-slate-700">REQ-001</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* User Request */}
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
              <User size={14} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-slate-200">管理员</span>
                <span className="text-xs text-slate-500">上午 10:00</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-300 leading-relaxed inline-block">
                请帮我解析 HR 域下的 `t_hr_employee` 和 `t_hr_department` 表，提取中英文名称和主外键关系。
              </div>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-emerald-400">语义理解专员</span>
                <span className="text-xs text-slate-500">上午 10:01</span>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-300 leading-relaxed inline-block">
                收到请求。我已经制定了执行计划，将分为三步进行：
                <ol className="list-decimal list-inside mt-2 space-y-1 text-slate-400">
                  <li>连接 MySQL 获取 DDL。</li>
                  <li>使用大模型进行语义推断。</li>
                  <li>生成标准化模型草案。</li>
                </ol>
                <br/>
                目前正在执行第一步。您可以在右侧的 <strong>执行计划 (Plan)</strong> 和 <strong>运行日志 (Run)</strong> 面板查看详细进度。
              </div>
            </div>
          </div>

          {/* System Event */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-slate-500 flex items-center space-x-2">
              <Activity size={12} className="text-blue-400" />
              <span>AI 正在执行任务... (已耗时 2m 14s)</span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/30 shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="向 AI 员工发送指令或补充信息..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Execution Panel */}
      <div className="w-[450px] xl:w-[500px] border-l border-slate-800 flex flex-col bg-slate-900 shrink-0">
        {/* Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-slate-800 bg-slate-950/50 shrink-0 custom-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-900">
          <AnimatePresence mode="wait">
            {activeTab === 'plan' && (
              <motion.div 
                key="plan"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200">执行计划</h3>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">运行中</span>
                </div>
                
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                  {/* Step 1 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-emerald-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckSquare size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-emerald-400 text-sm">步骤 1: 获取元数据</h4>
                        <span className="text-[10px] text-emerald-500/70">已完成</span>
                      </div>
                      <p className="text-xs text-slate-400">连接 MySQL 并提取目标表的 DDL。</p>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 animate-pulse">
                      <Activity size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-blue-400 text-sm">步骤 2: 语义推断</h4>
                        <span className="text-[10px] text-blue-400">进行中</span>
                      </div>
                      <p className="text-xs text-slate-400">调用 Gemini 3.1 Pro 推断业务名称和关联关系。</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <FileText size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-400 text-sm">步骤 3: 生成草案</h4>
                        <span className="text-[10px] text-slate-500">等待中</span>
                      </div>
                      <p className="text-xs text-slate-500">将输出格式化为标准模型草案并保存至交付物。</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'run' && (
              <motion.div 
                key="run"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-4 font-mono text-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-200 font-sans">运行日志</h3>
                  <div className="flex space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1"></span>
                    <span className="text-slate-400 font-sans text-xs">实时</span>
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-slate-400">
                  <div className="text-slate-500">[10:00:05] INFO: 初始化任务 REQ-001</div>
                  <div className="text-slate-500">[10:00:06] INFO: 加载策略 pol_001</div>
                  <div className="text-emerald-400/70">[10:00:08] SUCCESS: 成功连接到数据源 mysql_hr_db</div>
                  <div className="text-slate-500">[10:00:10] INFO: 执行 SHOW CREATE TABLE t_hr_employee</div>
                  <div className="text-slate-500">[10:00:12] INFO: 执行 SHOW CREATE TABLE t_hr_department</div>
                  <div className="text-blue-400/70">[10:00:15] INFO: 正在准备 Gemini 3.1 Pro 的提示词...</div>
                  <div className="text-blue-400/70 animate-pulse">[10:00:16] INFO: 等待模型响应中...</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'evidence' && (
              <motion.div 
                key="evidence"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-200 mb-4">已收集证据</h3>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-300 mb-3 pb-3 border-b border-slate-800">
                    <Database size={14} className="text-slate-500" />
                    <span className="font-mono">t_hr_employee DDL</span>
                  </div>
                  <pre className="text-xs text-slate-400 font-mono overflow-x-auto">
{`CREATE TABLE t_hr_employee (
  id INT PRIMARY KEY,
  emp_no VARCHAR(20) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  dept_id INT,
  hire_date DATE
);`}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* Placeholders for other tabs */}
            {['deliverables', 'tasks', 'replay'].includes(activeTab) && (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-64 text-slate-500"
              >
                <FileSearch size={32} className="mb-3 text-slate-700" />
                <p className="text-sm">暂无 {TABS.find(t => t.id === activeTab)?.label} 数据。</p>
                <p className="text-xs mt-1">等待任务推进...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
