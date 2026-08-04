import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Package, Truck, Tag, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const NotificationBell = () => {
  const { user } = useAuth();

const [notifications, setNotifications] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
  useEffect(() => {
  if (!user) return;

  const fetchNotifications = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data ?? []);
    }

    setLoading(false);
  };

  fetchNotifications();
}, [user]);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
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
    notifications.map((n) => {
      const Icon =
        n.type === "success"
          ? CheckCircle
          : n.type === "shipping"
          ? Truck
          : n.type === "product"
          ? Tag
          : Package;

      return (
        <div
          key={n.id}
          className={`flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors ${
            !n.is_read ? "bg-accent/30" : ""
          }`}
        >
          <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {n.title}
            </p>

            <p className="text-sm text-muted-foreground">
              {n.message}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>

          {!n.is_read && (
            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
      );
    })
  )}
</div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
