import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, MoreHorizontal, Plus, ShieldCheck, Activity, ChevronRight, Database, Box, PlayCircle, PowerOff, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_EMPLOYEES = [
  {
    id: 'emp_001',
    name: '语义理解专员',
    role: 'SemanticAnalyst',
    status: 'Enabled',
    version: 'v1.2.0',
    model: 'Gemini 3.1 Pro',
    coverage: { domains: ['HR', 'Finance'], datasources: ['mysql', 'hive'], datasourceCount: 12 },
    kpi7d: {
      autoPass: '85%',
      adoption: '92%',
      conflict: 12,
      anomaly: 3,
      cost: '$124.50'
    },
    routes: {
      'auto-pass': 65,
      'human-review': 25,
      'escalate': 10
    }
  },
  {
    id: 'emp_002',
    name: '数据质量巡检员',
    role: 'QA Engineer',
    status: 'Enabled',
    version: 'v2.0.1',
    model: 'Gemini 3 Flash',
    coverage: { domains: ['Sales', 'Marketing'], datasources: ['mysql', 'snowflake'], datasourceCount: 8 },
    kpi7d: {
      autoPass: '95%',
      adoption: '88%',
      conflict: 5,
      anomaly: 1,
      cost: '$45.20'
    },
    routes: {
      'auto-pass': 80,
      'human-review': 15,
      'escalate': 5
    }
  },
  {
    id: 'emp_003',
    name: '指标定义专家',
    role: 'Business Analyst',
    status: 'Disabled',
    version: 'v0.9.5',
    model: 'Gemini 3.1 Pro',
    coverage: { domains: ['Core'], datasources: ['hive'], datasourceCount: 3 },
    kpi7d: {
      autoPass: '60%',
      adoption: '75%',
      conflict: 28,
      anomaly: 12,
      cost: '$89.00'
    },
    routes: {
      'auto-pass': 40,
      'human-review': 40,
      'escalate': 20
    }
  },
  {
    id: 'emp_004',
    name: '血缘分析专员',
    role: 'Data Engineer',
    status: 'Deprecated',
    version: 'v1.0.0',
    model: 'Gemini 2.5 Flash',
    coverage: { domains: ['All'], datasources: ['mysql', 'hive', 'snowflake'], datasourceCount: 45 },
    kpi7d: {
      autoPass: '99%',
      adoption: '98%',
      conflict: 2,
      anomaly: 0,
      cost: '$310.00'
    },
    routes: {
      'auto-pass': 90,
      'human-review': 8,
      'escalate': 2
    }
  }
];

export default function AIOpsEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [datasourceFilter, setDatasourceFilter] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter ? emp.status === statusFilter : true;
      const matchRole = roleFilter ? emp.role === roleFilter : true;
      const matchDomain = domainFilter ? emp.coverage.domains.includes(domainFilter) || emp.coverage.domains.includes('All') : true;
      const matchDatasource = datasourceFilter ? emp.coverage.datasources.includes(datasourceFilter) : true;

      return matchSearch && matchStatus && matchRole && matchDomain && matchDatasource;
    });
  }, [employees, searchQuery, statusFilter, roleFilter, domainFilter, datasourceFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, domainFilter, datasourceFilter]);

  const toggleStatus = (id: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const newStatus = emp.status === 'Enabled' ? 'Disabled' : 'Enabled';
        return { ...emp, status: newStatus };
      }
      return emp;
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">数字员工台账</h2>
          <p className="text-sm text-slate-400 mt-1">管理和监控所有 AI 数字员工的状态与绩效</p>
        </div>
        <button 
          onClick={() => navigate('/aiops/employees/new')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>新建数字员工</span>
        </button>
      </div>

      {/* Top Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="搜索员工名称或角色..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">状态 (Status)</option>
          <option value="Enabled">Enabled</option>
          <option value="Disabled">Disabled</option>
          <option value="Deprecated">Deprecated</option>
        </select>

        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">角色 (Role)</option>
          <option value="SemanticAnalyst">SemanticAnalyst</option>
          <option value="QA Engineer">QA Engineer</option>
          <option value="Business Analyst">Business Analyst</option>
          <option value="Data Engineer">Data Engineer</option>
        </select>

        <select 
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">域 (Domain)</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Sales">Sales</option>
          <option value="Core">Core</option>
        </select>

        <select 
          value={datasourceFilter}
          onChange={(e) => setDatasourceFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="">数据源 (Datasource)</option>
          <option value="mysql">MySQL</option>
          <option value="hive">Hive</option>
          <option value="snowflake">Snowflake</option>
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {paginatedEmployees.length === 0 ? (
          <div className="col-span-1 xl:col-span-2 py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            <Users size={48} className="mb-4 text-slate-700" />
            <p className="text-lg font-medium text-slate-300">未找到匹配的数字员工</p>
            <p className="text-sm mt-1">请尝试调整筛选条件或搜索关键词</p>
          </div>
        ) : paginatedEmployees.map((emp) => (
          <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-700 transition-colors">
            {/* Card Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border",
                  emp.status === 'Enabled' ? "bg-emerald-900/30 text-emerald-400 border-emerald-500/30" :
                  emp.status === 'Disabled' ? "bg-slate-800 text-slate-400 border-slate-700" :
                  "bg-yellow-900/30 text-yellow-500 border-yellow-500/30"
                )}>
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-base font-bold text-slate-100">{emp.name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                      emp.status === 'Enabled' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      emp.status === 'Disabled' ? "bg-slate-800 text-slate-400 border-slate-700" :
                      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    )}>
                      {emp.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded">{emp.role}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-400">{emp.version}</span>
                    <span>•</span>
                    <span>{emp.model}</span>
                  </div>
                </div>
              </div>
              <button className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 grid grid-cols-2 gap-6">
              {/* Left Column: Coverage & Routes */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">覆盖范围 (Coverage)</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {emp.coverage.domains.map(d => (
                      <span key={d} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-xs">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <Database size={14} />
                    <span>{emp.coverage.datasourceCount} 个数据源</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">路由分布 (Routes - 7d)</div>
                  <div className="h-2 w-full flex rounded-full overflow-hidden mb-2">
                    <div style={{ width: `${emp.routes['auto-pass']}%` }} className="bg-emerald-500" title={`Auto Pass: ${emp.routes['auto-pass']}%`} />
                    <div style={{ width: `${emp.routes['human-review']}%` }} className="bg-yellow-500" title={`Human Review: ${emp.routes['human-review']}%`} />
                    <div style={{ width: `${emp.routes['escalate']}%` }} className="bg-red-500" title={`Escalate: ${emp.routes['escalate']}%`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span>Auto ({emp.routes['auto-pass']}%)</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span>Review ({emp.routes['human-review']}%)</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span>Escalate ({emp.routes['escalate']}%)</span></span>
                  </div>
                </div>
              </div>

              {/* Right Column: KPIs */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">近 7 天 KPI</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Auto-Pass</div>
                    <div className="text-sm font-bold text-emerald-400">{emp.kpi7d.autoPass}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Adoption</div>
                    <div className="text-sm font-bold text-indigo-400">{emp.kpi7d.adoption}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Conflict</div>
                    <div className="text-sm font-bold text-yellow-500">{emp.kpi7d.conflict}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Anomaly</div>
                    <div className="text-sm font-bold text-red-400">{emp.kpi7d.anomaly}</div>
                  </div>
                  <div className="col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-3 flex justify-between items-center">
                    <div className="text-[10px] text-slate-500">Cost (Tokens)</div>
                    <div className="text-sm font-bold font-mono text-slate-300">{emp.kpi7d.cost}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/aiops/runs')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors flex items-center space-x-1.5"
                >
                  <PlayCircle size={14} />
                  <span>查看运行</span>
                </button>
                {emp.status === 'Enabled' ? (
                  <button 
                    onClick={() => toggleStatus(emp.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded text-xs font-medium transition-colors flex items-center space-x-1.5"
                  >
                    <PowerOff size={14} />
                    <span>停用</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => toggleStatus(emp.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded text-xs font-medium transition-colors flex items-center space-x-1.5"
                  >
                    <Power size={14} />
                    <span>启用</span>
                  </button>
                )}
              </div>
              <button 
                onClick={() => navigate(`/aiops/employees/${emp.id}`)}
                className="px-3 py-1.5 text-indigo-400 hover:text-indigo-300 rounded text-xs font-medium transition-colors flex items-center space-x-1"
              >
                <span>查看详情</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
        <div className="text-sm text-slate-400">
          显示 {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} 到 {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} 条，共 {filteredEmployees.length} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center",
                  currentPage === i + 1 ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
