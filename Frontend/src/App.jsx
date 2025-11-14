import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Componentes/Header";
import Home from "./Home/HomePage";
import Footer from "./Componentes/Footer";
import Login from "./Login/LoginPage";
import Register from "./Login/RegisterPage";
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
        <Route path="/RegisterPage" element={<Register />}/>
      </Routes>
    </Router>
  );
}