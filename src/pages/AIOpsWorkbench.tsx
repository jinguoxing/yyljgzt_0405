import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Clock, MessageSquare, PlayCircle, 
  CheckCircle2, AlertTriangle, MoreVertical, LayoutDashboard,
  Library, ChevronDown, Database, Bot, ShieldAlert, Play,
  Archive, ExternalLink, CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIOpsWorkbenchRequestCreateModal from '@/components/AIOpsWorkbenchRequestCreateModal';
import AIOpsTemplateLibraryModal from '@/components/AIOpsTemplateLibraryModal';

const MOCK_REQUESTS = [
  { 
    id: 'REQ-20260227-001', 
    title: '解析 HR 域表结构与语义', 
    asset: { domain: 'HR', datasource: 'db-prod-hr', table: 'employees' },
    employee: { name: 'Data Steward AI', level: 'L2' },
    status: 'RUNNING', 
    stage: 'D',
    blockers: { hard: 0, soft: 3 },
    lastRun: '10分钟前',
    cost: '12.4k / 8',
    isMine: true
  },
  { 
    id: 'REQ-20260226-042', 
    title: '梳理 Sales 数据血缘', 
    asset: { domain: 'Sales', datasource: 'db-sales-01', table: 'orders' },
    employee: { name: 'Lineage Analyst', level: 'L1' },
    status: 'BLOCKED', 
    stage: 'C',
    blockers: { hard: 1, soft: 0 },
    lastRun: '2小时前',
    cost: '5.2k / 3',
    isMine: false
  },
  { 
    id: 'REQ-20260225-089', 
    title: '生成财务指标定义', 
    asset: { domain: 'Finance', datasource: 'dw-finance', table: 'fact_revenue' },
    employee: { name: 'Metric Generator', level: 'L2' },
    status: 'SUCCEEDED', 
    stage: 'E',
    blockers: { hard: 0, soft: 0 },
    lastRun: '1天前',
    cost: '28.1k / 15',
    isMine: true
  },
  { 
    id: 'REQ-20260225-090', 
    title: '用户行为日志异常检测', 
    asset: { domain: 'Growth', datasource: 'log-cluster', table: 'user_events' },
    employee: { name: 'Anomaly Detector', level: 'L3' },
    status: 'FAILED', 
    stage: 'A',
    blockers: { hard: 2, soft: 0 },
    lastRun: '2天前',
    cost: '1.1k / 1',
    isMine: false
  },
];

export default function AIOpsWorkbench() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Filters
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterEmployee, setFilterEmployee] = useState('全部');
  const [filterDomain, setFilterDomain] = useState('全部');
  const [filterDatasource, setFilterDatasource] = useState('全部');
  const [isMineOnly, setIsMineOnly] = useState(false);

  const filteredRequests = useMemo(() => {
    return MOCK_REQUESTS.filter(req => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          req.title.toLowerCase().includes(query) ||
          req.id.toLowerCase().includes(query) ||
          req.asset.domain.toLowerCase().includes(query) ||
          req.asset.datasource.toLowerCase().includes(query) ||
          req.asset.table.toLowerCase().includes(query) ||
          req.employee.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filters
      if (filterStatus !== '全部' && req.status !== filterStatus) return false;
      if (filterEmployee !== '全部' && req.employee.name !== filterEmployee) return false;
      if (filterDomain !== '全部' && req.asset.domain !== filterDomain) return false;
      if (filterDatasource !== '全部' && req.asset.datasource !== filterDatasource) return false;
      if (isMineOnly && !req.isMine) return false;

      return true;
    });
  }, [searchQuery, filterStatus, filterEmployee, filterDomain, filterDatasource, isMineOnly]);

  const handleRowClick = (id: string) => {
    navigate(`/aiops/workbench/requests/${id}`);
  };

  const handleCreateRequest = (start: boolean) => {
    setIsCreateModalOpen(false);
    const newId = `REQ-20260227-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    navigate(`/aiops/workbench/requests/${newId}`);
  };

  const handleSelectTemplate = (template: any) => {
    setIsTemplateLibraryOpen(false);
    setSelectedTemplate(template);
    setIsCreateModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedTemplate(null);
    setIsCreateModalOpen(true);
  };

  const toggleRowSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredRequests.map(r => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
      {/* 1.1 TopBar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-100">AI 运营工作台</h1>
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              placeholder="搜索需求/数据源/表/员工/状态..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsTemplateLibraryOpen(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <Library size={16} />
            <span>模板库</span>
          </button>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Plus size={16} />
            <span>新建需求</span>
          </button>
        </div>
      </div>

      {/* 1.2 FilterBar */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-x-auto custom-scrollbar pb-1">
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="全部">状态: 全部</option>
              <option value="RUNNING">状态: 运行中</option>
              <option value="BLOCKED">状态: 已阻塞</option>
              <option value="SUCCEEDED">状态: 已成功</option>
              <option value="FAILED">状态: 已失败</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select 
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="全部">AI员工: 全部</option>
              {Array.from(new Set(MOCK_REQUESTS.map(r => r.employee.name))).map(name => (
                <option key={name} value={name}>员工: {name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="全部">业务域: 全部</option>
              {Array.from(new Set(MOCK_REQUESTS.map(r => r.asset.domain))).map(domain => (
                <option key={domain} value={domain}>域: {domain}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterDatasource}
              onChange={(e) => setFilterDatasource(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="全部">数据源: 全部</option>
              {Array.from(new Set(MOCK_REQUESTS.map(r => r.asset.datasource))).map(ds => (
                <option key={ds} value={ds}>源: {ds}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <button className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap">
            <Clock size={14} className="text-slate-500" />
            <span>创建时间: 最近7天</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
        </div>
        <div className="flex items-center space-x-2 shrink-0 ml-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className="relative flex items-center justify-center w-4 h-4 rounded hover:bg-slate-800 transition-colors">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={isMineOnly}
                onChange={(e) => setIsMineOnly(e.target.checked)}
              />
              <div className="w-4 h-4 rounded border border-slate-500 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center transition-colors">
                <CheckSquare size={12} className="text-white opacity-0 peer-checked:opacity-100" />
              </div>
            </div>
            <span className="text-xs text-slate-400 select-none">仅看我的需求</span>
          </label>
        </div>
      </div>

      {/* 1.3 RequestTable */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-950"
                    checked={selectedRows.size === filteredRequests.length && filteredRequests.length > 0}
                    onChange={toggleAllRows}
                  />
                </th>
                <th className="px-4 py-3 font-medium">需求标题</th>
                <th className="px-4 py-3 font-medium">数据资产</th>
                <th className="px-4 py-3 font-medium">AI员工</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">当前阶段</th>
                <th className="px-4 py-3 font-medium">阻塞项</th>
                <th className="px-4 py-3 font-medium">最近运行</th>
                <th className="px-4 py-3 font-medium">消耗</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {filteredRequests.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => handleRowClick(req.id)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group relative"
                >
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-950"
                      checked={selectedRows.has(req.id)}
                      onChange={(e) => toggleRowSelection(req.id, e as any)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center space-x-2">
                      <span>{req.title}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{req.id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-slate-300">{req.asset.domain} / {req.asset.datasource}</span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center"><Database size={10} className="mr-1"/> {req.asset.table}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Bot size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-300">{req.employee.name}</span>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1 rounded w-max mt-0.5">{req.employee.level}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border",
                      req.status === 'RUNNING' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      req.status === 'BLOCKED' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      req.status === 'SUCCEEDED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      req.status === 'FAILED' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-slate-800 text-slate-400 border-slate-700"
                    )}>
                      {req.status === 'RUNNING' ? '运行中' : req.status === 'BLOCKED' ? '已阻塞' : req.status === 'SUCCEEDED' ? '已成功' : req.status === 'FAILED' ? '已失败' : req.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {req.stage}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {req.blockers.hard > 0 && (
                        <span className="flex items-center space-x-1 text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          <ShieldAlert size={12} />
                          <span>{req.blockers.hard}</span>
                        </span>
                      )}
                      {req.blockers.soft > 0 && (
                        <span className="flex items-center space-x-1 text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                          <AlertTriangle size={12} />
                          <span>{req.blockers.soft}</span>
                        </span>
                      )}
                      {req.blockers.hard === 0 && req.blockers.soft === 0 && (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-xs">
                    {req.lastRun}
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-xs font-mono">
                    {req.cost}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRowClick(req.id); }}
                        className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                        title="查看详情"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                        title="重新运行"
                      >
                        <Play size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        title="归档"
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AIOpsWorkbenchRequestCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRequest}
        initialTemplate={selectedTemplate}
      />

      <AIOpsTemplateLibraryModal
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
