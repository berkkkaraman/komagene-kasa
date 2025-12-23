"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, Zap, Shield, Smartphone, Store, Users } from "lucide-react";

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-2xl tracking-tighter uppercase italic">
            GÜN<span className="text-primary not-italic">KASA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold">Giriş Yap</Button>
            </Link>
            <Link href="/register">
              <Button className="font-bold rounded-xl">Ücretsiz Başla</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
            İşletmenizi <span className="text-primary italic">Dijitalleştirin</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Restoran, kafe ve marketler için modern POS sistemi, dijital menü ve bulut tabanlı yönetim paneli.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl gap-2 shadow-xl shadow-primary/20">
                Hemen Başla <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signage/demo">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-2xl">
                Demo Menüyü Gör
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-12 tracking-tight">
            Neden <span className="text-primary">Günkasa</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black tracking-tight mb-6">
            Dakikalar İçinde <span className="text-primary">Dijitale Geçin</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Kredi kartı gerekmez. Hemen ücretsiz hesap oluşturun ve işletmenizi yönetmeye başlayın.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20">
              Ücretsiz Kayıt Ol
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t bg-secondary/10">
        <div className="container mx-auto text-center">
          <p className="font-black text-xl tracking-tighter uppercase italic mb-2">
            GÜN<span className="text-primary not-italic">KASA</span>
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 Günkasa. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
