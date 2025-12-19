"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

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

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                // Type casting because database types might not be generated yet
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
                console.warn("Profil bulunamadı, bekleniyor...");
                // If profile doesn't exist yet (triggers running), we might need to retry or 
                // handle it gracefully. For now, we assume trigger handles it fast enough
                // or we are in 'legacy' mode where we might default to main.
                setUserProfile(null);
            }
        } catch (e) {
            console.error("Profil getirme hatası:", e);
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
