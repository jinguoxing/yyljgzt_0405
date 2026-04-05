import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, AlertTriangle, CheckCircle2, 
  Clock, TrendingUp, ShieldCheck, AlertOctagon,
  Layers, GitBranch, Database, Zap, Filter, RefreshCw,
  ListTodo, Package, ArrowRight, X, Play, Pause, MoreHorizontal,
  Cpu, Server, Network, CheckSquare, XCircle, PlayCircle, 
  BarChart2, PieChart as PieChartIcon, Layout, AlertCircle, ChevronRight,
  Briefcase, Check, FileText, Download, ExternalLink, Box, Calendar, History, TrendingDown, RefreshCcw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
const trendData = [
  { name: '周一', tasks: 24, quality: 92 },
  { name: '周二', tasks: 35, quality: 94 },
  { name: '周三', tasks: 28, quality: 91 },
  { name: '周四', tasks: 42, quality: 96 },
  { name: '周五', tasks: 38, quality: 95 },
  { name: '周六', tasks: 15, quality: 98 },
  { name: '周日', tasks: 12, quality: 99 },
];

const domains = ['全部', 'HR', '销售', '财务', '供应链'];
const datasources = ['全部', 'Snowflake', 'PostgreSQL', 'Salesforce', 'S3'];
const employees = ['全部', 'DataCleaner-01', 'ReportBot-X', 'AuditSentinel-V2'];
const triggers = ['全部', 'MANUAL', 'SCHEDULE', 'SCAN_DONE', 'SCHEMA_CHANGE'];
const statuses = ['全部', 'RUNNING', 'BLOCKED', 'FAILED', 'SUCCEEDED', 'PARTIAL'];

const routeDistribution = [
  { name: '待确认', value: 35, color: '#f59e0b' },
  { name: '冲突', value: 25, color: '#ef4444' },
  { name: '异常', value: 20, color: '#8b5cf6' },
  { name: '忽略', value: 20, color: '#64748b' },
];

const taskTypeData = [
  { name: '凭证', value: 45 },
  { name: '语义', value: 32 },
  { name: '画像', value: 28 },
  { name: 'Schema', value: 15 },
  { name: '超时', value: 10 },
];

interface Employee {
  id: string;
  name: string;
  roleKey: string;
  autonomyLevel: string;
  version: string;
  coverage: {
    domains: number;
    datasources: number;
  };
  status: {
    running: number;
    blockedHard: number;
    blockedSoft: number;
    failed: number;
  };
  kpi: {
    successRate: number;
    autoPassRate: number;
    conflictRate: number;
    avgLatency: string;
    cost: string;
  };
  healthScore: number;
}

interface Task {
  id: string;
  title: string;
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  status: string;
}

interface Deliverable {
  id: string;
  type: 'SEMANTIC' | 'QUALITY' | 'OBJECT' | 'REPORT';
  title: string;
  source: string;
  version: string;
  asset: string;
  generatedAt: string;
  runId: string;
  metrics: {
    label: string;
    value: string | number;
    subLabel?: string;
    subValue?: string | number;
    status?: 'success' | 'warning' | 'error' | 'neutral';
  }[];
}

interface RunEvent {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'success' | 'warning' | 'error' | 'pending';
  duration: string;
  trigger: string;
}

interface TrendMetric {
  date: string;
  successRate: number;
  blockRate: number;
  cost: number;
  semanticDrift: number;
}

interface ReleaseVersion {
  version: string;
  date: string;
  conflictRate: number;
  anomalyRate: number;
  autoPassRate: number;
  isCurrent: boolean;
}

const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    name: 'DataCleaner-01',
    roleKey: '数据清洗',
    autonomyLevel: 'L2',
    version: 'v2.4.0',
    coverage: { domains: 2, datasources: 3 },
    status: { running: 5, blockedHard: 0, blockedSoft: 2, failed: 0 },
    kpi: { successRate: 99.2, autoPassRate: 85, conflictRate: 0.5, avgLatency: '1.2s', cost: '$0.45' },
    healthScore: 98
  },
  {
    id: 'emp-002',
    name: 'ReportBot-X',
    roleKey: '报告生成',
    autonomyLevel: 'L3',
    version: 'v1.8.2',
    coverage: { domains: 4, datasources: 1 },
    status: { running: 12, blockedHard: 1, blockedSoft: 5, failed: 1 },
    kpi: { successRate: 94.5, autoPassRate: 92, conflictRate: 1.2, avgLatency: '45s', cost: '$2.10' },
    healthScore: 88
  },
  {
    id: 'emp-003',
    name: 'AuditSentinel-V2',
    roleKey: '合规审计',
    autonomyLevel: 'L2',
    version: 'v3.0.1-beta',
    coverage: { domains: 1, datasources: 5 },
    status: { running: 3, blockedHard: 2, blockedSoft: 0, failed: 2 },
    kpi: { successRate: 82.0, autoPassRate: 60, conflictRate: 4.5, avgLatency: '2.5m', cost: '$5.50' },
    healthScore: 72
  }
];

const myTasks: Task[] = [
  { id: 'T-1092', title: 'Schema Mismatch: HR_EMPLOYEES', type: '架构变更', priority: 'High', due: '2h', status: 'Blocked' },
  { id: 'T-1093', title: 'Ambiguous Intent: "Q3 Projections"', type: '需确认', priority: 'Medium', due: '4h', status: 'Pending' },
  { id: 'T-1094', title: 'API Rate Limit: Snowflake', type: '需凭证', priority: 'High', due: '30m', status: 'Blocked' },
  { id: 'T-1095', title: 'Data Drift Detected: Sales', type: '异常检测', priority: 'Low', due: '1d', status: 'Pending' },
];

const mockDeliverables: Deliverable[] = [
  {
    id: 'DEL-001',
    type: 'SEMANTIC',
    title: 'Semantic Layer Update: HR Domain',
    source: 'SemanticBuilder-01',
    version: 'v1.2.0',
    asset: 'Snowflake / HR_ANALYTICS',
    generatedAt: '10 mins ago',
    runId: 'R-9921',
    metrics: [
      { label: '自动确认', value: '85%', status: 'success' },
      { label: '未知', value: '5%', status: 'warning' },
      { label: '路由', value: 12 }
    ]
  },
  {
    id: 'DEL-002',
    type: 'QUALITY',
    title: 'Data Quality Scan: Sales Q3',
    source: 'DataCleaner-01',
    version: 'v2.4.0',
    asset: 'PostgreSQL / SALES_Q3',
    generatedAt: '1 hour ago',
    runId: 'R-9845',
    metrics: [
      { label: '规则检查', value: 145 },
      { label: '违规', value: 3, status: 'error' },
      { label: '得分', value: '98/100', status: 'success' }
    ]
  },
  {
    id: 'DEL-003',
    type: 'OBJECT',
    title: 'New Object Candidates: Supply Chain',
    source: 'ObjectMiner-X',
    version: 'v0.9.5',
    asset: 'S3 / LOGS_SC_2023',
    generatedAt: '3 hours ago',
    runId: 'R-9712',
    metrics: [
      { label: '候选', value: 24 },
      { label: '最高分', value: '0.92', status: 'success' },
      { label: '实体', value: 'Shipment_Event' }
    ]
  },
  {
    id: 'DEL-004',
    type: 'REPORT',
    title: 'Q3 Financial Compliance Report',
    source: 'ReportBot-X',
    version: 'v1.8.2',
    asset: 'PDF Export',
    generatedAt: '5 hours ago',
    runId: 'R-9650',
    metrics: [
      { label: '页数', value: 12 },
      { label: '图表', value: 8 },
      { label: '大小', value: '2.4MB' }
    ]
  }
];

const mockRunCalendar: RunEvent[] = [
  { id: 'R-101', date: '2023-10-23', status: 'success', duration: '45s', trigger: '定时' },
  { id: 'R-102', date: '2023-10-24', status: 'warning', duration: '1m 20s', trigger: '定时' },
  { id: 'R-103', date: '2023-10-25', status: 'success', duration: '50s', trigger: '定时' },
  { id: 'R-104', date: '2023-10-26', status: 'error', duration: '10s', trigger: '手动' },
  { id: 'R-105', date: '2023-10-27', status: 'success', duration: '48s', trigger: '定时' },
  { id: 'R-106', date: '2023-10-28', status: 'pending', duration: '-', trigger: '定时' },
  { id: 'R-107', date: '2023-10-29', status: 'pending', duration: '-', trigger: '定时' },
];

const mockTrendData: TrendMetric[] = Array.from({ length: 14 }).map((_, i) => ({
  date: `10-${15 + i}`,
  successRate: 90 + Math.random() * 10,
  blockRate: Math.random() * 15,
  cost: 0.5 + Math.random() * 0.5,
  semanticDrift: Math.random() * 5
}));

const mockReleases: ReleaseVersion[] = [
  { version: 'v2.4.0', date: 'Oct 24', conflictRate: 1.2, anomalyRate: 0.5, autoPassRate: 92, isCurrent: true },
  { version: 'v2.3.5', date: 'Oct 10', conflictRate: 2.5, anomalyRate: 1.8, autoPassRate: 88, isCurrent: false },
  { version: 'v2.3.0', date: 'Sep 28', conflictRate: 1.8, anomalyRate: 1.2, autoPassRate: 85, isCurrent: false },
];

export default function AIOpsDashboard() {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedRun, setSelectedRun] = useState<RunEvent | null>(null);
  const [distTab, setDistTab] = useState<'route' | 'type'>('route');
  const [activeDeliverableTab, setActiveDeliverableTab] = useState<'SEMANTIC' | 'QUALITY' | 'OBJECT' | 'REPORT'>('SEMANTIC');
  const [selectedTrendType, setSelectedTrendType] = useState<'success' | 'block' | 'cost'>('success');
  const [filters, setFilters] = useState({
    timeRange: '24h',
    domain: 'All',
    datasource: 'All',
    employee: 'All',
    version: 'All',
    trigger: 'All',
    status: 'All'
  });

  const [stats, setStats] = useState({
    // Active Employees
    runningEmployees: 12,
    enabledEmployees: 15,
    utilization: 80,

    // Runs Health
    successRate: 98.5,
    failureRate: 1.2,
    blockedRate: 0.3,
    hardBlockedRuns: 0.1,
    softBlockedRuns: 0.2,

    // Open Tasks
    openTasks: 45,
    hardBlockedTasks: 2,
    softBlockedTasks: 12,
    topRoutes: [
      { name: 'Data Cleaning', count: 20 },
      { name: 'Report Gen', count: 15 }
    ],

    // Deliverables
    totalDeliverables: 128,
    semanticResults: 80,
    qualityDrafts: 30,
    candidates: 18,

    // Other stats for charts
    qualityScore: 94,
    healthScore: 'A+',
    dataDrift: 2.5
  });

  // Simulate data update on filter change
  useEffect(() => {
    const randomFactor = Math.random() * 0.2 + 0.9; // 0.9 - 1.1
    setStats({
      runningEmployees: Math.floor(12 * randomFactor),
      enabledEmployees: 15,
      utilization: Math.floor(80 * randomFactor),
      
      successRate: +(98.5 * randomFactor).toFixed(1),
      failureRate: +(1.2 * randomFactor).toFixed(1),
      blockedRate: +(0.3 * randomFactor).toFixed(1),
      hardBlockedRuns: +(0.1 * randomFactor).toFixed(1),
      softBlockedRuns: +(0.2 * randomFactor).toFixed(1),
      
      openTasks: Math.floor(45 * randomFactor),
      hardBlockedTasks: Math.floor(2 * randomFactor),
      softBlockedTasks: Math.floor(12 * randomFactor),
      topRoutes: [
        { name: 'Data Cleaning', count: Math.floor(20 * randomFactor) },
        { name: 'Report Gen', count: Math.floor(15 * randomFactor) }
      ],
      
      totalDeliverables: Math.floor(128 * randomFactor),
      semanticResults: Math.floor(80 * randomFactor),
      qualityDrafts: Math.floor(30 * randomFactor),
      candidates: Math.floor(18 * randomFactor),
      
      qualityScore: Math.min(100, Math.floor(94 * randomFactor)),
      healthScore: randomFactor > 1 ? 'A+' : 'A',
      dataDrift: 2.5 * randomFactor
    });
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCardClick = (path: string) => {
    navigate(path, { state: { filters } });
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-200 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AIOps 智能运维看板</h1>
            <p className="text-slate-400 text-sm mt-1">实时监控数字员工运行状态与交付质量</p>
          </div>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20 flex items-center">
              <Activity size={14} className="mr-1.5" />
              系统运行正常
            </span>
            <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-medium border border-slate-700 flex items-center">
              <RefreshCw size={12} className="mr-1.5" />
              更新于: 刚刚
            </span>
          </div>
        </div>

        {/* Global Filters */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center text-slate-400 mr-2">
            <Filter size={16} className="mr-2" />
            <span className="text-sm font-medium">过滤:</span>
          </div>
          
          {/* Time Range */}
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => handleFilterChange('timeRange', range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filters.timeRange === range 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                最近 {range}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-700 mx-1" />

          {/* Dropdowns */}
          <select 
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.domain}
            onChange={(e) => handleFilterChange('domain', e.target.value)}
          >
            <option value="" disabled>业务域</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select 
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.datasource}
            onChange={(e) => handleFilterChange('datasource', e.target.value)}
          >
             <option value="" disabled>数据源</option>
            {datasources.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select 
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.employee}
            onChange={(e) => handleFilterChange('employee', e.target.value)}
          >
             <option value="" disabled>数字员工</option>
            {employees.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select 
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.trigger}
            onChange={(e) => handleFilterChange('trigger', e.target.value)}
          >
             <option value="" disabled>触发器</option>
            {triggers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select 
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
             <option value="" disabled>状态</option>
            {statuses.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards Row (Executive Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Active Employees */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleCardClick('/aiops/employees')}
          className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col cursor-pointer hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-sm font-semibold text-slate-400 flex items-center">
              <Users size={16} className="mr-2 text-indigo-400" />
              活跃员工 (Active Employees)
            </h2>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{stats.runningEmployees}</span>
              <span className="text-lg text-slate-500">/ {stats.enabledEmployees}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">运行中 / 已启用</div>
            
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">资源利用率</span>
              <span className="text-indigo-400 font-medium">{stats.utilization}%</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Runs Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleCardClick('/aiops/runs')}
          className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col cursor-pointer hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-sm font-semibold text-slate-400 flex items-center">
              <Activity size={16} className="mr-2 text-emerald-400" />
              运行健康度 (Runs Health)
            </h2>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="text-3xl font-bold text-white">{stats.successRate}%</div>
            <div className="text-xs text-slate-500 mt-1">成功率</div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-slate-400">{stats.failureRate}% 失败</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-slate-400">{stats.blockedRate}% 阻塞</span>
                <span className="text-slate-600 text-[10px]">({stats.hardBlockedRuns}% 硬 / {stats.softBlockedRuns}% 软)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Open Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleCardClick('/aiops/tasks')}
          className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col cursor-pointer hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-sm font-semibold text-slate-400 flex items-center">
              <ListTodo size={16} className="mr-2 text-amber-400" />
              待办任务 (Open Tasks)
            </h2>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-bold text-white">{stats.openTasks}</div>
                <div className="text-xs text-slate-500 mt-1">待办总数</div>
              </div>
              <div className="text-right text-[10px] text-slate-500 mb-1">
                {stats.topRoutes?.map((r, i) => (
                  <div key={i}>{r.name}: <span className="text-slate-300">{r.count}</span></div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <AlertOctagon size={12} className="text-red-400" />
                <span className="text-red-400 font-medium">{stats.hardBlockedTasks} 硬阻塞</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock size={12} className="text-amber-400" />
                <span className="text-amber-400 font-medium">{stats.softBlockedTasks} 软任务</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Deliverables */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleCardClick('/aiops/workbench')}
          className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col cursor-pointer hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-sm font-semibold text-slate-400 flex items-center">
              <Package size={16} className="mr-2 text-blue-400" />
              交付物 (Deliverables)
            </h2>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="text-3xl font-bold text-white">{stats.totalDeliverables}</div>
            <div className="text-xs text-slate-500 mt-1">生成总数</div>

            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-1 text-xs">
              <div className="text-center border-r border-slate-800 pr-1">
                <div className="text-slate-200 font-medium">{stats.semanticResults}</div>
                <div className="text-slate-500 scale-90 origin-center">语义</div>
              </div>
              <div className="text-center border-r border-slate-800 px-1">
                <div className="text-slate-200 font-medium">{stats.qualityDrafts}</div>
                <div className="text-slate-500 scale-90 origin-center">草案</div>
              </div>
              <div className="text-center pl-1">
                <div className="text-slate-200 font-medium">{stats.candidates}</div>
                <div className="text-slate-500 scale-90 origin-center">候选</div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Row 2: Employee Runtime Board */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Cpu size={20} className="mr-2 text-indigo-400" />
          数字员工运行态 (Employee Runtime Board)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEmployees.map((emp, index) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Health Score Indicator */}
              <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 ${
                emp.healthScore >= 90 ? 'bg-emerald-500/20' : emp.healthScore >= 75 ? 'bg-amber-500/20' : 'bg-red-500/20'
              }`}></div>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{emp.name}</h3>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">{emp.autonomyLevel}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-1">{emp.roleKey} • {emp.version}</div>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); /* Add logic */ }}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <Play size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); /* Add logic */ }}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>

              {/* Coverage & Status */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">覆盖范围</div>
                  <div className="flex items-center space-x-3 text-xs text-slate-300">
                    <span className="flex items-center"><Layers size={12} className="mr-1 text-slate-500" /> {emp.coverage.domains} 业务域</span>
                    <span className="flex items-center"><Database size={12} className="mr-1 text-slate-500" /> {emp.coverage.datasources} 数据源</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">状态</div>
                  <div className="flex space-x-2 text-xs">
                    {emp.status.running > 0 && <span className="text-emerald-400">{emp.status.running} 运行中</span>}
                    {(emp.status.blockedHard + emp.status.blockedSoft) > 0 && (
                      <span className="text-amber-400">
                        {emp.status.blockedHard + emp.status.blockedSoft} 阻塞
                        <span className="text-[9px] opacity-70 ml-0.5">({emp.status.blockedHard}硬/{emp.status.blockedSoft}软)</span>
                      </span>
                    )}
                    {emp.status.failed > 0 && <span className="text-red-400">{emp.status.failed} 失败</span>}
                  </div>
                </div>
              </div>

              {/* KPI Mini-Dashboard */}
              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <div className="text-[10px] text-slate-500">成功率</div>
                  <div className={`text-sm font-semibold ${emp.kpi.successRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {emp.kpi.successRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">自动通过率</div>
                  <div className="text-sm font-semibold text-blue-400">{emp.kpi.autoPassRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">平均延迟</div>
                  <div className="text-sm font-mono text-slate-300">{emp.kpi.avgLatency}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">冲突率</div>
                  <div className="text-sm font-mono text-slate-300">{emp.kpi.conflictRate}%</div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>

      {/* Row 3: Tasks & SLA */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <CheckSquare size={20} className="mr-2 text-indigo-400" />
          待办与 SLA (Tasks & SLA)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* A) Task Funnel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Hard Block Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col relative overflow-hidden group hover:bg-slate-800/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertOctagon size={18} />
                  <span className="font-semibold">硬阻塞 (Hard Block)</span>
                </div>
                <span className="text-xs text-slate-500">Critical</span>
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-bold text-white">{stats.hardBlockedTasks}</span>
                <span className="text-sm text-slate-400">任务</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs">
                <span className="text-slate-400">超时 (&gt;2h)</span>
                <span className="text-red-400 font-mono font-medium">4</span>
              </div>
            </div>

            {/* Soft Task Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col relative overflow-hidden group hover:bg-slate-800/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Clock size={18} />
                  <span className="font-semibold">软任务 (Soft Task)</span>
                </div>
                <span className="text-xs text-slate-500">Pending</span>
              </div>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-bold text-white">{stats.softBlockedTasks}</span>
                <span className="text-sm text-slate-400">任务</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs">
                <span className="text-slate-400">7日趋势</span>
                <span className="text-amber-400 font-mono font-medium flex items-center">
                  <TrendingUp size={12} className="mr-1" /> +12%
                </span>
              </div>
            </div>
          </div>

          {/* B) Task Distribution */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                <PieChartIcon size={16} className="mr-2 text-indigo-400" />
                任务分布 (Task Distribution)
              </h3>
              <div className="flex bg-slate-800 rounded-lg p-0.5">
                <button 
                  onClick={() => setDistTab('route')}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${distTab === 'route' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  路由
                </button>
                <button 
                  onClick={() => setDistTab('type')}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${distTab === 'type' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  类型
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[200px] relative cursor-pointer" onClick={() => navigate('/aiops/tasks', { state: { filters } })}>
              <ResponsiveContainer width="100%" height="100%">
                {distTab === 'route' ? (
                  <PieChart>
                    <Pie
                      data={routeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {routeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0', fontSize: '12px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                ) : (
                  <BarChart data={taskTypeData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                )}
              </ResponsiveContainer>
              
              {/* Overlay hint */}
              <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                <ArrowRight size={16} className="text-slate-500" />
              </div>
            </div>
          </div>

          {/* C) My Tasks */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                <Briefcase size={16} className="mr-2 text-indigo-400" />
                我的待办 (My Tasks)
              </h3>
              <span className="text-xs text-slate-500">负责人: 我</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[240px] custom-scrollbar">
              {myTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-2">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">{task.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{task.id} • {task.type}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{task.due}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex space-x-2">
              <button className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/20 py-1.5 rounded text-xs font-medium transition-colors">
                批量解决
              </button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-1.5 rounded text-xs font-medium transition-colors">
                全部忽略
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Row 4: Deliverables Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Package size={20} className="mr-2 text-blue-400" />
            交付物 (Deliverables Feed)
          </h2>
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {(['SEMANTIC', 'QUALITY', 'OBJECT', 'REPORT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDeliverableTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeDeliverableTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab === 'SEMANTIC' && '语义结果'}
                {tab === 'QUALITY' && '质量草案'}
                {tab === 'OBJECT' && '候选对象'}
                {tab === 'REPORT' && '报告'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockDeliverables
            .filter(d => d.type === activeDeliverableTab)
            .map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'SEMANTIC' ? 'bg-indigo-500/10 text-indigo-400' :
                    item.type === 'QUALITY' ? 'bg-emerald-500/10 text-emerald-400' :
                    item.type === 'OBJECT' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {item.type === 'SEMANTIC' && <Network size={18} />}
                    {item.type === 'QUALITY' && <ShieldCheck size={18} />}
                    {item.type === 'OBJECT' && <Box size={18} />}
                    {item.type === 'REPORT' && <FileText size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 line-clamp-1">{item.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {item.runId} • {item.generatedAt}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-slate-400 mb-1 flex items-center">
                  <Database size={10} className="mr-1" />
                  {item.asset}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center">
                  <Cpu size={10} className="mr-1" />
                  {item.source} ({item.version})
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 grid grid-cols-3 gap-2 mb-4">
                {item.metrics.map((metric, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`text-sm font-bold ${
                      metric.status === 'success' ? 'text-emerald-400' :
                      metric.status === 'warning' ? 'text-amber-400' :
                      metric.status === 'error' ? 'text-red-400' :
                      'text-slate-200'
                    }`}>
                      {metric.value}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center">
                  <ExternalLink size={14} className="mr-1.5" />
                  打开
                </button>
                <button className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-700 transition-colors">
                  <Download size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          
          {/* Empty State / Add New Placeholder */}
          <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-slate-500 hover:text-slate-400 hover:border-slate-700 transition-colors cursor-pointer min-h-[200px]">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <RefreshCw size={18} />
            </div>
            <div className="text-sm font-medium">加载更多历史</div>
          </div>
        </div>
      </div>

      {/* Row 5: Recurring Tracking */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <History size={20} className="mr-2 text-purple-400" />
          周期性跟踪 (Recurring Tracking)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* A) Run Calendar */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                <Calendar size={16} className="mr-2 text-purple-400" />
                运行日历 (Run Calendar)
              </h3>
              <span className="text-xs text-slate-500">Oct 23 - Oct 29</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-7 gap-2">
                {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => (
                  <div key={i} className="text-center text-[10px] text-slate-500 font-medium mb-1">{day}</div>
                ))}
                {mockRunCalendar.map((run) => (
                  <div 
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border ${
                      run.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' :
                      run.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' :
                      run.status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' :
                      'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{run.date.split('-')[2]}</span>
                    {run.status !== 'pending' && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        run.status === 'success' ? 'bg-emerald-500' :
                        run.status === 'warning' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div>成功</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></div>警告</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>错误</div>
              </div>
            </div>
          </div>

          {/* B) Trends & Drift */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                <TrendingUp size={16} className="mr-2 text-purple-400" />
                趋势与漂移 (Trends & Drift)
              </h3>
              <div className="flex bg-slate-800 rounded-lg p-0.5">
                <button 
                  onClick={() => setSelectedTrendType('success')}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${selectedTrendType === 'success' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  成功率
                </button>
                <button 
                  onClick={() => setSelectedTrendType('block')}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${selectedTrendType === 'block' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  阻塞率
                </button>
                <button 
                  onClick={() => setSelectedTrendType('cost')}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${selectedTrendType === 'cost' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  成本
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTrendData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={selectedTrendType === 'success' ? 'successRate' : selectedTrendType === 'block' ? 'blockRate' : 'cost'} 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorTrend)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* C) Regression & Release */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center">
                <GitBranch size={16} className="mr-2 text-purple-400" />
                回归与发布 (Regression & Release)
              </h3>
              <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center">
                <RefreshCcw size={12} className="mr-1" /> 回放
              </button>
            </div>

            <div className="flex-1 space-y-3">
              {mockReleases.map((release, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${release.isCurrent ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-950/50 border-slate-800'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className={`text-sm font-bold ${release.isCurrent ? 'text-purple-400' : 'text-slate-300'}`}>{release.version}</span>
                      {release.isCurrent && <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white text-[9px] rounded font-bold uppercase">当前版本</span>}
                    </div>
                    <span className="text-xs text-slate-500">{release.date}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500 text-[9px] uppercase">冲突率</div>
                      <div className={`font-mono ${release.conflictRate > 2 ? 'text-red-400' : 'text-slate-300'}`}>{release.conflictRate}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[9px] uppercase">异常率</div>
                      <div className={`font-mono ${release.anomalyRate > 1.5 ? 'text-amber-400' : 'text-slate-300'}`}>{release.anomalyRate}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[9px] uppercase">自动通过</div>
                      <div className="font-mono text-emerald-400">{release.autoPassRate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Run Detail Drawer */}
      <AnimatePresence>
        {selectedRun && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRun(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                      selectedRun.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      selectedRun.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      selectedRun.status === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {selectedRun.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{selectedRun.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-tight">运行详情: {selectedRun.date}</h2>
                </div>
                <button 
                  onClick={() => setSelectedRun(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500">耗时</div>
                      <div className="text-sm font-mono text-white">{selectedRun.duration}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">触发方式</div>
                      <div className="text-sm font-mono text-white">{selectedRun.trigger}</div>
                    </div>
                  </div>
                  
                  {/* Stepper Mock */}
                  <div className="relative pl-4 border-l border-slate-700 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                      <div className="text-sm font-medium text-white">初始化 (Initialization)</div>
                      <div className="text-xs text-slate-500">Config loaded, resources allocated</div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                      <div className="text-sm font-medium text-white">数据摄取 (Data Ingestion)</div>
                      <div className="text-xs text-slate-500">Fetched 12,405 records</div>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${selectedRun.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                      <div className="text-sm font-medium text-white">处理中 (Processing)</div>
                      <div className="text-xs text-slate-500">
                        {selectedRun.status === 'error' ? 'Failed at batch #42' : 'Completed successfully'}
                      </div>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${selectedRun.status === 'pending' ? 'bg-slate-600' : selectedRun.status === 'error' ? 'bg-slate-600' : 'bg-emerald-500'}`}></div>
                      <div className={`text-sm font-medium ${selectedRun.status === 'pending' ? 'text-slate-500' : 'text-white'}`}>完成 (Finalization)</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-600 transition-colors">
                    查看日志
                  </button>
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-600 transition-colors">
                    重跑
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                      selectedTask.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      selectedTask.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {selectedTask.priority}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{selectedTask.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-tight">{selectedTask.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">需要行动 (Action Required)</span>
                    <span className="text-xs text-slate-500">截止于 {selectedTask.due}</span>
                  </div>
                  
                  <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center mb-3">
                    <Zap size={16} className="mr-2" />
                    立即修复
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-600 transition-colors">
                      忽略
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-600 transition-colors">
                      重跑任务
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">上下文 (Context)</h3>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                    {`Error: Schema validation failed for table 'HR_EMPLOYEES'.
Expected column 'email' to be NOT NULL.
Found 12 records with NULL email.

Source: Snowflake / HR_PROD
Timestamp: 2023-10-24 14:30:22 UTC`}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">关联员工 (Related Employee)</h3>
                  <div className="flex items-center p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                    <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 mr-3">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">DataCleaner-01</div>
                      <div className="text-xs text-slate-500">v2.4.0 • 运行中</div>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-slate-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Employee Detail Drawer */}
      <AnimatePresence>
        {selectedEmployee && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedEmployee.name}</h2>
                  <div className="text-sm text-slate-400 mt-1">{selectedEmployee.roleKey}</div>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-white mb-3">快捷操作 (Quick Actions)</h3>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => navigate(`/aiops/employees/${selectedEmployee.id}`)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      查看详情
                    </button>
                    <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      最近运行
                    </button>
                    <button className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">性能指标 (Performance Metrics)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500">成功率</div>
                      <div className="text-xl font-bold text-white mt-1">{selectedEmployee.kpi.successRate}%</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500">自动通过率</div>
                      <div className="text-xl font-bold text-white mt-1">{selectedEmployee.kpi.autoPassRate}%</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500">平均延迟</div>
                      <div className="text-xl font-bold text-white mt-1">{selectedEmployee.kpi.avgLatency}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500">成本 / 运行</div>
                      <div className="text-xl font-bold text-white mt-1">{selectedEmployee.kpi.cost}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">最近活动 (Recent Activity)</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <div>
                            <div className="text-sm text-slate-200">Run #{10234 + i}</div>
                            <div className="text-xs text-slate-500">2 mins ago</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">1.2s</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
