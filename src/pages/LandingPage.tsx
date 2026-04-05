import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, LayoutGrid, BrainCircuit, Activity, 
  ArrowRight, Sparkles, Bot, Database
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();

  const products = [
    {
      id: 'semantic',
      title: '语义治理',
      description: '管理语义层、表理解和对象生成，构建统一的数据语义底座。',
      icon: BrainCircuit,
      color: 'violet',
      path: '/semantic/inbox',
      features: ['语义待办', '表结构理解', '业务对象生成', '发布管理']
    },
    {
      id: 'network',
      title: '知识网络',
      description: '统一的组织级、领域级和个人级知识图谱，实现智能化决策。',
      icon: Globe,
      color: 'indigo',
      path: '/network/studio',
      features: ['网络注册中心', '图工作台', 'AI 编排', '策略与分流']
    },
    {
      id: 'aiops',
      title: 'AIOps 中心',
      description: '监控、管理和优化您的 AI 员工及运营任务，提升执行效率。',
      icon: Activity,
      color: 'emerald',
      path: '/aiops/dashboard',
      features: ['员工工作台', '任务队列', '运行观测', '审计回放']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-slate-300">下一代 AI 操作系统</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
              统一 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">智能</span> 平台
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              编排您的 AI 劳动力，治理语义知识，并从单一控制平面构建全球智能网络。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Product Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -5 }}
              className="group relative bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl p-8 transition-all hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
              onClick={() => navigate(product.path)}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${product.color}-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-${product.color}-500/20 transition-colors`}></div>
              
              <div className={`w-14 h-14 rounded-xl bg-${product.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <product.icon size={28} className={`text-${product.color}-400`} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {product.title}
              </h3>
              <p className="text-slate-400 mb-8 leading-relaxed min-h-[48px]">
                {product.description}
              </p>
              
              <div className="space-y-3 mb-8">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-slate-500">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${product.color}-500/50 mr-3`}></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center text-sm font-medium text-white group-hover:translate-x-2 transition-transform">
                <span>进入模块</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 text-center text-slate-600 text-sm">
        <p>© 2024 AI 操作系统. 保留所有权利。</p>
      </footer>
    </div>
  );
}
