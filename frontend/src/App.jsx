import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Cart/CheckoutPage';
import OrdersPage from './pages/Orders/OrdersPage';
import SellerDashboard from './pages/Dashboard/SellerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import WishlistPage from './pages/Wishlist/WishlistPage';
import ProfilePage from './pages/Profile/ProfilePage';
import StoresPage from './pages/Stores/StoresPage';
import StoreDetailPage from './pages/Stores/StoreDetailPage';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const NoNavLayout = ({ children }) => <>{children}</>;

const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc', fontSize: '14px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
      }} />

      <Routes>
        {/* Auth pages - no navbar/footer */}
        <Route path="/login" element={<NoNavLayout><LoginPage /></NoNavLayout>} />
        <Route path="/register" element={<NoNavLayout><RegisterPage /></NoNavLayout>} />

        {/* Dashboard - no footer */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute roles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        } />

        {/* Admin - no footer */}
        <Route path="/admin/*" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Main pages */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
        <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
        <Route path="/stores" element={<MainLayout><StoresPage /></MainLayout>} />
        <Route path="/stores/:id" element={<MainLayout><StoreDetailPage /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
        <Route path="/checkout" element={
          <MainLayout>
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          </MainLayout>
        } />
        <Route path="/orders" element={
          <MainLayout>
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/wishlist" element={
          <MainLayout>
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          </MainLayout>
        } />

        <Route path="/profile" element={
          <MainLayout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </MainLayout>
        } />

        {/* 404 */}
        <Route path="*" element={
          <MainLayout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">404</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-6">The page you're looking for doesn't exist</p>
                <a href="/" className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors">Go Home</a>
              </div>
            </div>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
