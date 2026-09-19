import React from 'react';
import { EnginePhase } from '../types';
import { Coins, ShoppingCart, Flame, TrendingUp, Sparkles, Check, PauseCircle, PlayCircle } from 'lucide-react';

interface FlywheelWheelProps {
  currentPhase: EnginePhase;
  phaseProgress: number;
  isWheelSpinning: boolean;
  cycleCount: number;
  currentEscrowBalanceETH: number;
  claimThresholdETH: number;
  lastActionText: string;
  onSelectPhase?: (phase: EnginePhase) => void;
  tokenAddress?: string;
}

interface PhaseDefinition {
  id: EnginePhase;
  num: string;
  title: string;
  subtitle: string;
  contractDetail: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  angle: number;
  themeColor: string;
  markerClass: string;
}

const PHASES: PhaseDefinition[] = [
  {
    id: 'accumulate',
    num: '01',
    title: 'Trade & Tax Inflow',
    subtitle: 'Accumulating trading fee in Escrow',
    contractDetail: 'Pons Curve Trading Tax',
    icon: TrendingUp,
    angle: 0,
    themeColor: '#38bdf8',
    markerClass: 'bg-sky-400/20 text-sky-300 border-sky-400/50'
  },
  {
    id: 'claim',
    num: '02',
    title: 'Auto-Claim Fee',
    subtitle: 'Withdrawing ETH from Fee Escrow',
    contractDetail: '0xd3AFEB...Ac9e -> claim()',
    icon: Coins,
    angle: 90,
    themeColor: '#fbbf24',
    markerClass: 'bg-amber-400/20 text-amber-300 border-amber-400/50'
  },
  {
    id: 'buyback',
    num: '03',
    title: 'Auto-Buyback DEX',
    subtitle: 'Market buy token with claimed ETH',
    contractDetail: 'curve.buy{value: fee}()',
    icon: ShoppingCart,
    angle: 180,
    themeColor: '#34d399',
    markerClass: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/50'
  },
  {
    id: 'burn',
    num: '04',
    title: 'Burn to Dead Address',
    subtitle: 'Destroying bought supply in Dead Sink',
    contractDetail: 'transfer(0x000...dEaD)',
    icon: Flame,
    angle: 270,
    themeColor: '#f43f5e',
    markerClass: 'bg-rose-400/20 text-rose-300 border-rose-400/50'
  }
];

export const FlywheelWheel: React.FC<FlywheelWheelProps> = ({
  currentPhase,
  phaseProgress,
  isWheelSpinning,
  cycleCount,
  currentEscrowBalanceETH,
  claimThresholdETH,
  lastActionText,
  onSelectPhase,
  tokenAddress,
}) => {
  const isConfigured = Boolean(
    tokenAddress &&
    tokenAddress.toLowerCase() !== 'none' &&
    tokenAddress.startsWith('0x') &&
    tokenAddress.length === 42
  );

  const activeIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const activePhaseDef = PHASES[activeIndex] || PHASES[0];

  // The indicator points squarely to the active phase's angle
  const dynamicAngle = activePhaseDef.angle;

  return (
    <div className="relative p-3 xs:p-4 sm:p-8 bg-[#151c27] sketch-box flex flex-col items-center justify-center overflow-hidden">
      {/* Hand-drawn banner on top */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 text-[10px] sm:text-xs font-sketch font-bold tracking-wider rounded -rotate-1 shadow-sm border whitespace-nowrap ${
          !isConfigured
            ? 'bg-slate-800 text-slate-300 border-slate-600'
            : isWheelSpinning
            ? 'bg-emerald-400 text-slate-950 border-emerald-500 shadow-emerald-500/20 animate-pulse'
            : 'bg-[#fef08a] text-[#713f12] border-[#eab308]'
        }`}
      >
        {!isConfigured
          ? '⏸ ENGINE IDLE: TOKEN ADDRESS IS NOT SET'
          : isWheelSpinning
          ? '⚡ FEE DETECTED: WHEEL IS SPINNING ⚡'
          : '⏸ WHEEL STOPPED: AWAITING CLAIMABLE FEES'}
      </div>

      {/* Blueprint Header */}
      <div className="w-full flex items-center justify-between mb-3 mt-1 border-b-2 border-dashed border-slate-700 pb-2 sm:pb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center">
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                !isConfigured ? 'bg-slate-600' : isWheelSpinning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
          </span>
          <span className="font-sketch font-bold text-[10px] sm:text-xs uppercase tracking-wider text-slate-300">
            {!isConfigured ? (
              <span className="text-slate-400">STATUS: IDLE (AWAITING TOKEN)</span>
            ) : isWheelSpinning ? (
              <span className="text-emerald-400">
                STATUS: WHEEL RUNNING (CLAIM &rarr; BUY &rarr; BURN)
              </span>
            ) : (
              <span className="text-amber-300">
                STATUS: WHEEL STOPPED (WAITING FOR TAX)
              </span>
            )}
          </span>
        </div>

        <div className="font-doodle text-sm sm:text-lg text-amber-300 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Cycles: <strong>#{cycleCount}</strong></span>
        </div>
      </div>

      {/* THE HAND-DRAWN WHEEL */}
      <div className="relative w-[290px] xs:w-[340px] sm:w-[440px] h-[290px] xs:h-[340px] sm:h-[440px] flex items-center justify-center my-2 sm:my-4 transition-all">
        {/* Hand-drawn SVG Blueprint Wheel Tracks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 440 440">
          {/* Outer circle */}
          <path
            d="M 220, 30 
               C 325, 28, 412, 115, 410, 220 
               C 408, 325, 325, 412, 220, 410 
               C 115, 408, 28, 325, 30, 220 
               C 32, 115, 115, 32, 220, 30 Z"
            fill="none"
            stroke={isWheelSpinning ? '#475569' : '#334155'}
            strokeWidth="2.5"
            strokeDasharray={isWheelSpinning ? '8 4' : '4 8'}
            className={isWheelSpinning ? 'animate-spin-slow' : ''}
          />

          {/* Inner circle */}
          <path
            d="M 220, 65 
               C 305, 63, 375, 133, 375, 220 
               C 375, 305, 305, 375, 220, 375 
               C 133, 375, 65, 305, 65, 220 
               C 65, 133, 135, 67, 220, 65 Z"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Active Highlight Arc */}
          <circle
            cx="220"
            cy="220"
            r="155"
            fill="none"
            stroke={activePhaseDef.themeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="230 740"
            strokeDashoffset={-((activePhaseDef.angle / 360) * 970) + 230}
            className="transition-all duration-700 ease-out opacity-90"
          />

          {/* Squiggly flow curved doodle arrows between phases */}
          <path d="M 280, 80 Q 350, 110 360, 160" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 355, 155 L 360, 165 L 368, 158" fill="none" stroke="#475569" strokeWidth="2" />

          <path d="M 360, 280 Q 340, 350 280, 360" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 288, 355 L 278, 360 L 285, 368" fill="none" stroke="#475569" strokeWidth="2" />

          <path d="M 160, 360 Q 90, 340 80, 280" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 85, 285 L 80, 275 L 72, 282" fill="none" stroke="#475569" strokeWidth="2" />

          <path d="M 80, 160 Q 100, 90 160, 80" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 152, 85 L 162, 80 L 155, 72" fill="none" stroke="#475569" strokeWidth="2" />
        </svg>

        {/* HAND-DRAWN COMPASS NEEDLE / POINTER */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-700 ease-in-out"
          style={{ transform: `rotate(${dynamicAngle}deg)` }}
        >
          <div className="absolute top-[20px] xs:top-[24px] sm:top-[28px] w-2 sm:w-2.5 h-[100px] xs:h-[120px] sm:h-[150px] flex flex-col items-center justify-start origin-bottom">
            {/* Arrow Needle Head */}
            <div
              className={`w-0 h-0 border-l-[7px] sm:border-l-[9px] border-l-transparent border-r-[7px] sm:border-r-[9px] border-r-transparent border-b-[14px] sm:border-b-[18px] drop-shadow-md ${
                isWheelSpinning ? 'animate-bounce' : ''
              }`}
              style={{ borderBottomColor: activePhaseDef.themeColor }}
            />
            {/* Needle Line */}
            <div
              className="w-1 sm:w-1.5 flex-1 rounded-full opacity-90"
              style={{
                background: `linear-gradient(to bottom, ${activePhaseDef.themeColor}, transparent)`,
              }}
            />
          </div>
        </div>

        {/* 4 HAND-DRAWN STAGE NODES */}
        {PHASES.map((phase) => {
          const isActive = phase.id === currentPhase;
          const Icon = phase.icon;

          let posStyle = '';
          if (phase.angle === 0) posStyle = 'top-0 left-1/2 -translate-x-1/2 -translate-y-2 sm:-translate-y-3';
          if (phase.angle === 90) posStyle = 'top-1/2 right-0 translate-x-2 sm:translate-x-3 -translate-y-1/2';
          if (phase.angle === 180) posStyle = 'bottom-0 left-1/2 -translate-x-1/2 translate-y-2 sm:translate-y-3';
          if (phase.angle === 270) posStyle = 'top-1/2 left-0 -translate-x-2 sm:-translate-x-3 -translate-y-1/2';

          return (
            <button
              key={phase.id}
              onClick={() => onSelectPhase && onSelectPhase(phase.id)}
              className={`absolute ${posStyle} z-20 flex flex-col items-center cursor-pointer transition-all duration-500 group`}
            >
              <div
                className={`relative flex items-center justify-center w-11 h-11 xs:w-13 xs:h-13 sm:w-16 sm:h-16 sketch-btn transition-all duration-300 ${
                  isActive
                    ? 'bg-[#1e293b] scale-110 shadow-lg text-white border-2'
                    : 'bg-[#151c27] text-slate-400 hover:text-slate-200 border border-slate-700 opacity-80'
                }`}
                style={{
                  borderColor: isActive ? phase.themeColor : '#334155',
                  boxShadow: isActive ? `0 0 18px ${phase.themeColor}60` : undefined,
                }}
              >
                {isActive && (
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shadow">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                  </span>
                )}

                <Icon
                  className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 transition-colors"
                  style={{ color: isActive ? phase.themeColor : undefined }}
                />
              </div>

              <div
                className={`mt-1 sm:mt-1.5 px-1.5 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[11px] font-sketch font-bold tracking-wide transition-all whitespace-nowrap ${
                  isActive
                    ? `${phase.markerClass} border scale-105 shadow-sm`
                    : 'text-slate-400 bg-slate-900/80 border border-slate-800'
                }`}
              >
                {phase.num}. {phase.title}
              </div>
            </button>
          );
        })}

        {/* CENTER MECHANICAL CORE */}
        <div className="relative z-10 w-36 xs:w-44 sm:w-56 h-36 xs:h-44 sm:h-56 rounded-full bg-[#18202c] border-2 border-slate-600 sketch-circle flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 text-center shadow-xl">
          {!isConfigured ? (
            <>
              {/* UNCONFIGURED / IDLE DISPLAY */}
              <div className="flex items-center gap-1 text-[11px] font-sketch text-slate-400 uppercase tracking-wider mb-0.5">
                <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>ENGINE IDLE</span>
              </div>

              <h3 className="font-sketch text-xs sm:text-sm font-bold text-slate-200 leading-tight mt-0.5">
                CA Not Configured (None)
              </h3>

              <div className="mt-2 text-center px-2">
                <div className="font-mono text-xs font-bold text-amber-400/80">
                  Wheel Halted
                </div>
                <div className="font-hand text-[11px] text-slate-400 mt-1 leading-snug">
                  Waiting for token contract deployment to activate engine
                </div>
              </div>

              <div className="w-32 sm:w-36 bg-slate-900 border border-slate-800 rounded-full h-2 mt-3 overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-slate-700 w-0" />
              </div>
            </>
          ) : !isWheelSpinning ? (
            <>
              {/* STOPPED / IDLE DISPLAY */}
              <div className="flex items-center gap-1 text-[11px] font-sketch text-slate-400 uppercase tracking-wider mb-0.5">
                <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>WHEEL STOPPED</span>
              </div>

              <h3 className="font-sketch text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">
                No Claimable Fee Yet
              </h3>

              {/* Fee Accumulation Gauge */}
              <div className="mt-2 text-center">
                <div className="font-mono text-sm sm:text-base font-black text-amber-300">
                  {currentEscrowBalanceETH.toFixed(4)} / {claimThresholdETH.toFixed(4)} ETH
                </div>
                <div className="font-hand text-[11px] text-slate-400">
                  Fee Escrow ({phaseProgress}% to trigger)
                </div>
              </div>

              {/* Progress bar of fee threshold */}
              <div className="w-32 sm:w-36 bg-slate-900 border border-slate-700 rounded-full h-2 mt-2 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-400 to-amber-400"
                  style={{ width: `${phaseProgress}%` }}
                />
              </div>

              <span className="font-doodle text-[11px] text-slate-400 mt-2">
                Wheel starts when fee reaches {claimThresholdETH} ETH
              </span>
            </>
          ) : (
            <>
              {/* SPINNING / EXECUTING STATE */}
              <div className="flex items-center gap-1 text-[10px] font-sketch font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-1 animate-pulse"
                style={{
                  borderColor: activePhaseDef.themeColor,
                  color: activePhaseDef.themeColor,
                  backgroundColor: `${activePhaseDef.themeColor}15`,
                }}
              >
                <PlayCircle className="w-3 h-3" />
                <span>WHEEL SPINNING</span>
              </div>

              <h3 className="font-sketch text-sm sm:text-base font-bold text-white leading-tight">
                {activePhaseDef.title}
              </h3>

              <p className="font-doodle text-xs text-slate-300 mt-1 line-clamp-1 px-2">
                {activePhaseDef.subtitle}
              </p>

              <div className="w-32 sm:w-36 bg-slate-900 border border-slate-700 rounded-full h-2 mt-3 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: '100%',
                    backgroundColor: activePhaseDef.themeColor,
                  }}
                />
              </div>

              <span className="font-mono text-[10px] text-amber-300 mt-1.5 animate-pulse">
                STAGE {activePhaseDef.num}/04 EXECUTING...
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Banner */}
      <div className="w-full max-w-xl mt-3 p-3 bg-[#111722] border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-sketch text-amber-400 text-sm">▶</span>
          <span className="font-hand text-slate-300 text-sm truncate">
            Current Action: <span className="text-white font-bold">{lastActionText}</span>
          </span>
        </div>

        <div className="shrink-0 font-mono text-xs text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800">
          Escrow: <strong>{currentEscrowBalanceETH.toFixed(4)} ETH</strong>
        </div>
      </div>

      {/* 4-Step Cycle Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl mt-3 font-sketch text-[11px]">
        {PHASES.map((p) => (
          <div
            key={p.id}
            className={`p-2 rounded-lg border text-center transition-all ${
              p.id === currentPhase && isWheelSpinning
                ? 'bg-slate-800 border-amber-400 text-amber-300 font-bold shadow'
                : 'bg-slate-900/50 border-slate-800 text-slate-400'
            }`}
          >
            <div>STEP {p.num}</div>
            <div className="text-[10px] font-hand truncate">{p.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
