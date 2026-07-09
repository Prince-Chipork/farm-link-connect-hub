import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart as LucideBarChart, 
  TrendingUp, 
  Download, 
  Calendar,
  FileText,
  Users,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner';

const revenueData = [
  { name: "Jan", revenue: 450000 },
  { name: "Feb", revenue: 380000 },
  { name: "Mar", revenue: 620000 },
  { name: "Apr", revenue: 540000 },
  { name: "May", revenue: 780000 },
  { name: "Jun", revenue: 690000 },
];

const categoryData = [
  { name: 'Vegetables', value: 400 },
  { name: 'Fruits', value: 300 },
  { name: 'Grains', value: 300 },
  { name: 'Dairy', value: 200 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AdminReports() {
  const handleExport = () => {
    toast.success('Report generation started. You will be notified when it is ready.');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground text-sm">Detailed analytics and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42.50</div>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3" /> +5.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+128</div>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <LucideBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-red-600 font-medium flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 rotate-180" /> -0.4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfillment Rate</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3" /> +1.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Daily revenue over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.6 0.15 150)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="oklch(0.6 0.15 150)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="oklch(0.6 0.15 150)" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Sales by product category.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
