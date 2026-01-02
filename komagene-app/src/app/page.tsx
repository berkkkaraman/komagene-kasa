"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, Zap, Shield, Smartphone, Store, Users, Loader2 } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Hızlı Satış",
    description: "POS sistemiyle saniyeler içinde sipariş alın"
  },
  {
    icon: BarChart3,
    title: "Anlık Raporlar",
    description: "Gelir-gider takibi ve detaylı analizler"
  },
  {
    icon: Smartphone,
    title: "QR Menü",
    description: "Müşteriler masadan sipariş versin"
  },
  {
    icon: Shield,
    title: "Güvenli Bulut",
    description: "Verileriniz şifreli ve yedekli"
  },
  {
    icon: Store,
    title: "Çoklu Şube",
    description: "Tüm şubelerinizi tek panelden yönetin"
  },
  {
    icon: Users,
    title: "Ekip Yönetimi",
    description: "Personel yetkileri ve vardiya takibi"
  }
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, they'll be redirected (just show loading)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(215,25,32,0.05),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(215,25,32,0.05),transparent_50%)]" />
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="container mx-auto">
          <div className="glass-panel px-8 h-12 md:h-16 flex items-center justify-between rounded-[2rem] border-white/10 shadow-2xl backdrop-blur-3xl">
            <Link href="/" className="font-display font-black text-xl md:text-2xl tracking-tighter uppercase italic group">
              GÜN<span className="text-primary not-italic group-hover:text-rose-500 transition-colors">KASA</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {["Özellikler", "Çözümler", "Fiyatlandırma"].map((item) => (
                <Link key={item} href="#" className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-display font-bold text-[10px] uppercase tracking-widest px-6 hover:bg-white/5">Giriş</Button>
              </Link>
              <Link href="/register">
                <Button className="font-display font-black text-[10px] uppercase tracking-widest px-8 rounded-full bg-primary hover:bg-rose-600 shadow-glow-sm shadow-primary/20">Başla</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary mb-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <Zap className="w-4 h-4 fill-primary" />
            <span className="font-display font-black text-[9px] uppercase tracking-[0.2em]">Yepyeni Günkasa v2.0 Yayında</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-display font-black tracking-tighter leading-[0.9] mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            İşletmeni <br />
            <span className="text-gradient italic">Yükselt</span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-14 duration-1200 delay-200">
            Restoran, kafe ve marketler için tasarlanmış en akıllı, en hızlı ve tamamen bulut tabanlı yeni nesil yönetim sistemi.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-16 duration-1500 delay-300">
            <Link href="/register">
              <Button size="lg" className="h-[4.5rem] px-12 text-lg font-display font-black rounded-[2rem] gap-3 shadow-2xl shadow-primary/30 hover:scale-105 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-rose-500 to-primary bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">ÜCRETSİZ DENE</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signage/demo">
              <Button size="lg" variant="ghost" className="h-[4.5rem] px-12 text-lg font-display font-black rounded-[2rem] gap-3 border border-white/5 glass-panel hover:bg-white/5">
                DEMOYU İNCELE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Dashboard Preview (Placeholder Visual) */}
      <section className="px-6 pb-32 relative group">
        <div className="absolute inset-0 bg-primary/20 blur-[150px] opacity-20 group-hover:opacity-40 transition-opacity -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="glass-panel rounded-[3rem] aspect-video border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden p-3 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="h-full w-full bg-black/40 rounded-[2.5rem] flex items-center justify-center p-20 text-center flex-col gap-4 border border-white/5">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Store className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-black tracking-tight text-white/50 uppercase">Günkasa Yönetim Paneli</h3>
              <p className="text-xs font-bold text-white/20 uppercase tracking-[0.3em]">Hız, Güç ve Zarafet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 relative bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-xs font-display font-black text-primary mb-4 tracking-[0.5em] uppercase animate-pulse">
              TEKNOLOJİK GÜÇ
            </h2>
            <h3 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              Neden <span className="text-gradient">Günkasa</span>?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="group p-8 rounded-[3rem] glass-card border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all duration-500 hover:scale-105 shadow-xl">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-8 shadow-glow-sm shadow-primary/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-black text-2xl mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-44 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse-glow" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-10 leading-[0.9]">
            Dakikalar İçinde <br />
            <span className="text-gradient italic">Dijitale Geçin</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 font-medium opacity-80">
            Kredi kartı gerekmez. Hemen ücretsiz hesabını oluştur ve işletmenin yeni çağına tanıklık et.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-20 px-16 text-xl font-display font-black rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(215,25,32,0.4)] hover:shadow-[0_40px_80px_-15px_rgba(215,25,32,0.6)] hover:scale-110 active:scale-95 transition-all">
              ŞİMDİ ÜCRETSİZ KATIL
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="container mx-auto">
          <div className="flex flex-col items-center gap-10">
            <Link href="/" className="font-display font-black text-4xl tracking-tighter uppercase italic group">
              GÜN<span className="text-primary not-italic">KASA</span>
            </Link>

            <div className="flex gap-10">
              {["Gizlilik", "Şartlar", "İletişim", "Destek"].map(item => (
                <Link key={item} href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors">
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
                MADE WITH ❤️ BY SG-AI TEAM
              </p>
              <p className="text-[10px] font-bold text-muted-foreground opacity-20">
                &copy; 2024 Günkasa. Her hakkı saklıdır.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
