import React, { useState } from 'react';
import { 
  Database, Box, FileText, Shield, Activity, Zap, 
  ChevronRight, ChevronDown, Plus, Search, Filter, 
  MoreHorizontal, GitBranch, LayoutTemplate, Layers,
  ListTree, Link as LinkIcon, Edit3, Trash2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type OntologyType = 'Node' | 'Edge';
type TabType = '属性' | '关系' | '实例' | '规则';

interface OntologyClass {
  id: string;
  name: string;
  type: OntologyType;
  description: string;
  parent?: string;
  color: string;
  icon: React.ReactNode;
  properties: { name: string; type: string; required: boolean; desc: string }[];
}

export default function NetworkOntology() {
  const [activeType, setActiveType] = useState<OntologyType>('Node');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('属性');
  
  const [classes] = useState<OntologyClass[]>([
    {
      id: 'c1', name: '资产 (Asset)', type: 'Node', description: '物理或逻辑的数据资产，如数据库表、字段、API端点等。', color: 'bg-slate-500',
      icon: <Database size={16} />,
      properties: [
        { name: 'dataSource', type: 'String', required: true, desc: '数据源名称' },
        { name: 'schema', type: 'String', required: false, desc: '数据库Schema' },
        { name: 'rowCount', type: 'Integer', required: false, desc: '数据行数预估' },
      ]
    },
    {
      id: 'c2', name: '对象 (Object)', type: 'Node', description: '业务领域中的核心概念实体，如订单、客户、商品。', color: 'bg-indigo-500',
      icon: <Box size={16} />,
      properties: [
        { name: 'domain', type: 'String', required: true, desc: '所属业务域' },
        { name: 'lifecycle', type: 'Enum', required: false, desc: '生命周期状态' },
      ]
    },
    {
      id: 'c3', name: '标准 (Standard)', type: 'Node', description: '数据格式、命名规范或合规性要求。', color: 'bg-blue-500',
      icon: <FileText size={16} />,
      properties: [
        { name: 'version', type: 'String', required: true, desc: '标准版本号' },
        { name: 'authority', type: 'String', required: true, desc: '发布机构' },
      ]
    },
    {
      id: 'c4', name: '断言 (Assertion)', type: 'Node', description: '数据质量规则、映射逻辑或业务约束。', color: 'bg-amber-500',
      icon: <Shield size={16} />,
      properties: [
        { name: 'severity', type: 'Enum', required: true, desc: '严重程度 (High/Medium/Low)' },
        { name: 'expression', type: 'String', required: true, desc: '规则表达式' },
      ]
    },
    {
      id: 'c5', name: '运行 (Run)', type: 'Node', description: '执行实例，如数据同步任务、质量检查作业。', color: 'bg-emerald-500',
      icon: <Activity size={16} />,
      properties: [
        { name: 'schedule', type: 'String', required: true, desc: 'Cron 表达式' },
        { name: 'lastStatus', type: 'Enum', required: false, desc: '最后一次执行状态' },
      ]
    },
    {
      id: 'e1', name: '包含 (Contains)', type: 'Edge', description: '层级包含关系，如数据库包含表。', color: 'bg-slate-400',
      icon: <LinkIcon size={16} />,
      properties: []
    },
    {
      id: 'e2', name: '映射 (MapsTo)', type: 'Edge', description: '资产到对象或对象到对象的映射关系。', color: 'bg-indigo-400',
      icon: <LinkIcon size={16} />,
      properties: [
        { name: 'confidence', type: 'Float', required: true, desc: '映射置信度 (0-1)' },
      ]
    },
    {
      id: 'e3', name: '约束 (Constrains)', type: 'Edge', description: '断言或标准对资产/对象的约束。', color: 'bg-amber-400',
      icon: <LinkIcon size={16} />,
      properties: []
    }
  ]);

  const [selectedClassId, setSelectedClassId] = useState<string>('c2');
  
  const filteredClasses = classes.filter(c => 
    c.type === activeType && 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="h-full flex bg-slate-950 text-slate-200 overflow-hidden">
      {/* Left Sidebar: Ontology Tree */}
      <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ListTree size={20} className="mr-2 text-indigo-400" />
            本体管理 (Ontology)
          </h2>
          
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg mb-4">
            <button 
              onClick={() => setActiveType('Node')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeType === 'Node' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              节点类 (Nodes)
            </button>
            <button 
              onClick={() => setActiveType('Edge')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeType === 'Edge' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              关系类 (Edges)
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="搜索类名..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredClasses.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                selectedClassId === c.id 
                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-100' 
                  : 'border border-transparent text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-md ${c.color} bg-opacity-20 text-current`}>
                  {c.icon}
                </div>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
              <ChevronRight size={14} className={selectedClassId === c.id ? 'text-indigo-400' : 'text-slate-600'} />
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700">
            <Plus size={16} />
            <span>新建{activeType === 'Node' ? '节点类' : '关系类'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedClass ? (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl ${selectedClass.color} bg-opacity-20 flex items-center justify-center text-current border border-current`}>
                  {React.cloneElement(selectedClass.icon as React.ReactElement, { size: 24 })}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center">
                    {selectedClass.name}
                    <span className="ml-3 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      {selectedClass.type === 'Node' ? 'Node Class' : 'Edge Class'}
                    </span>
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">{selectedClass.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="编辑">
                  <Edit3 size={18} />
                </button>
                <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="删除">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mt-6">
              {(['属性', '关系', '实例', '规则'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {activeTab === '属性' && (
                <motion.div 
                  key="props"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">属性定义 (Properties)</h3>
                    <button className="flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300">
                      <Plus size={16} />
                      <span>添加属性</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800/50 text-slate-400">
                        <tr>
                          <th className="px-6 py-3 font-medium">属性名 (Name)</th>
                          <th className="px-6 py-3 font-medium">类型 (Type)</th>
                          <th className="px-6 py-3 font-medium">必填 (Required)</th>
                          <th className="px-6 py-3 font-medium">描述 (Description)</th>
                          <th className="px-6 py-3 font-medium text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {selectedClass.properties.length > 0 ? (
                          selectedClass.properties.map((prop, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4 font-mono text-indigo-300">{prop.name}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                                  {prop.type}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {prop.required ? (
                                  <span className="flex items-center text-emerald-400 text-xs"><CheckCircle2 size={14} className="mr-1"/> 是</span>
                                ) : (
                                  <span className="text-slate-500 text-xs">否</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-400">{prop.desc}</td>
                              <td className="px-6 py-4 text-right">
                                <button className="p-1 text-slate-500 hover:text-white transition-colors"><MoreHorizontal size={16} /></button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                              暂无自定义属性
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === '关系' && (
                <motion.div 
                  key="rels"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">允许的关系 (Allowed Relationships)</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-sm font-medium text-slate-400 mb-4">作为源节点 (Source)</h4>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mr-3">{selectedClass.name}</span>
                          <ArrowRight size={14} className="text-slate-500 mr-3" />
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 mr-3">映射 (MapsTo)</span>
                          <ArrowRight size={14} className="text-slate-500 mr-3" />
                          <span className="px-2 py-1 rounded bg-slate-500/20 text-slate-300 border border-slate-500/30">资产 (Asset)</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-sm font-medium text-slate-400 mb-4">作为目标节点 (Target)</h4>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 mr-3">断言 (Assertion)</span>
                          <ArrowRight size={14} className="text-slate-500 mr-3" />
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 mr-3">约束 (Constrains)</span>
                          <ArrowRight size={14} className="text-slate-500 mr-3" />
                          <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{selectedClass.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {(activeTab === '实例' || activeTab === '规则') && (
                <motion.div 
                  key="other"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-20 text-slate-500"
                >
                  <Layers size={48} className="mb-4 opacity-20" />
                  <p>该模块正在开发中...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-950">
          <ListTree size={48} className="mb-4 opacity-20" />
          <p>请在左侧选择一个本体类进行管理</p>
        </div>
      )}
    </div>
  );
}

// Helper for ArrowRight icon since it wasn't imported at top to avoid clutter
const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
