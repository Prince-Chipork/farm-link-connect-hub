import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (id: string, email: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
      return;
    }

    if (!data) {
      setUser(null);
      return;
    }

    setUser({
      id: data.id,
      name: data.full_name || "",
      email,
      role: data.role as any,
      verified: data.is_verified ?? undefined,
      farmName: data.farm_name ?? undefined,
      farmLocation: data.farm_location ?? undefined,
      trustLevel: data.trust_level as any,
    });
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          await fetchProfile(
            session.user.id,
            session.user.email ?? ""
          );
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setLoading(true);

          setTimeout(async () => {
            if (!mounted) return;

            await fetchProfile(
              session.user.id,
              session.user.email ?? ""
            );

            if (mounted) {
              setLoading(false);
            }
          }, 0);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};
