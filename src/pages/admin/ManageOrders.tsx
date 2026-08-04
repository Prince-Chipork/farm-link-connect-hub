import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOverallOrderStatus } from "@/lib/orderStatus";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { calculateOrderTotal } from "@/lib/orderCalculations";
import { Search, MoreHorizontal, Eye, Truck, XCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from "@/components/orders/StatusBadge";
  
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu,  DropdownMenuContent,  DropdownMenuItem,  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AdminManageOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("orders")
.select(`
  *,
  buyer:profiles!orders_buyer_id_fkey(full_name),
  order_items(
    quantity,
    price,
    delivery_fee,
    status
  )
`)
    
      if (error) {
  toast.error(error.message);
} else {
  setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o =>
  o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (o.buyer?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (o.farmer?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  getOverallOrderStatus(o)
  .toLowerCase()
  .includes(searchTerm.toLowerCase())
);
 return (
    <div className="flex flex-col gap-6">
         <div className="mb-6">
  <Button asChild variant="outline" size="sm">
      <Link to="/admin/dashboard">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
</div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

    <h1 className="text-3xl font-bold tracking-tight">
      Manage Orders
    </h1>
  </div>

  <div className="flex items-center gap-2">
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search orders..."
        className="pl-8 w-full sm:w-[300px]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    <Button variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  </div>
</div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage customer orders across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      #{order.id.split('-')[0].toUpperCase()}
                    </TableCell>
                  <TableCell>
  <div className="space-y-1">
    <p>
      <strong>Buyer:</strong> {order.buyer?.full_name || "Unknown"}
    </p>
  </div>
</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>₦{calculateOrderTotal(order).toLocaleString()}</TableCell>
                    <TableCell>
  <StatusBadge status={getOverallOrderStatus(order)} />
</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
  <Link to={`/admin/orders/${order.id}`}>
    <Eye className="mr-2 h-4 w-4" />
    View Details
  </Link>
</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
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
