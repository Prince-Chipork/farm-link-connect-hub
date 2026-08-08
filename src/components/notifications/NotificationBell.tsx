import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";

import {
  Bell,
  Package,
  Truck,
  Tag,
  CheckCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const NotificationBell = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  /*
   * Load existing notifications
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Unable to load notifications:",
          error
        );

        setNotifications([]);

        setLoading(false);

        return;
      }

      setNotifications(data ?? []);

      setLoading(false);
    };

    fetchNotifications();
  }, [user]);

  /*
   * Realtime notification listener
   */
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            "Realtime notification received:",
            payload.new
          );

          setNotifications((current) => {
            // Prevent duplicate notifications
            const alreadyExists = current.some(
              (notification) =>
                notification.id === payload.new.id
            );

            if (alreadyExists) {
              return current;
            }

            return [
              payload.new,
              ...current,
            ];
          });
        }
      )
      .subscribe((status) => {
        console.log(
          "Notification realtime status:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /*
   * Count unread notifications
   */
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  /*
   * Mark notification as read and navigate
   */
  const handleNotificationClick = async (
    notification: any
  ) => {
    try {
      if (!notification.is_read) {
        const { error } = await supabase
          .from("notifications")
          .update({
            is_read: true,
          })
          .eq("id", notification.id)
          .eq("user_id", user?.id);

        if (error) {
          console.error(
            "Unable to mark notification as read:",
            error
          );

          return;
        }

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item
          )
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error(
        "Notification click failed:",
        error
      );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
      >
        <div className="p-4 border-b">
          <h4 className="font-semibold">
            Notifications
          </h4>

          <p className="text-xs text-muted-foreground">
            {unreadCount} unread
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon =
                notification.type === "success"
                  ? CheckCircle
                  : notification.type === "shipping"
                  ? Truck
                  : notification.type === "product"
                  ? Tag
                  : Package;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  className={`w-full text-left flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors ${
                    !notification.is_read
                      ? "bg-accent/30"
                      : ""
                  }`}
                >
                  <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
