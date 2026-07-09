import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Package, Truck, Tag, CheckCircle } from "lucide-react";

const notifications = [
  { id: 1, message: "Your order #789123 has been delivered!", time: "2 hours ago", icon: CheckCircle, read: false },
  { id: 2, message: "Order #456789 has shipped and is on its way.", time: "1 day ago", icon: Truck, read: false },
  { id: 3, message: "New product: Organic Honey available from Farmer Bob", time: "2 days ago", icon: Tag, read: true },
  { id: 4, message: "Your order #123456 is being processed.", time: "3 days ago", icon: Package, read: true },
];

const NotificationBell = () => {
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
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors ${
                !n.read ? 'bg-accent/30' : ''
              }`}
            >
              <n.icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
