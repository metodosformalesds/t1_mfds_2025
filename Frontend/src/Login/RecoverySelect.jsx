import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Befitwhite.png';

export default function VerifyAccount() {
  // Datos simulados
  const options = [
    {
      id: 'sms',
      title: 'SMS',
      detail: 'Al celular que termina con **21',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      id: 'email',
      title: 'Correo',
      detail: 'Al correo que termina con r****@gmail.com',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      detail: 'Al celular que termina con **21',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf5]">
      
      {/* 1. Contenedor Superior Verde */}
      <div className="bg-[#70AA77] pb-48 shadow-sm">
        <header className="w-full px-6 py-4 flex items-center border-b border-[#A5C8A1]">
          <img src={logo} alt="Logo Befit" className="h-12 object-contain" />
        </header>
      </div>

      {/* 2. Contenido Principal con Margen Negativo */}
      <main className="flex-grow flex items-start justify-center px-4 -mt-40 pb-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 md:p-10 relative z-10">
          
          {/* Titulos */}
          <div className="text-center mb-8">
            <h1 className="font-bebas text-xl md:text-4xl font-regular text-gray-900 uppercase tracking-tight mb-3">
              Verifica que esta cuenta te pertenece
            </h1>
            <p className="font-poppins text-gray-600 text-sm md:text-base font-light">
              Elige cómo recibir el código de verificación
            </p>
          </div>

          {/* Lista de Opciones */}
          <div className="space-y-0">
            {options.map((option, index) => (
              <div key={option.id}>
                {/* Separador */}
                {index > 0 && <div className="h-px bg-gray-100"></div>}
                
                <Link to="/RecoveryCode" className="group w-full flex items-center justify-between py-5 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2">
                  <div className="flex items-center gap-4">
                    {/* Circulo del icono */}
                    <div className="w-12 h-12 rounded-full bg-[#B8D2B1] group-hover:bg-[#A5C8A1] transition-colors flex items-center justify-center flex-shrink-0 text-[#fcfbf5]">
                      {option.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-sm md:text-base">{option.title}</p>
                      <p className="text-gray-500 text-xs md:text-sm">{option.detail}</p>
                    </div>
                  </div>
                  
                  {/* Icono de flecha */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-hover:text-[#70AA77] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
            {/* Separador final */}
            <div className="h-px bg-gray-100"></div>
          </div>

          {/* Boton Volver */}
          <div className="mt-10 text-center">
            <Link to='/' className="font-montserrat text-gray-500 font-medium text-sm hover:text-[#70AA77] transition-colors">
              Volver
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}