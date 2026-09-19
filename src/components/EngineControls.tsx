import React from 'react';
import { Volume2, VolumeX, ShieldCheck, PauseCircle, PlayCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface EngineControlsProps {
  isWheelSpinning: boolean;
  claimThresholdETH: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  tokenAddress?: string;
}

export const EngineControls: React.FC<EngineControlsProps> = ({
  isWheelSpinning,
  claimThresholdETH,
  soundEnabled,
  onToggleSound,
  tokenAddress,
}) => {
  const isConfigured = Boolean(
    tokenAddress &&
    tokenAddress.toLowerCase() !== 'none' &&
    tokenAddress.startsWith('0x') &&
    tokenAddress.length === 42
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#151c27] sketch-box">
      {/* Live Engine Status based on fee availability */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-3.5 w-3.5">
          {!isConfigured ? (
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-500" />
          ) : isWheelSpinning ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-sketch font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
              {!isConfigured ? (
                <>
                  <PauseCircle className="w-4 h-4 text-slate-400 inline" />
                  <span className="text-slate-300">WHEEL STOPPED (UNCONFIGURED)</span>
                </>
              ) : isWheelSpinning ? (
                <>
                  <PlayCircle className="w-4 h-4 text-emerald-400 inline" />
                  <span className="text-emerald-400">FLYWHEEL WHEEL SPINNING</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-400 inline" />
                  <span className="text-amber-300">WHEEL STOPPED (STANDBY)</span>
                </>
              )}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
              {!isConfigured ? 'PAUSED' : 'REACTIVE MODE'}
            </span>
          </div>
          <p className="font-hand text-xs text-slate-400 mt-0.5">
            {!isConfigured
              ? 'Token address is not configured (None). Engine will not spin until token contract is deployed.'
              : isWheelSpinning
              ? 'Claimable fee detected in Escrow. Executing full Buyback & Burn cycle...'
              : `Wheel pauses when idle. Automatically spins once accumulated fee reaches ≥ ${claimThresholdETH} ETH.`}
          </p>
        </div>
      </div>

      {/* Visitor preferences & On-chain check */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs font-hand text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Pons Escrow Monitored</span>
        </div>

        {/* Audio Effects Toggle */}
        <button
          onClick={() => {
            sounds.enabled = !soundEnabled;
            onToggleSound();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer shadow-[2px_2px_0px_#000] transition-colors text-xs font-sketch ${
            soundEnabled
              ? 'bg-[#1e293b] text-amber-300 border-slate-600 hover:bg-slate-700'
              : 'bg-[#111722] text-slate-500 border-slate-800 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'FX On' : 'Muted'}</span>
        </button>
      </div>
    </div>
  );
};
