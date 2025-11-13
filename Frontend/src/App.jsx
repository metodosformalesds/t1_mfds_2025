import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Componentes/Header";
import Home from "./Componentes/HomePage";
import Footer from "./Componentes/Footer";
import './index.css';

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </Router>
  );
}