import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const PROFILE_COLUMNS =
  "id, email, first_name, last_name, full_name, document_type, document_number, phone, company, accepted_privacy, role, created_at";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  const buildFallbackProfile = (authUser) => {
    const meta = authUser.user_metadata || {};
    const firstName = meta.first_name || meta.given_name || "";
    const lastName = meta.last_name || meta.family_name || "";
    const fullName = meta.full_name || meta.name || `${firstName} ${lastName}`.trim();
    return {
      id: authUser.id,
      email: authUser.email,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      document_type: meta.document_type || "",
      document_number: meta.document_number || "",
      phone: meta.phone || "",
      company: meta.company || "",
      accepted_privacy: Boolean(meta.accepted_privacy),
      role: "customer",
    };
  };

  const fetchProfile = useCallback(async (authUser) => {
    if (!supabase || !authUser) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", authUser.id)
      .maybeSingle();

    if (error || !data) {
      const fallback = buildFallbackProfile(authUser);
      setProfile(fallback);
      return fallback;
    }

    setProfile(data);
    return data;
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

  const signUp = async ({
    email,
    password,
    firstName = "",
    lastName = "",
    documentType = "",
    documentNumber = "",
    phone = "",
    company = "",
    acceptedPrivacy = false,
  }) => {
    if (!supabase) {
      throw new Error("Supabase no está configurado en el frontend.");
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          document_type: documentType.trim(),
          document_number: documentNumber.trim(),
          phone: phone.trim(),
          company: company.trim(),
          accepted_privacy: Boolean(acceptedPrivacy),
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

  const updateProfile = async ({
    firstName = "",
    lastName = "",
    documentType = "",
    documentNumber = "",
    phone = "",
    company = "",
  }) => {
    if (!supabase || !user) throw new Error("No hay sesión activa.");
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
        document_type: documentType.trim(),
        document_number: documentNumber.trim(),
        phone: phone.trim(),
        company: company.trim(),
      })
      .eq("id", user.id)
      .select(PROFILE_COLUMNS)
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
