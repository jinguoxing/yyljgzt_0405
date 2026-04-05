import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle2, AlertTriangle, Info, 
  ChevronDown, ChevronRight, RefreshCw, 
  EyeOff, Check, ShieldCheck
} from 'lucide-react';

interface FieldSemanticDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fieldName: string;
}

export function FieldSemanticDrawer({ isOpen, onClose, fieldName }: FieldSemanticDrawerProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<string[]>(['D1', 'D2']);

  const toggleEvidence = (id: string) => {
    setExpandedEvidence(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div>
                <h2 className="text-lg font-bold text-slate-200 flex items-center">
                  <span className="font-mono text-indigo-400 mr-2">{fieldName}</span>
                  语义推断详情
                </h2>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded border border-yellow-500/20">
                    NEEDS_CONFIRM
                  </span>
                  <span className="text-xs text-slate-500">
                    Top1 Conf: <span className="text-slate-300 font-mono">0.82</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TopK Candidates */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300">Top 候选推荐 (Candidates)</h3>
                
                {/* Top 1 */}
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">Top 1</span>
                        <span className="text-sm font-bold text-slate-200">Type: STRING</span>
                        <span className="text-slate-500 text-xs">|</span>
                        <span className="text-sm font-bold text-slate-200">Role: DIMENSION</span>
                      </div>
                      <div className="text-xs text-slate-400">Joint Score: <span className="font-mono text-indigo-300">0.82</span></div>
                    </div>
                    <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors flex items-center">
                      <Check size={14} className="mr-1" />
                      确认 Top1
                    </button>
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-indigo-500/20">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">ConfType</div>
                      <div className="text-xs font-mono text-slate-300">0.95</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">ConfRole</div>
                      <div className="text-xs font-mono text-slate-300">0.85</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">Compat</div>
                      <div className="text-xs font-mono text-emerald-400">1.0</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">Penalty</div>
                      <div className="text-xs font-mono text-red-400">-0.05</div>
                    </div>
                  </div>
                </div>

                {/* Top 2 */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Top 2</span>
                        <span className="text-sm font-bold text-slate-300">Type: STRING</span>
                        <span className="text-slate-500 text-xs">|</span>
                        <span className="text-sm font-bold text-slate-300">Role: IDENTIFIER</span>
                      </div>
                      <div className="text-xs text-slate-500">Joint Score: <span className="font-mono text-slate-400">0.65</span></div>
                    </div>
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors">
                      选择 Top2
                    </button>
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">ConfType</div>
                      <div className="text-xs font-mono text-slate-400">0.95</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">ConfRole</div>
                      <div className="text-xs font-mono text-slate-400">0.60</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">Compat</div>
                      <div className="text-xs font-mono text-emerald-400/70">1.0</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">Penalty</div>
                      <div className="text-xs font-mono text-red-400/70">-0.10</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-300">推断证据 (Evidence D1~D8)</h3>
                  <span className="text-xs text-slate-500">8 项证据收集完毕</span>
                </div>
                
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                  {/* D1 */}
                  <div className="border-b border-slate-800 last:border-0">
                    <button 
                      onClick={() => toggleEvidence('D1')}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center">
                        {expandedEvidence.includes('D1') ? <ChevronDown size={16} className="text-slate-500 mr-2" /> : <ChevronRight size={16} className="text-slate-500 mr-2" />}
                        <span className="text-xs font-bold text-slate-300">D1: 字段名模式匹配 (Name Pattern)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Strong</span>
                    </button>
                    {expandedEvidence.includes('D1') && (
                      <div className="p-3 pt-0 pl-9 text-xs text-slate-400 bg-slate-900/30">
                        匹配到后缀 `_status`，通常表示枚举类型的 DIMENSION。
                      </div>
                    )}
                  </div>

                  {/* D2 */}
                  <div className="border-b border-slate-800 last:border-0">
                    <button 
                      onClick={() => toggleEvidence('D2')}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center">
                        {expandedEvidence.includes('D2') ? <ChevronDown size={16} className="text-slate-500 mr-2" /> : <ChevronRight size={16} className="text-slate-500 mr-2" />}
                        <span className="text-xs font-bold text-slate-300">D2: 数据分布特征 (Data Profile)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Strong</span>
                    </button>
                    {expandedEvidence.includes('D2') && (
                      <div className="p-3 pt-0 pl-9 text-xs text-slate-400 bg-slate-900/30 space-y-1">
                        <div>Distinct Count: <span className="font-mono text-slate-300">5</span> (极低基数)</div>
                        <div>Top Values: <span className="font-mono text-slate-300">ACTIVE, INACTIVE, PENDING</span></div>
                        <div className="text-indigo-400 mt-1">→ 强烈暗示为 DIMENSION。</div>
                      </div>
                    )}
                  </div>

                  {/* D3 */}
                  <div className="border-b border-slate-800 last:border-0">
                    <button 
                      onClick={() => toggleEvidence('D3')}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center">
                        {expandedEvidence.includes('D3') ? <ChevronDown size={16} className="text-slate-500 mr-2" /> : <ChevronRight size={16} className="text-slate-500 mr-2" />}
                        <span className="text-xs font-bold text-slate-300">D3: 查询模式 (Usage Pattern)</span>
                      </div>
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded">Weak</span>
                    </button>
                    {expandedEvidence.includes('D3') && (
                      <div className="p-3 pt-0 pl-9 text-xs text-slate-400 bg-slate-900/30">
                        在 GROUP BY 子句中出现频率中等 (12%)。
                      </div>
                    )}
                  </div>
                  
                  {/* Other evidences collapsed by default */}
                  <div className="p-3 pl-9 text-xs text-slate-500 italic border-t border-slate-800">
                    ... 还有 5 项证据 (D4-D8)
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex space-x-3">
              <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                <EyeOff size={16} className="mr-2" />
                标记为 IGNORE
              </button>
              <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center justify-center">
                <RefreshCw size={16} className="mr-2" />
                重新运行推断
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
