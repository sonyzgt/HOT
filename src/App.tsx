import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FlywheelWheel } from './components/FlywheelWheel';
import { MetricsOverview } from './components/MetricsOverview';
import { EngineControls } from './components/EngineControls';
import { LiveLogs } from './components/LiveLogs';
import { PonsContractsCard } from './components/PonsContractsCard';
import { AdminPanel } from './components/AdminPanel';
import { DocsPage } from './components/DocsPage';
import { useFlywheelEngine } from './hooks/useFlywheelEngine';
import { BookOpen, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const isMemexRoute = () => {
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/memex' || p === '/memex/' || h === '#memex' || h === '#/memex';
};

const isDocsRoute = () => {
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/docs' || p === '/docs/' || h === '#docs' || h === '#/docs';
};

export function App() {
  const {
    state,
    config,
    setConfig,
    resetConfigToDefaults,
    logs,
    runFlywheelExecution,
  } = useFlywheelEngine();

  const getInitialRoute = () => {
    if (isMemexRoute()) return '/memex';
    if (isDocsRoute()) return '/docs';
    return '/';
  };

  const [route, setRoute] = useState<string>(getInitialRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      if (isMemexRoute()) {
        setRoute('/memex');
      } else if (isDocsRoute()) {
        setRoute('/docs');
      } else {
        setRoute('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setRoute('/');
  };

  const navigateToDocs = () => {
    window.history.pushState({}, '', '/docs');
    setRoute('/docs');
  };

  // If user is on /memex, render Admin Panel
  if (route === '/memex') {
    return (
      <AdminPanel
        config={config}
        state={state}
        onSaveConfig={setConfig}
        onResetDefaults={resetConfigToDefaults}
        onTriggerCycle={runFlywheelExecution}
        onNavigateHome={navigateToHome}
      />
    );
  }

  // If user is on /docs, render Docs Page
  if (route === '/docs') {
    return (
      <DocsPage
        config={config}
        onNavigateHome={navigateToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f141d] text-slate-100 flex flex-col font-hand selection:bg-amber-400 selection:text-slate-950">
      {/* Public Navigation Header */}
      <Header
        config={config}
        tokenPriceUSD={state.tokenPriceUSD}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Top Key Performance Metrics */}
        <MetricsOverview state={state} />

        {/* Central Flywheel Wheel Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Wheel Container (Takes 7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <FlywheelWheel
              currentPhase={state.currentPhase}
              phaseProgress={state.phaseProgress}
              isWheelSpinning={state.isWheelSpinning}
              cycleCount={state.cycleCount}
              currentEscrowBalanceETH={state.currentEscrowBalanceETH}
              claimThresholdETH={state.claimThresholdETH}
              lastActionText={state.lastActionText}
              onSelectPhase={() => {}}
              tokenAddress={config.tokenAddress}
            />

            {/* Read-Only Public Status Bar */}
            <EngineControls
              isWheelSpinning={state.isWheelSpinning}
              claimThresholdETH={state.claimThresholdETH}
              soundEnabled={config.soundEnabled}
              onToggleSound={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
              tokenAddress={config.tokenAddress}
            />
          </div>

          {/* Right Column: Execution Terminal & Architecture Notes */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Terminal */}
            <LiveLogs logs={logs} />

            {/* Hand-drawn Blueprint Architecture Notebook */}
            <div className="p-5 bg-[#151c27] sketch-box space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-sketch text-sm border-b-2 border-dashed border-slate-700 pb-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>HOT Engine Architecture (Pons v2)</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 font-hand text-base leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-sky-950 text-sky-400 border border-sky-600 font-bold flex items-center justify-center shrink-0 text-xs font-mono">
                    1
                  </span>
                  <p>
                    <strong className="text-white font-sketch text-xs">5-Min Fee Accumulation:</strong> Traders buy tokens on the Pons Curve, building creator fees in Escrow. The wheel waits during this window.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-400 border border-amber-600 font-bold flex items-center justify-center shrink-0 text-xs font-mono">
                    2
                  </span>
                  <p>
                    <strong className="text-white font-sketch text-xs">Auto-Claim Fee:</strong> Every 5 minutes (or when threshold is hit), the pointer advances to Claim Fee and calls <code className="text-amber-300 text-xs font-mono">claim()</code> on the Pons Escrow (<code className="text-amber-300 text-xs font-mono">0xd3AFEB...Ac9e</code>).
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs font-mono">
                    3
                  </span>
                  <p>
                    <strong className="text-white font-sketch text-xs">Auto-Buyback:</strong> The claimed ETH is instantly swapped for tokens via <code className="text-emerald-300 text-xs font-mono">curve.buy()</code>, generating constant buying support.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-rose-950 text-rose-400 border border-rose-600 font-bold flex items-center justify-center shrink-0 text-xs font-mono">
                    4
                  </span>
                  <p>
                    <strong className="text-white font-sketch text-xs">Auto-Burn to Dead:</strong> All bought tokens are sent to the dead address (<code className="text-rose-300 text-xs font-mono">0x0...dEaD</code>), permanently reducing circulating supply. The wheel then resets to the 5-minute countdown.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-dashed border-slate-700/80 flex items-center gap-1.5 text-xs text-slate-400 font-doodle text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Runs automatically every 5 minutes in a closed loop.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pons Official Contracts Card */}
        <PonsContractsCard />
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#111722] border-t-2 border-slate-700/80 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 font-hand text-base">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            HOT &bull; Deployed on Robinhood Chain (ID: 4663)
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 font-sketch text-xs">
            {/* Twitter (@hotonrh) */}
            <a
              href="https://x.com/hotonrh"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-[#18202c] hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-[2px_2px_0px_#000]"
              title="HOT on Twitter / X (@hotonrh)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Twitter</span>
              <ArrowUpRight className="w-3 h-3 opacity-70" />
            </a>

            {/* Docs */}
            <button
              onClick={navigateToDocs}
              className="px-3 py-1 bg-[#18202c] hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Docs</span>
            </button>

            <a
              href="https://docs.ponsfamily.com/v2"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-400"
            >
              <span>Pons v2 Reference</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
