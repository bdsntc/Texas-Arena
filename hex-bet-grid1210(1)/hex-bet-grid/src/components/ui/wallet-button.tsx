import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useConnectWallet } from "@/hooks/useWallet";
import { WalletModal } from "./wallet-modal";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

export function WalletButton() {
  const { 
    wallet, 
    connectPhantom, 
    connectOKX,
    connectMetaMask,
    connectMagicEden,
    disconnect, 
    isConnecting 
  } = useConnectWallet();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!wallet.isConnected) {
    return (
      <>
        <Button
          variant="neon"
          onClick={() => setShow(true)}
          disabled={isConnecting}
          className="gap-2"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        <WalletModal 
          open={show} 
          onOpenChange={setShow} 
          onConnectPhantom={connectPhantom}
          onConnectOKX={connectOKX}
          onConnectMetaMask={connectMetaMask}
          onConnectMagicEden={connectMagicEden}
          isConnecting={isConnecting}
        />
      </>
    );
  }

  const explorerUrl = wallet.network === 'evm'
    ? (wallet.address ? `https://etherscan.io/address/${wallet.address}` : undefined)
    : (wallet.address ? `https://solscan.io/account/${wallet.address}` : undefined);

  return (
    <div className="flex items-center gap-3">
      <div className="px-4 py-2 rounded-lg bg-muted border border-primary/30 flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Balance</div>
          <AnimatedNumber 
            value={wallet.balance} 
            prefix="$" 
            decimals={2}
            className="text-primary font-bold"
          />
        </div>
        <div className="w-px h-8 bg-border" />
        <button
          onClick={copyAddress}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">
            {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
          </span>
          {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
        </button>
        {explorerUrl && (
          <a href={explorerUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
            View
          </a>
        )}
        <div className="text-xs text-muted-foreground">
          {(wallet.providerName || '').toUpperCase()} {wallet.network === 'evm' ? 'Ethereum' : wallet.network === 'solana' ? 'Solana' : ''}
        </div>
      </div>
      <Button variant="outline" onClick={() => setShow(true)}>Reconnect</Button>
      <Button variant="ghost" size="icon" onClick={disconnect}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
