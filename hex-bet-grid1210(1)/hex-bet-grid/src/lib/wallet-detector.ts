// Wallet detection utilities

export interface WalletInfo {
  id: 'phantom' | 'okx' | 'metamask' | 'magic-eden';
  name: string;
  downloadUrl: string;
  isInstalled: boolean;
}

// Detect whether a wallet is installed
export function detectWallet(walletId: 'phantom' | 'okx' | 'metamask' | 'magic-eden'): boolean {
  switch (walletId) {
    case 'phantom':
      return !!(window as any).phantom?.solana?.isPhantom;
    case 'okx':
      return !!(window as any).okxwallet;
    case 'metamask':
      return !!(window as any).ethereum?.isMetaMask;
    case 'magic-eden':
      return !!(window as any).magicEden;
    default:
      return false;
  }
}

// Get all wallet information
export function getAllWalletInfo(): WalletInfo[] {
  return [
    {
      id: 'phantom',
      name: 'Phantom',
      downloadUrl: 'https://phantom.app/',
      isInstalled: detectWallet('phantom'),
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      downloadUrl: 'https://www.okx.com/web3',
      isInstalled: detectWallet('okx'),
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      downloadUrl: 'https://metamask.io/',
      isInstalled: detectWallet('metamask'),
    },
    {
      id: 'magic-eden',
      name: 'Magic Eden',
      downloadUrl: 'https://www.magiceden.io/wallet',
      isInstalled: detectWallet('magic-eden'),
    },
  ];
}

// Fetch Solana balance
export async function getSolanaBalance(address: string): Promise<number> {
  try {
    const rpc = 'https://api.mainnet-beta.solana.com';
    const body = { 
      jsonrpc: '2.0', 
      id: 1, 
      method: 'getBalance', 
      params: [address] 
    };
    const response = await fetch(rpc, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    });
    const data = await response.json();
    const lamports: number = data?.result?.value ?? 0;
    return lamports / 1e9; // convert to SOL
  } catch (error) {
    console.error('Failed to fetch Solana balance:', error);
    return 0;
  }
}

// Fetch EVM balance
export async function getEVMBalance(address: string, provider: any): Promise<number> {
  try {
    if (provider && provider.request) {
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      return parseInt(balance, 16) / 1e18; // convert to ETH
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch EVM balance:', error);
    return 0;
  }
}

// Send Solana transaction
export async function sendSolanaTransaction(
  provider: any,
  toAddress: string,
  amount: number
): Promise<string> {
  try {
    // Note: A real recipient address is required
    // For demo purposes, you may use a test address or contract
    const publicKey = provider.publicKey;
    
    // Create transfer transaction
    // In production, build a real Solana transaction
    // For demo we simulate a signing flow
    
    // Request user signature
    const transaction = {
      to: toAddress,
      amount: amount * 1e9, // convert to lamports
    };
    
    // In production, you should:
    // 1. Build a Solana transaction object
    // 2. Sign with the wallet
    // 3. Send to the network
    // 4. Return the transaction hash
    
    // Simulate transaction flow (ideally call provider.signAndSendTransaction)
    const response = await provider.signAndSendTransaction({
      transaction: transaction,
    });
    
    return response.signature;
  } catch (error: any) {
    console.error('Solana transaction error:', error);
    throw new Error(error?.message || 'Transaction failed');
  }
}

// Send EVM transaction
export async function sendEVMTransaction(
  provider: any,
  toAddress: string,
  amount: number
): Promise<string> {
  try {
    // Get current account
    const accounts = await provider.request({ method: 'eth_accounts' });
    const fromAddress = accounts[0];
    
    // Get gas price
    const gasPrice = await provider.request({
      method: 'eth_gasPrice',
    });
    
    // Build transaction parameters
    const transactionParameters = {
      from: fromAddress,
      to: toAddress,
      value: `0x${(amount * 1e18).toString(16)}`, // convert to wei
      gasPrice: gasPrice,
      gas: '0x5208', // 21000 gas limit for simple transfer
    };
    
    // Request user signature and send transaction
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    
    return txHash;
  } catch (error: any) {
    console.error('EVM transaction error:', error);
    throw new Error(error?.message || 'Transaction failed');
  }
}

// Wait for transaction confirmation
export async function waitForTransaction(
  txHash: string,
  network: 'solana' | 'evm',
  provider?: any
): Promise<boolean> {
  try {
    if (network === 'solana') {
      // Solana transaction confirmation
      // In production, poll Solana RPC for status
      // For demo we simulate waiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } else {
      // EVM transaction confirmation
      if (provider) {
        // Wait for transaction to be mined
        await new Promise((resolve, reject) => {
          const checkInterval = setInterval(async () => {
            try {
              const receipt = await provider.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash],
              });
              
              if (receipt) {
                clearInterval(checkInterval);
                resolve(receipt);
              }
            } catch (error) {
              clearInterval(checkInterval);
              reject(error);
            }
          }, 1000);
          
          // 30s timeout
          setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Transaction timeout'));
          }, 30000);
        });
        return true;
      }
      // If no provider, simulate waiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    }
  } catch (error) {
    console.error('Transaction confirmation error:', error);
    return false;
  }
}

