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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. TOTAL FEES CLAIMED */}
      <div className="p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-xs text-amber-400 uppercase tracking-wider">
            Total Fees Claimed
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-white">
              {state.totalFeesClaimedETH.toFixed(4)}
            </span>
            <span className="text-xs font-bold text-amber-400">ETH</span>
          </div>
          <div className="font-hand text-xs text-slate-400">
            ≈ ${formatNumber(state.totalFeesClaimedUSD)} USD Claimed
          </div>
        </div>

        <div className="pt-2 border-t-2 border-dashed border-slate-700/80 flex items-center justify-between font-mono text-[11px] text-slate-400">
          <span>Escrow Available:</span>
          <span className="text-amber-300 font-bold">
            {state.currentEscrowBalanceETH.toFixed(4)} ETH
          </span>
        </div>
      </div>

      {/* 2. TOTAL BUYBACK */}
      <div className="p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-xs text-emerald-400 uppercase tracking-wider">
            Total Buyback Volume
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-white">
              {formatNumber(state.totalTokensBoughtBack)}
            </span>
            <span className="text-xs font-bold text-emerald-400">TOKENS</span>
          </div>
          <div className="font-hand text-xs text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Constant DEX Buying Pressure</span>
          </div>
        </div>

        <div className="pt-2 border-t-2 border-dashed border-slate-700/80 flex items-center justify-between font-mono text-[11px] text-slate-400">
          <span>Token Price:</span>
          <span className="text-emerald-300 font-bold">
            ${state.tokenPriceUSD.toFixed(6)}
          </span>
        </div>
      </div>

      {/* 3. TOTAL TOKENS BURNED */}
      <div className="p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-xs text-rose-400 uppercase tracking-wider">
            Total Tokens Burned 🔥
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-400/20 text-rose-300 border border-rose-400/40 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-rose-400">
              {formatNumber(state.totalTokensBurned)}
            </span>
            <span className="text-xs font-bold text-rose-500">BURNED</span>
          </div>
          <div className="font-hand text-xs text-slate-400">
            Permanently transferred to Dead Address
          </div>
        </div>

        {/* Burn progress */}
        <div className="pt-2 border-t-2 border-dashed border-slate-700/80">
          <div className="flex justify-between font-hand text-xs text-slate-300 mb-1">
            <span>Circulating Supply Destroyed:</span>
            <span className="font-mono text-rose-400 font-bold">
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
      <div className="p-4 bg-[#18202c] sketch-box flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-sketch text-xs text-sky-400 uppercase tracking-wider">
            Dead Address Vault
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-400/20 text-sky-300 border border-sky-400/40 flex items-center justify-center font-mono font-bold text-xs">
            0x0
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-white">
              {formatNumber(state.deadAddressBalance)}
            </span>
            <span className="text-xs font-bold text-sky-400">HELD</span>
          </div>
          <div className="font-hand text-xs text-slate-400">
            Irreversible zero-address sink
          </div>
        </div>

        <div className="pt-2 border-t-2 border-dashed border-slate-700/80 flex items-center justify-between font-mono text-[11px] text-slate-400">
          <span>Market Cap:</span>
          <span className="text-white font-bold">
            ${formatNumber(state.marketCapUSD)}
          </span>
        </div>
      </div>
    </div>
  );
};
