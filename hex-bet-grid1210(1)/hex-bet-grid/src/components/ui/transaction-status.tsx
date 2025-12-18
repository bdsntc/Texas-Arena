import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Loader2, ExternalLink, FileText } from "lucide-react";
import { Button } from "./button";

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'signing' | 'confirming' | 'confirmed' | 'failed';
  txHash?: string | null;
  network?: 'solana' | 'evm';
  errorMessage?: string | null;
  className?: string;
}

export function TransactionStatus({ 
  status, 
  txHash, 
  network,
  errorMessage,
  className 
}: TransactionStatusProps) {
  if (status === 'idle') return null;

  const getExplorerUrl = () => {
    if (!txHash) return null;
    if (network === 'solana') {
      return `https://solscan.io/tx/${txHash}`;
    } else {
      return `https://etherscan.io/tx/${txHash}`;
    }
  };

  const explorerUrl = getExplorerUrl();

  return (
    <div className={cn(
      "p-4 rounded-lg border",
      status === 'pending' && "border-secondary/50 bg-secondary/10",
      status === 'signing' && "border-yellow-500/50 bg-yellow-500/10",
      status === 'confirming' && "border-blue-500/50 bg-blue-500/10",
      status === 'confirmed' && "border-primary/50 bg-primary/10",
      status === 'failed' && "border-destructive/50 bg-destructive/10",
      className
    )}>
      <div className="flex items-start gap-3">
        {status === 'pending' && (
          <>
            <Loader2 className="w-5 h-5 text-secondary animate-spin mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Preparing transaction</div>
              <div className="text-xs text-muted-foreground mt-1">Preparing transaction data...</div>
            </div>
          </>
        )}
        
        {status === 'signing' && (
          <>
            <Loader2 className="w-5 h-5 text-yellow-500 animate-spin mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Waiting for signature</div>
              <div className="text-xs text-muted-foreground mt-1">Please confirm the transaction in your wallet...</div>
            </div>
          </>
        )}
        
        {status === 'confirming' && (
          <>
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Confirming transaction</div>
              <div className="text-xs text-muted-foreground mt-1">
                Transaction sent, awaiting network confirmation...
              </div>
              {txHash && (
                <div className="text-xs text-muted-foreground font-mono mt-1 break-all">
                  {txHash.slice(0, 20)}...{txHash.slice(-10)}
                </div>
              )}
            </div>
          </>
        )}
        
        {status === 'confirmed' && (
          <>
            <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Transaction confirmed</div>
              <div className="text-xs text-muted-foreground mt-1">
                Transaction successfully confirmed and recorded on-chain
              </div>
              {txHash && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    {txHash}
                  </div>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View in block explorer
                    </a>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Transaction failed</div>
              <div className="text-xs text-muted-foreground mt-1">
                {errorMessage || 'The transaction could not be completed. Please try again.'}
              </div>
              {txHash && (
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    {txHash}
                  </div>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View transaction details
                    </a>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
