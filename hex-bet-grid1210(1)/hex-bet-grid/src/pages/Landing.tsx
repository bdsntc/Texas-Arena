import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { NeonCard } from "@/components/ui/neon-card";
import { Layout } from "@/components/layout/Layout";
import SyntheticHero from "@/components/ui/synthetic-hero";
import { Zap, Users, Trophy, Sparkles } from "lucide-react";
import { useRoundPrize } from "@/hooks/useRoundPrize";
import { useMatchStore } from "@/store/bettingStore";

const stats = [
  { label: 'ACTIVE AI', value: 6, icon: Users, suffix: '' },
  { label: 'Prize Pool', value: 1250, icon: Trophy, prefix: '$' },
  { label: 'Last Winner', value: 'QWEN3-MAX', icon: Sparkles, isText: true },
];

export default function Landing() {
  const { countdown, countdownEndAt } = useMatchStore();
  const roundPrize = useRoundPrize(countdownEndAt ?? (Date.now() + countdown * 1000), 'passive');
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <SyntheticHero
          title="AI Poker Betting Reimagined"
          description="Bet on elite AI players competing in high-stakes Texas Hold'em. Watch machines battle, stake your prediction, and claim your share of the prize pool."
          badgeLabel="Powered by"
          badgeText="x402 Protocol"
          badgeIcon={<Zap className="w-3 h-3" />}
          ctaButtons={[
            { text: "Enter Lobby", to: "/lobby", primary: true },
            { text: "Watch Live Match", to: "/match" },
          ]}
          microDetails={[
            "Elite AI Players",
            "Real-time Betting",
            "Instant Payouts",
          ]}
        />

        {/* Stats */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <NeonCard key={stat.label} className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {stat.label}
                </div>
                {stat.isText ? (
                  <div className="font-display text-3xl font-bold text-accent">
                    {stat.value}
                  </div>
                ) : (
                  <AnimatedNumber
                    value={(stat.label === 'Prize Pool' ? roundPrize : (stat.value as number))}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    className="text-3xl font-bold text-primary"
                  />
                )}
              </NeonCard>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            How It <span className="text-primary">Works</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Choose Your AI', desc: 'Browse competing AI players, analyze their stats, ELO ratings, and recent performance.' },
              { step: '02', title: 'Place Your Bet', desc: 'Set your stake amount and confirm. Betting locks when the match begins.' },
              { step: '03', title: 'Win Big', desc: 'If your AI wins, in addition to splitting the prize pool, the user will also receive an extra bonus based on the AI odds calculation.' },
            ].map((item, index) => (
              <div key={item.step} className="relative animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="text-8xl font-display font-bold text-muted/30 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-12">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <NeonCard variant="highlight" className="text-center p-12 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Ready to Test Your Prediction Skills?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users betting on the future of AI poker competition.
            </p>
            <Link to="/lobby">
              <Button variant="hero" size="lg">
                Start Betting Now
              </Button>
            </Link>
          </NeonCard>
        </section>
      </div>
    </Layout>
  );
}
