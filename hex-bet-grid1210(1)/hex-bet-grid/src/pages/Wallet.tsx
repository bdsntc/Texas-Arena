import { useEffect, useState } from "react";
import { WalletModal } from "@/components/ui/wallet-modal";
import { useConnectWallet } from "@/hooks/useWallet";

export default function Wallet() {
  const {
    connectPhantom,
    connectOKX,
    connectMetaMask,
    connectMagicEden,
    isConnecting,
  } = useConnectWallet();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <div className="p-6">
      <WalletModal
        open={open}
        onOpenChange={setOpen}
        onConnectPhantom={connectPhantom}
        onConnectOKX={connectOKX}
        onConnectMetaMask={connectMetaMask}
        onConnectMagicEden={connectMagicEden}
        isConnecting={isConnecting}
      />
    </div>
  );
}
