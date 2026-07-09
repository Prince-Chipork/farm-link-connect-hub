import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  MoreHorizontal, 
  Trash2, 
  AlertTriangle,
  ExternalLink,
  MapPin,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AdminManageProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*, profiles(full_name, is_verified)');
      if (error) {
        toast.error(error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast.error(error.message);
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product removed successfully');
    }
  };

  const handleToggleVerification = (productId: string) => {
    toast.info('Verification logic would go here');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Monitor all products listed on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image_url || '/placeholder.svg'} 
                          alt={product.name} 
                          className="h-10 w-10 rounded-md object-cover bg-muted"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {product.location || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{product.profiles?.full_name}</span>
                        {product.profiles?.is_verified ? (
                          <span className="text-[10px] text-green-600 font-semibold flex items-center">
                            <CheckCircle className="mr-1 h-2 w-2" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-orange-500 font-semibold flex items-center">
                            <AlertTriangle className="mr-1 h-2 w-2" /> Unverified
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₦{Number(product.price || 0).toLocaleString()}/{product.unit || 'kg'}</TableCell>
                    <TableCell>{product.stock_quantity || 0} {product.unit || 'kg'}</TableCell>
                    <TableCell>
                      {product.profiles?.is_verified ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Safe</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-500 border-orange-500">Review Required</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Page
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleVerification(product.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify Farmer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found.
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
