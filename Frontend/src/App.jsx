import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Componentes/Header";
import Home from "./Home/HomePage";
import Footer from "./Componentes/Footer";
import Login from "./Login/LoginPage";
import Register from "./Login/RegisterPage";
import RSelect from "./Login/RecoverySelect"
import RCode from "./Login/RecoveryCode"
import RPassword from "./Login/RecoveryPassword"
import SetupP from "./Login/SetupProfile"
import ProfileUser from "./Profile/UserProfile";
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
        <Route path="/RecoverySelect" element={<RSelect />}/>
        <Route path="/RecoveryCode" element={<RCode />}/>
        <Route path="/RecoveryPassword" element={<RPassword />}/>
        <Route path="/SetupProfile" element={<SetupP />}/>
        
        {/* Perfil de usuario */}
        <Route path="/profile" element={
          <>
            <Header />
            <ProfileUser />
            <Footer />
          </>
        }/>
      </Routes>
    </Router>
  );
}