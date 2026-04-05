import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Network, CheckCircle2, AlertTriangle, 
  ArrowRight, Box, Layers, Database, Split, Merge, 
  MoreHorizontal, GripVertical, Plus, HelpCircle, X, Check,
  BrainCircuit, Sparkles, GitBranch, ShieldCheck,
  ChevronRight, Table, FileText, Trash2, RefreshCw,
  ArrowLeft, Settings, Info, ExternalLink, Eye, List,
  Link2, Share2, GitCommit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SemanticApi } from '@/services/semanticApi';
import { motion, AnimatePresence } from 'motion/react';

export default function SemanticObjects() {
  const { lvId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [objects, setObjects] = useState<any[]>([]);
  const [unassignedFields, setUnassignedFields] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'object' | 'table'>('object');
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  
  // Modal States
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configuringAttribute, setConfiguringAttribute] = useState<any>(null);
  const [splitStrategy, setSplitStrategy] = useState<'sensitivity' | 'frequency'>('sensitivity');

  useEffect(() => {
    SemanticApi.getBusinessObjects(lvId || 'lv_005').then(res => {
      setData(res);
      setObjects(res.objects);
      setUnassignedFields(res.unassignedFields);
      if (res.objects.length > 0) setSelectedObject(res.objects[0]);
    });
  }, [lvId]);

  const handleAssignField = (field: any, targetType: string = 'ATTRIBUTE') => {
    if (!selectedObject) return;

    // Remove from unassigned
    setUnassignedFields(prev => prev.filter(f => f.id !== field.id));

    // Add to selected object as a new attribute
    const newAttribute = {
      id: `attr_${Date.now()}`,
      name: field.name, // Default to field name
      type: targetType, // Use target type
      mappedField: field.name,
      evidence: '人工拖拽分配',
      status: 'CONFIRMED',
      qualityRules: []
    };

    const updatedObject = {
      ...selectedObject,
      attributes: [...selectedObject.attributes, newAttribute],
      fieldCount: selectedObject.fieldCount + 1
    };

    // Update objects list
    setObjects(prev => prev.map(obj => obj.id === selectedObject.id ? updatedObject : obj));
    setSelectedObject(updatedObject);
  };

  const handleMoveField = (field: any, targetType: string) => {
    if (!selectedObject) return;

    // If type is same, do nothing (or implement reordering later)
    if (field.type === targetType) return;

    const updatedAttributes = selectedObject.attributes.map((attr: any) => 
      attr.id === field.id ? { ...attr, type: targetType } : attr
    );

    const updatedObject = {
      ...selectedObject,
      attributes: updatedAttributes
    };

    setObjects(prev => prev.map(obj => obj.id === selectedObject.id ? updatedObject : obj));
    setSelectedObject(updatedObject);
  };

  const handleSplitObject = () => {
    if (!selectedObject) return;
    
    const attrs = [...selectedObject.attributes];
    let moveAttrs = [];
    let keepAttrs = [];

    if (splitStrategy === 'sensitivity') {
      const sensitiveNames = ['annual_salary', 'ssn_number', 'bonus_amt', 'tax_bracket', 'salary', 'ssn', 'sensitive'];
      moveAttrs = attrs.filter(a => sensitiveNames.some(n => a.name.toLowerCase().includes(n)));
      keepAttrs = attrs.filter(a => !sensitiveNames.some(n => a.name.toLowerCase().includes(n)));
    } else {
      const detailNames = ['biography_text', 'previous_employment', 'education_history', 'notes', 'description', 'detail'];
      moveAttrs = attrs.filter(a => detailNames.some(n => a.name.toLowerCase().includes(n)));
      keepAttrs = attrs.filter(a => !detailNames.some(n => a.name.toLowerCase().includes(n)));
    }

    // Fallback if no fields matched the mock criteria
    if (moveAttrs.length === 0) {
      const splitPoint = Math.floor(attrs.length / 2);
      keepAttrs = attrs.slice(0, splitPoint);
      moveAttrs = attrs.slice(splitPoint);
    }

    const updatedOriginal = {
      ...selectedObject,
      attributes: keepAttrs,
      fieldCount: keepAttrs.length
    };

    const newObject = {
      id: `bo_${Date.now()}`,
      name: splitStrategy === 'sensitivity' ? `${selectedObject.name}_Sensitive` : `${selectedObject.name}_Detail`,
      type: selectedObject.type,
      description: splitStrategy === 'sensitivity' 
        ? `Split from ${selectedObject.name} based on sensitivity analysis`
        : `Split from ${selectedObject.name} based on access frequency`,
      fieldCount: moveAttrs.length,
      attributes: moveAttrs
    };

    setObjects(prev => prev.map(obj => obj.id === selectedObject.id ? updatedOriginal : obj).concat(newObject));
    setSelectedObject(updatedOriginal);
    setIsSplitModalOpen(false);
  };

  const handleUnassignField = (attribute: any) => {
    if (!selectedObject) return;

    // Remove from selected object
    const updatedAttributes = selectedObject.attributes.filter((attr: any) => attr.id !== attribute.id);
    const updatedObject = {
      ...selectedObject,
      attributes: updatedAttributes,
      fieldCount: selectedObject.fieldCount - 1
    };

    // Add back to unassigned fields
    const newField = {
      id: attribute.id,
      name: attribute.mappedField || attribute.name,
      dataType: 'STRING',
      reason: '人工移除归属',
      group: 'UNASSIGNED'
    };

    setUnassignedFields(prev => [...prev, newField]);
    setObjects(prev => prev.map(obj => obj.id === selectedObject.id ? updatedObject : obj));
    setSelectedObject(updatedObject);
  };

  const handleIgnoreField = (field: any) => {
    setUnassignedFields(prev => prev.map(f => 
      f.id === field.id ? { ...f, group: 'IGNORED' } : f
    ));
  };

  const handleRestoreField = (field: any) => {
    setUnassignedFields(prev => prev.map(f => 
      f.id === field.id ? { ...f, group: 'UNASSIGNED' } : f
    ));
  };

  const handleMergeObject = (targetObj: any) => {
    if (!selectedObject) return;

    // Filter out duplicates based on mappedField
    const existingMappedFields = new Set(selectedObject.attributes.map((a: any) => a.mappedField));
    const newAttrs = targetObj.attributes.filter((a: any) => !existingMappedFields.has(a.mappedField));

    const mergedAttrs = [...selectedObject.attributes, ...newAttrs];
    const updatedOriginal = {
      ...selectedObject,
      attributes: mergedAttrs,
      fieldCount: mergedAttrs.length,
      description: `Merged with ${targetObj.name}`
    };

    // Remove target object and update selected
    setObjects(prev => prev.filter(o => o.id !== targetObj.id).map(o => o.id === selectedObject.id ? updatedOriginal : o));
    setSelectedObject(updatedOriginal);
    setIsMergeModalOpen(false);
  };

  const handleUpdateAttribute = (updatedAttr: any) => {
    if (!selectedObject) return;
    const updatedAttributes = selectedObject.attributes.map((attr: any) => 
      attr.id === updatedAttr.id ? updatedAttr : attr
    );
    const updatedObject = { ...selectedObject, attributes: updatedAttributes };
    setObjects(prev => prev.map(obj => obj.id === selectedObject.id ? updatedObject : obj));
    setSelectedObject(updatedObject);
    setIsConfigModalOpen(false);
  };

  const handleAutoOptimize = () => {
    if (!selectedObject) return;
    
    // Move all UNASSIGNED fields to the selected object as ATTRIBUTE
    const fieldsToMove = unassignedFields.filter(f => f.group === 'UNASSIGNED');
    if (fieldsToMove.length === 0) return;

    const newAttributes = fieldsToMove.map(f => ({
      id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: f.name,
      type: 'ATTRIBUTE',
      mappedField: f.name,
      evidence: 'AI 自动优化分配',
      status: 'SUGGESTED',
      qualityRules: []
    }));

    const updatedObject = {
      ...selectedObject,
      attributes: [...selectedObject.attributes, ...newAttributes],
      fieldCount: selectedObject.fieldCount + newAttributes.length
    };

    setObjects(prev => prev.map(obj => obj.id === selectedObject.id ? updatedObject : obj));
    setSelectedObject(updatedObject);
    setUnassignedFields(prev => prev.filter(f => f.group !== 'UNASSIGNED'));
  };

  const handlePublish = () => {
    navigate('/semantic/releases');
  };

  if (!data) return <div className="p-8 text-slate-400">正在加载对象...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative font-sans text-slate-200">
      {/* HeaderBar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="h-6 w-px bg-slate-800 mx-2" />
          <h1 className="text-sm font-semibold flex items-center space-x-2">
            <span>对象候选生成</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 font-mono">推理大模型 (Reasoning LLM)</span>
          </h1>
        </div>

        {/* Steps */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-[11px] text-green-500 font-medium">
            <CheckCircle2 size={12} />
            <span>字段裁决</span>
          </div>
          <ChevronRight size={12} className="text-slate-700" />
          <div className="flex items-center space-x-1.5 text-[11px] text-green-500 font-medium">
            <CheckCircle2 size={12} />
            <span>表理解</span>
          </div>
          <ChevronRight size={12} className="text-slate-700" />
          <div className="flex items-center space-x-1.5 text-[11px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
            <BrainCircuit size={12} />
            <span>对象生成</span>
          </div>
          <ChevronRight size={12} className="text-slate-700" />
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <div className="w-3 h-3 rounded-full border border-slate-600 flex items-center justify-center text-[8px]">4</div>
            <span>人工确认</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Sparkles size={14} className="text-yellow-500" />
            <span className="text-[11px] text-yellow-200/80">检测到混合语义，建议拆分 1 个对象</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleAutoOptimize} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors">一键优化</button>
            <button onClick={handlePublish} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-lg shadow-indigo-900/20 transition-colors">推进到可发布</button>
          </div>
        </div>
      </header>

      {/* TableContextBar */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 space-x-8 shrink-0">
        <div className="flex items-center space-x-2">
          <Table size={14} className="text-slate-500" />
          <span className="text-[11px] text-slate-500 uppercase tracking-wider">来源表:</span>
          <span className="text-xs font-mono text-indigo-300">{data.tableContext?.sourceTable || 't_customer_profile'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Layers size={14} className="text-slate-500" />
          <span className="text-[11px] text-slate-500 uppercase tracking-wider">业务域:</span>
          <span className="text-xs text-slate-300">{data.tableContext?.businessDomain || '客户中心'}</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center space-x-6 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">字段总数:</span>
            <span className="font-bold text-slate-300">{data.tableContext?.totalFields || 24}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">生成对象:</span>
            <span className="font-bold text-slate-300">{objects.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">对象覆盖率:</span>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${(data.tableContext?.objectCoverage || 0.875) * 100}%` }} />
            </div>
            <span className="font-bold text-green-400">{(data.tableContext?.objectCoverage || 0.875) * 100}%</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">未归属属性:</span>
            <span className="font-bold text-slate-300">{unassignedFields.filter(f => f.group === 'UNASSIGNED').length}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">冲突属性:</span>
            <span className="font-bold text-red-400">{unassignedFields.filter(f => f.group === 'CONFLICT').length}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">已忽略:</span>
            <span className="font-bold text-slate-400">{unassignedFields.filter(f => f.group === 'IGNORED').length}</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* View Mode Switcher - Moved here */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 shadow-sm mr-2">
          <button
            onClick={() => setActiveView('object')}
            className={cn(
              "px-3 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1.5 transition-all",
              activeView === 'object' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Layout size={12} />
            <span>对象视图</span>
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={cn(
              "px-3 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1.5 transition-all",
              activeView === 'table' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Table size={12} />
            <span>表视图</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        {activeView === 'object' ? (
          <StructureView 
            data={data}
            objects={objects}
            unassignedFields={unassignedFields}
            selectedObject={selectedObject} 
            onSelectObject={setSelectedObject}
            onAssignField={handleAssignField}
            onMoveField={handleMoveField}
            onUnassignField={handleUnassignField}
            onConfigAttribute={(attr: any) => { setConfiguringAttribute(attr); setIsConfigModalOpen(true); }}
            onSplit={() => setIsSplitModalOpen(true)}
            onMerge={() => setIsMergeModalOpen(true)}
            activeView={activeView}
            setActiveView={setActiveView}
            onOpenRelationship={() => setIsRelationshipOpen(true)}
          />
        ) : (
          <TableView 
            data={data} 
            objects={objects}
            unassignedFields={unassignedFields}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        )}
      </main>

      {/* RelationshipDrawer */}
      <RelationshipDrawer 
        isOpen={isRelationshipOpen} 
        onClose={() => setIsRelationshipOpen(false)} 
        data={data} 
      />

      {/* Split Modal */}
      <AnimatePresence>
        {isSplitModalOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl w-[600px] shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="text-indigo-400" size={20} />
                  <h3 className="text-lg font-semibold text-slate-200">AI 对象拆分建议</h3>
                </div>
                <button onClick={() => setIsSplitModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Strategy Selector */}
                <div className="flex space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setSplitStrategy('sensitivity')}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all flex items-center justify-center space-x-2",
                      splitStrategy === 'sensitivity' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <AlertTriangle size={12} />
                    <span>按敏感度拆分 (推荐)</span>
                  </button>
                  <button
                    onClick={() => setSplitStrategy('frequency')}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all flex items-center justify-center space-x-2",
                      splitStrategy === 'frequency' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <Network size={12} />
                    <span>按访问频率拆分</span>
                  </button>
                </div>

                <div className="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="text-yellow-400 mt-1 shrink-0" size={18} />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-300">
                        {splitStrategy === 'sensitivity' ? '推理解释：高内聚 / 低耦合' : '推理解释：访问模式分析'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {splitStrategy === 'sensitivity' ? (
                          <>
                            Reasoning LLM 分析发现该对象包含两组语义簇：
                            <br/>1. 核心身份信息 (Core Identity) - 高频访问
                            <br/>2. 敏感薪资信息 (Sensitive Compensation) - 低频且需权限控制
                            <br/>建议拆分为 <span className="font-mono text-indigo-300">Employee</span> 和 <span className="font-mono text-indigo-300">Employee_Sensitive</span> 以优化安全性和模型清晰度。
                          </>
                        ) : (
                          <>
                            Query Log 分析显示：
                            <br/>1. 基础信息 (Name, Dept) 在 90% 的查询中出现。
                            <br/>2. 详细档案 (Bio, History) 仅在 5% 的查询中出现。
                            <br/>建议拆分为 <span className="font-mono text-indigo-300">Employee_Core</span> 和 <span className="font-mono text-indigo-300">Employee_Detail</span> 以提升查询性能。
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <div className="border border-slate-700 rounded-lg bg-slate-950/50 p-3 h-48 flex flex-col">
                    <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">当前对象 (保留)</div>
                    <div className="font-medium text-slate-200 mb-2">{selectedObject?.name}</div>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                      <div className="text-xs text-slate-400 flex items-center"><Check size={10} className="mr-1 text-green-500"/> employee_id (员工ID)</div>
                      <div className="text-xs text-slate-400 flex items-center"><Check size={10} className="mr-1 text-green-500"/> full_name (姓名)</div>
                      <div className="text-xs text-slate-400 flex items-center"><Check size={10} className="mr-1 text-green-500"/> hire_date (入职日期)</div>
                      <div className="text-xs text-slate-400 flex items-center"><Check size={10} className="mr-1 text-green-500"/> dept_code (部门代码)</div>
                      <div className="text-xs text-slate-500 italic pl-4">还有 3 个...</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-slate-500 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider">迁移</span>
                    <ArrowRight size={20} />
                  </div>

                  <div className="border border-indigo-500/30 rounded-lg bg-indigo-950/10 p-3 h-48 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-indigo-500/20 rounded-bl-lg">
                      <Sparkles size={12} className="text-indigo-400" />
                    </div>
                    <div className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">新对象 (建议)</div>
                    <div className="font-medium text-indigo-200 mb-2">
                      {splitStrategy === 'sensitivity' ? `${selectedObject?.name}_敏感信息` : `${selectedObject?.name}_详情`}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                      {splitStrategy === 'sensitivity' ? (
                        <>
                          <div className="text-xs text-indigo-300/80 flex items-center"><Database size={10} className="mr-1"/> annual_salary (年薪)</div>
                          <div className="text-xs text-indigo-300/80 flex items-center"><Database size={10} className="mr-1"/> ssn_number (社保号)</div>
                          <div className="text-xs text-indigo-300/80 flex items-center"><Database size={10} className="mr-1"/> bonus_amt (奖金)</div>
                          <div className="text-xs text-indigo-300/80 flex items-center"><Database size={10} className="mr-1"/> tax_bracket (税率)</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-indigo-300/80 flex items-center"><Database size={10} className="mr-1"/> biography_text (简历)</div>
                          <div className="text-xs text-indigo-300/80 flex items-center"><Database size={10} className="mr-1"/> previous_employment (工作经历)</div>
                          <div className="text-xs text-indigo-300/80 flex items-center"><Database size={10} className="mr-1"/> education_history (教育背景)</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-800 flex justify-end space-x-3 bg-slate-900/50">
                <button onClick={() => setIsSplitModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">取消</button>
                <button onClick={handleSplitObject} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20 flex items-center space-x-2">
                  <Split size={16} />
                  <span>确认拆分</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* Merge Modal */}
       <AnimatePresence>
        {isMergeModalOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl w-[500px] shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center space-x-2">
                  <GitBranch className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold text-slate-200">AI 对象合并建议</h3>
                </div>
                <button onClick={() => setIsMergeModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-blue-950/30 border border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="text-blue-400 mt-1 shrink-0" size={18} />
                    <div>
                      <h4 className="text-sm font-medium text-blue-300">推理解释：语义重叠</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        检测到 <span className="font-mono text-slate-200">{selectedObject?.name}</span> 与以下对象存在高度主键重叠 (95%) 且业务语义相似。建议合并以减少冗余。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">可合并候选对象</p>
                  {objects.filter(o => o.id !== selectedObject?.id).map(obj => (
                    <button 
                      key={obj.id} 
                      onClick={() => handleMergeObject(obj)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500 hover:bg-blue-900/10 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <Box size={16} className="text-slate-500 group-hover:text-blue-400" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-300 group-hover:text-blue-200">{obj.name}</div>
                          <div className="text-[10px] text-slate-500">{obj.fieldCount} 字段 • {obj.type === 'PRIMARY' ? '主对象' : obj.type === 'REFERENCE' ? '引用对象' : obj.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-blue-400 font-mono">95% 匹配度</span>
                        <Merge size={16} className="text-blue-500" />
                      </div>
                    </button>
                  ))}
                  {objects.filter(o => o.id !== selectedObject?.id).length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm italic">
                      暂无合适的合并候选对象
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attribute Config Modal */}
      <AnimatePresence>
        {isConfigModalOpen && configuringAttribute && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl w-[500px] shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center space-x-2">
                  <Settings className="text-indigo-400" size={20} />
                  <h3 className="text-lg font-semibold text-slate-200">属性配置</h3>
                </div>
                <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">属性名称</label>
                  <input 
                    type="text" 
                    defaultValue={configuringAttribute.name}
                    onChange={(e) => setConfiguringAttribute({ ...configuringAttribute, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">语义类型</label>
                    <select 
                      defaultValue={configuringAttribute.type}
                      onChange={(e) => setConfiguringAttribute({ ...configuringAttribute, type: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                      <option value="ID">主标识 (ID)</option>
                      <option value="ATTRIBUTE">业务属性 (Attribute)</option>
                      <option value="DIMENSION">维度 (Dimension)</option>
                      <option value="MEASURE">度量 (Measure)</option>
                      <option value="AUDIT">审计属性 (Audit)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">物理映射</label>
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-500 font-mono">
                      {configuringAttribute.mappedField}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">质量规则 ({configuringAttribute.qualityRules?.length || 0})</label>
                    <button 
                      onClick={() => {
                        const rule = prompt('请输入质量规则 (例如: NOT_NULL, UNIQUE, > 0):');
                        if (rule && rule.trim()) {
                          setConfiguringAttribute({
                            ...configuringAttribute,
                            qualityRules: [...(configuringAttribute.qualityRules || []), rule.trim()]
                          });
                        }
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>添加规则</span>
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {configuringAttribute.qualityRules?.map((rule: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg group">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck size={14} className="text-green-500" />
                          <span className="text-xs text-slate-300">{rule}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const newRules = [...(configuringAttribute.qualityRules || [])];
                            newRules.splice(idx, 1);
                            setConfiguringAttribute({
                              ...configuringAttribute,
                              qualityRules: newRules
                            });
                          }}
                          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {(!configuringAttribute.qualityRules || configuringAttribute.qualityRules.length === 0) && (
                      <div className="text-center py-4 border border-dashed border-slate-800 rounded-lg text-[11px] text-slate-600 italic">
                        暂无质量规则
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-800 flex justify-end space-x-3 bg-slate-900/50">
                <button onClick={() => setIsConfigModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">取消</button>
                <button 
                  onClick={() => handleUpdateAttribute(configuringAttribute)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20"
                >
                  保存配置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StructureView({ 
  data,
  objects, 
  unassignedFields, 
  selectedObject, 
  onSelectObject, 
  onAssignField, 
  onMoveField, 
  onUnassignField,
  onIgnoreField,
  onRestoreField,
  onConfigAttribute,
  onSplit, 
  onMerge,
  activeView,
  setActiveView,
  onOpenRelationship
}: any) {
  const [draggedField, setDraggedField] = useState<any>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [isDraggingToPool, setIsDraggingToPool] = useState(false);

  const handleDragStart = (e: React.DragEvent, field: any, source: 'POOL' | 'STRUCTURE') => {
    setDraggedField({ ...field, source });
    e.dataTransfer.effectAllowed = 'move';
    // Create a ghost image or just let default happen
  };

  const handleDragOver = (e: React.DragEvent, groupType: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGroup(groupType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, groupType: string) => {
    e.preventDefault();
    setDragOverGroup(null);
    if (draggedField) {
      if (draggedField.source === 'POOL') {
        onAssignField(draggedField, groupType);
      } else if (draggedField.source === 'STRUCTURE') {
        onMoveField(draggedField, groupType);
      }
      setDraggedField(null);
    }
  };

  const handlePoolDragOver = (e: React.DragEvent) => {
    if (draggedField?.source === 'STRUCTURE') {
      e.preventDefault();
      setIsDraggingToPool(true);
    }
  };

  const handlePoolDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingToPool(false);
    if (draggedField?.source === 'STRUCTURE') {
      onUnassignField(draggedField);
      setDraggedField(null);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* 1. Object List Panel */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">生成对象 ({objects.length})</h3>
          <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {objects.map((obj: any) => {
            const hasRelationships = data?.relationships?.some((r: any) => r.source === obj.name || r.target === obj.name);
            return (
              <div
                key={obj.id}
                onClick={() => onSelectObject(obj)}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all group relative",
                  selectedObject?.id === obj.id
                    ? "bg-indigo-900/20 border-indigo-500/50 shadow-sm"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 truncate">
                    <Box size={14} className={cn(
                      "shrink-0",
                      obj.type === 'PRIMARY' ? "text-indigo-400" : 
                      obj.type === 'REFERENCE' ? "text-blue-400" : 
                      obj.type === 'LOG' ? "text-amber-400" : "text-slate-500"
                    )} />
                    <span className={cn(
                      "text-sm font-semibold truncate",
                      selectedObject?.id === obj.id ? "text-indigo-200" : "text-slate-300"
                    )}>{obj.name}</span>
                    {obj.type === 'PRIMARY' && (
                      <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 rounded border border-indigo-500/30">PRIMARY</span>
                    )}
                    {obj.type === 'REFERENCE' && (
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded border border-blue-500/30">REF</span>
                    )}
                  </div>
                  {hasRelationships && (
                    <Network size={12} className="text-indigo-500/60 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <Table size={10} />
                    <span className="truncate max-w-[100px]">{obj.description.split(' ').pop()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500">{obj.fieldCount} 属性</span>
                    <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: obj.type === 'PRIMARY' ? '92%' : '75%' }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onOpenRelationship}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center space-x-2 transition-colors"
          >
            <Network size={14} />
            <span>查看对象关系</span>
          </button>
        </div>
      </div>

      {/* 2. Object Structure Panel (Core) */}
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0 border-r border-slate-800 relative">
        {selectedObject ? (
          <>
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/20 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <Box size={20} className="text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-100">{selectedObject.name}</h2>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                      {selectedObject.type === 'PRIMARY' ? '主对象' : selectedObject.type === 'REFERENCE' ? '引用对象' : selectedObject.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <span>来源:</span>
                    <span className="font-mono text-indigo-400/70">{data?.tableContext?.sourceTable || 't_employee_profile'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mr-32">
                <button 
                  onClick={onSplit}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Split size={14} />
                  <span>拆分</span>
                </button>
                <button 
                  onClick={onMerge}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Merge size={14} />
                  <span>合并</span>
                </button>
                <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-950/50">
              <div className="max-w-4xl mx-auto space-y-10">
                
                {/* AI Insight Banner */}
                {selectedObject.fieldCount > 10 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-5 flex items-start justify-between shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BrainCircuit size={64} />
                    </div>
                    <div className="flex items-start space-x-4 relative z-10">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Sparkles className="text-indigo-400" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-indigo-300">AI 建议：检测到混合语义，建议拆分</h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xl">
                          推理大模型 (Reasoning LLM) 分析发现该对象包含 <span className="text-indigo-200 font-medium">核心身份信息</span> 和 <span className="text-indigo-200 font-medium">敏感薪资</span> 两类语义簇。
                          拆分后可提升数据安全管控粒度，并降低下游模型理解风险。
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={onSplit}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-lg shadow-indigo-900/40 relative z-10"
                    >
                      一键拆分建议
                    </button>
                  </motion.div>
                )}

                {/* Attribute Sections */}
                {[
                  { id: 'ID', label: '主标识 (Identifiers)', color: 'bg-indigo-500' },
                  { id: 'ATTRIBUTE', label: '业务属性 (Attributes)', color: 'bg-slate-500' },
                  { id: 'DIMENSION', label: '维度 (Dimensions)', color: 'bg-blue-500' },
                  { id: 'MEASURE', label: '度量 (Measures)', color: 'bg-emerald-500' },
                  { id: 'AUDIT', label: '审计属性 (Audit)', color: 'bg-amber-500' },
                  { id: 'CONFLICT', label: '冲突属性 (Conflicts)', color: 'bg-red-500' }
                ].map(section => {
                  const attrs = selectedObject.attributes.filter((a: any) => a.type === section.id);
                  const isOver = dragOverGroup === section.id;
                  const isDragging = !!draggedField;
                  
                  // Only hide CONFLICT if empty AND not dragging
                  if (attrs.length === 0 && section.id === 'CONFLICT' && !isDragging) return null;

                  return (
                    <div 
                      key={section.id} 
                      className={cn(
                        "space-y-4 p-4 rounded-2xl border-2 border-transparent transition-all",
                        isOver ? "border-indigo-500/50 bg-indigo-900/10" : "hover:bg-slate-900/20",
                        isDragging && !isOver && "border-dashed border-slate-800/50"
                      )}
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em] flex items-center space-x-2 select-none">
                          <div className={cn("w-2 h-2 rounded-full shadow-sm", section.color)} />
                          <span>{section.label}</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400 font-mono ml-2">{attrs.length}</span>
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 min-h-[40px]">
                        {attrs.map((attr: any) => (
                          <div 
                            key={attr.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, attr, 'STRUCTURE')}
                            onDragEnd={() => setDraggedField(null)}
                            className={cn(
                              "group flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-3 hover:border-indigo-500/40 hover:bg-slate-900 transition-all cursor-grab active:cursor-grabbing shadow-sm",
                              draggedField?.id === attr.id && "opacity-40 grayscale"
                            )}
                          >
                            <div className="mr-3 text-slate-700 group-hover:text-slate-500 transition-colors">
                              <GripVertical size={14} />
                            </div>
                            
                            <div className="flex-1 grid grid-cols-[1.5fr,auto,1fr,auto] items-center gap-4">
                              {/* Attribute Name */}
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-200 truncate" title={attr.name}>{attr.name}</div>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">{attr.type}</span>
                                  {attr.qualityRules?.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <ShieldCheck size={10} className="text-slate-600" />
                                      <span className="text-[9px] text-slate-600">{attr.qualityRules.length} 规则</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <ArrowRight size={12} className="text-slate-700" />

                              {/* Physical Field */}
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <Database size={12} className="text-slate-600 shrink-0" />
                                  <span className="text-xs font-mono text-indigo-300/80 truncate" title={attr.mappedField}>{attr.mappedField}</span>
                                </div>
                                <div className="text-[9px] text-slate-600 mt-0.5 flex items-center space-x-1">
                                  <Info size={8} />
                                  <span>证据: {attr.evidence}</span>
                                </div>
                              </div>

                              {/* Status & Actions */}
                              <div className="flex items-center space-x-3">
                                <div className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center space-x-1",
                                  attr.status === 'CONFIRMED' 
                                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                )}>
                                  {attr.status === 'CONFIRMED' ? <Check size={8} /> : <RefreshCw size={8} />}
                                  <span>{attr.status === 'CONFIRMED' ? '已确认' : '建议'}</span>
                                </div>
                                <button 
                                  onClick={() => onConfigAttribute(attr)}
                                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Settings size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {attrs.length === 0 && (
                          <div className="h-16 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-600 italic bg-slate-900/20">
                            拖拽属性到此处添加
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
              <Box size={40} className="text-slate-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-400">选择左侧对象以查看详细结构</p>
              <p className="text-xs text-slate-600 mt-1">您可以查看 AI 自动生成的对象候选并进行调整</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Attribute Pool Panel */}
      <div 
        className={cn(
          "w-80 border-l border-slate-800 bg-slate-900/30 flex flex-col shrink-0 transition-all",
          isDraggingToPool ? "bg-indigo-900/20 border-l-indigo-500/50" : ""
        )}
        onDragOver={handlePoolDragOver}
        onDragLeave={() => setIsDraggingToPool(false)}
        onDrop={handlePoolDrop}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <HelpCircle size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">属性池 (Attribute Pool)</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
            {unassignedFields.length}
          </span>
        </div>
        
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isDraggingToPool && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-32 border-2 border-dashed border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center text-indigo-400 bg-indigo-500/5"
            >
              <Trash2 size={24} className="mb-2" />
              <span className="text-xs font-bold">释放以移除归属</span>
            </motion.div>
          )}
          {/* Unassigned Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-between">
              <span>未归属属性</span>
              <span className="text-slate-700">{unassignedFields.filter(f => f.group === 'UNASSIGNED').length}</span>
            </h4>
            {unassignedFields.filter(f => f.group === 'UNASSIGNED').map((f: any) => (
              <AttributeCard key={f.id} field={f} onDragStart={handleDragStart} onAssign={onAssignField} onIgnore={onIgnoreField} />
            ))}
          </div>

          {/* Conflict Section */}
          {unassignedFields.some(f => f.group === 'CONFLICT') && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest flex items-center justify-between">
                <span>冲突归属</span>
                <span className="text-red-900/50">{unassignedFields.filter(f => f.group === 'CONFLICT').length}</span>
              </h4>
              {unassignedFields.filter(f => f.group === 'CONFLICT').map((f: any) => (
                <AttributeCard key={f.id} field={f} onDragStart={handleDragStart} onAssign={onAssignField} onIgnore={onIgnoreField} isConflict />
              ))}
            </div>
          )}

          {/* Technical Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-between">
              <span>技术字段 (建议忽略)</span>
              <span className="text-slate-700">{unassignedFields.filter(f => f.group === 'TECHNICAL').length}</span>
            </h4>
            {unassignedFields.filter(f => f.group === 'TECHNICAL').map((f: any) => (
              <AttributeCard key={f.id} field={f} onDragStart={handleDragStart} onAssign={onAssignField} onIgnore={onIgnoreField} isTechnical />
            ))}
          </div>

          {/* Ignored Section */}
          {unassignedFields.some(f => f.group === 'IGNORED') && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-between">
                <span>已忽略</span>
                <span className="text-slate-700">{unassignedFields.filter(f => f.group === 'IGNORED').length}</span>
              </h4>
              {unassignedFields.filter(f => f.group === 'IGNORED').map((f: any) => (
                <AttributeCard key={f.id} field={f} onDragStart={handleDragStart} onAssign={onAssignField} onRestore={onRestoreField} isIgnored />
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-indigo-950/20 border-t border-slate-800">
          <div className="flex items-start space-x-3">
            <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              拖拽属性到中间区域的相应分组以完成分配。系统会自动计算覆盖率并更新 GateMetrics。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttributeCard({ field, onDragStart, onAssign, onIgnore, onRestore, isConflict, isTechnical, isIgnored }: any) {
  return (
    <div 
      draggable={!isIgnored}
      onDragStart={(e) => !isIgnored && onDragStart(e, field, 'POOL')}
      className={cn(
        "group bg-slate-900 border border-slate-800 rounded-xl p-3 transition-all relative overflow-hidden",
        !isIgnored && "cursor-grab active:cursor-grabbing hover:border-indigo-500/50 hover:shadow-lg",
        isConflict && "border-red-500/20 bg-red-500/5",
        isTechnical && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100",
        isIgnored && "opacity-40 grayscale"
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 bg-slate-800 transition-colors",
        !isIgnored && "group-hover:bg-indigo-500",
        isConflict && "bg-red-500",
        isTechnical && "bg-slate-700",
        isIgnored && "bg-slate-800"
      )}></div>
      <div className="flex justify-between items-start pl-2">
        <div className="min-w-0 flex-1">
          <div className={cn("text-xs font-bold font-mono mb-1 truncate", isIgnored ? "text-slate-500 line-through" : "text-slate-200")}>{field.name}</div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-slate-500 font-mono uppercase">{field.dataType}</span>
            <div className="flex items-center space-x-1 text-[9px] text-slate-500 truncate">
              {isConflict ? <AlertTriangle size={10} className="text-red-500" /> : <Database size={10} className="text-slate-600" />}
              <span className="truncate">{field.reason}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isIgnored ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onRestore(field); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors"
              title="恢复"
            >
              <RefreshCw size={14} />
            </button>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onIgnore(field); }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                title="忽略"
              >
                <X size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onAssign(field, 'ATTRIBUTE'); }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors"
                title="添加"
              >
                <Plus size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TableView({ objects, unassignedFields, data, activeView, setActiveView }: any) {
  // Compute rows dynamically from objects and unassignedFields
  const mappedRows = objects.flatMap((obj: any) => 
    obj.attributes.map((attr: any) => ({
      field: attr.mappedField,
      attribute: attr.name,
      object: obj.name,
      confidence: attr.status === 'CONFIRMED' ? '100%' : '90%',
      type: obj.type,
      isUnassigned: false
    }))
  );

  const unassignedRows = unassignedFields.map((field: any) => ({
    field: field.name,
    attribute: '-',
    object: '未归属 (Unassigned)',
    confidence: '-',
    type: 'NONE',
    isUnassigned: true
  }));

  const allRows = [...mappedRows, ...unassignedRows];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative">
      <div className="h-14 border-b border-slate-800 flex items-center px-6 bg-slate-900/20 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Table size={20} className="text-indigo-400" />
          </div>
          <h2 className="text-base font-bold text-slate-100">物理字段映射视图</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">物理字段 (Physical Field)</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">逻辑属性 (Logical Attribute)</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">所属对象 (Target Object)</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">置信度</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {allRows.map((row: any, i: number) => (
                  <tr key={i} className={cn("hover:bg-slate-800/30 transition-colors group", row.isUnassigned && "opacity-60")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                          {i + 1}
                        </div>
                        <span className="text-sm font-mono text-indigo-300/80">{row.field}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-200">{row.attribute}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {row.isUnassigned ? <HelpCircle size={14} className="text-slate-500" /> : <Box size={14} className="text-indigo-400" />}
                        <span className={cn("text-sm", row.isUnassigned ? "text-slate-500 italic" : "text-slate-300")}>{row.object}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn("text-xs font-mono", row.isUnassigned ? "text-slate-500" : "text-green-400")}>{row.confidence}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


const RelationshipDrawer = ({ isOpen, onClose, data }: any) => {
  const relationships = data?.relationships || [];
  
  const getRelIcon = (type: string) => {
    switch (type) {
      case 'Foreign Key': return <Link2 size={16} className="text-indigo-400" />;
      case 'One-to-Many': return <Network size={16} className="text-blue-400" />;
      case 'Self-Reference': return <RefreshCw size={16} className="text-amber-400" />;
      case 'Association': return <Share2 size={16} className="text-emerald-400" />;
      default: return <GitCommit size={16} className="text-slate-400" />;
    }
  };

  const getRelColor = (type: string) => {
    switch (type) {
      case 'Foreign Key': return 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5';
      case 'One-to-Many': return 'border-blue-500/30 text-blue-400 bg-blue-500/5';
      case 'Self-Reference': return 'border-amber-500/30 text-amber-400 bg-amber-500/5';
      case 'Association': return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5';
      default: return 'border-slate-500/30 text-slate-400 bg-slate-500/5';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-[650px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col"
          >
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                  <Network className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">对象关系可视化</h3>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">检测到 {relationships.length} 条语义关联</div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto relative bg-slate-950">
               <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
               
               <div className="relative z-10 space-y-12 flex flex-col items-center">
                  {relationships.length > 0 ? (
                    relationships.map((rel: any, idx: number) => {
                      const sourceObj = data.objects.find((o: any) => o.name === rel.source);
                      const targetObj = data.objects.find((o: any) => o.name === rel.target);

                      return (
                        <div key={idx} className="w-full flex flex-col items-center">
                          <div className="flex items-center justify-center space-x-0 w-full">
                            {/* Source Node */}
                            <div className="w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden group hover:border-indigo-500/50 transition-all">
                               <div className="bg-slate-800/50 p-3 border-b border-slate-800">
                                  <div className="flex justify-between items-center">
                                     <div className="flex items-center space-x-2">
                                        <Box size={14} className="text-indigo-400" />
                                        <div className="text-xs font-bold text-white truncate max-w-[140px]">{rel.source}</div>
                                     </div>
                                     <div className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 font-mono">{sourceObj?.type || 'OBJECT'}</div>
                                  </div>
                               </div>
                               <div className="p-3 space-y-2">
                                  <div className="flex items-center justify-between text-[10px]">
                                     <span className="text-slate-500">属性:</span>
                                     <span className="text-slate-300">{sourceObj?.fieldCount}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                     <span className="text-slate-500">关联字段:</span>
                                     <span className="text-indigo-400 font-mono">{rel.field}</span>
                                  </div>
                               </div>
                            </div>
                            
                            {/* Edge */}
                            <div className="flex flex-col items-center px-4 relative min-w-[120px]">
                               <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500/50 via-blue-500/50 to-slate-700 relative">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                     <div className={cn(
                                       "px-2 py-1 rounded-full border text-[9px] font-bold whitespace-nowrap flex items-center space-x-1 shadow-lg",
                                       getRelColor(rel.type)
                                     )}>
                                       {getRelIcon(rel.type)}
                                       <span>{rel.type}</span>
                                     </div>
                                  </div>
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                                     <ChevronRight size={14} className="text-slate-600" />
                                  </div>
                               </div>
                               <div className="mt-6 text-center">
                                  <div className="text-[9px] text-slate-500 font-mono mb-1">{rel.keys}</div>
                                  <div className="flex items-center justify-center space-x-1">
                                     <span className="text-[8px] text-slate-600">置信度:</span>
                                     <span className="text-[9px] text-green-400 font-mono">{(rel.confidence * 100).toFixed(0)}%</span>
                                  </div>
                               </div>
                            </div>

                            {/* Target Node */}
                            <div className="w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden hover:border-blue-500/50 transition-colors">
                               <div className="bg-slate-800/50 p-3 border-b border-slate-800">
                                  <div className="flex justify-between items-center">
                                     <div className="flex items-center space-x-2">
                                        <Layers size={14} className="text-blue-400" />
                                        <div className="text-xs font-bold text-white truncate max-w-[140px]">{rel.target}</div>
                                     </div>
                                     <div className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 font-mono">{targetObj?.type || 'OBJECT'}</div>
                                  </div>
                               </div>
                               <div className="p-3 space-y-2">
                                  <div className="flex items-center justify-between text-[10px]">
                                     <span className="text-slate-500">属性:</span>
                                     <span className="text-slate-300">{targetObj?.fieldCount}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                     <span className="text-slate-500">关联类型:</span>
                                     <span className="text-blue-400">{rel.type === 'Self-Reference' ? '递归' : '引用'}</span>
                                  </div>
                               </div>
                            </div>
                          </div>
                          {idx < relationships.length - 1 && (
                            <div className="h-8 w-px bg-slate-800 my-2"></div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                      <Network size={48} className="opacity-20 mb-4" />
                      <p className="text-sm">暂无检测到的对象关系</p>
                    </div>
                  )}
               </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
               <div className="text-[11px] text-slate-500">
                  基于 <span className="text-indigo-400 font-mono">Reasoning LLM</span> 语义关联推断
               </div>
               <div className="flex items-center space-x-3">
                 <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2">
                    <ExternalLink size={14} />
                    <span>导出关系图</span>
                  </button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
