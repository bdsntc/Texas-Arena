import { useState, useCallback } from 'react';
import { useWalletStore } from '@/store/walletStore';
import type { WalletProvider, WalletNetwork } from '@/store/walletStore';
import { 
  detectWallet, 
  getSolanaBalance, 
  getEVMBalance,
  sendSolanaTransaction,
  sendEVMTransaction,
  waitForTransaction
} from '@/lib/wallet-detector';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: number;
  network?: WalletNetwork;
  providerName?: WalletProvider;
}

export function useConnectWallet() {
  const walletStore = useWalletStore();
  const wallet: WalletState = {
    address: walletStore.address,
    isConnected: walletStore.isConnected,
    balance: walletStore.balance,
    network: walletStore.network,
    providerName: walletStore.providerName,
  };
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect Phantom (Solana)
  const connectPhantom = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if the wallet is installed
      if (!detectWallet('phantom')) {
        throw new Error('PHANTOM_NOT_INSTALLED');
      }

      const phantom = (window as any).phantom?.solana;
      if (!phantom || !phantom.isPhantom) {
        throw new Error('PHANTOM_NOT_INSTALLED');
      }

      const resp = await phantom.connect();
      const address: string = resp.publicKey?.toString?.() || resp.publicKey;
      
      // Fetch real balance
      const balance = await getSolanaBalance(address);
      
      walletStore.setWallet({ 
        address, 
        isConnected: true, 
        balance, 
        network: 'solana', 
        providerName: 'phantom' 
      });
    } catch (error: any) {
      setIsConnecting(false);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [walletStore]);

  // Connect OKX Wallet (supports EVM and Solana)
  const connectOKX = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if the wallet is installed
      if (!detectWallet('okx')) {
        throw new Error('OKX_NOT_INSTALLED');
      }

      const okx = (window as any).okxwallet;
      if (!okx) {
        throw new Error('OKX_NOT_INSTALLED');
      }

      let address: string;
      let network: WalletNetwork;
      let balance: number;

      // Prefer Solana first
      if (okx.solana) {
        const accounts = await okx.solana.connect();
        address = accounts.publicKey?.toString();
        network = 'solana';
        balance = await getSolanaBalance(address);
      } else if (okx.ethereum) {
        // If EVM is supported
        const accounts = await okx.ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
        network = 'evm';
        balance = await getEVMBalance(address, okx.ethereum);
      } else {
        throw new Error('OKX Wallet not available');
      }

      walletStore.setWallet({ 
        address, 
        isConnected: true, 
        balance, 
        network, 
        providerName: 'okx' 
      });
    } catch (error: any) {
      setIsConnecting(false);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [walletStore]);

  // Connect MetaMask (EVM)
  const connectMetaMask = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if the wallet is installed
      if (!detectWallet('metamask')) {
        throw new Error('METAMASK_NOT_INSTALLED');
      }

      const ethereum = (window as any).ethereum;
      if (!ethereum || !ethereum.isMetaMask) {
        throw new Error('METAMASK_NOT_INSTALLED');
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Fetch real balance
      const balance = await getEVMBalance(address, ethereum);
      
      walletStore.setWallet({ 
        address, 
        isConnected: true, 
        balance, 
        network: 'evm', 
        providerName: 'metamask' 
      });
    } catch (error: any) {
      setIsConnecting(false);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [walletStore]);

  // Connect Magic Eden (Solana)
  const connectMagicEden = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if the wallet is installed
      if (!detectWallet('magic-eden')) {
        throw new Error('MAGIC_EDEN_NOT_INSTALLED');
      }

      const magicEden = (window as any).magicEden;
      if (!magicEden) {
        throw new Error('MAGIC_EDEN_NOT_INSTALLED');
      }

      const accounts = await magicEden.connect();
      const address = accounts.publicKey?.toString();
      
      // Fetch real balance
      const balance = await getSolanaBalance(address);
      
      walletStore.setWallet({ 
        address, 
        isConnected: true, 
        balance, 
        network: 'solana', 
        providerName: 'magic-eden' 
      });
    } catch (error: any) {
      setIsConnecting(false);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [walletStore]);

  const disconnect = useCallback(() => {
    walletStore.reset();
  }, [walletStore]);

  return { 
    wallet, 
    connectPhantom, 
    connectOKX,
    connectMetaMask,
    connectMagicEden,
    disconnect, 
    isConnecting 
  };
}

export function useSendTransaction() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'signing' | 'confirming' | 'confirmed' | 'failed'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const walletStore = useWalletStore();

  const send = useCallback(async (amount: number, recipientAddress?: string) => {
    // Check whether the wallet is connected
    if (!walletStore.isConnected || !walletStore.address) {
      throw new Error('Please connect your wallet first');
    }

    // Check whether the balance is sufficient
    if (walletStore.balance < amount) {
      throw new Error('Insufficient balance');
    }

    setStatus('pending');
    setTxHash(null);
    setErrorMessage(null);
    
    try {
      const provider = walletStore.providerName;
      const network = walletStore.network;
      
      // Step 1: prepare transaction (simulated delay)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 2: request user signature (simulate wallet confirmation modal)
      setStatus('signing');
      
      // Simulate user confirmation delay (wallet confirmation UI in real apps)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock tx hash (based on network format)
      const hash = network === 'solana' 
        ? Array.from({ length: 88 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')
        : `0x${Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')}`;
      
      setTxHash(hash);
      
      // Step 3: wait for confirmation (simulate network process)
      setStatus('confirming');
      
      // Simulate network confirmation delay (poll in real apps)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate 90% success rate (demo; real apps should succeed)
      const success = Math.random() > 0.1;
      
      if (success) {
        setStatus('confirmed');
        
        // Simulate balance deduction (frontend-only display)
        const newBalance = Math.max(0, walletStore.balance - amount);
        walletStore.setWallet({ balance: newBalance });
        
        return { success: true, hash };
      } else {
        setStatus('failed');
        setErrorMessage('Transaction failed (simulated)');
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      setStatus('failed');
      setErrorMessage(error?.message || 'Transaction failed');
      throw error;
    }
  }, [walletStore]);

  const reset = useCallback(() => {
    setStatus('idle');
    setTxHash(null);
  }, []);

  return { status, txHash, errorMessage, send, reset };
}

export function useTransactionStatus(txHash: string | null) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed' | null>(null);

  // In a real implementation, this would poll the blockchain
  // For mock purposes, we just return confirmed after a delay
  
  return status;
}
