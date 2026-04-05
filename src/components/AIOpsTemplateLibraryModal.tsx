import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Library, FileText, Database, Bot, ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  employee: string;
  usageCount: number;
}

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'TPL-001',
    title: '解析表结构与语义',
    description: '自动扫描指定数据源的表结构，提取字段级元数据，并推断业务语义与分类。',
    category: '数据资产',
    employee: 'Data Steward AI',
    usageCount: 1245
  },
  {
    id: 'TPL-002',
    title: '梳理数据血缘',
    description: '通过解析 SQL 脚本和调度任务，自动构建表级和字段级数据血缘关系图谱。',
    category: '数据资产',
    employee: 'Lineage Analyst',
    usageCount: 892
  },
  {
    id: 'TPL-003',
    title: '生成业务指标定义',
    description: '基于事实表和维度表，自动生成标准化的业务指标定义和计算逻辑。',
    category: '数据指标',
    employee: 'Metric Generator',
    usageCount: 567
  },
  {
    id: 'TPL-004',
    title: '数据质量异常检测',
    description: '配置数据质量规则，定期扫描数据并检测异常值、空值率、唯一性等问题。',
    category: '数据质量',
    employee: 'Anomaly Detector',
    usageCount: 2103
  },
  {
    id: 'TPL-005',
    title: '构建用户画像标签',
    description: '基于用户行为日志和交易数据，自动提取特征并构建用户画像标签体系。',
    category: '数据应用',
    employee: 'Data Steward AI',
    usageCount: 432
  }
];

interface AIOpsTemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export default function AIOpsTemplateLibraryModal({ isOpen, onClose, onSelectTemplate }: AIOpsTemplateLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const categories = ['全部', ...Array.from(new Set(MOCK_TEMPLATES.map(t => t.category)))];

  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === '全部' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Library className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">需求模板库</h2>
                  <p className="text-xs text-slate-400 mt-1">选择预置模板，快速创建 AI 运营需求</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar: Categories */}
              <div className="w-48 border-r border-slate-800 bg-slate-950/50 p-4 shrink-0 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left",
                        activeCategory === category 
                          ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Area: Templates */}
              <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
                <div className="p-4 border-b border-slate-800 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text"
                      placeholder="搜索模板名称或描述..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map(template => (
                      <div 
                        key={template.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group cursor-pointer flex flex-col h-full"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{template.title}</h3>
                              <span className="text-[10px] text-slate-500 font-mono">{template.id}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-800 text-slate-400">
                            {template.category}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">
                          {template.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-auto">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                              <Bot size={14} className="text-slate-600" />
                              <span>{template.employee}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                              <span className="text-slate-600">使用次数:</span>
                              <span>{template.usageCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <button className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500 hover:text-white">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredTemplates.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
                      <Search size={32} className="mb-4 opacity-20" />
                      <p className="text-sm">没有找到匹配的模板</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
