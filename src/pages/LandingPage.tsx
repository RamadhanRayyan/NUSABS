import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Code, Book, Users, Star, Globe, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <span className="text-xl font-bold tracking-tight">NUSA <span className="text-primary">Boarding</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#method" className="hover:text-primary transition-colors">Method</a>
            <a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Button size="sm">Apply Now</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <Zap className="w-3 h-3" />
              <span>100 Days Learning, Then Earning</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              The Future of <span className="text-primary italic">Islamic IT</span> Education
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              NUSA Boarding School combines cutting-edge technology training with Islamic values. 
              We don't just teach code; we build character and real-world careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="h-14 px-8 text-base gap-2">
                  Explore Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                View Student Portfolios
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="w-6 h-6 text-primary" />}
              title="Bootcamp Style"
              description="Intensive project-based learning focused on full-stack development and UI/UX design."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Islamic Values"
              description="Character building and religious foundation integrated into daily technical training."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-primary" />}
              title="English First"
              description="Daily communication in English to prepare students for the global tech market."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Real Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Placement Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Mentorship</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Lines of Code</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl border border-border bg-card/50 hover:border-primary/50 transition-all"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
