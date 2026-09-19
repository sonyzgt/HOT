import React from 'react';
import { FlywheelState } from '../types';
import { Coins, ShoppingBag, Flame, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface MetricsOverviewProps {
  state: FlywheelState;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ state }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
      {/* 1. TOTAL FEES CLAIMED */}
      <div className="p-2.5 sm:p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-[10px] sm:text-xs text-amber-400 uppercase tracking-wider truncate mr-1">
            Total Fees Claimed
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-lg xs:text-xl sm:text-2xl font-black text-white">
              {state.totalFeesClaimedETH.toFixed(4)}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-amber-400">ETH</span>
          </div>
          <div className="font-hand text-[10px] sm:text-xs text-slate-400 truncate">
            ≈ ${formatNumber(state.totalFeesClaimedUSD)} USD
          </div>
        </div>

        <div className="pt-1.5 sm:pt-2 border-t-2 border-dashed border-slate-700/80 flex items-center justify-between font-mono text-[9px] sm:text-[11px] text-slate-400">
          <span className="hidden xs:inline">Escrow:</span>
          <span className="text-amber-300 font-bold truncate">
            {state.currentEscrowBalanceETH.toFixed(4)} ETH
          </span>
        </div>
      </div>

      {/* 2. TOTAL BUYBACK */}
      <div className="p-2.5 sm:p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-[10px] sm:text-xs text-emerald-400 uppercase tracking-wider truncate mr-1">
            Buyback Volume
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-lg xs:text-xl sm:text-2xl font-black text-white">
              {formatNumber(state.totalTokensBoughtBack)}
            </span>
          </div>
          <div className="font-hand text-[10px] sm:text-xs text-emerald-400 flex items-center gap-0.5 truncate">
            <ArrowUpRight className="w-3 h-3 shrink-0" />
            <span className="truncate">Constant DEX Pressure</span>
          </div>
        </div>

        <div className="pt-1.5 sm:pt-2 border-t-2 border-dashed border-slate-700/80 flex items-center justify-between font-mono text-[9px] sm:text-[11px] text-slate-400">
          <span className="hidden xs:inline">Price:</span>
          <span className="text-emerald-300 font-bold truncate">
            ${state.tokenPriceUSD.toFixed(6)}
          </span>
        </div>
      </div>

      {/* 3. TOTAL TOKENS BURNED */}
      <div className="p-2.5 sm:p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-[10px] sm:text-xs text-rose-400 uppercase tracking-wider truncate mr-1">
            Tokens Burned 🔥
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-rose-400/20 text-rose-300 border border-rose-400/40 flex items-center justify-center shrink-0">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-lg xs:text-xl sm:text-2xl font-black text-rose-400">
              {formatNumber(state.totalTokensBurned)}
            </span>
          </div>
          <div className="font-hand text-[10px] sm:text-xs text-slate-400 truncate">
            To Dead Address
          </div>
        </div>

        {/* Burn progress */}
        <div className="pt-1.5 sm:pt-2 border-t-2 border-dashed border-slate-700/80">
          <div className="flex justify-between font-hand text-[9px] sm:text-xs text-slate-300 mb-1">
            <span className="truncate mr-1">Destroyed:</span>
            <span className="font-mono text-rose-400 font-bold shrink-0">
              {state.burnedPercentageOfSupply.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-slate-900 border border-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, state.burnedPercentageOfSupply)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. DEAD ADDRESS VAULT */}
      <div className="p-2.5 sm:p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-[10px] sm:text-xs text-sky-400 uppercase tracking-wider truncate mr-1">
            Dead Vault
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-sky-400/20 text-sky-300 border border-sky-400/40 flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs shrink-0">
            0x0
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-lg xs:text-xl sm:text-2xl font-black text-white">
              {formatNumber(state.deadAddressBalance)}
            </span>
          </div>
          <div className="font-hand text-[10px] sm:text-xs text-slate-400 truncate">
            Zero-Address Sink
          </div>
        </div>

        <div className="pt-1.5 sm:pt-2 border-t-2 border-dashed border-slate-700/80 flex items-center justify-between font-mono text-[9px] sm:text-[11px] text-slate-400">
          <span className="hidden xs:inline">MCap:</span>
          <span className="text-white font-bold truncate">
            ${formatNumber(state.marketCapUSD)}
          </span>
        </div>
      </div>
    </div>
  );
};
