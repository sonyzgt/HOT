import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  Save,
  RotateCcw,
  Play,
  Terminal,
  ArrowLeft,
  Flame,
  Check,
  Copy,
  AlertTriangle,
  Sliders,
  Radio,
  Sparkles
} from 'lucide-react';
import { MachineConfig, FlywheelState } from '../types';
import { PONS_V2_CONFIG } from '../contracts';

interface AdminPanelProps {
  config: MachineConfig;
  state: FlywheelState;
  onSaveConfig: (cfg: MachineConfig) => void;
  onResetDefaults: () => void;
  onTriggerCycle: () => void;
  onNavigateHome: () => void;
}

const ADMIN_SECRET = 'Sonyfree24@';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  state,
  onSaveConfig,
  onResetDefaults,
  onTriggerCycle,
  onNavigateHome,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('hot_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Form State
  const [formData, setFormData] = useState<MachineConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedBot, setCopiedBot] = useState(false);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_SECRET) {
      sessionStorage.setItem('hot_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('hot_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Quick set CA to none
  const setCaToNone = () => {
    setFormData((prev) => ({ ...prev, tokenAddress: 'none' }));
  };

  // Copy bot script command
  const copyBotCommand = () => {
    const command = `npm run bot`;
    navigator.clipboard.writeText(command);
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2000);
  };

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col justify-center items-center px-4 font-hand selection:bg-amber-400 selection:text-slate-950">
        <div className="w-full max-w-md bg-[#131924] sketch-box p-8 border-2 border-slate-700 shadow-2xl relative overflow-hidden">
          {/* Top subtle ribbon */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black -rotate-3 shadow-[3px_3px_0px_#000]">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <h1 className="text-2xl font-sketch font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>HOT ADMIN PORTAL</span>
              </h1>
              <div className="inline-block mt-1 px-2.5 py-0.5 bg-rose-950/80 border border-rose-600/60 rounded text-[11px] font-mono text-rose-300">
                RESTRICTED ACCESS &bull; SECURE PORTAL
              </div>
            </div>

            <p className="font-hand text-sm text-slate-400">
              Enter password to access engine controls and token configuration.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-sketch text-amber-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  placeholder="Enter administrator password..."
                  className={`w-full px-3.5 py-2.5 bg-[#090d13] border rounded-lg text-white font-mono text-sm focus:outline-none transition-colors pr-10 ${
                    authError
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-700 focus:border-amber-400'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <p className="text-rose-400 font-hand text-xs mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Password incorrect. Access denied.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-sketch font-bold rounded-lg transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          {/* Navigation link back to public view */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-700/80 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-amber-400 font-hand flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Flywheel Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col font-hand selection:bg-amber-400 selection:text-slate-950">
      {/* Admin Topbar */}
      <header className="w-full bg-[#111722] border-b-2 border-slate-700 sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Flame className="w-6 h-6 stroke-[2.5] fill-black text-black" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-sketch font-bold text-white tracking-wide">
                  HOT ENGINE ADMIN
                </h1>
                <span className="px-2 py-0.5 bg-rose-950/90 text-rose-300 border border-rose-600 rounded text-[11px] font-mono font-bold">
                  CONTROL ROOM
                </span>
                <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-400 border border-emerald-600 rounded text-[11px] font-mono">
                  ● ROOT
                </span>
              </div>
              <p className="font-hand text-xs text-slate-400">
                Pons Family v2 Autonomous Engine Control Room &amp; Parameter Config
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="px-3 py-1.5 bg-[#18202c] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-sketch flex items-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Dashboard</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/80 rounded-lg text-xs font-sketch flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Quick Notification Toast */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-950/90 border-2 border-emerald-600 text-emerald-300 rounded-xl flex items-center gap-2 font-sketch text-sm shadow-[3px_3px_0px_#000] animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Configuration saved! Changes are now active across the entire engine and public view.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#141b26] sketch-box p-6 border-2 border-slate-700 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <h2 className="font-sketch text-lg text-white font-bold">
                    Token &amp; Flywheel Parameters
                  </h2>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Chain: Robinhood (4663)
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4 font-hand text-base">
                {/* Token Symbol & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Token Symbol ($)
                    </label>
                    <input
                      type="text"
                      value={formData.tokenSymbol}
                      onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                      placeholder="HOT"
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Token Name
                    </label>
                    <input
                      type="text"
                      value={formData.tokenName}
                      onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                      placeholder="HOT"
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Token Contract Address (CA) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-sketch text-amber-300">
                      Token Contract Address (CA)
                    </label>
                    <button
                      type="button"
                      onClick={setCaToNone}
                      className="text-xs font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Set to "none"
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.tokenAddress}
                    onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                    placeholder="none or 0x..."
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 block mt-1">
                    Set to <code className="text-amber-400">none</code> if token is not yet deployed or pending public launch. Public view will show CA: None.
                  </span>
                </div>

                {/* Pons Curve Address */}
                <div>
                  <label className="block text-xs font-sketch text-amber-300 mb-1">
                    Pons Bonding Curve Address
                  </label>
                  <input
                    type="text"
                    value={formData.curveAddress}
                    onChange={(e) => setFormData({ ...formData, curveAddress: e.target.value })}
                    placeholder="0xa92fDeb8a2387D9Ef8e3b87d5EF68a0BC4D0fcDa"
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 block mt-1">
                    DEX Curve where buybacks are routed via <code className="text-emerald-400">curve.buy()</code>.
                  </span>
                </div>

                {/* Creator / Fee Recipient Address */}
                <div>
                  <label className="block text-xs font-sketch text-amber-300 mb-1">
                    Creator / Fee Recipient Address (Escrow Beneficiary)
                  </label>
                  <input
                    type="text"
                    value={formData.creatorAddress}
                    onChange={(e) => setFormData({ ...formData, creatorAddress: e.target.value })}
                    placeholder="0xDBC643105561621D1cd9D7Bcb6161A296bABeD8b"
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Claim Threshold & Interval */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Claim Fee Threshold (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.0001"
                      value={formData.claimThresholdETH}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          claimThresholdETH: parseFloat(e.target.value) || 0.01,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Wheel spins when claimable fee &ge; threshold.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Cycle Step Speed (Seconds)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="60"
                      value={formData.cycleIntervalSeconds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cycleIntervalSeconds: parseInt(e.target.value, 10) || 5,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Speed of pointer transition between phases.
                    </span>
                  </div>
                </div>

                {/* RPC URL */}
                <div>
                  <label className="block text-xs font-sketch text-amber-300 mb-1">
                    Robinhood Chain RPC URL
                  </label>
                  <input
                    type="text"
                    value={formData.rpcUrl}
                    onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                    placeholder="https://rpc.mainnet.chain.robinhood.com"
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Submit & Reset Buttons */}
                <div className="pt-4 border-t-2 border-dashed border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onResetDefaults();
                      setFormData({ ...config });
                    }}
                    className="px-4 py-2 bg-[#17202c] hover:bg-slate-800 text-slate-300 font-sketch text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-sketch font-bold rounded-lg flex items-center gap-2 transition-all shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save &amp; Apply to Engine</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Engine Operations & Bot Integration (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Engine Control Box */}
            <div className="bg-[#141b26] sketch-box p-5 border-2 border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-sketch text-base border-b border-dashed border-slate-700 pb-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Engine Operations</span>
              </div>

              <div className="space-y-3 font-hand text-sm">
                <div className="p-3 bg-[#0c1017] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Wheel Status:</span>
                  <span
                    className={`font-sketch text-xs px-2 py-0.5 rounded border ${
                      state.isWheelSpinning
                        ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {state.isWheelSpinning ? 'SPINNING / EXECUTING' : 'STOPPED (IDLE)'}
                  </span>
                </div>

                <div className="p-3 bg-[#0c1017] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Current Escrow Balance:</span>
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    {state.currentEscrowBalanceETH.toFixed(4)} ETH
                  </span>
                </div>

                <div className="p-3 bg-[#0c1017] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Cycles Completed:</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {state.cycleCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onTriggerCycle}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-sketch font-bold rounded-lg transition-all shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Trigger 1 Test Cycle Now</span>
                </button>
              </div>
            </div>

            {/* Autonomous Node.js Daemon Script Box */}
            <div className="bg-[#141b26] sketch-box p-5 border-2 border-slate-700 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-dashed border-slate-700 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-sketch text-sm">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>24/7 Autonomous Bot Daemon</span>
                </div>
                <button
                  onClick={copyBotCommand}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                >
                  {copiedBot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBot ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 font-hand">
                Run the headless autonomous execution script in the background on your server or VPS:
              </p>

              <div className="p-3 bg-[#090d13] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 select-all">
                <div className="text-slate-500"># 1. Masukkan Private Key di file .env</div>
                <div className="text-amber-400">CREATOR_PRIVATE_KEY="0x..."</div>
                <div className="text-slate-500 mt-2"># 2. Jalankan bot flywheel on-chain:</div>
                <div className="text-emerald-400">npm run bot</div>
              </div>

              <div className="text-[11px] text-slate-400 font-hand flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Mengeksekusi otomatis di background: Claim Fee &rarr; Buyback &rarr; Transfer Dead Sink.</span>
              </div>
            </div>

            {/* Fixed Pons Protocol Addresses */}
            <div className="p-4 bg-[#0e131b] rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
              <div className="text-slate-300 font-sketch text-xs">Pons Protocol Contracts:</div>
              <div>Factory: <span className="text-slate-500">{PONS_V2_CONFIG.contracts.factory.substring(0, 14)}...</span></div>
              <div>Escrow: <span className="text-slate-500">{PONS_V2_CONFIG.contracts.feeEscrow.substring(0, 14)}...</span></div>
              <div>Dead Sink: <span className="text-rose-400">{PONS_V2_CONFIG.contracts.deadAddress.substring(0, 14)}...</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
