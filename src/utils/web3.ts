import { ethers } from 'ethers';
import { PONS_V2_CONFIG } from '../contracts';

export const ROBINHOOD_CHAIN_PARAMS = {
  chainId: '0x1237', // 4663 in hex
  chainName: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.robinhood.org'],
  blockExplorerUrls: ['https://explorer.robinhood.org'],
};

export const ESCROW_ABI = [
  'function balanceOf(address recipient) view returns (uint256)',
  'function balanceOfToken(address recipient, address token) view returns (uint256)',
  'function claim() returns ()',
  'function claimToken(address token) returns ()'
];

export const CURVE_ABI = [
  'function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256)',
  'function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)',
  'function sellableTokens() view returns (uint256)',
  'function feeBps() view returns (uint256)',
  'function creatorTaxBps() view returns (uint256)',
  'function graduated() view returns (bool)'
];

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

export async function connectWallet(): Promise<{ address: string; signer: ethers.Signer } | null> {
  const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
  if (!ethereum) {
    alert('Please install MetaMask, Rabby, or a Web3 wallet browser extension to connect.');
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(ethereum);
    // Request accounts
    const accounts = await provider.send('eth_requestAccounts', []);
    if (!accounts || accounts.length === 0) return null;

    // Check / switch chain
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: ROBINHOOD_CHAIN_PARAMS.chainId }]);
    } catch (switchError: any) {
      // 4902 error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await provider.send('wallet_addEthereumChain', [ROBINHOOD_CHAIN_PARAMS]);
      }
    }

    const signer = await provider.getSigner();
    return {
      address: await signer.getAddress(),
      signer
    };
  } catch (err: any) {
    console.error('Wallet connection error:', err);
    return null;
  }
}

export async function fetchOnChainEscrowBalance(address: string, rpcUrl = 'https://rpc.robinhood.org'): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(PONS_V2_CONFIG.contracts.feeEscrow, ESCROW_ABI, provider);
    const balance = await contract.balanceOf(address);
    return parseFloat(ethers.formatEther(balance));
  } catch {
    // If RPC unavailable or address fresh, return 0
    return 0;
  }
}

export async function executeRealClaim(signer: ethers.Signer): Promise<string> {
  const contract = new ethers.Contract(PONS_V2_CONFIG.contracts.feeEscrow, ESCROW_ABI, signer);
  const tx = await contract.claim();
  return tx.hash;
}

export async function executeRealBuyback(
  signer: ethers.Signer,
  curveAddress: string,
  ethAmount: number,
  recipientAddress: string
): Promise<string> {
  const contract = new ethers.Contract(curveAddress, CURVE_ABI, signer);
  const val = ethers.parseEther(ethAmount.toString());
  const tx = await contract.buy(val, 0n, recipientAddress, { value: val });
  return tx.hash;
}

export async function executeRealBurn(
  signer: ethers.Signer,
  tokenAddress: string,
  amount: bigint
): Promise<string> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const tx = await contract.transfer(PONS_V2_CONFIG.contracts.deadAddress, amount);
  return tx.hash;
}
