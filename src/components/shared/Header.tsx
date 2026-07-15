import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Mountain, ShoppingCart } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";


    export default function Header() {
  const { user, signOut } = useAuth();
const { cartCount } = useCart();
console.log("Header user:", user);
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Mountain />
          <span>FarmLink</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild><Link to="/products">Browse Products</Link></Button>
          <Button variant="ghost" asChild><Link to="/signup">Become a Seller</Link></Button>
        </nav>
      <div className="hidden md:flex items-center space-x-2">
  {user ? (
    <>
      <Button variant="ghost" asChild>
  <Link
    to={
      user?.role === "farmer"
        ? "/farmer/dashboard"
        : user?.role === "admin"
        ? "/admin/dashboard"
        : "/buyer/dashboard"
    }
  >
    Dashboard
  </Link>
</Button>
        
      {user && (
  <Button variant="ghost" asChild className="relative">
    <Link to="/cart">
      <ShoppingCart className="h-5 w-5" />

      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </Link>
  </Button>
)}
      <Button variant="outline" onClick={signOut}>
        Logout
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" asChild>
        <Link to="/login">Login</Link>
      </Button>

      <Button asChild>
        <Link to="/signup">Sign Up</Link>
      </Button>
    </>
  )}

  <ThemeToggle />
</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Mountain className="h-6 w-6" />
                <span className="sr-only">FarmLink</span>
              </Link>
              <Link to="/products" className="hover:text-foreground">Browse Products</Link>
              <Link to="/signup-farmer" className="hover:text-foreground">Become a Seller</Link>
              <hr className='my-4'/>
              {user ? (
  <>
    <Link
  to={
    user.role === "farmer"
      ? "/farmer/dashboard"
      : user.role === "buyer"
      ? "/buyer/dashboard"
      : "/admin/dashboard"
  }
>
  Dashboard
</Link>

    <button
      onClick={signOut}
      className="text-left hover:text-foreground"
    >
      Logout
    </button>
  </>
) : (
  <>
    <Link to="/login" className="hover:text-foreground">
      Login
    </Link>

    <Link to="/signup" className="hover:text-foreground">
      Sign Up
    </Link>
  </>
)}
              <div className="pt-4">
                <ThemeToggle />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
