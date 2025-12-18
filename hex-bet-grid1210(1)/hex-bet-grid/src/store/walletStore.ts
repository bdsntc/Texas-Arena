import { create } from 'zustand';

export type WalletNetwork = 'evm' | 'solana' | undefined;
export type WalletProvider = 'phantom' | 'okx' | 'metamask' | 'magic-eden' | undefined;

interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: number;
  network: WalletNetwork;
  providerName: WalletProvider;
  setWallet: (partial: Partial<WalletState>) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  balance: 0,
  network: undefined,
  providerName: undefined,
  setWallet: (partial) => set((prev) => ({ ...prev, ...partial })),
  reset: () => set({ address: null, isConnected: false, balance: 0, network: undefined, providerName: undefined }),
}));

