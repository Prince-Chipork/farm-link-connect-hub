import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Session inactivity settings
const WARNING_TIME = 1 * 60 * 1000; // 15 minutes
const LOGOUT_TIME = 2 * 60 * 1000;  // 20 minutes

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const lastActivityRef = useRef<number>(Date.now());

  const isSigningOutRef = useRef(false);

  const clearInactivityTimers = () => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const handleAutomaticLogout = async () => {
    if (isSigningOutRef.current) return;

    isSigningOutRef.current = true;

    clearInactivityTimers();

    toast.info(
      "Your session has expired due to inactivity. Please log in again."
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Automatic logout failed:", error);
    }

    setUser(null);
    setLoading(false);

    isSigningOutRef.current = false;
  };

  const resetInactivityTimer = () => {
    if (!user) return;
    if (isSigningOutRef.current) return;

    lastActivityRef.current = Date.now();

    clearInactivityTimers();

    warningTimerRef.current = setTimeout(() => {
      if (!user || isSigningOutRef.current) return;

      toast.warning(
        "Your session will expire in 5 minutes due to inactivity.",
        {
          duration: 10000,
          id: "session-warning",
        }
      );
    }, WARNING_TIME);

    logoutTimerRef.current = setTimeout(() => {
      handleAutomaticLogout();
    }, LOGOUT_TIME);
  };

  const fetchProfile = async (
    id: string,
    email: string
  ) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        "Error fetching profile:",
        error
      );

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
        console.error(
          "Error initializing auth:",
          error
        );

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
        if (
          event === "SIGNED_OUT" ||
          !session?.user
        ) {
          clearInactivityTimers();
          setUser(null);
          setLoading(false);
          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED"
        ) {
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

      clearInactivityTimers();

      subscription.unsubscribe();
    };
  }, []);

  // Start/reset inactivity timer whenever the
  // authenticated user changes.
  useEffect(() => {
    if (!user) {
      clearInactivityTimers();
      return;
    }

    resetInactivityTimer();

    return () => {
      clearInactivityTimers();
    };
  }, [user]);

  // Monitor user activity.
  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    let activityThrottle: ReturnType<
      typeof setTimeout
    > | null = null;

    const handleActivity = () => {
      if (activityThrottle) return;

      activityThrottle = setTimeout(() => {
        activityThrottle = null;

        const now = Date.now();

        // Only reset the timer when at least 1 second
        // has passed since the previous recorded activity.
        if (
          now - lastActivityRef.current >= 1000
        ) {
          resetInactivityTimer();
        }
      }, 1000);
    };

    activityEvents.forEach((event) => {
      window.addEventListener(
        event,
        handleActivity,
        { passive: true }
      );
    });

    return () => {
      if (activityThrottle) {
        clearTimeout(activityThrottle);
      }

      activityEvents.forEach((event) => {
        window.removeEventListener(
          event,
          handleActivity
        );
      });
    };
  }, [user]);

  const signOut = async () => {
    if (isSigningOutRef.current) return;

    isSigningOutRef.current = true;

    clearInactivityTimers();

    setLoading(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      isSigningOutRef.current = false;
      return;
    }

    setUser(null);
    setLoading(false);

    isSigningOutRef.current = false;
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
