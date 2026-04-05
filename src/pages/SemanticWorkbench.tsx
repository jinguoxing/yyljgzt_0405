import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, Database, Table, Columns, 
  AlertTriangle, CheckCircle2, Shield, Network, 
  MoreHorizontal, Search, Plus, Code, FileJson,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SemanticApi } from '@/services/semanticApi';
import { motion } from 'motion/react';

export default function SemanticWorkbench() {
  const { lvId } = useParams();
  const [searchParams] = useSearchParams();
  const [lvData, setLvData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'semantics' | 'lineage' | 'definition'>('semantics');
  const [selectedField, setSelectedField] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching data
    SemanticApi.getLogicalView(lvId || 'lv_005').then(data => {
      setLvData(data);
      // Auto-select first field or focused field
      const focusId = searchParams.get('focus');
      if (focusId) {
        const field = data.fields.find((f: any) => f.id === focusId.replace('field:', ''));
        if (field) setSelectedField(field);
      } else if (data.fields.length > 0) {
        setSelectedField(data.fields[0]);
      }
    });
  }, [lvId, searchParams]);

  if (!lvData) return <div className="p-8 text-slate-400">加载工作台中...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Workbench Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Table size={16} className="text-indigo-400" />
              <h1 className="text-lg font-semibold text-slate-100">{lvData.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-400 uppercase tracking-wider">
                {lvData.status === 'DRAFT' ? '草稿' : lvData.status === 'PUBLISHED' ? '已发布' : lvData.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{lvData.description}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center -space-x-2 mr-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-xs text-white">OU</div>
            <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-300">+2</div>
          </div>
          <button 
            onClick={() => navigate(`/semantic/table-understanding/${lvData.id || lvId || 'lv_005'}`)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors border border-slate-700"
          >
            <BrainCircuit size={16} className="text-indigo-400" />
            <span>表理解</span>
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors">
            <Save size={16} />
            <span>保存</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Field List */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="搜索字段..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {lvData.fields.map((field: any) => (
              <div 
                key={field.id}
                onClick={() => setSelectedField(field)}
                className={cn(
                   "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm group transition-colors",
                  selectedField?.id === field.id 
                    ? "bg-indigo-900/20 text-indigo-300" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Columns size={14} className={cn(
                    field.status === 'WARNING' ? "text-yellow-500" : 
                    field.status === 'SENSITIVE' ? "text-red-400" : "text-slate-500"
                  )} />
                  <span className="truncate">{field.name}</span>
                </div>
                {field.status === 'WARNING' && <AlertTriangle size={12} className="text-yellow-500" />}
              </div>
            ))}
            <button className="w-full mt-2 flex items-center justify-center space-x-2 py-2 border border-dashed border-slate-700 rounded-md text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors text-xs">
              <Plus size={14} />
              <span>添加字段</span>
            </button>
          </div>
        </div>

        {/* Center: Canvas / Editor */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          {/* Tabs */}
          <div className="h-10 border-b border-slate-800 flex items-center px-4 space-x-6 bg-slate-900/20">
            {[
              { id: 'semantics', label: '语义定义', icon: Database },
              { id: 'definition', label: '计算逻辑', icon: Code },
              { id: 'lineage', label: '血缘关系', icon: Network },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 h-full text-sm font-medium border-b-2 transition-colors px-1",
                  activeTab === tab.id 
                    ? "border-indigo-500 text-indigo-400" 
                    : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'semantics' && selectedField && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                {/* Field Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-100">{selectedField.name}</h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {selectedField.dataType}
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded border uppercase tracking-wide",
                        selectedField.status === 'VERIFIED' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        selectedField.status === 'WARNING' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {selectedField.status === 'VERIFIED' ? '已验证' : selectedField.status === 'WARNING' ? '警告' : selectedField.status}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-800 rounded text-slate-400">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Semantic Config Form */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">业务描述</label>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 min-h-[100px]"
                      defaultValue={selectedField.description}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">语义类型</label>
                      <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500">
                        <option>{selectedField.semanticType}</option>
                        <option>标识符 (IDENTIFIER)</option>
                        <option>度量 (MEASURE)</option>
                        <option>维度 (DIMENSION)</option>
                        <option>时间 (TIME)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">安全等级</label>
                      <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500">
                        <option>内部 (Internal)</option>
                        <option>机密 (Confidential)</option>
                        <option>公开 (Public)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Validation Rules */}
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <h3 className="text-lg font-medium text-slate-200">数据质量规则</h3>
                  <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <span className="text-sm text-slate-300">非空检查 (Not Null)</span>
                      </div>
                      <div className="text-xs text-slate-500">系统默认</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <span className="text-sm text-slate-300">唯一性检查 (Unique)</span>
                      </div>
                      <div className="text-xs text-slate-500">系统默认</div>
                    </div>
                    <button className="w-full py-2 border border-dashed border-slate-700 rounded text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors text-sm">
                      + 添加自定义规则
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'definition' && (
              <div className="h-full flex flex-col">
                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 font-mono text-sm text-slate-300 flex-1">
                  <span className="text-indigo-400">SELECT</span><br/>
                  &nbsp;&nbsp;e.employee_id,<br/>
                  &nbsp;&nbsp;e.first_name,<br/>
                  &nbsp;&nbsp;e.last_name,<br/>
                  &nbsp;&nbsp;d.dept_code<br/>
                  <span className="text-indigo-400">FROM</span><br/>
                  &nbsp;&nbsp;hr_db.employees e<br/>
                  <span className="text-indigo-400">LEFT JOIN</span><br/>
                  &nbsp;&nbsp;hr_db.departments d <span className="text-indigo-400">ON</span> e.dept_id = d.id
                </div>
              </div>
            )}

            {activeTab === 'lineage' && (
              <div className="h-full flex items-center justify-center text-slate-500 flex-col space-y-4">
                <Network size={48} className="opacity-20" />
                <p>血缘关系图谱渲染区域</p>
                <div className="flex items-center space-x-8 text-sm">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">上游 (Upstream)</div>
                    <div className="font-mono text-slate-300">hr_db.employees</div>
                  </div>
                  <div className="h-px w-12 bg-slate-700"></div>
                  <div className="p-4 bg-indigo-900/20 border border-indigo-500/50 rounded-lg">
                    <div className="text-xs text-indigo-400 mb-1">当前 (Current)</div>
                    <div className="font-mono text-indigo-200 font-bold">{lvData.name}</div>
                  </div>
                  <div className="h-px w-12 bg-slate-700"></div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">下游 (Downstream)</div>
                    <div className="font-mono text-slate-300">rpt_headcount</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Context / Properties */}
        <div className="w-72 border-l border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">属性</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">负责人 (Owner)</label>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">DG</div>
                <span className="text-sm text-slate-300">{lvData.owner}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">领域 (Domain)</label>
              <div className="text-sm text-slate-300">{lvData.domain}</div>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">最近活动</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                  <div>
                    <span className="text-slate-300">User_01</span>
                    <span className="text-slate-500"> 更新了描述： </span>
                    <span className="text-slate-300 font-mono">salary_amt</span>
                    <div className="text-slate-600 mt-0.5">2 小时前</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5"></div>
                  <div>
                    <span className="text-slate-300">系统</span>
                    <span className="text-slate-500"> 检测到异常： </span>
                    <span className="text-slate-300 font-mono">dept_code</span>
                    <div className="text-slate-600 mt-0.5">5 小时前</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
