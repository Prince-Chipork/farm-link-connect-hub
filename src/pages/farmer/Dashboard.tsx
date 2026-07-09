import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Award,
  Plus,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const revenueData = [
  { name: "Jan", revenue: 450000 },
  { name: "Feb", revenue: 380000 },
  { name: "Mar", revenue: 620000 },
  { name: "Apr", revenue: 540000 },
  { name: "May", revenue: 780000 },
  { name: "Jun", revenue: 690000 },
];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [farmerOrders, setFarmerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      
      try {
        const [productsRes, ordersRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('farmer_id', user.id),
          supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5)
        ]);

        if (productsRes.error) throw productsRes.error;
        if (ordersRes.error) throw ordersRes.error;

        setProductsCount(productsRes.count || 0);
        setFarmerOrders(ordersRes.data || []);
        
        // For demonstration, ordersRes.data is used for recent table. 
        // In a real app, we'd filter orders by items belonging to this farmer.
        const { data: allOrders, error: revError } = await supabase.from('orders').select('total');
        if (revError) throw revError;

        setOrdersCount(allOrders?.length || 0);
        setTotalRevenue(allOrders?.reduce((acc: number, curr: any) => acc + Number(curr.total || 0), 0) || 0);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Farmer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your farm operations and track your performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Report</Button>
          <Button asChild>
            <Link to="/farmer/products">
              <Plus className="h-4 w-4 mr-2" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{ordersCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Products Listed</p>
              <p className="text-2xl font-bold">{productsCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trust Level</p>
              <p className="text-2xl font-bold text-purple-600">Platinum</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue growth from your farm sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shop Status</CardTitle>
            <CardDescription>Quick overview of your presence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm font-medium">Store Status</span>
              <Badge className="bg-green-500">Active</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm font-medium">Verification</span>
              <Badge variant="secondary">Verified</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm font-medium">Positive Rating</span>
              <span className="text-sm font-bold text-green-600">98%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <span className="text-sm font-bold">~2 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Overview of your most recent customer orders.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/farmer/orders">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {farmerOrders.length > 0 ? farmerOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">#{order.id.split('-')[0].toUpperCase()}</td>
                    <td className="px-4 py-4">{order.profiles?.full_name || 'Customer'}</td>
                    <td className="px-4 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4 font-semibold text-foreground">₦{Number(order.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant="secondary" 
                        className={`capitalize text-[10px] ${
                          order.status === "delivered" ? "bg-green-100 text-green-800" :
                          order.status === "processing" ? "bg-amber-100 text-amber-800" :
                          "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
