import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { getAllWalletInfo, type WalletInfo } from "@/lib/wallet-detector";
import { ExternalLink, Download } from "lucide-react";
// Use static paths (public/) for images

interface WalletOption {
  id: 'phantom' | 'okx' | 'metamask' | 'magic-eden';
  name: string;
  icon: string;
  network: string;
}

// Wallet icon component
function WalletIcon({ walletId }: { walletId: string }) {
  switch (walletId) {
    case 'phantom':
      return <img src="/ph.png" alt="Phantom" className="w-12 h-12 rounded-lg object-cover" />;
    case 'okx':
      return <img src="/okx.png" alt="OKX Wallet" className="w-12 h-12 rounded-lg object-cover" />;
    case 'metamask':
      return <img src="/mate.png" alt="MetaMask" className="w-12 h-12 rounded-lg object-cover" />;
    case 'magic-eden':
      return <img src="/mg.PNG" alt="Magic Eden" className="w-12 h-12 rounded-lg object-cover" />;
    default:
      return <div className="w-12 h-12 rounded-lg bg-muted" />;
  }
}

const walletOptions: WalletOption[] = [
  { id: 'phantom', name: 'Phantom', icon: '', network: 'Solana' },
  { id: 'okx', name: 'OKX Wallet', icon: '', network: 'Solana' },
  { id: 'metamask', name: 'MetaMask', icon: '', network: 'Ethereum' },
  { id: 'magic-eden', name: 'Magic Eden', icon: '', network: 'Solana' },
];

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectPhantom: () => Promise<void>;
  onConnectOKX: () => Promise<void>;
  onConnectMetaMask: () => Promise<void>;
  onConnectMagicEden: () => Promise<void>;
  isConnecting: boolean;
}

export function WalletModal({ 
  open, 
  onOpenChange, 
  onConnectPhantom,
  onConnectOKX,
  onConnectMetaMask,
  onConnectMagicEden,
  isConnecting 
}: WalletModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo[]>([]);

  // Detect wallet installation status
  useEffect(() => {
    if (open) {
      setWalletInfo(getAllWalletInfo());
    }
  }, [open]);

  const handle = async (walletId: string, fn: () => Promise<void>) => {
    setError(null);
    setConnectingWallet(walletId);
    try {
      await fn();
      onOpenChange(false);
      setConnectingWallet(null);
    } catch (e: any) {
      const errorMessage = e?.message || "Connection failed";
      // Check whether it's a "not installed" error
      if (errorMessage.includes('NOT_INSTALLED')) {
        setError(null); // Hide error; show download CTA instead
      } else {
        setError(errorMessage);
      }
      setConnectingWallet(null);
    }
  };

  const handleDownload = (wallet: WalletInfo) => {
    window.open(wallet.downloadUrl, '_blank');
  };

  const getConnectHandler = (walletId: string) => {
    switch (walletId) {
      case 'phantom':
        return () => handle(walletId, onConnectPhantom);
      case 'okx':
        return () => handle(walletId, onConnectOKX);
      case 'metamask':
        return () => handle(walletId, onConnectMetaMask);
      case 'magic-eden':
        return () => handle(walletId, onConnectMagicEden);
      default:
        return () => {};
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {walletOptions.map((wallet) => {
            const isConnectingThis = connectingWallet === wallet.id;
            const disabled = isConnecting && !isConnectingThis;
            const walletInfoItem = walletInfo.find(w => w.id === wallet.id);
            const isInstalled = walletInfoItem?.isInstalled ?? false;
            
            return (
              <div
                key={wallet.id}
                className={cn(
                  "w-full p-4 rounded-lg",
                  "bg-muted/50 border border-border",
                  "transition-all duration-200",
                  isInstalled && "hover:border-primary/50 hover:shadow-lg",
                  !isInstalled && "opacity-75"
                )}
              >
                <div className="flex items-center gap-4">
                  <WalletIcon walletId={wallet.id} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{wallet.name}</span>
                      {!isInstalled && (
                        <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive">
                          Not installed
                        </span>
                      )}
                    </div>
                    
                  </div>
                  {isConnectingThis && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {isInstalled ? (
                  <button
                    onClick={getConnectHandler(wallet.id)}
                    disabled={disabled}
                    className={cn(
                      "w-full mt-3 py-2 px-4 rounded-lg",
                      "bg-primary text-primary-foreground font-medium",
                      "hover:bg-primary/90 transition-colors",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    Connect
                  </button>
                ) : (
                  <Button
                    onClick={() => handleDownload(walletInfoItem!)}
                    variant="outline"
                    className="w-full mt-3 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download {wallet.name}
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        {error && (
          <div className="text-destructive text-sm mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
