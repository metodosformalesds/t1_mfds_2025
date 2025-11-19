import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";

// Componentes Globales
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Header from "./Componentes/Header";
import Footer from "./Componentes/Footer";
import CartSidebar from "./Componentes/CartSidebar";
import AdminSidebar from "./Componentes/AdminSidebar";
import { ProtectedRoute } from "./Componentes/ProtectedRoute";

// Páginas principales
import Home from "./Home/HomePage";
import AboutUs from "./Home/AboutUsPage";

// Login y Registro
import Login from "./Login/LoginPage";
import Register from "./Login/RegisterPage";
import RSelect from "./Login/RecoverySelect";
import RCode from "./Login/RecoveryCode"; 
import RPassword from "./Login/RecoveryPassword";
import SetupP from "./Login/SetupProfile";
import ConfirmAccount from "./Login/ConfirmAccount";

// Perfil de usuario
import ProfileUser from "./Profile/UserProfile";
import PersonalInfo from "./Profile/PersonalInformation";
import FitnessProfile from "./Profile/FitnessProfile";
import Addresses from "./Profile/Addresses";
import LoyaltyProgram from "./Profile/LoyaltyProgram.jsx";
import SubscriptionPage from "./Profile/Subscription.jsx";
import OrderHistory from "./Profile/OrderHistory";
import PaymentMethods from "./Payments/PaymentMethods";

// Productos
import Tienda from "./Componentes/Shop.jsx";
import ProductDetail from "./Products/ProductDetails";
import CartPage from "./Products/CartPage";
import CheckoutPage from "./Products/CheckoutPage";
import DoReviews from "./Products/Reviews";

// Test de posicionamiento
import PlacementTest from "./PositioningTest/Test";
import PlacementTestQuestions from "./PositioningTest/PlacementTestQuestions";
import TestResults from "./PositioningTest/TestResults";

// Admin
import ManageProducts from "./Admin/ManageProducts";
import Dashboard from "./Admin/Dashboard";

// Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_tu_clave_publica");

// Estilos globales
import "./index.css";

// Mock data removido - ahora se obtiene del backend

// --- MAIN LAYOUT ---
const MainLayout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const isCartOrCheckoutPage =
    location.pathname === "/CartPage" || location.pathname === "/CheckoutPage";

  const handleCartClick = () => {
    if (!isCartOrCheckoutPage) setIsCartOpen(true);
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const productId = product.product_id || product.id;
      const exists = prev.find((item) => (item.product_id || item.id) === productId);
      if (exists) {
        return prev.map((item) =>
          (item.product_id || item.id) === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Normalizar estructura para compatibilidad
      return [...prev, { 
        ...product,
        id: productId,
        product_id: productId,
        title: product.name || product.title,
        name: product.name || product.title,
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => (item.product_id || item.id) !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCartItems((prev) =>
      prev.map((item) => ((item.product_id || item.id) === id ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <>
      <Header
        cartItems={cartItems}
        onCartClick={handleCartClick}
        isCartDisabled={isCartOrCheckoutPage}
      />

      <CartSidebar
        isOpen={isCartOpen && !isCartOrCheckoutPage}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />

      <Outlet
        context={{
          cartItems,
          addToCart,
          removeFromCart,
          updateQuantity,
          setIsCartOpen,
          clearCart,
        }}
      />

      <Footer />
    </>
  );
};

// --- ADMIN LAYOUT ---
const AdminLayout = () => (
  <div className="flex min-h-screen">
    <AdminSidebar />
    <main className="flex-1 ml-20">
      <Outlet />
    </main>
  </div>
);

// --- RUTAS PRINCIPALES ---
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas - Accesibles sin autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/RegisterPage" element={<Register />} />
        <Route path="/RecoverySelect" element={<RSelect />} />
        <Route path="/RecoveryCode" element={<RCode />} />
        <Route path="/RecoveryPassword" element={<RPassword />} />
        <Route path="/SetupProfile" element={<SetupP />} />
        <Route path="/confirm-account" element={<ConfirmAccount />} />

        {/* Layout principal */}
        <Route element={<MainLayout />}>
          {/* HomePage - Accesible sin autenticación */}
          <Route path="/" element={<Home />} />
          <Route path="/aboutUsPage" element={<AboutUs />} />

          {/* Rutas Protegidas - Requieren autenticación */}
          <Route path="/placement-test/questions" element={<ProtectedRoute><PlacementTestQuestions /></ProtectedRoute>} />
          <Route path="/placement-test/results" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileUser /></ProtectedRoute>} />

          {/* Tienda - Protegida */}
          <Route path="/Productos" element={<Tienda />} />
          <Route path="/:productName/:id" element={<ProductDetail />} />
          <Route path="/CartPage" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/CheckoutPage" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

          {/* Subscripción - Protegida */}
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />

          {/* Órdenes - Protegidas */}
          <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/reviews/:orderId" element={<ProtectedRoute><DoReviews /></ProtectedRoute>} />

          {/* Test - Protegido */}
          <Route path="/placement-test" element={<ProtectedRoute><PlacementTest /></ProtectedRoute>} />

          {/* Perfil - Protegido */}
          <Route path="/personal-info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/fitness-profile" element={<ProtectedRoute><FitnessProfile /></ProtectedRoute>} />

          {/* Pagos - Protegido */}
          <Route
            path="/payment-methods"
            element={
              <ProtectedRoute>
                <Elements stripe={stripePromise}>
                  <PaymentMethods />
                </Elements>
              </ProtectedRoute>
            }
          />

          {/* Lealtad - Protegida */}
          <Route path="/loyalty-program" element={<ProtectedRoute><LoyaltyProgram /></ProtectedRoute>} />
        </Route>

        {/* Admin - Protegido */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
        </Route>
      </Routes>
    </Router>
  );
}
