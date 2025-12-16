"use client";

import { useState, useEffect } from 'react';

interface NFTStatus {
  configured: boolean;
  contractAddress: string | null;
  network: string;
  totalSupply?: number;
  totalSupplyError?: string;
  walletInfo?: {
    hasMinted: boolean;
    tokenId: number | null;
    contractAddress: string | null;
    network: string;
  };
  walletError?: string;
}

interface MintResult {
  success: boolean;
  tokenId?: number;
  txHash?: string;
  alreadyMinted?: boolean;
  error?: string;
  configured?: boolean;
}

export default function DebugDashboard() {
  const [status, setStatus] = useState<NFTStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintWallet, setMintWallet] = useState('');
  const [checkWallet, setCheckWallet] = useState('');
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [minting, setMinting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async (wallet?: string) => {
    setLoading(true);
    addLog(`Fetching NFT status${wallet ? ` for wallet ${wallet}` : ''}...`);
    try {
      const url = wallet
        ? `/api/nft/status?wallet=${wallet}`
        : '/api/nft/status';
      const response = await fetch(url);
      const data = await response.json();
      setStatus(data);
      addLog(`Status response: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`Error fetching status: ${error}`);
    }
    setLoading(false);
  };

  const handleMint = async () => {
    if (!mintWallet) {
      addLog('Error: No wallet address provided');
      return;
    }

    setMinting(true);
    setMintResult(null);
    addLog(`🚀 Starting mint for wallet: ${mintWallet}`);

    try {
      addLog('📤 POST /api/nft/mint...');
      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: mintWallet }),
      });
      const result = await response.json();
      setMintResult(result);
      addLog(`📥 Mint response: ${JSON.stringify(result)}`);

      if (result.success) {
        addLog(`✅ Mint successful! Token ID: ${result.tokenId}, TX: ${result.txHash}`);
        // Refresh status
        fetchStatus();
      } else {
        addLog(`❌ Mint failed: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Mint error: ${error}`);
      setMintResult({ success: false, error: String(error) });
    }

    setMinting(false);
  };

  const handleCheckWallet = () => {
    if (checkWallet) {
      fetchStatus(checkWallet);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🔧 NFT Debug Dashboard</h1>
        <p className="text-gray-400 mb-8">Manual NFT minting and status checking</p>

        {/* Status Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 NFT Configuration Status</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : status ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${status.configured ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>Configured: {status.configured ? 'Yes' : 'No'}</span>
              </div>
              <p><strong>Contract:</strong> <code className="bg-gray-700 px-2 py-1 rounded text-sm">{status.contractAddress || 'Not set'}</code></p>
              <p><strong>Network:</strong> {status.network}</p>
              <p><strong>Total Supply:</strong> {status.totalSupply ?? status.totalSupplyError ?? 'Unknown'}</p>

              {status.walletInfo && (
                <div className="mt-4 p-4 bg-gray-700 rounded">
                  <h3 className="font-semibold mb-2">Wallet Status:</h3>
                  <p>Has Minted: {status.walletInfo.hasMinted ? '✅ Yes' : '❌ No'}</p>
                  <p>Token ID: {status.walletInfo.tokenId ?? 'N/A'}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-400">Failed to load status</p>
          )}
          <button
            onClick={() => fetchStatus()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
          >
            Refresh Status
          </button>
        </div>

        {/* Check Wallet Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Check Wallet NFT Status</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={checkWallet}
              onChange={(e) => setCheckWallet(e.target.value)}
              placeholder="0x... wallet address"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCheckWallet}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Check
            </button>
          </div>
        </div>

        {/* Manual Mint Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎨 Manual Mint NFT</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={mintWallet}
              onChange={(e) => setMintWallet(e.target.value)}
              placeholder="0x... wallet address to mint to"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleMint}
              disabled={minting || !mintWallet}
              className={`px-6 py-2 rounded transition font-semibold ${
                minting || !mintWallet
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {minting ? '⏳ Minting...' : '🚀 Mint NFT'}
            </button>
          </div>

          {mintResult && (
            <div className={`p-4 rounded ${mintResult.success ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'}`}>
              <h3 className="font-semibold mb-2">{mintResult.success ? '✅ Mint Success!' : '❌ Mint Failed'}</h3>
              {mintResult.success ? (
                <>
                  <p>Token ID: {mintResult.tokenId}</p>
                  <p>TX Hash: <code className="text-xs">{mintResult.txHash}</code></p>
                  {mintResult.alreadyMinted && <p className="text-yellow-400">Already minted</p>}
                </>
              ) : (
                <p className="text-red-300">{mintResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Logs Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📝 Debug Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition"
            >
              Clear
            </button>
          </div>
          <div className="bg-black rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-300 mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">📌 Quick Info</h3>
          <p className="text-sm text-gray-400">
            Contract: <code className="bg-gray-700 px-1 rounded">0x3E89cDbFB68A88F405E83af7a78D2E1af6F5cFdF</code>
          </p>
          <p className="text-sm text-gray-400">
            Minter Wallet: <code className="bg-gray-700 px-1 rounded">0x334E6F34C04260313d6BF68B091d40B519bd098c</code>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            ⚠️ Make sure minter wallet has ZETA for gas!
          </p>
        </div>
      </div>
    </div>
  );
}
