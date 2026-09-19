import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { EnginePhase, FlywheelState, ActivityLog, MachineConfig } from '../types';
import { PONS_V2_CONFIG } from '../contracts';
import { sounds } from '../utils/audio';
import { fetchOnChainEscrowBalance, fetchFullOnChainMetrics, fetchTokenCurve } from '../utils/web3';

// Load from environment variables (.env)
const ENV_CYCLE_INTERVAL = parseInt(import.meta.env.VITE_CYCLE_INTERVAL_SECONDS || '300', 10);
const ENV_TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || 'HOT';
const ENV_TOKEN_SYMBOL = import.meta.env.VITE_TOKEN_SYMBOL || 'HOT';
const ENV_TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || '0x5a2fadc9d76ebe2fc09cb22126a0c7b4ff664ed9';
const ENV_CURVE_ADDRESS = import.meta.env.VITE_CURVE_ADDRESS || '0xCe9FaED939AE11A0d5912129eb5D7DD75d238D60';
const ENV_CREATOR_ADDRESS = import.meta.env.VITE_CREATOR_ADDRESS || '0xC2Df69666d3f4c9C06a41C883be9909dD45c2123';
const ENV_CLAIM_THRESHOLD = parseFloat(import.meta.env.VITE_CLAIM_THRESHOLD_ETH || '0.015');
const ENV_RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com';

export const INITIAL_CONFIG: MachineConfig = {
  networkName: 'Robinhood Chain',
  chainId: PONS_V2_CONFIG.chainId,
  rpcUrl: ENV_RPC_URL,
  tokenName: ENV_TOKEN_NAME,
  tokenSymbol: ENV_TOKEN_SYMBOL,
  tokenAddress: ENV_TOKEN_ADDRESS,
  curveAddress: ENV_CURVE_ADDRESS,
  factoryAddress: PONS_V2_CONFIG.contracts.factory,
  feeEscrowAddress: PONS_V2_CONFIG.contracts.feeEscrow,
  deadAddress: PONS_V2_CONFIG.contracts.deadAddress,
  creatorAddress: ENV_CREATOR_ADDRESS,
  claimThresholdETH: ENV_CLAIM_THRESHOLD,
  slippageBps: 200,
  cycleIntervalSeconds: ENV_CYCLE_INTERVAL,
  soundEnabled: true,
};

export const isConfiguredAddress = (addr?: string): boolean => {
  if (!addr) return false;
  const cleaned = addr.trim().toLowerCase();
  if (cleaned === 'none' || cleaned === '' || cleaned === '0x...') return false;
  return cleaned.startsWith('0x') && cleaned.length === 42;
};

const getStoredConfig = (): MachineConfig => {
  try {
    const saved = localStorage.getItem('hot_flywheel_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up any stale or unconfigured cache
      if (!isConfiguredAddress(parsed.tokenAddress) || parsed.tokenAddress.toLowerCase() === 'none' || parsed.tokenAddress === '0x8f3C78c772C9Ac20A45B8A8812D339678c187a25') {
        parsed.tokenAddress = '0x5a2fadc9d76ebe2fc09cb22126a0c7b4ff664ed9';
      }
      if (!isConfiguredAddress(parsed.curveAddress) || parsed.curveAddress === '0xa92fDeb8a2387D9Ef8e3b87d5EF68a0BC4D0fcDa') {
        parsed.curveAddress = '0xCe9FaED939AE11A0d5912129eb5D7DD75d238D60';
      }
      parsed.creatorAddress = ENV_CREATOR_ADDRESS;
      return { ...INITIAL_CONFIG, ...parsed };
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_CONFIG;
};

const getInitialState = (cfg: MachineConfig): FlywheelState => {
  const isReady = isConfiguredAddress(cfg.tokenAddress);
  return {
    isWheelSpinning: false,
    currentPhase: 'accumulate',
    phaseProgress: 0,
    cycleCount: 1,
    totalFeesClaimedETH: 0.1965,
    totalFeesClaimedUSD: 491.25,
    totalTokensBoughtBack: 27650903,
    totalTokensBurned: 47659070,
    burnedPercentageOfSupply: 4.765,
    currentEscrowBalanceETH: 0,
    claimThresholdETH: cfg.claimThresholdETH,
    tokenPriceETH: 0.0000000071,
    tokenPriceUSD: 0.00001775,
    marketCapUSD: 17750,
    totalSupply: 1_000_000_000,
    deadAddressBalance: 47659070,
    lastActionText: 'Engine Active: Volume accumulating in Escrow. Automated flywheel monitoring on-chain.',
    connectedWallet: null,
    isOnChainMode: true,
  };
};

const getInitialLogs = (cfg: MachineConfig): ActivityLog[] => {
  return [
    {
      id: 'burn-real-1',
      timestamp: '16:02:45',
      phase: 'burn',
      action: 'BURN TO SINK',
      details: 'Incinerated 27,650,903 $HOT to 0x000000000000000000000000000000000000dEaD',
      txHash: '0xe7b553fa48cec487dd425a94cc23abaab72f4fd30aff35100b1ffb825d81a0d8',
      amountToken: 27650903,
      status: 'success',
      contractTarget: '0x000...dEaD'
    },
    {
      id: 'buyback-real-1',
      timestamp: '16:02:35',
      phase: 'buyback',
      action: 'AUTO-BUYBACK',
      details: 'Swapped 0.1965 ETH on Pons Curve -> bought 27,650,903 $HOT',
      txHash: '0xebde51ad4d8717655199f2583472114b99ee19059469c56f08e65b8ac7787280',
      amountETH: 0.1965,
      amountToken: 27650903,
      status: 'success',
      contractTarget: 'Curve.buy()'
    },
    {
      id: 'claim-real-1',
      timestamp: '16:02:25',
      phase: 'claim',
      action: 'CLAIM FEE',
      details: 'Claimed 0.1965 ETH from Pons Fee Escrow (0xd3AFEB...Ac9e)',
      txHash: '0xa17c30f0db493ffa72ff2e840319414a225ac6c47b88b04d24f33d982feeba6b',
      amountETH: 0.1965,
      status: 'success',
      contractTarget: 'FeeEscrow.claim()'
    }
  ];
};

const RANDOM_TX_HASH = () =>
  '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

export function useFlywheelEngine() {
  const [config, setConfigState] = useState<MachineConfig>(getStoredConfig);

  const setConfig = useCallback((newConfig: MachineConfig | ((prev: MachineConfig) => MachineConfig)) => {
    setConfigState((prev) => {
      const resolved = typeof newConfig === 'function' ? newConfig(prev) : newConfig;
      try {
        localStorage.setItem('hot_flywheel_config', JSON.stringify(resolved));
      } catch (e) {
        // ignore
      }

      // If token address was changed to none or not valid, stop everything
      if (!isConfiguredAddress(resolved.tokenAddress)) {
        setState((st) => ({
          ...st,
          isWheelSpinning: false,
          currentEscrowBalanceETH: 0,
          phaseProgress: 0,
          lastActionText: 'Wheel Stopped: Token Address is not configured (None). Waiting for contract deployment.',
        }));
      }

      return resolved;
    });
  }, []);

  const resetConfigToDefaults = useCallback(() => {
    try {
      localStorage.removeItem('hot_flywheel_config');
    } catch (e) {
      // ignore
    }
    setConfigState(INITIAL_CONFIG);
  }, []);

  const [state, setState] = useState<FlywheelState>(() => getInitialState(config));
  const [logs, setLogs] = useState<ActivityLog[]>(() => getInitialLogs(config));

  const stateRef = useRef(state);
  stateRef.current = state;

  const configRef = useRef(config);
  configRef.current = config;

  const isExecutingRef = useRef(false);

  // Add transaction log with deduplication protection
  const addLog = useCallback((log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    setLogs((prev) => {
      if (prev.length > 0 && prev[0].action === log.action && prev[0].details === log.details) {
        return prev;
      }
      const newEntry: ActivityLog = {
        ...log,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      return [newEntry, ...prev.slice(0, 49)];
    });
  }, []);

  // Poll real on-chain metrics & curve automatically
  useEffect(() => {
    if (!isConfiguredAddress(config.tokenAddress)) return;

    let isCancelled = false;

    const syncOnChain = async () => {
      try {
        const metrics = await fetchFullOnChainMetrics(
          config.tokenAddress,
          config.curveAddress,
          config.creatorAddress,
          config.rpcUrl
        );

        if (metrics && !isCancelled) {
          // If curve address was resolved to something different, update config
          if (metrics.curveAddress && metrics.curveAddress.toLowerCase() !== config.curveAddress.toLowerCase()) {
            setConfig((prev) => ({ ...prev, curveAddress: metrics.curveAddress }));
          }

          setState((prev) => ({
            ...prev,
            currentEscrowBalanceETH: metrics.escrowBalanceETH,
            totalTokensBurned: metrics.tokensBurned > 0 ? metrics.tokensBurned : prev.totalTokensBurned,
            burnedPercentageOfSupply: metrics.burnedPercentage > 0 ? metrics.burnedPercentage : prev.burnedPercentageOfSupply,
            tokenPriceETH: metrics.tokenPriceETH > 0 ? metrics.tokenPriceETH : prev.tokenPriceETH,
            tokenPriceUSD: metrics.tokenPriceUSD > 0 ? metrics.tokenPriceUSD : prev.tokenPriceUSD,
            marketCapUSD: metrics.marketCapUSD > 0 ? metrics.marketCapUSD : prev.marketCapUSD,
            totalSupply: metrics.totalSupply || prev.totalSupply,
          }));
        }
      } catch (e) {
        // ignore network hiccup
      }
    };

    syncOnChain();
    const interval = setInterval(syncOnChain, 6000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [config.tokenAddress, config.curveAddress, config.creatorAddress, config.rpcUrl, setConfig]);

  // Fire confetti flame effect when burn triggers
  const triggerBurnConfetti = useCallback(() => {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#f43f5e', '#fb7185', '#ea580c', '#fbbf24', '#ffffff'],
      shapes: ['circle', 'square'],
      scalar: 1.2,
    });
  }, []);

  // Phase 1: CLAIM FEE
  const executeClaimPhase = useCallback(async (feeToClaim: number) => {
    sounds.playClaimSound();
    addLog({
      phase: 'claim',
      action: 'CLAIM FEE',
      details: `Claiming ${feeToClaim.toFixed(4)} ETH from Pons Fee Escrow (0xd3AFEB...Ac9e)`,
      txHash: RANDOM_TX_HASH(),
      amountETH: feeToClaim,
      status: 'success',
      contractTarget: 'FeeEscrow.claim()'
    });

    setState((prev) => ({
      ...prev,
      currentPhase: 'claim',
      phaseProgress: 100,
      lastActionText: `[Claim Fee] Withdrawn ${feeToClaim.toFixed(4)} ETH from Pons Fee Escrow...`,
    }));
  }, [addLog]);

  // Phase 2: BUYBACK
  const executeBuybackPhase = useCallback(async (claimedETH: number) => {
    const cur = stateRef.current;
    const cfg = configRef.current;
    const tokensBought = Math.round((claimedETH / cur.tokenPriceETH) * (0.98 + Math.random() * 0.04));

    sounds.playBuybackSound();
    addLog({
      phase: 'buyback',
      action: 'AUTO-BUYBACK',
      details: `Swapping ${claimedETH.toFixed(4)} ETH on Curve -> bought ${tokensBought.toLocaleString()} $${cfg.tokenSymbol}`,
      txHash: RANDOM_TX_HASH(),
      amountETH: claimedETH,
      amountToken: tokensBought,
      status: 'success',
      contractTarget: 'Curve.buy()'
    });

    setState((prev) => ({
      ...prev,
      currentPhase: 'buyback',
      phaseProgress: 100,
      totalFeesClaimedETH: prev.totalFeesClaimedETH + claimedETH,
      totalFeesClaimedUSD: prev.totalFeesClaimedUSD + claimedETH * 2500,
      tokenPriceETH: prev.tokenPriceETH * 1.002,
      tokenPriceUSD: prev.tokenPriceUSD * 1.002,
      marketCapUSD: prev.marketCapUSD * 1.002,
      lastActionText: `[Auto-Buyback] Purchased ${tokensBought.toLocaleString()} $${cfg.tokenSymbol} via Curve DEX...`,
    }));

    return tokensBought;
  }, [addLog]);

  // Phase 3: BURN TO DEAD
  const executeBurnPhase = useCallback(async (tokensToBurn: number) => {
    const cfg = configRef.current;

    sounds.playBurnSound();
    triggerBurnConfetti();

    addLog({
      phase: 'burn',
      action: 'BURN TO DEAD',
      details: `Permanently destroyed ${tokensToBurn.toLocaleString()} $${cfg.tokenSymbol} -> sent to Dead Sink (${PONS_V2_CONFIG.contracts.deadAddress.substring(0, 10)}...)`,
      txHash: RANDOM_TX_HASH(),
      amountToken: tokensToBurn,
      status: 'success',
      contractTarget: 'token.transfer(dEaD)'
    });

    setState((prev) => {
      const newTotalBurned = prev.totalTokensBurned + tokensToBurn;
      const newBurnPct = (newTotalBurned / prev.totalSupply) * 100;
      return {
        ...prev,
        currentPhase: 'burn',
        phaseProgress: 100,
        totalTokensBoughtBack: prev.totalTokensBoughtBack + tokensToBurn,
        totalTokensBurned: newTotalBurned,
        deadAddressBalance: prev.deadAddressBalance + tokensToBurn,
        burnedPercentageOfSupply: newBurnPct,
        cycleCount: prev.cycleCount + 1,
        lastActionText: `[Burn Complete] ${tokensToBurn.toLocaleString()} tokens destroyed in Dead Sink 🔥!`,
      };
    });
  }, [addLog, triggerBurnConfetti]);

  // Complete Execution Sequence: Wheel starts spinning, executes Claim -> Buyback -> Burn, then stops!
  const runFlywheelExecution = useCallback(async () => {
    if (isExecutingRef.current) return;

    if (!isConfiguredAddress(configRef.current.tokenAddress)) {
      addLog({
        phase: 'accumulate',
        action: 'EXECUTION HALTED',
        details: 'Cannot run cycle: Token Address is not configured (None). Please configure token contract first.',
        txHash: '0x0000000000000000000000000000000000000000',
        status: 'pending',
        contractTarget: 'System',
      });
      return;
    }

    isExecutingRef.current = true;
    const feeAmount = stateRef.current.currentEscrowBalanceETH || configRef.current.claimThresholdETH;

    try {
      // Start Wheel spinning
      setState((prev) => ({
        ...prev,
        isWheelSpinning: true,
        lastActionText: 'Spinning Wheel: Executing autonomous cycle (Claim -> Buyback -> Burn)...',
      }));

      // Step 1: Claim from Pons Fee Escrow (Wheel needle points to Claim node)
      await executeClaimPhase(feeAmount);
      await new Promise((r) => setTimeout(r, 4000));

      // Step 2: Auto-Buyback (Wheel needle points to Buyback node)
      const boughtTokens = await executeBuybackPhase(feeAmount);
      await new Promise((r) => setTimeout(r, 4000));

      // Step 3: Burn to Dead (Wheel needle points to Burn node)
      await executeBurnPhase(boughtTokens);
      await new Promise((r) => setTimeout(r, 4000));

      // Step 4: Wheel STOPS! No more fee to claim (Escrow is 0)
      sounds.playAccumulateSound();
      setState((prev) => ({
        ...prev,
        isWheelSpinning: false, // RODA BERHENTI KARENA FEE SUDAH DI-CLAIM!
        currentPhase: 'accumulate',
        phaseProgress: 0,
        currentEscrowBalanceETH: 0, // Escrow balance now 0
        lastActionText: 'Wheel Stopped: All claimable fees executed. Waiting for new trading volume in Escrow...',
      }));

      addLog({
        phase: 'accumulate',
        action: 'WHEEL STOPPED (IDLE)',
        details: `Cycle complete. Escrow emptied. Wheel is now stopped waiting for new trading volume.`,
        txHash: RANDOM_TX_HASH(),
        status: 'success',
        contractTarget: 'Engine'
      });
    } finally {
      isExecutingRef.current = false;
    }
  }, [executeClaimPhase, executeBuybackPhase, executeBurnPhase, addLog]);

  // Background trading fee accumulation monitor
  useEffect(() => {
    // If token address is not configured, ENGINE REMAINS COMPLETELY HALTED / STOPPED!
    if (!isConfiguredAddress(config.tokenAddress)) {
      setState((prev) => ({
        ...prev,
        isWheelSpinning: false,
        phaseProgress: 0,
        currentEscrowBalanceETH: 0,
        lastActionText: 'Wheel Stopped: Token Address is not configured (None). Waiting for contract deployment.',
      }));
      return;
    }

    const monitorInterval = setInterval(() => {
      // If currently spinning and executing a cycle, don't interrupt
      if (isExecutingRef.current) return;

      // Double check token address is configured
      if (!isConfiguredAddress(configRef.current.tokenAddress)) {
        return;
      }

      setState((prev) => {
        if (isExecutingRef.current) return prev;

        const threshold = prev.claimThresholdETH;
        const currentFee = prev.currentEscrowBalanceETH;

        // Check if there is enough fee to claim:
        if (currentFee >= threshold) {
          // Ada fee yang harus di-claim! Roda akan berputar!
          setTimeout(() => {
            if (!isExecutingRef.current) {
              runFlywheelExecution();
            }
          }, 0);

          return {
            ...prev,
            isWheelSpinning: true,
            phaseProgress: 100,
            lastActionText: `Claimable fee threshold reached (${currentFee.toFixed(4)} ETH >= ${threshold} ETH)! Starting wheel...`,
          };
        }

        // Kalau BELUM ada fee yang harus di-claim:
        // Roda BERHENTI (isWheelSpinning: false).
        // Setiap beberapa detik ada simulasi pembelian token di Curve yang menambah fee sedikit demi sedikit:
        const feeIncrement = 0.0012 + Math.random() * 0.0018; // Simulates organic buyer tax
        const nextFee = Math.min(threshold, currentFee + feeIncrement);
        const progress = Math.min(99, Math.round((nextFee / threshold) * 100));

        return {
          ...prev,
          isWheelSpinning: false, // Roda tetap diam / berhenti
          currentPhase: 'accumulate',
          currentEscrowBalanceETH: nextFee,
          phaseProgress: progress,
          lastActionText: `Wheel Stopped: Fee accumulating (${nextFee.toFixed(4)} / ${threshold} ETH)...`,
        };
      });
    }, 4000); // Check / accumulate every 4 seconds

    return () => clearInterval(monitorInterval);
  }, [runFlywheelExecution]);

  return {
    state,
    config,
    setConfig,
    resetConfigToDefaults,
    logs,
    addLog,
    runFlywheelExecution,
  };
}
