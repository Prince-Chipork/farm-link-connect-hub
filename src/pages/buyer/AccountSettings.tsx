import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, MapPin, Bell, Plus, Trash2, Edit } from "lucide-react";

type Address = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

const initialAddresses: Address[] = [
  { id: "1", label: "Home", street: "123 Buyer St", city: "Nairobi", state: "Nairobi", zip: "00100", isDefault: true },
  { id: "2", label: "Office", street: "456 Business Ave", city: "Nairobi", state: "Nairobi", zip: "00200", isDefault: false },
];

const AccountSettings = () => {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    emailNotifs: true,
    smsNotifs: false,
  });

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="w-4 h-4 mr-2" /> Addresses
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="Buyer Charlie" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="charlie@buyer.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+254 700 000 000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your shipping and billing addresses.</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add New
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="flex items-start justify-between p-4 rounded-lg border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{address.label}</span>
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.street}, {address.city}, {address.state} {address.zip}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeAddress(address.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Notification Types</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Order Updates</Label>
                    <p className="text-xs text-muted-foreground">Get notified about order status changes</p>
                  </div>
                  <Switch checked={notifPrefs.orderUpdates} onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, orderUpdates: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Promotions & Deals</Label>
                    <p className="text-xs text-muted-foreground">Receive special offers and discounts</p>
                  </div>
                  <Switch checked={notifPrefs.promotions} onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, promotions: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">New Products</Label>
                    <p className="text-xs text-muted-foreground">Be the first to know about new listings</p>
                  </div>
                  <Switch checked={notifPrefs.newProducts} onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, newProducts: v }))} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Delivery Method</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={notifPrefs.emailNotifs} onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, emailNotifs: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch checked={notifPrefs.smsNotifs} onCheckedChange={(v) => setNotifPrefs(p => ({ ...p, smsNotifs: v }))} />
                </div>
              </div>
              <Button className="mt-4">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;
