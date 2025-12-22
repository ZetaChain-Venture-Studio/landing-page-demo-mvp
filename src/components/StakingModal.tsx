"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { ColorPalette, lightSteel, isDarkPalette } from '@/lib/palettes';
import { useWallets } from '@privy-io/react-auth';
import { encodeFunctionData, formatUnits, parseUnits, createPublicClient, http } from 'viem';
import { zetachain } from 'viem/chains';
import { stakingAbi, STAKING_PRECOMPILE_ADDRESS, VALIDATOR_ADDRESS } from '@/lib/stakingAbi';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  palette?: ColorPalette;
  paletteId?: string;
  onStakeSuccess?: (amount: string) => void;
}

export default function StakingModal({
  isOpen,
  onClose,
  walletAddress,
  palette,
  paletteId = '3',
  onStakeSuccess
}: StakingModalProps) {
  const colors = palette || lightSteel;
  const isDark = isDarkPalette(paletteId);
  const { wallets } = useWallets();

  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Balances
  const [walletBalance, setWalletBalance] = useState('0');
  const [stakedBalance, setStakedBalance] = useState('0');

  const overlayBg = colors.overlay || (isDark ? 'rgba(12, 12, 12, 0.95)' : 'rgba(248, 249, 250, 0.95)');

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoadingData(true);
    try {
      const client = createPublicClient({
        chain: zetachain,
        transport: http(),
      });

      // Get wallet ZETA balance
      const balance = await client.getBalance({
        address: walletAddress as `0x${string}`
      });
      setWalletBalance(formatUnits(balance, 18));

      // Get staked balance
      try {
        const delegationResult = await client.readContract({
          address: STAKING_PRECOMPILE_ADDRESS,
          abi: stakingAbi,
          functionName: 'delegation',
          args: [walletAddress as `0x${string}`, VALIDATOR_ADDRESS],
        });

        // delegationResult is [shares, balance] where balance is { denom, amount }
        const [, balanceData] = delegationResult as [bigint, { denom: string; amount: bigint }];
        setStakedBalance(formatUnits(balanceData.amount, 18));
      } catch {
        // No delegation found - this is normal for new users
        setStakedBalance('0');
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchBalances();
    }
  }, [isOpen, walletAddress, fetchBalances]);

  // Handle stake
  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amountWei = parseUnits(amount, 18);
    if (amountWei > parseUnits(walletBalance, 18)) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const wallet = wallets.find(w => w.walletClientType === 'privy');
      if (!wallet) throw new Error('No wallet found');

      // Switch to ZetaChain if needed
      await wallet.switchChain(zetachain.id);

      const provider = await wallet.getEthereumProvider();

      // Encode the delegate function call
      const data = encodeFunctionData({
        abi: stakingAbi,
        functionName: 'delegate',
        args: [walletAddress as `0x${string}`, VALIDATOR_ADDRESS, amountWei],
      });

      // Send transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: STAKING_PRECOMPILE_ADDRESS,
          data,
          value: '0x0',
        }],
      });

      setSuccess(`Staked ${amount} ZETA successfully!`);
      setAmount('');

      // Callback for points
      if (onStakeSuccess) {
        onStakeSuccess(amount);
      }

      // Refresh balances after a delay
      setTimeout(fetchBalances, 3000);

      console.log('Stake tx:', txHash);
    } catch (err) {
      console.error('Stake error:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle unstake
  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amountWei = parseUnits(amount, 18);
    if (amountWei > parseUnits(stakedBalance, 18)) {
      setError('Insufficient staked balance');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const wallet = wallets.find(w => w.walletClientType === 'privy');
      if (!wallet) throw new Error('No wallet found');

      await wallet.switchChain(zetachain.id);

      const provider = await wallet.getEthereumProvider();

      const data = encodeFunctionData({
        abi: stakingAbi,
        functionName: 'undelegate',
        args: [walletAddress as `0x${string}`, VALIDATOR_ADDRESS, amountWei],
      });

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: STAKING_PRECOMPILE_ADDRESS,
          data,
          value: '0x0',
        }],
      });

      setSuccess(`Unstaking ${amount} ZETA initiated! Unbonding period: ~21 days`);
      setAmount('');

      setTimeout(fetchBalances, 3000);

      console.log('Unstake tx:', txHash);
    } catch (err) {
      console.error('Unstake error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unstake');
    } finally {
      setIsLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (activeTab === 'stake') {
      // Leave small amount for gas (~0.01 ZETA)
      const max = Math.max(0, parseFloat(walletBalance) - 0.01);
      setAmount(max.toFixed(4));
    } else {
      setAmount(stakedBalance);
    }
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: overlayBg }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 pb-8"
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: colors.border }} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors"
              style={{ color: colors.textLight }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: colors.bgAlt }}
              >
                <Coins className="w-6 h-6" style={{ color: colors.accent }} />
              </div>
              <h2 className="text-xl font-medium mb-1" style={{ color: colors.text }}>
                Stake ZETA
              </h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Earn 1 point per ZETA staked
              </p>
            </div>

            {/* Balance cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div
                className="p-3 rounded-xl text-center"
                style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
              >
                <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Wallet</p>
                {isLoadingData ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" style={{ color: colors.textMuted }} />
                ) : (
                  <p className="text-lg font-medium" style={{ color: colors.text }}>
                    {formatBalance(walletBalance)} <span className="text-xs">ZETA</span>
                  </p>
                )}
              </div>
              <div
                className="p-3 rounded-xl text-center"
                style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
              >
                <p className="text-xs mb-1" style={{ color: colors.textMuted }}>Staked</p>
                {isLoadingData ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" style={{ color: colors.textMuted }} />
                ) : (
                  <p className="text-lg font-medium" style={{ color: colors.accent }}>
                    {formatBalance(stakedBalance)} <span className="text-xs">ZETA</span>
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div
              className="flex rounded-xl p-1 mb-4"
              style={{ backgroundColor: colors.bgAlt }}
            >
              <button
                onClick={() => { setActiveTab('stake'); setError(null); setSuccess(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'stake' ? colors.bg : 'transparent',
                  color: activeTab === 'stake' ? colors.accent : colors.textMuted,
                  boxShadow: activeTab === 'stake' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Stake
              </button>
              <button
                onClick={() => { setActiveTab('unstake'); setError(null); setSuccess(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === 'unstake' ? colors.bg : 'transparent',
                  color: activeTab === 'unstake' ? colors.accent : colors.textMuted,
                  boxShadow: activeTab === 'unstake' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <ArrowDownCircle className="w-4 h-4" />
                Unstake
              </button>
            </div>

            {/* Amount input */}
            <div className="mb-4">
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
              >
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-lg outline-none"
                  style={{ color: colors.text }}
                  min="0"
                  step="0.01"
                />
                <span className="text-sm font-medium" style={{ color: colors.textMuted }}>ZETA</span>
                <button
                  onClick={setMaxAmount}
                  className="px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: colors.accent + '20',
                    color: colors.accent
                  }}
                >
                  MAX
                </button>
              </div>
              <p className="text-xs mt-1 px-1" style={{ color: colors.textLight }}>
                Available: {formatBalance(activeTab === 'stake' ? walletBalance : stakedBalance)} ZETA
              </p>
            </div>

            {/* Error/Success messages */}
            {error && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
              >
                {success}
              </div>
            )}

            {/* Action button */}
            <button
              onClick={activeTab === 'stake' ? handleStake : handleUnstake}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor: colors.accent,
                color: isDark ? colors.bg : '#ffffff'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                activeTab === 'stake' ? 'Stake ZETA' : 'Unstake ZETA'
              )}
            </button>

            {/* Info */}
            <p className="text-xs text-center mt-4" style={{ color: colors.textLight }}>
              {activeTab === 'stake'
                ? 'Staking to anuma.ai validator on ZetaChain'
                : 'Unstaking takes ~21 days to complete'
              }
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
