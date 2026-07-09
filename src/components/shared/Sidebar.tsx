import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, BarChart, Mountain, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';


const farmerNav = [
  { name: 'Overview', href: '/farmer/dashboard', icon: Home },
  { name: 'Products', href: '/farmer/products', icon: Package },
  { name: 'Orders', href: '/farmer/orders', icon: ShoppingCart },
  { name: 'Sales Summary', href: '/farmer/sales', icon: BarChart },
];

const buyerNav = [
  { name: 'Dashboard', href: '/buyer/dashboard', icon: Home },
  { name: 'Browse', href: '/products', icon: Package },
  { name: 'My Orders', href: '/buyer/orders', icon: ShoppingCart },
  { name: 'Wishlist', href: '/buyer/wishlist', icon: Users },
  { name: 'Account Settings', href: '/buyer/settings', icon: Settings },
];

const adminNav = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
  { name: 'Manage Products', href: '/admin/products', icon: Package },
  { name: 'Manage Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
];

const getNavLinks = (role: string) => {
  switch (role) {
    case 'farmer': return farmerNav;
    case 'buyer': return buyerNav;
    case 'admin': return adminNav; 
    default: return [];
  }
}

export default function Sidebar() { 
  const location = useLocation();
  const { user } = useAuth();
  const navLinks = getNavLinks(user?.role || '');

  return (
    <>
      <div className="flex h-16 items-center border-b px-4 lg:h-[68px] lg:px-6 md:hidden">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <Mountain className="h-6 w-6" />
          <span className="">FarmLink</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                location.pathname.startsWith(link.href) && 'bg-muted text-primary'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}