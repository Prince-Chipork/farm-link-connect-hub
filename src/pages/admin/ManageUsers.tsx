import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  ShieldAlert,
  Mail,
  MapPin,
  Filter
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        toast.error(error.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.farm_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const farmers = filteredUsers.filter(u => u.role === 'farmer');
  const buyers = filteredUsers.filter(u => u.role === 'buyer');

  const handleVerify = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
    if (error) {
      toast.error(error.message);
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: true } : u));
      toast.success('Farmer verified successfully');
    }
  };

  const handleReject = (userId: string) => {
    toast.info('Farmer verification rejected');
  };

  const handleSuspend = (userId: string) => {
    toast.warning('User account suspended');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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

      <Tabs defaultValue="farmers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
          <TabsTrigger value="farmers">Farmers ({farmers.length})</TabsTrigger>
          <TabsTrigger value="buyers">Buyers ({buyers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="farmers">
          <Card>
            <CardHeader>
              <CardTitle>Farmers</CardTitle>
              <CardDescription>Manage farmer accounts and verification status.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Farm Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : farmers.length > 0 ? (
                    farmers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {user.full_name?.charAt(0) || 'F'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.full_name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.farm_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                            {user.farm_location || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_verified ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-500 border-orange-500">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!user.is_verified && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 text-xs border-green-500 text-green-600 hover:bg-green-50"
                                  onClick={() => handleVerify(user.id)}
                                >
                                  <UserCheck className="mr-1 h-3 w-3" />
                                  Verify
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 text-xs border-red-500 text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(user.id)}
                                >
                                  <UserX className="mr-1 h-3 w-3" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                                  <ShieldAlert className="mr-2 h-4 w-4" />
                                  Suspend Account
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No farmers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers">
          <Card>
            <CardHeader>
              <CardTitle>Buyers</CardTitle>
              <CardDescription>Manage buyer accounts and activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : buyers.length > 0 ? (
                    buyers.map((buyer) => (
                      <TableRow key={buyer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {buyer.full_name?.charAt(0) || 'B'}
                            </div>
                            <span className="font-medium">{buyer.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                            {buyer.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(buyer.created_at).toLocaleDateString()}
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
                              <DropdownMenuItem onClick={() => handleSuspend(buyer.id)}>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Suspend Account
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No buyers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
