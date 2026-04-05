import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wand2, ArrowRight, CheckCircle2, AlertTriangle, 
  Database, Shield, FileText, Layers, Box, 
  ChevronRight, ChevronDown, Play, Save, Upload,
  Search, Plus, X, Sparkles, ArrowLeft, GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NetworkCompose() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock Data
  const planOutline = [
    { category: '资产 (Assets)', count: 12, items: ['表: ORDERS', '表: CUSTOMERS', '表: PRODUCTS'] },
    { category: '标准 (Standards)', count: 5, items: ['标准: ISO-8601 日期', '标准: 货币 USD'] },
    { category: '断言 (Assertions)', count: 8, items: ['规则: 订单总额 > 0', '规则: 有效邮箱'] },
    { category: '对象 (Objects)', count: 3, items: ['对象: Customer', '对象: Order'] },
    { category: '动作 (Actions)', count: 2, items: ['接口: CreateOrder', '接口: GetOrderStatus'] },
  ];

  const changeSet = [
    { type: '新增节点', count: 15, details: ['新增 3 个对象节点', '新增 12 个数据节点'] },
    { type: '新增关系', count: 24, details: ['新增 24 条关联关系'] },
    { type: '新增策略', count: 2, details: ['新增隐私策略', '新增保留策略'] },
    { type: '新增规则', count: 8, details: ['新增 8 条数据质量规则'] },
  ];

  const handleAnalyze = () => {
    if (!intent) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(2);
    }, 1500);
  };

  const handleApply = () => {
    // Navigate to Studio with a "toast" or state indicating success
    navigate('/network/studio');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Header / Stepper */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white">
            <Wand2 size={18} />
          </div>
          <h1 className="text-lg font-semibold text-white">网络编排向导 (Compose Wizard)</h1>
        </div>

        <div className="flex items-center space-x-2">
          <StepIndicator step={1} current={step} label="目标 (Intent)" />
          <div className={`w-8 h-0.5 ${step > 1 ? 'bg-indigo-600' : 'bg-slate-800'}`} />
          <StepIndicator step={2} current={step} label="方案 (Propose)" />
          <div className={`w-8 h-0.5 ${step > 2 ? 'bg-indigo-600' : 'bg-slate-800'}`} />
          <StepIndicator step={3} current={step} label="提交 (Commit)" />
        </div>

        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepIntent 
              key="step1" 
              intent={intent} 
              setIntent={setIntent} 
              onNext={handleAnalyze} 
              isAnalyzing={isAnalyzing} 
            />
          )}
          {step === 2 && (
            <StepPropose 
              key="step2" 
              planOutline={planOutline} 
              onBack={() => setStep(1)}
              onNext={() => setStep(3)} 
            />
          )}
          {step === 3 && (
            <StepCommit 
              key="step3" 
              changeSet={changeSet} 
              onBack={() => setStep(2)}
              onApply={handleApply} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepIndicator({ step, current, label }: { step: number; current: number; label: string }) {
  const isActive = step === current;
  const isCompleted = step < current;

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        isActive ? 'bg-indigo-600 text-white' : 
        isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
      }`}>
        {isCompleted ? <CheckCircle2 size={14} /> : step}
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

function StepIntent({ intent, setIntent, onNext, isAnalyzing }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full overflow-y-auto p-8 max-w-4xl mx-auto"
    >
      <div className="space-y-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">定义您的场景目标</h2>
          <p className="text-slate-400">AI 将自动解析您的需求，从全局网络 (GKN) 中抽取相关的子图结构。</p>
        </div>

        {/* Intent Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <label className="block text-sm font-medium text-indigo-400 mb-2 flex items-center">
            <Sparkles size={16} className="mr-2" />
            场景目标 / 典型任务 (Intent)
          </label>
          <textarea 
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32 text-lg placeholder:text-slate-600"
            placeholder="例如：我需要构建一个‘Q3 季度库存优化’的领域网，重点关注华东地区的仓库数据，需要包含订单、物流和库存实体，并应用最新的财务合规标准..."
          />
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Layers size={18} className="mr-2 text-slate-400" />
              基座版本 (Base Network)
            </h3>
            <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 outline-none focus:border-indigo-500">
              <option>GKN v2.4.0 (最新稳定版)</option>
              <option>GKN v2.3.5</option>
              <option>DKN: 供应链 v1.2</option>
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Database size={18} className="mr-2 text-slate-400" />
              数据域约束 (Domain Scope)
            </h3>
            <div className="flex flex-wrap gap-2">
              {['供应链', '财务', '人力资源', '客户', '产品'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300 border border-slate-700 cursor-pointer hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                  {tag}
                </span>
              ))}
              <button className="px-3 py-1 bg-slate-800/50 rounded-full text-sm text-slate-500 border border-dashed border-slate-700 hover:text-slate-300 flex items-center">
                <Plus size={14} className="mr-1" /> 自定义
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Shield size={18} className="mr-2 text-slate-400" />
              标准与合规 (Standards)
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-slate-300 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                <span>ISO-8601 日期标准</span>
              </label>
              <label className="flex items-center space-x-3 text-slate-300 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                <span>GDPR 隐私合规</span>
              </label>
              <label className="flex items-center space-x-3 text-slate-300 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500" />
                <span>财务审计标准 v2</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center">
              <Box size={18} className="mr-2 text-slate-400" />
              预算与规模 (Constraints)
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">最大节点数</span>
                  <span className="text-slate-200">500</span>
                </div>
                <input type="range" className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">计算成本预估</span>
                  <span className="text-slate-200">中 (Medium)</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-2 flex-1 bg-emerald-500 rounded-l"></div>
                  <div className="h-2 flex-1 bg-emerald-500"></div>
                  <div className="h-2 flex-1 bg-slate-800 rounded-r"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button 
            onClick={onNext}
            disabled={!intent || isAnalyzing}
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium text-lg transition-all ${
              !intent || isAnalyzing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Wand2 size={20} className="animate-spin" />
                <span>AI 解析中...</span>
              </>
            ) : (
              <>
                <Wand2 size={20} />
                <span>生成方案 (Generate)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StepPropose({ planOutline, onBack, onNext }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex"
    >
      {/* Left: Plan Outline */}
      <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white flex items-center">
            <FileText size={18} className="mr-2 text-indigo-400" />
            方案大纲 (Plan Outline)
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {planOutline.map((section: any, idx: number) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="px-3 py-2 bg-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-colors">
                <span className="font-medium text-slate-200 text-sm">{section.category}</span>
                <span className="bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded-full">{section.count}</span>
              </div>
              <div className="p-2 space-y-1">
                {section.items.map((item: string, i: number) => (
                  <div key={i} className="text-xs text-slate-400 px-2 py-1 hover:bg-slate-700/30 rounded flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Subgraph Preview */}
      <div className="flex-1 bg-slate-950 relative flex flex-col">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        
        {/* Toolbar */}
        <div className="h-12 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-4 z-10">
          <span className="text-sm text-slate-400">子图预览 (Subgraph Preview)</span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
              <AlertTriangle size={12} className="mr-1.5" />
              3 个潜在冲突
            </span>
            <span className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              <CheckCircle2 size={12} className="mr-1.5" />
              质量检查通过
            </span>
          </div>
        </div>

        {/* Graph Visualization Placeholder */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Mock Graph Nodes */}
          <div className="relative w-[600px] h-[400px]">
            {/* Central Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-24 h-24 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <div className="text-center">
                  <Box size={24} className="mx-auto text-indigo-400 mb-1" />
                  <span className="text-xs font-bold text-white">Order</span>
                </div>
              </div>
            </div>

            {/* Surrounding Nodes */}
            {[0, 72, 144, 216, 288].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = Math.cos(rad) * 180;
              const y = Math.sin(rad) * 180;
              return (
                <div key={i} className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 z-10" style={{ transform: `translate(${x}px, ${y}px)` }}>
                  <div className="w-full h-full rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer">
                    <span className="text-xs text-slate-300">节点 {i+1}</span>
                  </div>
                  {/* Connection Line */}
                  <svg className="absolute top-1/2 left-1/2 w-[200px] h-[200px] -ml-[100px] -mt-[100px] pointer-events-none" style={{ transform: `translate(${-x/2}px, ${-y/2}px) rotate(${deg + 180}deg)` }}>
                    <line x1="100" y1="100" x2="100" y2="0" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: AI Explain */}
      <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white flex items-center">
            <Sparkles size={18} className="mr-2 text-indigo-400" />
            AI 解析 (Explain)
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-slate-200 mb-2">为什么选择这些节点？</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              根据您的目标“库存优化”，系统自动关联了核心实体 <span className="text-indigo-400">Order</span> 和 <span className="text-indigo-400">Inventory</span>。同时，为了满足“财务合规”要求，引入了 <span className="text-indigo-400">AuditLog</span> 表。
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-200 mb-2">缺失内容 (Missing)</h4>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5" />
                <p className="text-xs text-amber-200">
                  缺少 <span className="font-mono">Shipping_Cost</span> 的明确计算规则。建议在后续步骤中补充。
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-200 mb-2">建议补充 (Suggestions)</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">
                <Plus size={12} className="mr-2 text-indigo-500" />
                添加 Supplier 实体
              </li>
              <li className="flex items-center text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">
                <Plus size={12} className="mr-2 text-indigo-500" />
                引入 ISO-3166 国家代码标准
              </li>
            </ul>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-800 flex justify-between">
          <button 
            onClick={onBack}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            上一步
          </button>
          <button 
            onClick={onNext}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <span>确认方案</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StepCommit({ changeSet, onBack, onApply }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col max-w-5xl mx-auto p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">确认并提交变更集 (Commit ChangeSet)</h2>
        <p className="text-slate-400">请审查即将应用到网络的变更内容。</p>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GitBranch size={18} className="text-indigo-400" />
            <span className="font-mono text-sm text-slate-300">变更集 #CS-2024-0892</span>
          </div>
          <span className="text-xs text-slate-500">刚刚创建</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {changeSet.map((item: any, idx: number) => (
            <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden">
              <div className="bg-slate-800/30 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded ${
                    item.type.includes('节点') ? 'bg-indigo-500/20 text-indigo-400' :
                    item.type.includes('关系') ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.type.includes('节点') ? <Box size={16} /> : 
                     item.type.includes('关系') ? <ArrowRight size={16} /> : 
                     <Shield size={16} />}
                  </div>
                  <span className="font-medium text-slate-200">{item.type}</span>
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full font-mono">
                  +{item.count}
                </span>
              </div>
              <div className="bg-slate-950/50 px-4 py-3 border-t border-slate-800">
                <ul className="space-y-1">
                  {item.details.map((detail: string, i: number) => (
                    <li key={i} className="text-sm text-slate-400 flex items-center">
                      <div className="w-1 h-1 rounded-full bg-slate-600 mr-2"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            返回修改
          </button>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700">
              <Play size={16} />
              <span>运行校验 (Validation)</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700">
              <Upload size={16} />
              <span>发布发布包 (Publish)</span>
            </button>
            <button 
              onClick={onApply}
              className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Save size={16} />
              <span>应用为草稿</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
