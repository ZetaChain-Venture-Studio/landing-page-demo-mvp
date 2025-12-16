import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { zetachain, zetachainAthensTestnet } from 'viem/chains';

// Contract ABI (only the functions we need)
const NFT_ABI = parseAbi([
  'function mint(address to) external returns (uint256)',
  'function batchMint(address[] calldata recipients) external',
  'function hasMinted(address wallet) view returns (bool)',
  'function walletToToken(address wallet) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function setMinter(address _minter) external',
  'event GenesisMinted(address indexed to, uint256 indexed tokenId)',
]);

// Configuration
const CONTRACT_ADDRESS = process.env.POP_AI_NFT_ADDRESS as `0x${string}` | undefined;
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY as `0x${string}` | undefined;
const USE_TESTNET = process.env.ZETACHAIN_TESTNET === 'true';

// Chain configuration
const chain = USE_TESTNET ? zetachainAthensTestnet : zetachain;
const rpcUrl = USE_TESTNET
  ? 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public'
  : 'https://zetachain-evm.blockpi.network/v1/rpc/public';

// Create clients
const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

function getWalletClient() {
  if (!MINTER_PRIVATE_KEY) {
    throw new Error('MINTER_PRIVATE_KEY not configured');
  }

  const account = privateKeyToAccount(MINTER_PRIVATE_KEY);

  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
}

// Check if NFT is configured
export function isNFTConfigured(): boolean {
  return !!(CONTRACT_ADDRESS && MINTER_PRIVATE_KEY);
}

// Check if wallet has already minted
export async function hasMinted(walletAddress: string): Promise<boolean> {
  if (!CONTRACT_ADDRESS) {
    console.warn('[NFT] Contract address not configured');
    return false;
  }

  try {
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'hasMinted',
      args: [walletAddress as `0x${string}`],
    });
    return result as boolean;
  } catch (error) {
    console.error('[NFT] Error checking hasMinted:', error);
    return false;
  }
}

// Get token ID for wallet
export async function getTokenId(walletAddress: string): Promise<number | null> {
  if (!CONTRACT_ADDRESS) {
    return null;
  }

  try {
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'walletToToken',
      args: [walletAddress as `0x${string}`],
    });
    const tokenId = Number(result);
    return tokenId > 0 ? tokenId : null;
  } catch (error) {
    console.error('[NFT] Error getting token ID:', error);
    return null;
  }
}

// Get total supply
export async function getTotalSupply(): Promise<number> {
  if (!CONTRACT_ADDRESS) {
    return 0;
  }

  try {
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'totalSupply',
    });
    return Number(result);
  } catch (error) {
    console.error('[NFT] Error getting total supply:', error);
    return 0;
  }
}

// Mint Genesis NFT to user
export async function mintGenesisNFT(userWallet: string): Promise<{
  success: boolean;
  tokenId?: number;
  txHash?: string;
  error?: string;
}> {
  if (!CONTRACT_ADDRESS) {
    return { success: false, error: 'Contract address not configured' };
  }

  if (!MINTER_PRIVATE_KEY) {
    return { success: false, error: 'Minter private key not configured' };
  }

  try {
    // Check if already minted
    const alreadyMinted = await hasMinted(userWallet);
    if (alreadyMinted) {
      const existingTokenId = await getTokenId(userWallet);
      return {
        success: true,
        tokenId: existingTokenId || undefined,
        error: 'Already minted'
      };
    }

    const walletClient = getWalletClient();

    // Mint the NFT
    console.log('[NFT] Minting to:', userWallet);

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [userWallet as `0x${string}`],
    });

    console.log('[NFT] Transaction submitted:', hash);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log('[NFT] Transaction confirmed:', receipt.status);

    if (receipt.status === 'success') {
      // Get the token ID from the event
      const tokenId = await getTokenId(userWallet);
      return {
        success: true,
        tokenId: tokenId || undefined,
        txHash: hash,
      };
    } else {
      return {
        success: false,
        error: 'Transaction failed',
        txHash: hash,
      };
    }
  } catch (error) {
    console.error('[NFT] Error minting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Batch mint to multiple wallets
export async function batchMintGenesisNFT(wallets: string[]): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  if (!CONTRACT_ADDRESS || !MINTER_PRIVATE_KEY) {
    return { success: false, error: 'NFT not configured' };
  }

  try {
    const walletClient = getWalletClient();

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'batchMint',
      args: [wallets as `0x${string}`[]],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      success: receipt.status === 'success',
      txHash: hash,
    };
  } catch (error) {
    console.error('[NFT] Error batch minting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get NFT info for display
export async function getNFTInfo(walletAddress: string): Promise<{
  hasMinted: boolean;
  tokenId: number | null;
  contractAddress: string | null;
  network: string;
}> {
  const minted = await hasMinted(walletAddress);
  const tokenId = minted ? await getTokenId(walletAddress) : null;

  return {
    hasMinted: minted,
    tokenId,
    contractAddress: CONTRACT_ADDRESS || null,
    network: USE_TESTNET ? 'ZetaChain Testnet' : 'ZetaChain Mainnet',
  };
}
