import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Componentes/Header";
import Home from "./Home/HomePage";
import Footer from "./Componentes/Footer";
import Login from "./Login/LoginPage";
import './index.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/home" 
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          } 
        />
        <Route 
          path="/proteinas" 
          element={
            <>
              <Header />
              <div className="h-screen flex justify-center items-center">Página de Proteínas (En construcción)</div>
              <Footer />
            </>
          } 
        />

      </Routes>
    </Router>
  );
}