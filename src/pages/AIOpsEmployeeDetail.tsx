import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Database, Box, Activity, 
  Clock, DollarSign, GitBranch, PlayCircle, History, 
  Settings, User, FileText, Zap, CheckCircle2, AlertTriangle, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_DETAIL = {
  id: 'emp_001',
  name: '语义理解专员',
  role: 'SemanticAnalyst',
  owner: 'Zhang San',
  description: '负责对 ODS/DWD 层数据表进行自动化语义理解，提取中英文名称、业务描述、主外键关系，并输出标准化模型草案。',
  status: 'Enabled',
  coverage: {
    domains: ['HR', 'Finance', 'Sales'],
    datasources: ['MySQL (hr_db)', 'Hive (dw_core)', 'Snowflake (sales_mart)'],
    assetTypes: ['Table', 'View', 'Topic']
  },
  activeVersion: {
    version: 'v1.2.0',
    model: 'Gemini 3.1 Pro',
    promptSummary: '基于企业数据字典 v2 的 Few-shot 提示词模板',
    policySummary: '严格主键验证策略 + 敏感字段脱敏规则',
    effectiveTime: '2026-02-20 14:30:00'
  },
  skills: {
    allowlistCount: 12,
    topSkills: ['SQL Parser', 'Metadata Fetcher', 'Data Profiler']
  },
  health: {
    routes: {
      'auto-pass': 65,
      'human-review': 25,
      'escalate': 10
    },
    cost: '$124.50',
    latency: '14.2s',
    successRate: '98.5%'
  }
};

export default function AIOpsEmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/aiops/employees')}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-lg font-bold text-emerald-400">
              {MOCK_DETAIL.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>{MOCK_DETAIL.name}</span>
                <span className="text-sm font-mono text-slate-500">({employeeId})</span>
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {MOCK_DETAIL.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <User size={12} />
                  <span>Owner: {MOCK_DETAIL.owner}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
            编辑配置
          </button>
          <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">
            停用员工
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Info & Coverage */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Info & Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <FileText size={16} className="text-slate-400" />
              <span>基本信息</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">角色 (Role)</div>
                <div className="text-sm font-medium text-slate-200 bg-slate-950 px-3 py-2 rounded border border-slate-800">{MOCK_DETAIL.role}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">负责人 (Owner)</div>
                <div className="text-sm font-medium text-slate-200 bg-slate-950 px-3 py-2 rounded border border-slate-800">{MOCK_DETAIL.owner}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">描述 (Description)</div>
              <div className="text-sm text-slate-300 leading-relaxed bg-slate-950 px-3 py-2 rounded border border-slate-800">
                {MOCK_DETAIL.description}
              </div>
            </div>
          </div>

          {/* Active Version Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -z-10" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <GitBranch size={16} className="text-indigo-400" />
                <span>当前运行版本 (Active Version)</span>
              </h3>
              <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                {MOCK_DETAIL.activeVersion.version}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">大语言模型 (Model)</div>
                  <div className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                    <Zap size={14} className="text-emerald-400" />
                    <span>{MOCK_DETAIL.activeVersion.model}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">提示词模板 (Prompt)</div>
                  <div className="text-sm text-slate-300">{MOCK_DETAIL.activeVersion.promptSummary}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">执行策略 (Policy)</div>
                  <div className="text-sm text-slate-300 flex items-start space-x-2">
                    <ShieldCheck size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                    <span>{MOCK_DETAIL.activeVersion.policySummary}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">生效时间 (Effective Time)</div>
                  <div className="text-sm font-mono text-slate-400 flex items-center space-x-2">
                    <Clock size={14} />
                    <span>{MOCK_DETAIL.activeVersion.effectiveTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage & Skills */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
                <Database size={16} className="text-slate-400" />
                <span>覆盖范围 (Coverage)</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-2">业务域 (Domains)</div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_DETAIL.coverage.domains.map(d => (
                      <span key={d} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">{d}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-2">数据源 (Datasources)</div>
                  <div className="flex flex-col space-y-1.5">
                    {MOCK_DETAIL.coverage.datasources.map(d => (
                      <div key={d} className="text-xs text-slate-300 flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-2">资产类型 (Asset Types)</div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_DETAIL.coverage.assetTypes.map(d => (
                      <span key={d} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs border border-indigo-500/20">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
                <Wrench size={16} className="text-slate-400" />
                <span>技能授权 (Skills)</span>
              </h3>
              <div className="flex items-center space-x-3 mb-4 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {MOCK_DETAIL.skills.allowlistCount}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">已授权技能数</div>
                  <div className="text-xs text-slate-500">Allowlist Skills Count</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">常用技能 (Top Skills)</div>
                <div className="space-y-2">
                  {MOCK_DETAIL.skills.topSkills.map(skill => (
                    <div key={skill} className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-950 px-3 py-2 rounded border border-slate-800">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Health & Entrances */}
        <div className="space-y-6">
          {/* Health & KPIs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Activity size={16} className="text-slate-400" />
              <span>健康度 (Health - 7d)</span>
            </h3>
            
            <div className="space-y-6">
              {/* Route Distribution */}
              <div>
                <div className="text-xs text-slate-500 mb-2 flex justify-between">
                  <span>路由分布 (Route Distribution)</span>
                  <span className="text-emerald-400 font-bold">{MOCK_DETAIL.health.routes['auto-pass']}% Auto</span>
                </div>
                <div className="h-3 w-full flex rounded-full overflow-hidden mb-3">
                  <div style={{ width: `${MOCK_DETAIL.health.routes['auto-pass']}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${MOCK_DETAIL.health.routes['human-review']}%` }} className="bg-yellow-500" />
                  <div style={{ width: `${MOCK_DETAIL.health.routes['escalate']}%` }} className="bg-red-500" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">Auto Pass</div>
                    <div className="text-sm font-bold text-emerald-400">{MOCK_DETAIL.health.routes['auto-pass']}%</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">Review</div>
                    <div className="text-sm font-bold text-yellow-500">{MOCK_DETAIL.health.routes['human-review']}%</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">Escalate</div>
                    <div className="text-sm font-bold text-red-500">{MOCK_DETAIL.health.routes['escalate']}%</div>
                  </div>
                </div>
              </div>

              {/* Other KPIs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                    <DollarSign size={14} />
                    <span className="text-xs">Cost (Tokens)</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-200">{MOCK_DETAIL.health.cost}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                    <Clock size={14} />
                    <span className="text-xs">Avg Latency</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-200">{MOCK_DETAIL.health.latency}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Entrances */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Box size={16} className="text-slate-400" />
              <span>快捷入口 (Quick Links)</span>
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/aiops/runs')}
                className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Activity size={16} className="text-blue-400" />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100">运行记录 (Runs)</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">124 今日</span>
              </button>
              
              <button 
                onClick={() => navigate('/aiops/replay')}
                className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <PlayCircle size={16} className="text-emerald-400" />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100">审计回放 (Replay)</span>
                </div>
              </button>

              <button 
                onClick={() => navigate('/aiops/policies')}
                className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck size={16} className="text-indigo-400" />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100">策略与版本 (Policies)</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">v1.2.0</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <History size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100">版本历史 (Version History)</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
