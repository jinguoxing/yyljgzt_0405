import React, { useState } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { 
  ChevronRight, AlertCircle, CheckCircle2, AlertTriangle, 
  Activity, ShieldCheck, Key, Link as LinkIcon, 
  BarChart3, Settings, RefreshCw, Save, History,
  MessageSquare, Eye, UploadCloud, Sparkles,
  ChevronUp, ChevronDown, GitCommit, ArrowRight, Edit2, Check,
  Network, Database, ArrowLeftRight, Table
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const MOCK_CONTEXT = {
  lvId: 'lv_005',
  tableName: 't_hr_employee',
  qualifiedName: 'dw.hr.t_hr_employee',
  status: 'DRAFT',
  gateMetrics: { must: 2, coverage: 0.85, risk: 'HIGH' }
};

const MOCK_STRATEGY = {
  summary: {
    tableType: { top1: 'DIMENSION', top2: 'MASTER', confidence: 0.92 },
    grain: '每个员工（Employee）一行',
    description: '存储企业正式员工的核心基础信息，包含身份、组织归属与基础薪资等级。',
    tags: ['HR', 'Core', 'PII'],
    explain: '该表包含大量描述性属性（如姓名、部门、职级），且被多个事实表（如考勤、发薪）作为外键引用，符合典型维度表特征。'
  },
  structure: {
    pkCandidates: [
      { fields: ['employee_id'], confidence: 0.99, evidence: '100% Unique, Non-Null, PK Constraint', validator: 'PASS', details: { unique: true, nonNull: true, constraint: true } },
      { fields: ['ssn_number'], confidence: 0.85, evidence: '99.9% Unique, Has Nulls', validator: 'WARN', reason: '存在空值，不建议作为物理主键', details: { unique: false, nonNull: false, constraint: false } }
    ],
    fkCandidates: [
      { field: 'department_id', target: 'dim_department', matchScore: 0.95, evidence: 'Join frequency high, name match', validation: { exists: true, typeMatch: true } },
      { field: 'manager_id', target: 't_hr_employee', matchScore: 0.88, evidence: 'Self-referencing hierarchy', validation: { exists: true, typeMatch: true } }
    ]
  },
  composition: {
    semanticTypes: [
      { type: 'ID', count: 3 },
      { type: 'NAME', count: 5 },
      { type: 'TIME', count: 4 },
      { type: 'STATUS', count: 2 },
      { type: 'MONEY', count: 1 }
    ],
    roles: [
      { role: 'PK', count: 1 },
      { role: 'FK', count: 2 },
      { role: 'DIMENSION', count: 10 },
      { role: 'MEASURE', count: 1 },
      { role: 'AUDIT', count: 2 }
    ],
    keyFields: ['employee_id', 'department_id', 'status', 'hire_date'],
    anomalies: ['annual_salary 缺乏血缘引用', 'ssn_number 采样率不足 10%']
  },
  usage: {
    downstreams: 24,
    usageSummary: ['常用于按 department_id 分组聚合', '常与 fact_payroll 进行 JOIN'],
    sensitiveFields: 3,
    impactNodes: 12,
    explain: '作为核心维度表，其主键和部门外键的变更将直接影响下游 12 个核心报表的数据准确性。'
  },
  issues: {
    must: [
      { id: 'm1', title: '主键 employee_id 存在重复值风险', action: '去处理' },
      { id: 'm2', title: '敏感字段 ssn_number 未配置脱敏规则', action: '去配置' }
    ],
    review: [
      { id: 'r1', title: '建议将 annual_salary 拆分至独立子表', action: '查看建议' }
    ]
  }
};

export default function TableUnderstanding() {
  const { lvId } = useParams();
  const navigate = useNavigate();
  const { setIsCopilotOpen } = useOutletContext<any>();
  const [isSaving, setIsSaving] = useState(false);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'preview' | 'audit'>('preview');
  const [activeMainTab, setActiveMainTab] = useState<'semantic' | 'lineage'>('semantic');

  // Editable fields state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tableName, setTableName] = useState('员工维度表');
  
  const [isEditingGrain, setIsEditingGrain] = useState(false);
  const [grain, setGrain] = useState(MOCK_STRATEGY.summary.grain);
  
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState(MOCK_STRATEGY.summary.description);

  const [issues, setIssues] = useState(MOCK_STRATEGY.issues);
  const [resolvedIssues, setResolvedIssues] = useState<string[]>([]);

  const handleFixIssue = (id: string, type: 'must' | 'review') => {
    setResolvedIssues(prev => [...prev, id]);
    setTimeout(() => {
      setIssues(prev => ({
        ...prev,
        [type]: prev[type].filter(i => i.id !== id)
      }));
    }, 500);
  };

  const handleBatchFix = () => {
    const mustIds = issues.must.map(i => i.id);
    setResolvedIssues(prev => [...prev, ...mustIds]);
    setTimeout(() => {
      setIssues(prev => ({
        ...prev,
        must: []
      }));
    }, 500);
  };

  const handleConfirm = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Mock success
      alert('策略已确认保存');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans">
      {/* TopBar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link to="/semantic/workbench" className="hover:text-slate-200">语义治理</Link>
            <ChevronRight size={12} />
            <span>表理解</span>
            <ChevronRight size={12} />
            <span className="text-slate-200 font-medium">{MOCK_CONTEXT.tableName}</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-100">{MOCK_CONTEXT.tableName}</span>
            <span className="text-[10px] text-slate-500 font-mono">{MOCK_CONTEXT.qualifiedName}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              {MOCK_CONTEXT.status}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5 cursor-pointer hover:text-red-400 transition-colors">
              <AlertCircle size={14} className="text-red-500" />
              <span className="text-slate-400">MUST:</span>
              <span className="font-bold text-red-400">{MOCK_CONTEXT.gateMetrics.must}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-slate-400">Coverage:</span>
              <span className="font-bold text-green-400">{MOCK_CONTEXT.gateMetrics.coverage * 100}%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Activity size={14} className="text-yellow-500" />
              <span className="text-slate-400">Risk:</span>
              <span className="font-bold text-yellow-500">{MOCK_CONTEXT.gateMetrics.risk}</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <button className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors" title="重新分析">
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={() => setIsCopilotOpen(true)}
              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors" 
              title="智能助手"
            >
              <MessageSquare size={16} />
            </button>
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5">
              <Eye size={14} />
              <span>预览发布</span>
            </button>
            <button disabled className="px-3 py-1.5 bg-indigo-600/50 text-white/50 rounded-lg text-xs font-medium cursor-not-allowed flex items-center space-x-1.5">
              <UploadCloud size={14} />
              <span>发布上架</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center space-x-6 border-b border-slate-800 mb-6 shrink-0">
            <button 
              onClick={() => setActiveMainTab('semantic')}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative",
                activeMainTab === 'semantic' ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className="flex items-center space-x-2">
                <Sparkles size={16} />
                <span>语义分析</span>
              </div>
              {activeMainTab === 'semantic' && (
                <motion.div layoutId="mainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button 
              onClick={() => setActiveMainTab('lineage')}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative",
                activeMainTab === 'lineage' ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className="flex items-center space-x-2">
                <Network size={16} />
                <span>血缘关系</span>
              </div>
              {activeMainTab === 'lineage' && (
                <motion.div layoutId="mainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          </div>

          {activeMainTab === 'semantic' ? (
            <div className="space-y-6">
              {/* A. AI Table Summary Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none w-48"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditingName(false);
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                        onBlur={() => setIsEditingName(false)}
                      />
                    </div>
                  ) : (
                    <>
                      <span>{tableName}</span>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                        title="编辑表名"
                      >
                        <Settings size={14}/>
                      </button>
                    </>
                  )}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded text-xs font-bold tracking-wider">
                    {MOCK_STRATEGY.summary.tableType.top1}
                  </span>
                  <span className="text-xs text-slate-500">置信度 {(MOCK_STRATEGY.summary.tableType.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                {MOCK_STRATEGY.summary.tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md text-[10px] uppercase tracking-wider border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">粒度 (Grain)</div>
                  {!isEditingGrain && (
                    <button 
                      onClick={() => setIsEditingGrain(true)}
                      className="text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
                {isEditingGrain ? (
                  <div className="flex items-start space-x-2">
                    <textarea 
                      value={grain}
                      onChange={(e) => setGrain(e.target.value)}
                      className="flex-1 bg-slate-950 border border-indigo-500 rounded p-2 text-sm text-slate-200 focus:outline-none resize-none h-16"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setIsEditingGrain(false);
                        }
                        if (e.key === 'Escape') setIsEditingGrain(false);
                      }}
                      onBlur={() => setIsEditingGrain(false)}
                    />
                  </div>
                ) : (
                  <div 
                    className="text-sm text-slate-200 bg-slate-950 p-2 rounded border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
                    onClick={() => setIsEditingGrain(true)}
                  >
                    {grain}
                  </div>
                )}
              </div>
              
              <div className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">业务描述</div>
                  {!isEditingDesc && (
                    <button 
                      onClick={() => setIsEditingDesc(true)}
                      className="text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
                {isEditingDesc ? (
                  <div className="flex items-start space-x-2">
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="flex-1 bg-slate-950 border border-indigo-500 rounded p-2 text-sm text-slate-200 focus:outline-none resize-none h-20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setIsEditingDesc(false);
                        }
                        if (e.key === 'Escape') setIsEditingDesc(false);
                      }}
                      onBlur={() => setIsEditingDesc(false)}
                    />
                  </div>
                ) : (
                  <div 
                    className="text-sm text-slate-300 leading-relaxed cursor-pointer hover:text-slate-200 transition-colors"
                    onClick={() => setIsEditingDesc(true)}
                  >
                    {description}
                  </div>
                )}
              </div>
              
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-300">AI 推理过程</span>
                </div>
                <p className="text-xs text-indigo-200/70 leading-relaxed">{MOCK_STRATEGY.summary.explain}</p>
              </div>
            </div>
          </div>

          {/* B. Key Structure Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Key size={16} className="text-slate-400" />
              <span>结构与联接键</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* PK */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>主键候选 (Primary Key)</span>
                  <span className="text-[10px] text-slate-600 font-normal">AI 验证规则</span>
                </div>
                {MOCK_STRATEGY.structure.pkCandidates.map((pk, i) => (
                  <div key={i} className={cn("p-4 rounded-xl border transition-all duration-300 hover:shadow-md", pk.validator === 'PASS' ? "bg-slate-900 border-green-500/30 hover:border-green-500/50" : "bg-slate-900 border-yellow-500/30 hover:border-yellow-500/50")}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-slate-200">{pk.fields.join(', ')}</span>
                        {pk.validator === 'PASS' ? <ShieldCheck size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-yellow-500" />}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono font-bold text-indigo-400">{(pk.confidence * 100).toFixed(0)}%</span>
                        <span className="text-[9px] text-slate-500 uppercase">置信度</span>
                      </div>
                    </div>
                    
                    {/* Validation Details */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded border border-slate-800">
                        {pk.details.unique ? <CheckCircle2 size={12} className="text-green-500 mb-1" /> : <AlertCircle size={12} className="text-yellow-500 mb-1" />}
                        <span className="text-[9px] text-slate-400">唯一性</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded border border-slate-800">
                        {pk.details.nonNull ? <CheckCircle2 size={12} className="text-green-500 mb-1" /> : <AlertCircle size={12} className="text-yellow-500 mb-1" />}
                        <span className="text-[9px] text-slate-400">非空</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded border border-slate-800">
                        {pk.details.constraint ? <CheckCircle2 size={12} className="text-green-500 mb-1" /> : <AlertCircle size={12} className="text-slate-600 mb-1" />}
                        <span className="text-[9px] text-slate-400">物理约束</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/50">{pk.evidence}</div>
                    {pk.reason && <div className="text-[11px] text-yellow-500/90 mt-2 flex items-start space-x-1.5"><AlertTriangle size={12} className="mt-0.5 shrink-0" /><span>{pk.reason}</span></div>}
                  </div>
                ))}
              </div>

              {/* FK */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>外键候选 (Foreign Keys)</span>
                  <span className="text-[10px] text-slate-600 font-normal">关系推断</span>
                </div>
                {MOCK_STRATEGY.structure.fkCandidates.map((fk, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-2 mb-3 bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-mono text-sm font-bold text-slate-200">{fk.field}</span>
                      <LinkIcon size={14} className="text-slate-500 shrink-0" />
                      <span className="font-mono text-sm font-bold text-indigo-400 truncate" title={fk.target}>{fk.target}</span>
                    </div>
                    
                    {/* Validation Details */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex space-x-3">
                        <div className="flex items-center space-x-1">
                          {fk.validation.exists ? <CheckCircle2 size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-red-500" />}
                          <span className="text-[10px] text-slate-400">目标表存在</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {fk.validation.typeMatch ? <CheckCircle2 size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-yellow-500" />}
                          <span className="text-[10px] text-slate-400">类型匹配</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono font-bold text-indigo-400">{(fk.matchScore * 100).toFixed(0)}%</span>
                        <span className="text-[9px] text-slate-500 uppercase">匹配度</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/50">{fk.evidence}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* C & D in a row */}
          <div className="grid grid-cols-2 gap-6">
            {/* C. Field Composition Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
                <BarChart3 size={16} className="text-slate-400" />
                <span>字段分布与角色</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-2">语义类型分布</div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_STRATEGY.composition.semanticTypes.map(st => (
                      <div key={st.type} className="flex items-center space-x-1 text-xs bg-slate-950 border border-slate-800 px-2 py-1 rounded">
                        <span className="text-slate-300">{st.type}</span>
                        <span className="text-slate-500 font-mono">{st.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-2">关键字段 (Key Fields)</div>
                  <div className="flex flex-wrap gap-1">
                    {MOCK_STRATEGY.composition.keyFields.map(kf => (
                      <span key={kf} className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {kf}
                      </span>
                    ))}
                  </div>
                </div>
                {MOCK_STRATEGY.composition.anomalies.length > 0 && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="text-xs font-bold text-orange-400 mb-1">异常/缺失证据</div>
                    <ul className="list-disc list-inside text-[11px] text-orange-300/80 space-y-1">
                      {MOCK_STRATEGY.composition.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* D. Usage & Impact Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
                <Activity size={16} className="text-slate-400" />
                <span>使用与影响</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-slate-200">{MOCK_STRATEGY.usage.downstreams}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">下游引用</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">{MOCK_STRATEGY.usage.sensitiveFields}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">敏感字段 (PII)</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">常见用法</div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {MOCK_STRATEGY.usage.usageSummary.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-800/50 p-2 rounded">
                  {MOCK_STRATEGY.usage.explain}
                </div>
              </div>
            </div>
          </div>

            {/* E. Issues & Blockers Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <AlertCircle size={16} className="text-slate-400" />
                  <span>阻塞项与建议</span>
                </h3>
                {issues.must.length > 0 && (
                  <button 
                    onClick={handleBatchFix}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition-colors"
                  >
                    批量修复
                  </button>
                )}
              </div>
              <div className="space-y-3">
              {issues.must.length === 0 && issues.review.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500/50" />
                  暂无阻塞项或建议
                </div>
              )}
              {issues.must.map(issue => (
                <div 
                  key={issue.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-500",
                    resolvedIssues.includes(issue.id) 
                      ? "bg-green-500/5 border-green-500/20 opacity-50 scale-95" 
                      : "bg-red-500/5 border-red-500/20"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      "px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border",
                      resolvedIssues.includes(issue.id)
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    )}>
                      {resolvedIssues.includes(issue.id) ? 'FIXED' : 'MUST'}
                    </span>
                    <span className={cn("text-sm transition-colors", resolvedIssues.includes(issue.id) ? "text-slate-400 line-through" : "text-slate-200")}>
                      {issue.title}
                    </span>
                  </div>
                  {!resolvedIssues.includes(issue.id) && (
                    <button 
                      onClick={() => handleFixIssue(issue.id, 'must')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {issue.action} &rarr;
                    </button>
                  )}
                </div>
              ))}
              {issues.review.map(issue => (
                <div 
                  key={issue.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-500",
                    resolvedIssues.includes(issue.id) 
                      ? "bg-green-500/5 border-green-500/20 opacity-50 scale-95" 
                      : "bg-orange-500/5 border-orange-500/20"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      "px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border",
                      resolvedIssues.includes(issue.id)
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    )}>
                      {resolvedIssues.includes(issue.id) ? 'FIXED' : 'REVIEW'}
                    </span>
                    <span className={cn("text-sm transition-colors", resolvedIssues.includes(issue.id) ? "text-slate-400 line-through" : "text-slate-200")}>
                      {issue.title}
                    </span>
                  </div>
                  {!resolvedIssues.includes(issue.id) && (
                    <button 
                      onClick={() => handleFixIssue(issue.id, 'review')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      {issue.action} &rarr;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
              {/* Simple Lineage Visualization */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              
              <div className="relative z-10 flex items-center justify-center w-full max-w-4xl">
                {/* Upstream */}
                <div className="flex flex-col space-y-4 w-64">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">上游依赖 (Upstream)</div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg flex items-center space-x-3">
                    <Database size={20} className="text-blue-400" />
                    <div>
                      <div className="text-sm font-bold text-slate-200">ods_hr_employee</div>
                      <div className="text-xs text-slate-500">ODS 层原始表</div>
                    </div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg flex items-center space-x-3">
                    <Database size={20} className="text-blue-400" />
                    <div>
                      <div className="text-sm font-bold text-slate-200">ods_hr_department</div>
                      <div className="text-xs text-slate-500">ODS 层原始表</div>
                    </div>
                  </div>
                </div>

                {/* Connections */}
                <div className="flex-1 flex items-center justify-center px-8">
                  <div className="h-px bg-slate-700 w-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-slate-500 rotate-45"></div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-[10px] text-slate-500 border border-slate-700 rounded-full">ETL</div>
                  </div>
                </div>

                {/* Current Table */}
                <div className="w-72 shrink-0">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 text-center">当前表 (Current)</div>
                  <div className="bg-indigo-900/40 border-2 border-indigo-500 p-5 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col items-center">
                    <div className="p-3 bg-indigo-500/20 rounded-full mb-3">
                      <Table size={24} className="text-indigo-400" />
                    </div>
                    <div className="text-base font-bold text-slate-100 mb-1">{tableName}</div>
                    <div className="text-xs text-indigo-300 font-mono">{MOCK_CONTEXT.qualifiedName}</div>
                    <div className="mt-4 flex space-x-2">
                      <span className="px-2 py-1 bg-slate-950 rounded text-[10px] text-slate-400 border border-slate-800">24 个字段</span>
                      <span className="px-2 py-1 bg-slate-950 rounded text-[10px] text-slate-400 border border-slate-800">1.2M 行</span>
                    </div>
                  </div>
                </div>

                {/* Connections */}
                <div className="flex-1 flex items-center justify-center px-8">
                  <div className="h-px bg-slate-700 w-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-slate-500 rotate-45"></div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-[10px] text-slate-500 border border-slate-700 rounded-full">JOIN</div>
                  </div>
                </div>

                {/* Downstream */}
                <div className="flex flex-col space-y-4 w-64">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">下游影响 (Downstream)</div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg flex items-center space-x-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                    <BarChart3 size={20} className="text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-slate-200">月度薪资报表</div>
                      <div className="text-xs text-slate-500">BI Dashboard</div>
                    </div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg flex items-center space-x-3">
                    <BarChart3 size={20} className="text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-slate-200">部门人员分布</div>
                      <div className="text-xs text-slate-500">BI Dashboard</div>
                    </div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg flex items-center space-x-3 opacity-60">
                    <div className="text-xs text-slate-400 text-center w-full">+ 22 个其他依赖</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Confirmation Panel */}
        <div className="w-[400px] border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
          <div className="h-14 border-b border-slate-800 flex items-center px-6 bg-slate-900 shrink-0">
            <h2 className="text-sm font-bold text-slate-100">确认表策略 (Table Strategy)</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* 1. Table Type */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>1. 表类型确认</span>
                <span className="text-[10px] text-indigo-400 font-normal">AI 推荐: DIMENSION</span>
              </label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="DIMENSION">维度表 (DIMENSION)</option>
                <option value="FACT">事实表 (FACT)</option>
                <option value="MASTER">主数据 (MASTER)</option>
              </select>
            </div>

            {/* 2. Grain */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. 粒度确认 (Grain)</label>
              <textarea 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none h-20"
                defaultValue={MOCK_STRATEGY.summary.grain}
              />
            </div>

            {/* 3. PK / FK */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. 主键/外键确认</label>
              
              <div className="space-y-2">
                <div className="text-[11px] text-slate-500">主键 (Primary Key)</div>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
                  {MOCK_STRATEGY.structure.pkCandidates.map(pk => (
                    <option key={pk.fields.join(',')} value={pk.fields.join(',')}>{pk.fields.join(', ')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] text-slate-500">外键 (Foreign Keys)</div>
                <div className="space-y-2">
                  {MOCK_STRATEGY.structure.fkCandidates.map(fk => (
                    <label key={fk.field} className="flex items-center space-x-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50" />
                      <div className="flex-1 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-300">{fk.field}</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="font-mono text-indigo-400">{fk.target}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Risk & Compliance */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. 风险与合规</label>
              <div className="flex flex-wrap gap-2">
                {['PII', 'Core', 'HR', 'Financial'].map(tag => (
                  <label key={tag} className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" defaultChecked={MOCK_STRATEGY.summary.tags.includes(tag)} className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50" />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="p-6 border-t border-slate-800 bg-slate-900 space-y-3 shrink-0">
            <button 
              onClick={() => setIsBottomPanelOpen(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center space-x-2 mb-2"
            >
              <Eye size={16} />
              <span>查看变更预览</span>
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20 flex items-center justify-center space-x-2"
            >
              <Save size={16} />
              <span>{isSaving ? '保存中...' : '保存并确认策略'}</span>
            </button>
            <div className="flex space-x-2">
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium transition-colors border border-slate-700">
                保存草稿
              </button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium transition-colors border border-slate-700 flex items-center justify-center space-x-1">
                <History size={14} />
                <span>恢复AI建议</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel (Change Preview & Audit) */}
      {isBottomPanelOpen && (
        <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-20 relative">
          <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveBottomTab('preview')}
                className={cn("text-xs font-medium px-2 py-1 border-b-2 transition-colors", activeBottomTab === 'preview' ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200")}
              >
                变更预览 (Diff)
              </button>
              <button 
                onClick={() => setActiveBottomTab('audit')}
                className={cn("text-xs font-medium px-2 py-1 border-b-2 transition-colors", activeBottomTab === 'audit' ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200")}
              >
                审计与历史
              </button>
            </div>
            <button onClick={() => setIsBottomPanelOpen(false)} className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded">
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeBottomTab === 'preview' ? (
              <div className="flex space-x-6 h-full">
                <div className="flex-1 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">本次将修改的内容</h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 w-24">TableType:</span>
                      <span className="text-red-400 line-through">UNKNOWN</span>
                      <ArrowRight size={12} className="text-slate-600" />
                      <span className="text-green-400">DIMENSION</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 w-24">PrimaryKey:</span>
                      <span className="text-red-400 line-through">None</span>
                      <ArrowRight size={12} className="text-slate-600" />
                      <span className="text-green-400">employee_id</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 w-24">Grain:</span>
                      <span className="text-green-400">+ 每个员工（Employee）一行</span>
                    </div>
                  </div>
                </div>
                <div className="w-64 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">预估影响</h4>
                  <div className="space-y-2">
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700 flex justify-between items-center">
                      <span className="text-xs text-slate-400">MUST 阻塞项</span>
                      <span className="text-xs font-bold text-green-400">-2</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700 flex justify-between items-center">
                      <span className="text-xs text-slate-400">覆盖率 (Coverage)</span>
                      <span className="text-xs font-bold text-green-400">+15%</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700 flex justify-between items-center">
                      <span className="text-xs text-slate-400">风险等级 (Risk)</span>
                      <span className="text-xs font-bold text-yellow-500">HIGH &rarr; MED</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 bg-slate-800 p-1.5 rounded-full text-slate-400">
                    <GitCommit size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">系统自动生成策略 (AI 推断)</div>
                    <div className="text-xs text-slate-500 mt-0.5">2023-10-25 14:30:00 • 关联 Run ID: run_98765</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 opacity-50">
                  <div className="mt-1 bg-slate-800 p-1.5 rounded-full text-slate-400">
                    <History size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">初始状态</div>
                    <div className="text-xs text-slate-500 mt-0.5">2023-10-25 10:00:00</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
