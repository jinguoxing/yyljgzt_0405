import React, { useEffect, useState } from 'react';
import { 
  GitCommit, RotateCcw, CheckCircle, Clock, FileText, 
  Layers, Database, ArrowRight, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SemanticApi, Release } from '@/services/semanticApi';

export default function SemanticReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  useEffect(() => {
    SemanticApi.getReleases().then(res => {
      setReleases(res.items);
      if (res.items.length > 0) setSelectedRelease(res.items[0]);
    });
  }, []);

  return (
    <div className="h-full flex space-x-4 overflow-hidden p-4 lg:p-6 bg-slate-950">
      {/* Left List */}
      <div className="w-1/3 min-w-[320px] flex flex-col bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">发布历史</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {releases.map(release => (
            <div
              key={release.releaseId}
              onClick={() => setSelectedRelease(release)}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all group",
                selectedRelease?.releaseId === release.releaseId
                  ? "bg-indigo-900/20 border-indigo-500/50 shadow-md"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-sm text-slate-200 font-medium">{release.lvName}</span>
                <StatusBadge status={release.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{release.snapshotVersion}</span>
                <span>{new Date(release.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-3 flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  <ShieldCheck size={10} />
                  <span>覆盖率: {(release.gateSnapshot.coverage * 100).toFixed(0)}%</span>
                </div>
                {release.gateSnapshot.must > 0 && (
                  <div className="flex items-center space-x-1 text-[10px] text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/30">
                    <AlertCircle size={10} />
                    <span>阻断: {release.gateSnapshot.must}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detail */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        {selectedRelease ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur">
              <div>
                <h1 className="text-xl font-semibold text-slate-100 flex items-center space-x-3">
                  <span>{selectedRelease.lvName}</span>
                  <span className="text-sm font-normal text-slate-500 font-mono px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
                    {selectedRelease.snapshotVersion}
                  </span>
                </h1>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                  <span>发布人: {selectedRelease.createdBy}</span>
                  <span>•</span>
                  <span>{new Date(selectedRelease.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {selectedRelease.status === 'PREVIEWED' && (
                  <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-green-900/20">
                    <GitCommit size={16} />
                    <span>确认发布</span>
                  </button>
                )}
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors border border-slate-700">
                  <RotateCcw size={16} />
                  <span>回滚</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Gate Snapshot Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <ShieldCheck size={16} />
                  <span>门禁快照</span>
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">必须修复 (Must)</span>
                    <span className={cn("text-2xl font-bold mt-1", selectedRelease.gateSnapshot.must > 0 ? "text-red-400" : "text-green-400")}>
                      {selectedRelease.gateSnapshot.must}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">语义覆盖率</span>
                    <span className="text-2xl font-bold text-slate-200 mt-1">
                      {(selectedRelease.gateSnapshot.coverage * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">风险等级</span>
                    <span className={cn("text-2xl font-bold mt-1", 
                      selectedRelease.gateSnapshot.riskLevel === 'HIGH' ? "text-red-400" : 
                      selectedRelease.gateSnapshot.riskLevel === 'MEDIUM' ? "text-yellow-400" : "text-green-400"
                    )}>
                      {selectedRelease.gateSnapshot.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Release Note / Diff */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <FileText size={16} />
                    <span>变更日志</span>
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">语义定义</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-green-400 text-xs font-mono">+12</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">映射关系</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-yellow-400 text-xs font-mono">~3</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">对象定义</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 text-xs font-mono">0</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Layers size={16} />
                    <span>影响范围</span>
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">下游报表</span>
                      <span className="text-slate-200 font-mono">16</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">数据产品</span>
                      <span className="text-slate-200 font-mono">2</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Artifacts */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Database size={16} />
                  <span>冻结资产</span>
                </h3>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>所有资产 (字段, 映射, 对象) 已在快照 <span className="font-mono text-slate-300">{selectedRelease.snapshotVersion}</span> 中冻结。</span>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            选择一个版本查看详情
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PREVIEWED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PUBLISHED: "bg-green-500/10 text-green-400 border-green-500/20",
    ROLLED_BACK: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  const labels: any = {
    PREVIEWED: "预览中",
    PUBLISHED: "已发布",
    ROLLED_BACK: "已回滚",
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide", (styles as any)[status])}>
      {labels[status] || status}
    </span>
  );
}

