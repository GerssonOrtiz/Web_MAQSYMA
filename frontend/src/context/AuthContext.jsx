import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  const fetchProfile = useCallback(async (authUser) => {
    if (!supabase || !authUser) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, company, role, created_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      // Fallback seguro si la tabla profiles aún no fue creada en Supabase
      const fallback = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || "",
        company: authUser.user_metadata?.company || "",
        role: "customer",
      };
      setProfile(fallback);
      return fallback;
    }

    const resolved = data || {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || "",
      company: authUser.user_metadata?.company || "",
      role: "customer",
    };
    setProfile(resolved);
    return resolved;
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const currentSession = data?.session || null;
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        await fetchProfile(currentSession.user);
      }
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        setUser(nextSession?.user || null);
        if (nextSession?.user) {
          await fetchProfile(nextSession.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    if (!supabase) {
      throw new Error("Supabase no está configurado en el frontend.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    const loadedProfile = await fetchProfile(data.user);
    return { ...data, profile: loadedProfile };
  };

  const signUp = async ({ email, password, fullName = "", company = "" }) => {
    if (!supabase) {
      throw new Error("Supabase no está configurado en el frontend.");
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          company: company.trim(),
        },
      },
    });
    if (error) throw error;
    if (data.user && data.session) {
      await fetchProfile(data.user);
    }
    return data;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async ({ fullName, company }) => {
    if (!supabase || !user) throw new Error("No hay sesión activa.");
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        company: company.trim(),
      })
      .eq("id", user.id)
      .select("id, email, full_name, company, role, created_at")
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: profile?.role === "admin",
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile: () => fetchProfile(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
