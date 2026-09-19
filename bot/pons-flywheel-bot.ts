/**
 * PONS FAMILY V2 - AUTONOMOUS FLYWHEEL BOT (CLAIM -> BUYBACK -> BURN)
 * Network: Robinhood Chain (EVM Chain ID: 4663)
 * Reference: https://docs.ponsfamily.com/v2
 * 
 * Mekanisme:
 * 1. Cek saldo fee di Fee Escrow (0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e)
 * 2. Saat saldo >= THRESHOLD (misal 0.01 ETH), panggil escrow.claim()
 * 3. Gunakan ETH yang diklaim untuk eksekusi curve.buy() di Curve DEX Pons
 * 4. Transfer token yang terbeli langsung ke DEAD_ADDRESS (0x000000000000000000000000000000000000dEaD)
 * 5. Ulangi siklus secara otomatis!
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// Konfigurasi dari file .env (Mendukung prefix VITE_ atau standar)
const RPC_URL = process.env.RPC_URL || process.env.VITE_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const PRIVATE_KEY = process.env.CREATOR_PRIVATE_KEY || process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || process.env.VITE_TOKEN_ADDRESS;
const CURVE_ADDRESS = process.env.CURVE_ADDRESS || process.env.VITE_CURVE_ADDRESS;
const CLAIM_THRESHOLD_ETH = process.env.CLAIM_THRESHOLD_ETH || process.env.VITE_CLAIM_THRESHOLD_ETH || "0.015";
const POLL_INTERVAL_SECONDS = parseInt(process.env.POLL_INTERVAL_SECONDS || "10", 10);

// Kontrak Resmi Pons v2 (docs.ponsfamily.com/v2)
const PONS_FEE_ESCROW = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

if (!PRIVATE_KEY || PRIVATE_KEY === "") {
  console.error("❌ ERROR: CREATOR_PRIVATE_KEY belum diisi di file .env");
  console.error("   Tambahkan: CREATOR_PRIVATE_KEY=\"0x...\" ke file .env");
  process.exit(1);
}
if (!TOKEN_ADDRESS || TOKEN_ADDRESS.toLowerCase() === "none") {
  console.error("❌ ERROR: TOKEN_ADDRESS masih bernilai 'none' atau belum diisi di .env");
  console.error("   Silakan masukkan Token Contract Address (CA) yang sudah dideploy di Pons ke .env");
  process.exit(1);
}
if (!CURVE_ADDRESS || CURVE_ADDRESS.toLowerCase() === "none") {
  console.error("❌ ERROR: CURVE_ADDRESS belum diisi di .env");
  process.exit(1);
}

// ABI Minimal
const ESCROW_ABI = [
  "function balanceOf(address recipient) view returns (uint256)",
  "function claim()"
];

const CURVE_ABI = [
  "function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256)",
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function sellableTokens() view returns (uint256)",
  "function graduated() view returns (bool)"
];

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function runFlywheel() {
  console.log("==========================================================");
  console.log("🚀 PONS V2 AUTONOMOUS FLYWHEEL ENGINE AKTIF");
  console.log("   Jaringan: Robinhood Chain (ID: 4663)");
  console.log("   Fee Escrow Target:", PONS_FEE_ESCROW);
  console.log("   Dead Burn Address:", DEAD_ADDRESS);
  console.log("==========================================================");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);

  console.log("Operator Wallet :", wallet.address);
  console.log("Token Target    :", TOKEN_ADDRESS);
  console.log("Curve Target    :", CURVE_ADDRESS);
  console.log("Min Claim Fee   :", CLAIM_THRESHOLD_ETH, "ETH");

  const feeEscrow = new ethers.Contract(PONS_FEE_ESCROW, ESCROW_ABI, wallet);
  const curve = new ethers.Contract(CURVE_ADDRESS!, CURVE_ABI, wallet);
  const token = new ethers.Contract(TOKEN_ADDRESS!, ERC20_ABI, wallet);

  const tokenSymbol = await token.symbol().catch(() => "TOKEN");
  let cycle = 1;

  async function checkCycle() {
    try {
      const now = new Date().toLocaleTimeString();
      console.log(`\n[${now}] [Siklus #${cycle}] Mengecek saldo di Fee Escrow...`);

      const claimableWei = await feeEscrow.balanceOf(wallet.address);
      const claimableETH = ethers.formatEther(claimableWei);
      console.log(`  -> Fee Terkumpul di Escrow: ${claimableETH} ETH`);

      const thresholdWei = ethers.parseEther(CLAIM_THRESHOLD_ETH);

      if (claimableWei >= thresholdWei) {
        console.log(`\n⚡ AMBANG BATAS TERCAPAI (${claimableETH} ETH >= ${CLAIM_THRESHOLD_ETH} ETH)`);
        console.log(`🔥 MEMULAI EKSEKUSI SIKLUS FLYWHEEL...`);

        // TAHAP 1: CLAIM FEE
        console.log(`  [1/3] Mengklaim ${claimableETH} ETH dari Pons Fee Escrow...`);
        const claimTx = await feeEscrow.claim();
        console.log(`  Tx Claim terkirim: ${claimTx.hash}`);
        await claimTx.wait();
        console.log(`  ✅ Fee berhasil diklaim ke dompet!`);

        // TAHAP 2: BUYBACK TOKEN DI CURVE
        console.log(`  [2/3] Mengeksekusi buyback di Pons Curve menggunakan ${claimableETH} ETH...`);
        const isGraduated = await curve.graduated().catch(() => false);

        if (isGraduated) {
          console.log(`  Token telah lulus (graduated) ke Uniswap v4 pool.`);
        } else {
          // Beli langsung via curve
          const buyTx = await curve.buy(claimableWei, 0n, wallet.address, {
            value: claimableWei
          });
          console.log(`  Tx Buyback terkirim: ${buyTx.hash}`);
          await buyTx.wait();
          console.log(`  ✅ Buyback selesai!`);
        }

        // TAHAP 3: BURN KE DEAD ADDRESS
        const tokenBalance = await token.balanceOf(wallet.address);
        console.log(`  [3/3] Membakar ${ethers.formatUnits(tokenBalance, 18)} $${tokenSymbol} ke dead address...`);

        const burnTx = await token.transfer(DEAD_ADDRESS, tokenBalance);
        console.log(`  Tx Burn terkirim: ${burnTx.hash}`);
        await burnTx.wait();
        console.log(`  🔥 TOKEN BERHASIL DIMUSNAHKAN KE ${DEAD_ADDRESS}!`);

        cycle++;
        console.log(`  🎉 Siklus Flywheel #${cycle - 1} tuntas! Kembali memantau fee...\n`);
      } else {
        console.log(`  (Fee belum mencapai threshold ${CLAIM_THRESHOLD_ETH} ETH. Menunggu volume...)`);
      }
    } catch (err: any) {
      console.error("  ❌ Terjadi kesalahan pada siklus:", err.message || err);
    }
  }

  // Jalankan pengecekan pertama dan set interval berulang
  await checkCycle();
  setInterval(checkCycle, POLL_INTERVAL_SECONDS * 1000);
}

runFlywheel().catch(console.error);
