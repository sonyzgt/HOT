import React, { useState } from 'react';
import { Flame, Copy, Check, ExternalLink } from 'lucide-react';
import { MachineConfig } from '../types';

interface HeaderProps {
  config: MachineConfig;
  tokenPriceUSD: number;
}

export const Header: React.FC<HeaderProps> = ({ config, tokenPriceUSD }) => {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    navigator.clipboard.writeText(config.tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full bg-[#111722] border-b-2 border-slate-700/80 sticky top-0 z-40 px-3 sm:px-8 py-2 sm:py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Hand-drawn Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#fbbf24] text-black border-2 border-black flex items-center justify-center -rotate-2 shadow-[2px_2px_0px_#000] shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] fill-black text-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-sketch font-black tracking-tight text-white flex items-center gap-1.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 underline decoration-wavy decoration-rose-500">
                  HOT
                </span>
              </h1>
            </div>
            <p className="font-hand text-[10px] sm:text-xs text-slate-400 line-clamp-1 sm:line-clamp-none">
              Autonomous Engine: Auto-Claim Fee → Buyback DEX → Permanent Dead Burn
            </p>
          </div>
        </div>

        {/* Public Information Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          {/* Token Contract Address (CA) Copy for Public Holders */}
          {config.tokenAddress && config.tokenAddress.toLowerCase() !== 'none' && config.tokenAddress.startsWith('0x') ? (
            <button
              onClick={copyCA}
              className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#18202c] hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] sm:text-xs font-mono text-slate-300 shadow-[1px_1px_0px_#000] cursor-pointer transition-colors"
              title="Click to copy Token Contract Address"
            >
              <span className="text-amber-400 font-bold">CA:</span>
              <span>
                {config.tokenAddress.substring(0, 6)}...{config.tokenAddress.substring(config.tokenAddress.length - 4)}
              </span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#18202c] border border-slate-700 rounded-lg text-[10px] sm:text-xs font-mono text-slate-400 shadow-[1px_1px_0px_#000]">
              <span className="text-amber-400 font-bold">CA:</span>
              <span className="italic text-slate-400">None</span>
            </div>
          )}

          {/* Network Pill */}
          <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#18202c] border border-slate-700 rounded-lg text-[10px] sm:text-xs font-mono text-slate-300 shadow-[1px_1px_0px_#000]">
            <span className="text-emerald-400">●</span> Robinhood (4663)
          </div>

          {/* Live Token Price Pill */}
          <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#18202c] border border-slate-700 rounded-lg text-[10px] sm:text-xs font-mono text-slate-200 shadow-[1px_1px_0px_#000]">
            <span className="text-amber-400">${config.tokenSymbol}:</span> ${tokenPriceUSD.toFixed(6)}
          </div>
        </div>
      </div>
    </header>
  );
};
