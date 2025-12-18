import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hero-gradient fixed inset-0 pointer-events-none" />
      <Navbar />
      <main className="pt-16 relative">
        {children}
      </main>
    </div>
  );
}
