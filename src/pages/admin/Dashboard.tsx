import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getOverallOrderStatus } from "@/lib/orderStatus";
import { 
  Users, 
  ShoppingBag, 
  Wallet,
  ArrowRight, 
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
      setLoading(true);
      const [usersRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase
  .from("orders")
  .select(`
    *,
    buyer:profiles!orders_buyer_id_fkey(full_name),
    farmer:profiles!orders_farmer_id_fkey(full_name),
    order_items(
      id,
      status
    )
  `)
        
      ]);
      
      if (usersRes.error) toast.error(usersRes.error.message);
      else setUsers(usersRes.data || []);

      if (ordersRes.error) toast.error(ordersRes.error.message);
      else setOrders(ordersRes.data || []);
      
      const monthlyRevenue: Record<string, number> = {};

(ordersRes.data || []).forEach((order: any) => {
  if (getOverallOrderStatus(order) !== "delivered") return;

  const month = new Date(order.created_at).toLocaleString(
    "default",
    {
      month: "short",
      year: "2-digit",
    }
  );

  monthlyRevenue[month] =
    (monthlyRevenue[month] || 0) +
    Number(order.total || 0);
});
      
const chartData = Object.entries(monthlyRevenue)
  .map(([name, revenue]) => ({
    name,
    revenue,
  }))
  .sort((a, b) => {
    const da = new Date("01 " + a.name);
    const db = new Date("01 " + b.name);
    return da.getTime() - db.getTime();
  });

setRevenueData(chartData);

      setLoading(false);
    };
  
  useEffect(() => {
  fetchDashboardData();

  const channel = supabase
    .channel("admin-dashboard")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      () => {
        fetchDashboardData();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
      },
      () => {
        fetchDashboardData();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  
  const stats = {
  totalFarmers: users.filter(u => u.role === "farmer").length,

  pendingFarmers: users.filter(
    u => u.role === "farmer" && !u.is_verified
  ).length,

  totalBuyers: users.filter(
    u => u.role === "buyer"
  ).length,

  totalRevenue: orders
  .filter(
    order =>
      getOverallOrderStatus(order) === "delivered"
  )
  .reduce(
    (acc, order) => acc + Number(order.total || 0),
    0
  ),
    
activeOrders: orders.filter((order) => {
  const status = getOverallOrderStatus(order);

  return (
    status !== "delivered" &&
    status !== "cancelled"
  );
}).length,
    
  totalOrders: orders.length,

  pendingOrders: orders.filter(
    o => getOverallOrderStatus(o) === "pending"
  ).length,

  deliveredOrders: orders.filter(
    o => getOverallOrderStatus(o) === "delivered"
  ).length,
};

  const pendingFarmersList = users.filter(u => u.role === 'farmer' && !u.is_verified).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  if (loading) {
  return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform performance and manage users.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
  From {stats.deliveredOrders} completed orders
</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFarmers}</div>
            <p className="text-xs text-muted-foreground">
  {stats.totalFarmers - stats.pendingFarmers} verified
</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
  Pending Orders
</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
  {stats.pendingOrders}
</div>

<p className="text-xs text-muted-foreground">
  Awaiting processing
</p>
          </CardContent>
        </Card>
<Card className="border-l-4 border-l-orange-500">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      Active Orders
    </CardTitle>

    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
  </CardHeader>

  <CardContent>
    <div className="text-2xl font-bold">
      {stats.activeOrders}
    </div>

    <p className="text-xs text-muted-foreground">
      Orders currently in progress
    </p>
  </CardContent>
</Card>
        <Card className="border-l-4 border-l-green-600">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      Delivered Orders
    </CardTitle>

    <CheckCircle className="h-4 w-4 text-muted-foreground" />
  </CardHeader>

  <CardContent>
    <div className="text-2xl font-bold">
      {stats.deliveredOrders}
    </div>

    <p className="text-xs text-muted-foreground">
  {Math.round(
    (stats.deliveredOrders /
      (stats.totalOrders || 1)) *
      100
  )}% completion rate
</p>
  </CardContent>
</Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuyers}</div>
            <p className="text-xs text-muted-foreground">Registered buyers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue growth for the current year.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₦${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Farmers waiting for approval.</CardDescription>
            </div>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingFarmersList.length > 0 ? (
                pendingFarmersList.map((farmer) => (
                  <div key={farmer.id} className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {farmer.full_name?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{farmer.full_name}</p>
                        <p className="text-xs text-muted-foreground">{farmer.farm_name}</p>
                      </div>
                    </div>
                    <Link to="/admin/users">
                      <Button size="sm" variant="outline" className="h-8 text-xs">Review</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">All farmers are verified!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>The latest transactions on the platform.</CardDescription>
          </div>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm">View All Orders</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.split('-')[0].toUpperCase()}</TableCell>
                  <TableCell>{order.buyer?.full_name || "Unknown"}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    ₦{Number(order.total || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOverallOrderStatus(order) === "delivered"? "default": "outline"}className="capitalize">{getOverallOrderStatus(order)} </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
  <Link to={`/admin/orders/${order.id}`}>
    Details
  </Link>
</Button>
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
