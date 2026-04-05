import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Bot, Database, Wrench, 
  ShieldCheck, FileText, Zap, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIOpsEmployeeCreate() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: 'SemanticAnalyst',
    owner: 'Admin',
    description: '',
    model: 'Gemini 3.1 Pro',
    promptTemplate: 'default_semantic_v2',
    policy: 'pol_001',
    domains: [] as string[],
    datasources: [] as string[],
    skills: [] as string[]
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      navigate('/aiops/employees');
    }, 1000);
  };

  const toggleArrayItem = (field: 'domains' | 'datasources' | 'skills', value: string) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
  };

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
          <div>
            <h2 className="text-xl font-bold text-slate-100">注册新数字员工</h2>
            <p className="text-sm text-slate-400 mt-1">配置 AI 员工的基础信息、模型能力与覆盖范围</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/aiops/employees')}
            className="px-4 py-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !formData.name}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shadow-lg shadow-emerald-900/20"
          >
            <Save size={16} />
            <span>{isSaving ? '注册中...' : '确认注册'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl">
        {/* Left Column: Basic & AI Config */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-5 flex items-center space-x-2">
              <FileText size={16} className="text-slate-400" />
              <span>基本信息 (Basic Info)</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">员工名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="例如：语义理解专员"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">角色 (Role)</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SemanticAnalyst">SemanticAnalyst (语义分析)</option>
                    <option value="QA Engineer">QA Engineer (质量巡检)</option>
                    <option value="Business Analyst">Business Analyst (业务分析)</option>
                    <option value="Data Engineer">Data Engineer (数据工程)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">职责描述 (Description)</label>
                <textarea 
                  placeholder="描述该数字员工的主要工作内容和职责边界..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-5 flex items-center space-x-2">
              <Bot size={16} className="text-indigo-400" />
              <span>AI 模型与策略 (AI Configuration)</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase flex items-center space-x-1">
                    <Zap size={12} className="text-emerald-400" />
                    <span>大语言模型 (Model)</span>
                  </label>
                  <select 
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Gemini 3.1 Pro">Gemini 3.1 Pro (推荐，高精度)</option>
                    <option value="Gemini 3 Flash">Gemini 3 Flash (高性价比)</option>
                    <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase flex items-center space-x-1">
                    <ShieldCheck size={12} className="text-indigo-400" />
                    <span>执行策略 (Policy)</span>
                  </label>
                  <select 
                    value={formData.policy}
                    onChange={e => setFormData({...formData, policy: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pol_001">默认表理解策略 (v1.2.0)</option>
                    <option value="pol_002">严格主键验证策略 (v2.0.1)</option>
                    <option value="pol_003">敏感字段脱敏规则 (v1.0.5)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">提示词模板 (Prompt Template)</label>
                <select 
                  value={formData.promptTemplate}
                  onChange={e => setFormData({...formData, promptTemplate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="default_semantic_v2">基于企业数据字典 v2 的 Few-shot 模板</option>
                  <option value="qa_inspection_v1">数据质量巡检标准模板 v1</option>
                  <option value="lineage_trace_v1">血缘关系追溯模板 v1</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Coverage & Skills */}
        <div className="space-y-6">
          {/* Coverage */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-5 flex items-center space-x-2">
              <Database size={16} className="text-slate-400" />
              <span>覆盖范围 (Coverage)</span>
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">业务域 (Domains)</div>
                <div className="flex flex-wrap gap-2">
                  {['HR', 'Finance', 'Sales', 'Marketing', 'Core'].map(domain => (
                    <button
                      key={domain}
                      onClick={() => toggleArrayItem('domains', domain)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                        formData.domains.includes(domain) 
                          ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">数据源 (Datasources)</div>
                <div className="space-y-2">
                  {['MySQL (hr_db)', 'Hive (dw_core)', 'Snowflake (sales_mart)', 'PostgreSQL (crm)'].map(ds => (
                    <label key={ds} className="flex items-center space-x-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
                      <input 
                        type="checkbox" 
                        checked={formData.datasources.includes(ds)}
                        onChange={() => toggleArrayItem('datasources', ds)}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500/50" 
                      />
                      <span className="text-sm text-slate-300">{ds}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-5 flex items-center space-x-2">
              <Wrench size={16} className="text-slate-400" />
              <span>技能授权 (Skills)</span>
            </h3>
            <div className="space-y-2">
              {[
                { id: 'sql_parser', name: 'SQL Parser', desc: '解析 DDL/DML 提取表结构' },
                { id: 'meta_fetcher', name: 'Metadata Fetcher', desc: '获取数据字典和元数据' },
                { id: 'data_profiler', name: 'Data Profiler', desc: '数据探查与分布统计' },
                { id: 'lineage_api', name: 'Lineage API', desc: '查询上下游血缘关系' },
              ].map(skill => (
                <label key={skill.id} className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.skills.includes(skill.id)
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                )}>
                  <input 
                    type="checkbox" 
                    checked={formData.skills.includes(skill.id)}
                    onChange={() => toggleArrayItem('skills', skill.id)}
                    className="mt-1 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500/50" 
                  />
                  <div>
                    <div className={cn(
                      "text-sm font-medium",
                      formData.skills.includes(skill.id) ? "text-emerald-400" : "text-slate-200"
                    )}>
                      {skill.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{skill.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
