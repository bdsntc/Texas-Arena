import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/ui/wallet-button";
import { Home, Users, Gamepad2, Trophy, LayoutDashboard, Settings } from "lucide-react";

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Lobby', href: '/lobby', icon: Users },
  { label: 'Match', href: '/match', icon: Gamepad2 },
  { label: 'Results', href: '/results', icon: Trophy },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-10 h-10 rounded-lg bg-[url('/p1.jpg')] bg-center bg-cover shadow-[0_0_20px_hsl(172_100%_57%_/_0.3)] group-hover:shadow-[0_0_30px_hsl(172_100%_57%_/_0.5)] transition-shadow"
            aria-label="Texas Arena"
          />
          <span className="font-display font-bold text-xl text-foreground hidden sm:block">
            Texas <span className="text-primary">Arena</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                "hover:bg-muted hover:text-primary",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4 inline-block mr-2" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <WalletButton />
      </div>
    </header>
  );
}
1
