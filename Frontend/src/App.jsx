import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";

// Componentes Globales
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Header from "./Componentes/Header";
import Footer from "./Componentes/Footer";
import CartSidebar from "./Componentes/CartSidebar";
import AdminSidebar from "./Componentes/AdminSidebar";

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

// --- BASE DE DATOS CENTRALIZADA ---
const ALL_PRODUCTS = [
  { id: 1, title: "Whey Gold Standard", category: "proteinas", goal: "muscle", activity: "gym", description: "Proteína aislada", price: 1200, rating: 5, reviewCount: 320, hasBg: false },
  { id: 2, title: "Gatorade Polvo", category: "post-entreno", goal: "performance", activity: "team_sports", description: "Hidratación intensa", price: 200, rating: 4, reviewCount: 500, hasBg: true },
  { id: 3, title: "Multivitamínico Pro", category: "vitaminas", goal: "health", activity: "swimming", description: "Salud integral", price: 400, rating: 5, reviewCount: 120, hasBg: false },
  { id: 4, title: "Creatina Monohidratada", category: "creatinas", goal: "muscle", activity: "crossfit", description: "Fuerza explosiva", price: 600, rating: 5, reviewCount: 300, hasBg: false },
  { id: 5, title: "Pre-Workout C4", category: "pre-entreno", goal: "energy", activity: "gym", description: "Energía total", price: 550, rating: 4, reviewCount: 200, hasBg: false },
  { id: 6, title: "Isotónico Gel", category: "pre-entreno", goal: "performance", activity: "cycling", description: "Resistencia larga", price: 50, rating: 5, reviewCount: 80, hasBg: true },
  { id: 7, title: "Quemador Hydroxy", category: "quemadores", goal: "weight_loss", activity: "running", description: "Termogénico", price: 700, rating: 3, reviewCount: 90, hasBg: false },
  { id: 8, title: "BCAAs Recovery", category: "aminoacidos", goal: "recovery", activity: "gym", description: "Recuperación muscular", price: 500, rating: 4, reviewCount: 150, hasBg: false },
];

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
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
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
          allProducts: ALL_PRODUCTS,
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
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/RegisterPage" element={<Register />} />
        <Route path="/RecoverySelect" element={<RSelect />} />
        <Route path="/RecoveryCode" element={<RCode />} />
        <Route path="/RecoveryPassword" element={<RPassword />} />
        <Route path="/SetupProfile" element={<SetupP />} />
        <Route path="/placement-test/questions" element={<PlacementTestQuestions />} />
        <Route path="/placement-test/results" element={<TestResults />} />

        {/* Layout principal */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<ProfileUser />} />
          <Route path="/aboutUsPage" element={<AboutUs />} />

          {/* Tienda */}
          <Route path="/Productos" element={<Tienda />} />
          <Route path="/:productName/:id" element={<ProductDetail />} />
          <Route path="/CartPage" element={<CartPage />} />
          <Route path="/CheckoutPage" element={<CheckoutPage />} />

          {/* Subscripción */}
          <Route path="/subscription" element={<SubscriptionPage />} />

          {/* Órdenes */}
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/reviews/:orderId" element={<DoReviews />} />

          {/* Test */}
          <Route path="/placement-test" element={<PlacementTest />} />

          {/* Perfil */}
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/fitness-profile" element={<FitnessProfile />} />

          {/* Pagos */}
          <Route
            path="/payment-methods"
            element={
              <Elements stripe={stripePromise}>
                <PaymentMethods />
              </Elements>
            }
          />

          {/* Lealtad */}
          <Route path="/loyalty-program" element={<LoyaltyProgram />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
        </Route>
      </Routes>
    </Router>
  );
}
