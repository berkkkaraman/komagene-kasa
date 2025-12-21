"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { useRef } from "react";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const { setUserProfile, login, logout } = useStore();
    const fetchingInProgress = useRef<string | null>(null);

    const fetchProfile = async (userId: string) => {
        if (fetchingInProgress.current === userId) return;
        fetchingInProgress.current = userId;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle(); // maybeSingle avoids the 'PGRST116' error if profile is missing

            if (error) {
                console.error("❌ Profil Çekme Hatası:", error.message, error.details);
                // toast.error is removed from here to prevent loops, 
                // we'll handle UI feedback in the component that needs the profile
                setUserProfile(null);
                return;
            }

            if (data) {
                const profile = {
                    id: data.id,
                    email: data.email,
                    full_name: data.full_name,
                    role: data.role as 'admin' | 'manager' | 'staff',
                    branch_id: data.branch_id
                };
                setUserProfile(profile);
                login();
            } else {
                console.warn("⚠️ Profil bulunamadı, şube ataması bekleniyor...");
                setUserProfile(null);
            }
        } catch (e) {
            console.error("🔥 Beklenmedik Hata:", e);
        } finally {
            fetchingInProgress.current = null;
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setUserProfile(null);
                logout(); // Store temizliği
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        logout(); // Store temizliği
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
