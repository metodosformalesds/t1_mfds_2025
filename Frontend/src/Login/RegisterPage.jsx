import React from 'react';
import Man from '../assets/FitnessMen.png';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* --- SECCION IZQUIERDA (Formulario) --- */}
      <div className="relative flex w-full flex-col justify-center bg-[#FFFCF2] p-8 md:w-1/2 lg:px-20">
        
        {/* Texto de fondo */}
        <div className="hidden md:block w-[669px] h-0">
          <span className="fixed top-[560px] -left-px text-[150px] font-bold text-gray-200 opacity-60 md:text-[180px] font-bebas tracking-[40.00px] leading-[normal]">
            B E F I T
          </span>
        </div>

        {/* Contenedor del Formulario */}
        <div className="z-10 mx-auto w-full max-w-md">
          
          {/* Encabezado */}
        <div className="mb-12 flex w-full justify-center">
          <div className="relative mb-0 text-center inline-block">
            <h1 className="font-bebas text-7xl tracking-wider text-black md:text-8xl md:tracking-[0.3em]">
              REGISTER
            </h1>
            {/* Estrella */}
            <div className="absolute -right-6 -top-10 animate-pulse md:-right-8 md:-top-14">
              <svg width="80" height="100" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth=".5" className="text-gray-800">
                <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
              </svg>
            </div>
          </div>
        </div>

          <form className="flex flex-col space-y-2">
            {/* Input Email */}
            <div className="flex flex-col">
              <label className="font-oswald mb-1 text-s font-semibold text-gray-600">Correo</label>
              <input 
                type="email" 
                className="border-b border-gray-300 bg-transparent py-1 text-gray-900 outline-none transition-colors focus:border-black"
              />
            </div>

            {/* Input Password */}
            <div className="flex flex-col">
              <label className="font-oswald mb-1 text-s font-semibold text-gray-600">Contraseña</label>
              <input 
                type="password" 
                className="border-b border-gray-300 bg-transparent py-1 text-gray-900 outline-none transition-colors focus:border-black"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="font-oswald mb-1 text-s font-semibold text-gray-600">Confirma tu Contraseña</label>
              <input 
                type="password" 
                className="border-b border-gray-300 bg-transparent py-1 text-gray-900 outline-none transition-colors focus:border-black"
              />
            </div>

            {/* Olvidaste contraseña */}
            <div className="text-right">
              <Link to="/RecoverySelect" className="text-xs font-medium text-gray-600 hover:text-black hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Boton Register */}

            <Link to="/SetupProfile" 
                type="button"
                className=" font-bebas tracking-[3px] w-full rounded-md  bg-[#3b4d82] py-3 font-medium text-white text-center shadow-md transition-all duration-150 border border-transparent hover:bg-transparent hover:border-[#3b4d82] hover:text-black">
                Registrarse
            </Link>

            {/* Registro */}
            <div className="text-center text-xs text-gray-600">
              ¿Ya tienes cuenta? <Link to="/" className="font-bold text-[#5DA586] hover:underline">Inicia Sesión</Link>
            </div>

            {/* Divisor "o" */}
            <div className="relative flex items-center justify-center py-2">
              <span className="text-xs text-gray-400">o</span>
            </div>

            {/* Botones Sociales */}
            <div className="space-y-3">
              <button className="flex w-full items-center justify-center border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                {/* Icono Google SVG */}
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continua con Google
              </button>

              <button className="flex w-full items-center justify-center border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                 {/* Icono Facebook SVG */}
                <svg className="mr-2 h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.648 0-2.924 1.611-2.924 4.055v2.056h3.984l-.599 3.667h-3.385L15.425 24C12.8 24 9.101 24 9.101 23.691Z"/>
                </svg>
                Continua con Facebook
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- SECCION DERECHA (Imagen) --- */}
      <div className="hidden h-screen w-1/2 items-center justify-center bg-[#70AA77] md:flex">
      <div className="relative flex items-center justify-center">
        <img 
          src={Man} 
          alt="Creatina Product" 
          className="max-w-[73%] drop-shadow-2xl transition-transform hover:scale-105 duration-500"
        />
      </div>
      </div>
    </div>
  );
};

export default RegisterPage;