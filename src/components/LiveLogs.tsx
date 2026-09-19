import React from 'react';
import { ActivityLog } from '../types';
import { Terminal, CheckCircle } from 'lucide-react';

interface LiveLogsProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="bg-[#151c27] sketch-box overflow-hidden flex flex-col h-[320px]">
      {/* Blueprint Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111722] border-b-2 border-dashed border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="font-sketch text-xs tracking-wider text-slate-200">
            TRANSACTION & EXECUTION TERMINAL
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Robinhood Chain (ID: 4663)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-[11px] font-hand text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              [Clear]
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 bg-[#0d1219]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center font-doodle text-base text-slate-500 italic">
            Waiting for transactions... Press "Start Machine" to initiate the cycle.
          </div>
        ) : (
          logs.map((log) => {
            let badgeColor = 'text-sky-400 border-sky-800 bg-sky-950/60';
            if (log.phase === 'claim') badgeColor = 'text-amber-400 border-amber-800 bg-amber-950/60';
            if (log.phase === 'buyback') badgeColor = 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
            if (log.phase === 'burn') badgeColor = 'text-rose-400 border-rose-800 bg-rose-950/60';

            return (
              <div
                key={log.id}
                className="p-2 rounded bg-[#151c27] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
              >
                <div className="flex items-start sm:items-center gap-2 overflow-hidden">
                  <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-slate-300 font-medium truncate font-hand text-sm">
                    {log.details}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-[10px] self-end sm:self-auto text-slate-400">
                  {log.contractTarget && (
                    <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-400">
                      {log.contractTarget}
                    </span>
                  )}
                  <span className="font-mono text-slate-500">
                    tx: {log.txHash.substring(0, 6)}...{log.txHash.substring(log.txHash.length - 4)}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
