import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/landing';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailsPage from './pages/products/ProductDetailsPage';
import CheckoutPage from './pages/products/CheckoutPage';

import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerProducts from './pages/farmer/Products';
import CreateProduct from './pages/farmer/CreateProduct';
import FarmerOrders from './pages/farmer/Orders';

import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerOrderHistory from './pages/buyer/OrderHistory';
import BuyerWishlist from './pages/buyer/Wishlist';
import BuyerAccountSettings from './pages/buyer/AccountSettings';

import AdminDashboard from './pages/admin/Dashboard';
import AdminManageUsers from './pages/admin/ManageUsers';
import AdminManageProducts from './pages/admin/ManageProducts';
import AdminManageOrders from './pages/admin/ManageOrders';
import AdminReports from './pages/admin/Reports';

import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import CartPage from "@/pages/CartPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/products" element={<FarmerProducts />} />
            <Route path="/farmer/products/new" element={<CreateProduct />} />
            <Route path="/farmer/products/edit/:id" element={<CreateProduct />} />
            <Route path="/farmer/orders" element={<FarmerOrders />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/orders" element={<BuyerOrderHistory />} />
            <Route path="/buyer/wishlist" element={<BuyerWishlist />} />
            <Route path="/buyer/settings" element={<BuyerAccountSettings />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminManageUsers />} />
            <Route path="/admin/products" element={<AdminManageProducts />} />
            <Route path="/admin/orders" element={<AdminManageOrders />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
  position="top-center"
  richColors
/>
    </>
  );
}

export default App;
