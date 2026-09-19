import React, { useState } from 'react';
import { Shield, Copy, Check, ExternalLink } from 'lucide-react';
import { PONS_V2_CONFIG } from '../contracts';

export const PonsContractsCard: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contracts = [
    {
      role: 'HOT Token Contract (CA)',
      address: PONS_V2_CONFIG.contracts.token,
      key: 'token',
      highlight: true,
      desc: 'Official deployed HOT token contract on Robinhood Chain.'
    },
    {
      role: 'HOT Pons Bonding Curve',
      address: PONS_V2_CONFIG.contracts.curve,
      key: 'curve',
      highlight: true,
      desc: 'DEX Bonding Curve where all autonomous buybacks are routed.'
    },
    {
      role: 'Fee Escrow (Claim Vault)',
      address: PONS_V2_CONFIG.contracts.feeEscrow,
      key: 'escrow',
      highlight: true,
      desc: 'Pons v2 creator fee escrow vault. The engine calls claim() on this contract.'
    },
    {
      role: 'Dead Burn Address (Sink)',
      address: PONS_V2_CONFIG.contracts.deadAddress,
      key: 'dead',
      highlight: true,
      desc: 'Permanent dead address receiving bought tokens to extinguish supply forever.'
    },
    {
      role: 'Launch Factory',
      address: PONS_V2_CONFIG.contracts.factory,
      key: 'factory',
      desc: 'Canonical launch factory on Robinhood Chain deploying tokens & curves.'
    },
    {
      role: 'Buyback Vault',
      address: PONS_V2_CONFIG.contracts.buybackVault,
      key: 'buyback',
      desc: 'Protocol vault releasing vested buyback tokens linearly over 5 years.'
    }
  ];

  return (
    <div className="bg-[#151c27] sketch-box p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-dashed border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-sketch text-base font-bold text-white flex items-center gap-2">
              Official Pons v2 Protocol Contracts
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Robinhood Chain (4663)
              </span>
            </h4>
            <p className="font-hand text-xs text-slate-400">
              Verified from official documentation: docs.ponsfamily.com/v2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://explorer.mainnet.chain.robinhood.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-sketch text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#1e293b] border border-slate-600 transition-colors shadow-[2px_2px_0px_#000]"
          >
            <span>RH Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {contracts.map((item) => (
          <div
            key={item.key}
            className={`p-3 rounded-xl border-2 transition-all ${
              item.highlight
                ? 'bg-[#111722] border-slate-600 shadow-[3px_3px_0px_#000]'
                : 'bg-[#111722]/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sketch text-xs text-amber-300">{item.role}</span>
              <div className="flex items-center gap-1">
                <a
                  href={`https://explorer.mainnet.chain.robinhood.com/address/${item.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-800 transition-colors"
                  title="View on Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => copyToClipboard(item.address, item.key)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy Address"
                >
                  {copiedKey === item.key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-1 font-mono text-[11px] text-slate-300 select-all break-all">
              {item.address}
            </div>

            <p className="mt-1 font-hand text-xs text-slate-400 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
