import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ZoomIn, ZoomOut, Move, MousePointer2, Layers, 
  Maximize, Minimize, Save, Share2, MoreHorizontal,
  Plus, Minus, Filter, Search, Building2, Box, User,
  LayoutTemplate, Network, GitCommit, Activity,
  Clock, Calendar, PlayCircle, PauseCircle, SkipBack, SkipForward,
  Database, Shield, FileText, Bookmark, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle2, X, Sparkles, MessageCircleQuestion, PenLine, Wrench,
  Link, History, FileSearch, GitPullRequest, Download, Trash2, Send, RefreshCw, ChevronUp, AlertOctagon, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ViewMode = '分层视图' | '故事视图' | '依赖视图' | '质量视图' | '个人驾驶舱';
type LayoutMode = '层级布局' | '放射布局' | '簇状布局';
type InspectorTab = '属性' | '关系' | '断言' | '证据' | '运行';
type ChangeSetStep = '审查' | '校验中' | '结果';

interface NodeData {
  id: string;
  type: '资产' | '对象' | '标准' | '断言' | '运行' | '行动';
  label: string;
  details?: Record<string, string>;
  status?: '健康' | '风险' | '未知';
  riskScore?: number;
  stage?: number;
  layer?: '资产层' | '断言层' | '对象层' | '运行层';
  x: number;
  y: number;
  expanded?: boolean;
  collapsed?: boolean;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: '实线' | '虚线' | '发光';
}

export default function NetworkStudio() {
  const { networkMode } = useOutletContext<{ networkMode: 'GKN' | 'DKN' | 'PKN' }>();
  const [viewMode, setViewMode] = useState<ViewMode>(networkMode === 'DKN' ? '故事视图' : networkMode === 'PKN' ? '个人驾驶舱' : '分层视图');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('层级布局');

  // Update view mode when network mode changes
  useEffect(() => {
    if (networkMode === 'DKN') setViewMode('故事视图');
    else if (networkMode === 'PKN') setViewMode('个人驾驶舱');
    else setViewMode('分层视图');
  }, [networkMode]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['资产', '对象']);
  const [timeValue, setTimeValue] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedClusters, setExpandedClusters] = useState<string[]>(['资产', '对象']);
  const [activeTab, setActiveTab] = useState<InspectorTab>('属性');
  const [showFixOptions, setShowFixOptions] = useState(false);
  
  // ChangeSet State
  const [isChangeSetOpen, setIsChangeSetOpen] = useState(false);
  const [changeSetStep, setChangeSetStep] = useState<ChangeSetStep>('审查');

  // Graph State
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: 'n1', type: '资产', label: 'Table: ORDERS', status: '风险', riskScore: 85, stage: 1, layer: '资产层', x: 0, y: 0, details: { db: 'Snowflake', rows: '1.2M', quality: '65%' } },
    { id: 'n2', type: '资产', label: 'Table: CUSTOMERS', status: '健康', riskScore: 10, stage: 1, layer: '资产层', x: 0, y: 0, details: { db: 'Snowflake', rows: '500K', quality: '98%' } },
    { id: 'n3', type: '标准', label: 'ISO-8601 Date', status: '健康', riskScore: 5, stage: 2, layer: '断言层', x: 0, y: 0, details: { format: 'YYYY-MM-DD' } },
    { id: 'n4', type: '断言', label: 'Total > 0', status: '未知', riskScore: 45, stage: 2, layer: '断言层', x: 0, y: 0, details: { rule: 'val > 0', severity: 'High' } },
    { id: 'n5', type: '对象', label: 'Order', status: '风险', riskScore: 75, stage: 3, layer: '对象层', x: 0, y: 0, details: { id: 'UUID', total: 'Decimal' } },
    { id: 'n6', type: '对象', label: 'Customer', status: '健康', riskScore: 20, stage: 3, layer: '对象层', x: 0, y: 0, details: { id: 'UUID', email: 'String' } },
    { id: 'n7', type: '运行', label: 'Sync to CRM', status: '健康', riskScore: 15, stage: 4, layer: '运行层', x: 0, y: 0, details: { target: 'Salesforce', freq: 'Daily' } },
    { id: 'n8', type: '运行', label: 'Alert: High Risk', status: '风险', riskScore: 90, stage: 4, layer: '运行层', x: 0, y: 0, details: { channel: 'Slack', threshold: '> 80' } },
  ]);
  
  const [edges, setEdges] = useState<EdgeData[]>([
    { id: 'e1', source: 'n1', target: 'n5', type: '实线' },
    { id: 'e2', source: 'n2', target: 'n6', type: '实线' },
    { id: 'e3', source: 'n3', target: 'n5', type: '虚线' },
    { id: 'e4', source: 'n4', target: 'n5', type: '发光' },
    { id: 'e5', source: 'n6', target: 'n5', type: '实线' }, 
    { id: 'e6', source: 'n6', target: 'n7', type: '实线' },
    { id: 'e7', source: 'n5', target: 'n8', type: '发光' },
  ]);

  useEffect(() => {
    setNodes(prev => prev.map((node, index) => {
      let nx = node.x;
      let ny = node.y;

      if (viewMode === '分层视图') {
        const layerX = { '资产层': 100, '断言层': 350, '对象层': 600, '运行层': 850 };
        nx = layerX[node.layer as keyof typeof layerX] || 100;
        const nodesInLayer = prev.filter(n => n.layer === node.layer);
        const idx = nodesInLayer.findIndex(n => n.id === node.id);
        ny = 150 + idx * 120;
      } else if (viewMode === '故事视图') {
        nx = 100 + ((node.stage || 1) - 1) * 250;
        const nodesInStage = prev.filter(n => n.stage === node.stage);
        const idx = nodesInStage.findIndex(n => n.id === node.id);
        ny = 250 + (idx - (nodesInStage.length - 1) / 2) * 120;
      } else if (viewMode === '依赖视图') {
        if (layoutMode === '层级布局') {
          // Hierarchical layout for dependency view
          const levels: Record<string, number> = { 'n1': 0, 'n2': 0, 'n3': 0, 'n4': 2, 'n5': 1, 'n6': 1, 'n7': 2, 'n8': 2 };
          const level = levels[node.id] || 0;
          const nodesInLevel = prev.filter(n => (levels[n.id] || 0) === level);
          const idx = nodesInLevel.findIndex(n => n.id === node.id);
          nx = 150 + level * 300;
          ny = 200 + (idx - (nodesInLevel.length - 1) / 2) * 150;
        } else if (layoutMode === '放射布局') {
          // Radial layout around n5 (Order)
          if (node.id === 'n5') {
            nx = 450; ny = 300;
          } else {
            const radius = 250;
            const angle = (index / (prev.length - 1)) * 2 * Math.PI;
            nx = 450 + radius * Math.cos(angle);
            ny = 300 + radius * Math.sin(angle);
          }
        } else if (layoutMode === '簇状布局') {
          // Clustered by type
          const clusters: Record<string, { x: number, y: number }> = {
            '资产': { x: 150, y: 150 },
            '对象': { x: 450, y: 300 },
            '标准': { x: 750, y: 150 },
            '断言': { x: 750, y: 450 },
            '运行': { x: 150, y: 450 }
          };
          const center = clusters[node.type] || { x: 450, y: 300 };
          const nodesInCluster = prev.filter(n => n.type === node.type);
          const idx = nodesInCluster.findIndex(n => n.id === node.id);
          const offset = idx * 60;
          nx = center.x + (idx % 2 === 0 ? offset : -offset);
          ny = center.y + (idx % 2 === 0 ? offset : -offset);
        }
      } else if (viewMode === '质量视图') {
        const sorted = [...prev].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
        const idx = sorted.findIndex(n => n.id === node.id);
        nx = 150 + (idx % 4) * 220;
        ny = 150 + Math.floor(idx / 4) * 150;
      }

      return { ...node, x: nx, y: ny };
    }));
  }, [viewMode, layoutMode]);

  const hiddenNodeIds = React.useMemo(() => {
    if (viewMode !== '依赖视图') return new Set<string>();
    const hidden = new Set<string>();
    const collapsed = new Set(nodes.filter(n => n.collapsed).map(n => n.id));
    
    edges.forEach(e => {
      if (collapsed.has(e.source)) {
        hidden.add(e.target);
      }
    });
    return hidden;
  }, [nodes, edges, viewMode]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const scopes = ['资产', '标准', '断言', '对象', '运行'];

  // Mock ChangeSet Data
  const changes = [
    { id: 'c1', type: '节点', action: '新增', label: 'Table: SHIPPING_COSTS', desc: '从 Snowflake 源添加' },
    { id: 'c2', type: '关系', action: '修改', label: 'Order -> Customer', desc: '基数更改为 1:N' },
    { id: 'c3', type: '策略', action: '新增', label: 'PII 脱敏', desc: '应用于 email 字段' },
    { id: 'c4', type: '断言', action: '重载', label: 'Total > 0', desc: '对退货单禁用' },
  ];

  const validationResults = [
    { id: 'v1', type: 'Schema', status: 'Pass', label: '本体约束检查 (Schema Check)', message: 'All types match ontology definitions.' },
    { id: 'v2', type: 'Consistency', status: 'Fail', label: '一致性检查 (Consistency Check)', message: 'Detected cyclic dependency in Order -> Payment -> Order.' },
    { id: 'v3', type: 'Risk', status: 'Warning', label: '风险检查 (Risk Check)', message: 'High sensitivity data exposed without masking.' },
  ];

  const handleApplyChanges = () => {
    setChangeSetStep('校验中');
    setTimeout(() => {
      setChangeSetStep('结果');
    }, 2000);
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const toggleCluster = (cluster: string) => {
    if (expandedClusters.includes(cluster)) {
      setExpandedClusters(expandedClusters.filter(c => c !== cluster));
    } else {
      setExpandedClusters([...expandedClusters, cluster]);
    }
  };

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
  };

  const handleNodeDoubleClick = (id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, expanded: !n.expanded } : n));
  };

  // Helper to get node color based on type
  const getNodeColor = (node: NodeData) => {
    if (viewMode === '质量视图') {
      const score = node.riskScore || 0;
      if (score > 70) return 'border-red-500/80 bg-red-950/80 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      if (score > 30) return 'border-amber-500/80 bg-amber-950/80 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      return 'border-emerald-500/80 bg-emerald-950/80 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    }

    switch (node.type) {
      case '资产': return 'border-slate-500 bg-slate-900 text-slate-300';
      case '对象': return 'border-indigo-500 bg-slate-900 text-indigo-100';
      case '标准': return 'border-blue-400 bg-slate-900 text-blue-100';
      case '断言': return 'border-amber-500 bg-slate-900 text-amber-100';
      case '运行': return 'border-emerald-500 bg-slate-900 text-emerald-100';
      case '行动': return 'border-purple-500 bg-slate-900 text-purple-100';
      default: return 'border-slate-500 bg-slate-900 text-slate-300';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case '资产': return <Database size={14} className="text-slate-400" />;
      case '对象': return <Box size={14} className="text-indigo-400" />;
      case '标准': return <FileText size={14} className="text-blue-400" />;
      case '断言': return <Shield size={14} className="text-amber-400" />;
      case '运行': return <Activity size={14} className="text-emerald-400" />;
      case '行动': return <Zap size={14} className="text-purple-400" />;
      default: return <Box size={14} />;
    }
  };

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{show: boolean, x: number, y: number} | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setZoom(prev => Math.min(Math.max(0.2, prev - e.deltaY * 0.005), 3));
    } else {
      setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-element')) return;
    if (e.button === 2) return; // Right click
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setContextMenu(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.2));
  const handleZoomOut = () => setZoom(prev => Math.max(0.2, prev - 0.2));
  const handleFitScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    setContextMenu(null);
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden rounded-xl border border-slate-800">
      {/* Studio Toolbar */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center space-x-4">
          {/* Network Indicator */}
          <div className="flex items-center space-x-2 text-sm font-medium text-slate-300 mr-2">
            {networkMode === 'GKN' && <Building2 size={16} className="text-indigo-400" />}
            {networkMode === 'DKN' && <Box size={16} className="text-emerald-400" />}
            {networkMode === 'PKN' && <User size={16} className="text-amber-400" />}
            <span className="hidden md:inline">{networkMode} 工作台</span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* View Switch */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button 
              onClick={() => setViewMode('分层视图')}
              className={`p-1.5 rounded transition-colors ${viewMode === '分层视图' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} 
              title="分层视图"
            >
              <Layers size={16} />
            </button>
            <button 
              onClick={() => setViewMode('故事视图')}
              className={`p-1.5 rounded transition-colors ${viewMode === '故事视图' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} 
              title="故事视图"
            >
              <GitCommit size={16} className="rotate-90" />
            </button>
            <button 
              onClick={() => setViewMode('依赖视图')}
              className={`p-1.5 rounded transition-colors ${viewMode === '依赖视图' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} 
              title="依赖视图"
            >
              <Network size={16} />
            </button>
            <button 
              onClick={() => setViewMode('质量视图')}
              className={`p-1.5 rounded transition-colors ${viewMode === '质量视图' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} 
              title="质量视图"
            >
              <Activity size={16} />
            </button>
            {networkMode === 'PKN' && (
              <button 
                onClick={() => setViewMode('个人驾驶舱')}
                className={`p-1.5 rounded transition-colors ${viewMode === '个人驾驶舱' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} 
                title="个人驾驶舱"
              >
                <User size={16} />
              </button>
            )}
          </div>

          {/* Layout Switch */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 hidden lg:flex">
            <button 
              onClick={() => setLayoutMode('层级布局')}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${layoutMode === '层级布局' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              层级布局
            </button>
            <button 
              onClick={() => setLayoutMode('放射布局')}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${layoutMode === '放射布局' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              放射布局
            </button>
            <button 
              onClick={() => setLayoutMode('簇状布局')}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${layoutMode === '簇状布局' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              簇状布局
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Scope Chips */}
          <div className="flex items-center space-x-1 hidden xl:flex">
            {scopes.map(scope => (
              <button
                key={scope}
                onClick={() => toggleScope(scope)}
                className={`px-2 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                  selectedScopes.includes(scope)
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-800 hidden xl:block" />

          {/* Standard Tools */}
          <div className="flex items-center space-x-2">
             <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title="选择">
                <MousePointer2 size={16} />
              </button>
              <button className="p-1.5 bg-slate-700 rounded text-white transition-colors shadow-sm" title="平移">
                <Move size={16} />
              </button>
            </div>
            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-indigo-500/20">
              <Plus size={14} />
              <span className="hidden sm:inline">添加节点</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Explorer Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-30 flex-shrink-0">
          {/* Search */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="搜索节点..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Clusters */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>簇列表</span>
              <Filter size={12} className="cursor-pointer hover:text-slate-300" />
            </div>
            
            {/* Assets Cluster */}
            <div>
              <button 
                onClick={() => toggleCluster('资产')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {expandedClusters.includes('资产') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Database size={14} className="text-slate-400" />
                  <span>资产</span>
                </div>
                <span className="text-xs text-slate-600">12</span>
              </button>
              {expandedClusters.includes('资产') && (
                <div className="pl-9 pr-2 space-y-0.5 mt-0.5">
                   <div className="flex items-center text-xs text-slate-400 py-1 hover:text-white cursor-pointer truncate">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2 flex-shrink-0"></div>
                     <span className="truncate">DS: Snowflake_Prod</span>
                   </div>
                   <div className="flex items-center text-xs text-slate-400 py-1 hover:text-white cursor-pointer truncate">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2 flex-shrink-0"></div>
                     <span className="truncate">Table: ORDERS</span>
                   </div>
                   <div className="flex items-center text-xs text-slate-400 py-1 hover:text-white cursor-pointer truncate">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2 flex-shrink-0"></div>
                     <span className="truncate">Table: CUSTOMERS</span>
                   </div>
                </div>
              )}
            </div>

            {/* Objects Cluster */}
            <div>
              <button 
                onClick={() => toggleCluster('对象')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {expandedClusters.includes('对象') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Box size={14} className="text-slate-400" />
                  <span>对象</span>
                </div>
                <span className="text-xs text-slate-600">8</span>
              </button>
              {expandedClusters.includes('对象') && (
                <div className="pl-9 pr-2 space-y-0.5 mt-0.5">
                   <div className="flex items-center text-xs text-slate-400 py-1 hover:text-white cursor-pointer truncate">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 flex-shrink-0"></div>
                     <span className="truncate">Obj: Customer</span>
                   </div>
                   <div className="flex items-center text-xs text-slate-400 py-1 hover:text-white cursor-pointer truncate">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 flex-shrink-0"></div>
                     <span className="truncate">Obj: Order</span>
                   </div>
                </div>
              )}
            </div>

            {/* Assertions Cluster */}
            <div>
              <button 
                onClick={() => toggleCluster('断言')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {expandedClusters.includes('断言') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Shield size={14} className="text-slate-400" />
                  <span>断言</span>
                </div>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 rounded-full">3</span>
              </button>
            </div>

            {/* Standards Cluster */}
            <div>
              <button 
                onClick={() => toggleCluster('标准')}
                className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800 rounded transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {expandedClusters.includes('标准') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <FileText size={14} className="text-slate-400" />
                  <span>标准</span>
                </div>
              </button>
            </div>

            <div className="my-4 border-t border-slate-800 mx-2"></div>

            {/* Saved Views */}
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">已存视图</div>
            <div className="space-y-0.5">
              {['订单对象全链路', '语义待办 Top20', '质量高风险子图'].map((view, i) => (
                <button key={i} className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-left">
                  <Bookmark size={12} className="text-indigo-500" />
                  <span>{view}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Graph Canvas */}
        <div 
          className={`flex-1 bg-[#0B0F19] relative overflow-hidden ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onContextMenu={handleContextMenu}
        >
          {/* Dot Grid Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20" 
            style={{ 
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`, 
              backgroundPosition: `${pan.x}px ${pan.y}px`,
              backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)' 
            }}
          />

          {/* Dynamic Background based on View Mode */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500">
            {viewMode === '分层视图' ? (
              <div className="w-full h-full flex justify-around opacity-20">
                <div className="w-1/4 h-full border-r border-dashed border-slate-600 flex flex-col items-center pt-8">
                  <span className="text-2xl font-bold text-slate-500">资产层 (Assets)</span>
                  <span className="text-sm text-slate-500 mt-2">DataSource / Table / Column</span>
                </div>
                <div className="w-1/4 h-full border-r border-dashed border-slate-600 flex flex-col items-center pt-8">
                  <span className="text-2xl font-bold text-slate-500">断言层 (Assertions)</span>
                  <span className="text-sm text-slate-500 mt-2">语义 / 质量 / 候选 / 映射建议</span>
                </div>
                <div className="w-1/4 h-full border-r border-dashed border-slate-600 flex flex-col items-center pt-8">
                  <span className="text-2xl font-bold text-slate-500">对象层 (Objects)</span>
                  <span className="text-sm text-slate-500 mt-2">BusinessObject / Attribute</span>
                </div>
                <div className="w-1/4 h-full flex flex-col items-center pt-8">
                  <span className="text-2xl font-bold text-slate-500">运行层 (Runs)</span>
                  <span className="text-sm text-slate-500 mt-2">执行与回放</span>
                </div>
              </div>
            ) : viewMode === '故事视图' ? (
              <div className="w-full h-full flex items-center px-10 opacity-10">
                <div className="flex-1 border-t-4 border-dashed border-slate-600 relative">
                  <div className="absolute -top-8 left-0 text-2xl font-bold text-slate-500">Stage 1: Ingestion</div>
                  <div className="absolute -top-8 left-1/3 text-2xl font-bold text-slate-500">Stage 2: Validation</div>
                  <div className="absolute -top-8 left-2/3 text-2xl font-bold text-slate-500">Stage 3: Modeling</div>
                </div>
              </div>
            ) : viewMode === '个人驾驶舱' ? (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                <User size={120} className="text-slate-500 mb-4" />
                <span className="text-3xl font-bold text-slate-500">个人驾驶舱 (Personal Cockpit)</span>
                <span className="text-lg text-slate-500 mt-2">您的私有工作区与草稿</span>
              </div>
            ) : viewMode === '依赖视图' ? (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                {layoutMode === '放射布局' ? (
                  <div className="w-[800px] h-[800px] border border-slate-700 rounded-full border-dashed animate-spin-slow"></div>
                ) : layoutMode === '层级布局' ? (
                  <div className="w-full h-full flex justify-around">
                    <div className="w-px h-full bg-slate-700 border-r border-dashed"></div>
                    <div className="w-px h-full bg-slate-700 border-r border-dashed"></div>
                    <div className="w-px h-full bg-slate-700 border-r border-dashed"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-20">
                    <div className="w-64 h-64 border border-slate-700 rounded-full border-dashed"></div>
                    <div className="w-64 h-64 border border-slate-700 rounded-full border-dashed"></div>
                    <div className="w-64 h-64 border border-slate-700 rounded-full border-dashed"></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-around opacity-10 p-8">
                <div className="w-full h-1/3 flex items-center justify-start pl-8 text-4xl font-bold text-red-500 border-b border-dashed border-red-500/30">高风险区 (High Risk)</div>
                <div className="w-full h-1/3 flex items-center justify-start pl-8 text-4xl font-bold text-amber-500 border-b border-dashed border-amber-500/30">中风险区 (Medium Risk)</div>
                <div className="w-full h-1/3 flex items-center justify-start pl-8 text-4xl font-bold text-emerald-500">低风险区 (Low Risk)</div>
              </div>
            )}
          </div>

          {/* Zoom/Pan Container */}
          <div 
            className="absolute inset-0 origin-top-left transition-transform duration-75"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* Edges Layer */}
            <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-visible">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {edges.filter(e => !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target)).map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isStoryMode = viewMode === '故事视图';
                const isQualityMode = viewMode === '质量视图';
                
                let strokeColor = isStoryMode ? '#8b5cf6' : (edge.type === '发光' ? '#6366f1' : '#475569');
                if (isQualityMode) {
                  const sourceScore = sourceNode.riskScore || 0;
                  const targetScore = targetNode.riskScore || 0;
                  const maxScore = Math.max(sourceScore, targetScore);
                  if (maxScore > 70) strokeColor = '#ef4444';
                  else if (maxScore > 30) strokeColor = '#f59e0b';
                  else strokeColor = '#10b981';
                }

                const strokeWidth = isStoryMode ? 3 : (edge.type === '发光' ? 3 : 2);
                const isDashed = !isStoryMode && edge.type === '虚线';

                // Curved edge calculation
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const isHorizontal = Math.abs(dx) > Math.abs(dy);
                const cx1 = isHorizontal ? sourceNode.x + 100 + dx / 2 : sourceNode.x + 100;
                const cy1 = isHorizontal ? sourceNode.y + 40 : sourceNode.y + 40 + dy / 2;
                const cx2 = isHorizontal ? targetNode.x + 100 - dx / 2 : targetNode.x + 100;
                const cy2 = isHorizontal ? targetNode.y + 40 : targetNode.y + 40 - dy / 2;

                return (
                  <g key={edge.id}>
                    <path 
                      d={`M ${sourceNode.x + 100} ${sourceNode.y + 40} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x + 100} ${targetNode.y + 40}`}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isDashed ? '5,5' : '0'}
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      filter={(edge.type === '发光' || isStoryMode) ? 'url(#glow)' : undefined}
                    />
                    {/* Animated particle for glow edges */}
                    {(edge.type === '发光' || isStoryMode) && (
                      <circle r="3" fill="#fff" filter="url(#glow)">
                        <animateMotion 
                          dur="2s" 
                          repeatCount="indefinite" 
                          path={`M ${sourceNode.x + 100} ${sourceNode.y + 40} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x + 100} ${targetNode.y + 40}`} 
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Nodes Layer */}
            {nodes.filter(n => !hiddenNodeIds.has(n.id)).map(node => (
              <motion.div 
                key={node.id}
                drag
                dragMomentum={false}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onDrag={(event, info) => {
                  setNodes(prev => prev.map(n => n.id === node.id ? { ...n, x: n.x + info.delta.x / zoom, y: n.y + info.delta.y / zoom } : n));
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleNodeDoubleClick(node.id);
                }}
                style={{ left: node.x, top: node.y }}
                className={`node-element absolute w-[200px] rounded-xl border-2 shadow-lg cursor-grab active:cursor-grabbing z-10 group ${
                  selectedNodeId === node.id 
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 z-20' 
                    : 'hover:border-opacity-80'
                } ${getNodeColor(node)} ${
                  viewMode !== '质量视图' && node.status === '风险' ? 'border-amber-500/80 shadow-amber-500/10' : 
                  viewMode !== '质量视图' && node.status === '未知' ? 'border-slate-600 border-dashed' : 
                  'border-opacity-40'
                } ${
                  viewMode === '故事视图' ? 'shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''
                }`}
              >
                {/* Node Header */}
                <div className="p-3 flex items-center justify-between border-b border-black/10">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <div className={`p-1 rounded-md ${
                      node.status === '风险' && viewMode !== '质量视图' ? 'bg-amber-500/20 text-amber-400' : 'bg-black/20'
                    }`}>
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="font-semibold text-sm truncate">{node.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {viewMode === '依赖视图' && edges.some(e => e.source === node.id) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setNodes(prev => prev.map(n => n.id === node.id ? { ...n, collapsed: !n.collapsed } : n)); }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 transition-colors"
                      >
                        {node.collapsed ? <Plus size={12} /> : <Minus size={12} />}
                      </button>
                    )}
                    {viewMode === '质量视图' && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        (node.riskScore || 0) > 70 ? 'bg-red-500/20 text-red-300' :
                        (node.riskScore || 0) > 30 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {node.riskScore}
                      </span>
                    )}
                    {viewMode !== '质量视图' && node.status === '风险' && <AlertTriangle size={12} className="text-amber-500" />}
                    {viewMode !== '质量视图' && node.status === '未知' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                  </div>
                </div>

                {/* Node Body (Details) */}
                <div className="p-3 space-y-1.5 bg-black/20">
                  {node.details && Object.entries(node.details).slice(0, node.expanded ? undefined : 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-[10px] items-center">
                      <span className="text-slate-400 opacity-80">{key}</span>
                      <span className="font-mono opacity-60">{value}</span>
                    </div>
                  ))}
                  
                  {/* Expand Indicator */}
                  {!node.expanded && node.details && Object.keys(node.details).length > 2 && (
                    <div className="pt-1 flex justify-center">
                      <MoreHorizontal size={12} className="text-slate-500 opacity-50" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Minimap */}
          <div className="absolute bottom-6 left-6 z-20 w-48 h-32 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            <div className="w-full h-full relative" style={{ transform: 'scale(0.15)', transformOrigin: 'top left' }}>
              {nodes.filter(n => !hiddenNodeIds.has(n.id)).map(node => (
                <div 
                  key={`mini-${node.id}`} 
                  className={`absolute w-[200px] h-[80px] rounded-xl ${getNodeColor(node).split(' ')[0]} bg-current opacity-50`}
                  style={{ left: node.x, top: node.y }}
                />
              ))}
              {/* Viewport Indicator */}
              <div 
                className="absolute border-2 border-indigo-500 bg-indigo-500/10 rounded"
                style={{ 
                  left: -pan.x, 
                  top: -pan.y, 
                  width: 1200 / zoom, // Approximate viewport width
                  height: 800 / zoom // Approximate viewport height
                }}
              />
            </div>
          </div>

          {/* Time Slider Overlay (Moved inside Canvas) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-3 shadow-2xl flex items-center space-x-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex-shrink-0"
              >
                {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
              </button>
              
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                  <span>v1.0.0 (Jan 2024)</span>
                  <span className="text-indigo-400 font-bold">v2.4.0 (Current)</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={timeValue} 
                  onChange={(e) => setTimeValue(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              
              <div className="flex items-center space-x-1 text-slate-400">
                <button className="p-1 hover:text-white"><SkipBack size={16} /></button>
                <button className="p-1 hover:text-white"><SkipForward size={16} /></button>
              </div>
            </div>
          </div>
          {/* Floating Canvas Controls */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col space-y-2">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-1 shadow-xl flex flex-col">
              <button onClick={handleZoomIn} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="放大">
                <ZoomIn size={18} />
              </button>
              <div className="text-xs text-center text-slate-500 font-mono py-1 select-none">{Math.round(zoom * 100)}%</div>
              <button onClick={handleZoomOut} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="缩小">
                <ZoomOut size={18} />
              </button>
              <div className="h-px w-full bg-slate-700 my-1"></div>
              <button onClick={handleFitScreen} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="适应屏幕">
                <Maximize size={18} />
              </button>
            </div>
          </div>

          {/* Context Menu */}
          <AnimatePresence>
            {contextMenu && contextMenu.show && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed z-50 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 overflow-hidden"
                style={{ left: contextMenu.x, top: contextMenu.y }}
              >
                <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center space-x-2">
                  <Plus size={14} /> <span>新建节点</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center space-x-2">
                  <LayoutTemplate size={14} /> <span>自动布局</span>
                </button>
                <div className="h-px w-full bg-slate-800 my-1"></div>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center space-x-2">
                  <Download size={14} /> <span>导出为图片</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Inspector */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl"
            >
              {/* AI Copilot Header */}
              <div className="p-4 bg-indigo-900/20 border-b border-indigo-500/30">
                <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                  <Sparkles size={16} />
                  <span className="font-semibold text-sm">AI Copilot</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group border border-slate-700 hover:border-indigo-500/50">
                    <MessageCircleQuestion size={16} className="text-slate-400 group-hover:text-indigo-400 mb-1" />
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-200">解释</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group border border-slate-700 hover:border-emerald-500/50">
                    <PenLine size={16} className="text-slate-400 group-hover:text-emerald-400 mb-1" />
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-200">建议</span>
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowFixOptions(!showFixOptions)}
                      className="w-full flex flex-col items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group border border-slate-700 hover:border-amber-500/50"
                    >
                      <Wrench size={16} className="text-slate-400 group-hover:text-amber-400 mb-1" />
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-200">修复</span>
                    </button>
                    {showFixOptions && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-1">
                        <div className="text-[10px] text-slate-500 px-2 py-1 uppercase font-semibold">修复路径</div>
                        <button className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white rounded flex items-center">
                          <FileText size={12} className="mr-2 text-blue-400" /> 补标准
                        </button>
                        <button className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white rounded flex items-center">
                          <Database size={12} className="mr-2 text-slate-400" /> 补样本
                        </button>
                        <button className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white rounded flex items-center">
                          <Activity size={12} className="mr-2 text-emerald-400" /> 调阈值
                        </button>
                        <button className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white rounded flex items-center">
                          <Bookmark size={12} className="mr-2 text-amber-400" /> 入队待办
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Node Header */}
              <div className="p-4 border-b border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    {selectedNode.label}
                  </h2>
                  <button onClick={() => setSelectedNodeId(null)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">{selectedNode.type}</span>
                  <span className={`px-2 py-0.5 rounded border font-medium flex items-center ${
                    selectedNode.status === '风险' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    selectedNode.status === '未知' ? 'bg-slate-700 text-slate-400 border-slate-600' : 
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {selectedNode.status === '风险' && <AlertTriangle size={10} className="mr-1" />}
                    {selectedNode.status === '健康' && <CheckCircle2 size={10} className="mr-1" />}
                    {selectedNode.status || '健康'}
                  </span>
                  <span className="text-slate-500 font-mono">v1.2</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                {['属性', '关系', '断言', '证据', '运行'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as InspectorTab)}
                    className={`flex-1 py-3 text-xs font-medium transition-colors relative ${
                      activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === '属性' && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="text-xs font-medium text-slate-500 uppercase mb-3 flex items-center">
                        <Database size={12} className="mr-1.5" />
                        基础属性
                      </div>
                      <div className="space-y-3">
                        {selectedNode.details && Object.entries(selectedNode.details).map(([key, value]) => (
                          <div key={key} className="group">
                            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">{key}</label>
                            <input 
                              type="text" 
                              defaultValue={value} 
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                            />
                          </div>
                        ))}
                        <div className="group">
                          <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">描述</label>
                          <textarea 
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-colors h-20 resize-none"
                            defaultValue="销售系统中代表客户订单的核心业务实体。"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === '关系' && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="text-xs font-medium text-slate-500 uppercase mb-3 flex items-center">
                        <Link size={12} className="mr-1.5" />
                        入边
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-700 hover:border-indigo-500/50 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                            <span className="text-xs text-slate-300">Source_System_A</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">数据流</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="text-xs font-medium text-slate-500 uppercase mb-3 flex items-center">
                        <Link size={12} className="mr-1.5" />
                        出边
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-700 hover:border-indigo-500/50 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-slate-300">Sales_Report_Daily</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">依赖</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === '断言' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-medium text-emerald-400">数据质量检查</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 rounded">通过</span>
                      </div>
                      <p className="text-xs text-slate-400">主键 'id' 的空值检查已通过。</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-medium text-amber-400">业务规则</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 rounded">警告</span>
                      </div>
                      <p className="text-xs text-slate-400">总金额超过日均值的 200%。</p>
                      <button className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center">
                        <Wrench size={10} className="mr-1" /> 修复建议
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === '证据' && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded transition-colors">
                      <div className="mt-0.5"><FileSearch size={14} className="text-indigo-400" /></div>
                      <div>
                        <div className="text-xs font-medium text-slate-200">数据概况扫描</div>
                        <div className="text-[10px] text-slate-500">已扫描 1.2M 行 • 2 小时前</div>
                        <div className="mt-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-3/4"></div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">贡献度: 75%</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-2 hover:bg-slate-800 rounded transition-colors">
                      <div className="mt-0.5"><User size={14} className="text-slate-400" /></div>
                      <div>
                        <div className="text-xs font-medium text-slate-200">人工标注</div>
                        <div className="text-[10px] text-slate-500">由数据管家 • 1 天前</div>
                        <div className="mt-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-500 w-1/4"></div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">贡献度: 25%</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === '运行' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 hover:bg-slate-800 rounded transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-emerald-500/20 rounded text-emerald-400"><PlayCircle size={12} /></div>
                        <div>
                          <div className="text-xs font-medium text-slate-200">日常同步</div>
                          <div className="text-[10px] text-slate-500">成功 • 10 分钟前</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">240ms</span>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-slate-800 rounded transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-red-500/20 rounded text-red-400"><AlertTriangle size={12} /></div>
                        <div>
                          <div className="text-xs font-medium text-slate-200">质量检查</div>
                          <div className="text-[10px] text-slate-500">失败 • 2 小时前</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">1.2s</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500 flex-shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-400">已连接</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <span>节点: {nodes.length}</span>
          <span>关系: {edges.length}</span>
          <div className="h-3 w-px bg-slate-800" />
          <span>选中: {selectedNodeId || '无'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsChangeSetOpen(!isChangeSetOpen)}
            className={`flex items-center space-x-2 px-2 py-0.5 rounded transition-colors ${isChangeSetOpen ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-slate-800 hover:text-slate-300'}`}
          >
            <GitPullRequest size={12} />
            <span>变更集 (4)</span>
            {isChangeSetOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
          <div className="h-3 w-px bg-slate-800" />
          <span>上次同步: 10:42 AM</span>
        </div>
      </div>

      {/* ChangeSet Drawer */}
      <AnimatePresence>
        {isChangeSetOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-8 left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-2xl z-40 flex flex-col max-h-[50vh]"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <GitPullRequest size={18} />
                  <span className="font-semibold text-sm">变更集</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
                  4 待处理
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {changeSetStep === '审查' && (
                  <>
                    <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <Trash2 size={14} />
                      <span>舍弃</span>
                    </button>
                    <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                      <Download size={14} />
                      <span>导出</span>
                    </button>
                    <button 
                      onClick={handleApplyChanges}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      <Send size={14} />
                      <span>应用变更</span>
                    </button>
                  </>
                )}
                {changeSetStep === '结果' && (
                  <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={14} />
                    <span>{networkMode === 'DKN' ? '发布 Package' : networkMode === 'PKN' ? 'Promote' : '发布'}</span>
                  </button>
                )}
                <button onClick={() => setIsChangeSetOpen(false)} className="p-1.5 text-slate-500 hover:text-white rounded hover:bg-slate-800 ml-2">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-0 bg-slate-950/50">
              {changeSetStep === '审查' && (
                <div className="divide-y divide-slate-800">
                  {changes.map(change => (
                    <div key={change.id} className="flex items-center px-4 py-3 hover:bg-slate-900/50 transition-colors group">
                      <div className="w-8 flex justify-center mr-3">
                        {change.action === '新增' && <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Plus size={14} /></div>}
                        {change.action === '修改' && <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center"><PenLine size={14} /></div>}
                        {change.action === '重载' && <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center"><Shield size={14} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-0.5">
                          <span className="text-xs font-medium text-slate-200">{change.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{change.type}</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">{change.desc}</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 underline">差异</button>
                        <button className="p-1 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {changeSetStep === '校验中' && (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <RefreshCw size={32} className="text-indigo-500 animate-spin" />
                  <div className="text-sm text-slate-300 font-medium">校验变更中...</div>
                  <div className="text-xs text-slate-500">正在运行架构检查和一致性分析</div>
                </div>
              )}

              {changeSetStep === '结果' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {validationResults.map(result => (
                    <div key={result.id} className={`p-4 rounded-xl border ${
                      result.status === '通过' ? 'bg-emerald-500/5 border-emerald-500/20' :
                      result.status === '失败' ? 'bg-red-500/5 border-red-500/20' :
                      'bg-amber-500/5 border-amber-500/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {result.status === '通过' && <CheckCircle2 size={18} className="text-emerald-500" />}
                          {result.status === '失败' && <AlertOctagon size={18} className="text-red-500" />}
                          {result.status === '警告' && <AlertTriangle size={18} className="text-amber-500" />}
                          <span className={`text-sm font-semibold ${
                            result.status === '通过' ? 'text-emerald-400' :
                            result.status === '失败' ? 'text-red-400' :
                            'text-amber-400'
                          }`}>{result.label}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          result.status === '通过' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          result.status === '失败' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>{result.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{result.message}</p>
                      {result.status !== '通过' && (
                        <button className="text-xs flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition-colors">
                          <Wrench size={12} />
                          <span>查看修复建议</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
