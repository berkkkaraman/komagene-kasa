import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useStore } from "@/store/useStore";

interface AdminGuardProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'manager' | 'staff';
}

export function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
    const { user, loading: authLoading } = useAuth();
    const { userProfile, isLoading: storeLoading } = useStore();
    const router = useRouter();

    const isLoading = authLoading || storeLoading;

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login"); // Redirect to login if not authenticated
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                    Yetki Kontrolü Yapılıyor...
                </p>
            </div>
        );
    }

    if (!user) return null;

    // Check Role
    if (userProfile && userProfile.role !== requiredRole && userProfile.role !== 'admin') {
        // If user is not the required role AND not an admin (admins can access everything)
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-6 p-4 text-center">
                <div className="bg-destructive/10 p-6 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Erişim Reddedildi</h1>
                    <p className="text-muted-foreground max-w-[500px]">
                        Bu sayfayı görüntülemek için <strong>{requiredRole.toUpperCase()}</strong> yetkisine sahip olmanız gerekmektedir.
                        Mevcut yetkiniz: <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{userProfile.role?.toUpperCase() || 'YOK'}</span>
                    </p>
                </div>
                <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Ana Sayfaya Dön
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
