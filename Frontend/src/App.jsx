import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

// Componentes Globales
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Header from "./Componentes/Header";
import Footer from "./Componentes/Footer";
import CartSidebar from "./Componentes/CartSidebar";

// Componentes de Páginas
import Home from "./Home/HomePage";
import Login from "./Login/LoginPage";
import Register from "./Login/RegisterPage";
import RSelect from "./Login/RecoverySelect";
import RCode from "./Login/RecoveryCode";
import RPassword from "./Login/RecoveryPassword";
import SetupP from "./Login/SetupProfile";
import ProfileUser from "./Profile/UserProfile";
// Componentes de Productos
import Tienda from "./Componentes/Tienda";
import ProductDetail from "./Products/ProductDetails";
import CartPage from "./Products/CartPage";
import CheckoutPage from "./Products/CheckoutPage";
import PaymentMethods from "./Payments/PaymentMethods";
import FitnessProfile from "./Profile/FitnessProfile";

// Inicializar Stripe con tu clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_tu_clave_publica');

// Estilos Globales
import './index.css';

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

// Layout Principal con Lógica del Carrito
const MainLayout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- AGREGAR AL CARRITO ---
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // --- REMOVER DEL CARRITO ---
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // --- ACTUALIZAR CANTIDAD ---
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  return (
    <>
      <Header 
        cartItems={cartItems} 
        onCartClick={() => setIsCartOpen(true)} 
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />

      {/* Outlet provee el contexto del carrito a Home, Tienda, Perfil, etc. */}
      <Outlet context={{ cartItems, addToCart, removeFromCart, updateQuantity, setIsCartOpen, allProducts: ALL_PRODUCTS }} />

      <Footer />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas de Autenticación (Sin Header/Footer/Carrito) */}
        <Route path="/" element={<Login />} />
        <Route path="/RegisterPage" element={<Register />} />
        <Route path="/RecoverySelect" element={<RSelect />} />
        <Route path="/RecoveryCode" element={<RCode />} />
        <Route path="/RecoveryPassword" element={<RPassword />} />
        <Route path="/SetupProfile" element={<SetupP />} />

        {/* Rutas Principales (Dentro del MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<ProfileUser />} />
          
          {/* Rutas de la Tienda */}
          <Route path="/Productos" element={<Tienda />} />
          <Route path="/:productName/:id" element={<ProductDetail />}/>
          <Route path="/CartPage" element={<CartPage />} />
          <Route path="/CheckoutPage" element={<CheckoutPage />} />
          <Route path="/profile" element={<FitnessProfile />}/>
          {/* Perfil Fitness */}
          <Route path="/fitness-profile" element={<FitnessProfile />}/>
          {/* Métodos de pago */}
          <Route path="/payment-methods" element={<Elements stripe={stripePromise}><PaymentMethods /></Elements>}/>
        </Route>    
      </Routes>
    </Router>
  );
}