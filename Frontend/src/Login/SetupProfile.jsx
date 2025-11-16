import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Icono de Lapiz para editar
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

// --- Componente Principal ---
export default function App() {
  // Estado de inputs
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [año, setAño] = useState('');

  // Foto de perfil
  const [foto, setFoto] = useState(null);

  // Cargar foto y mostrar preview
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(URL.createObjectURL(file));
    }
  };

  // --- Helpers Fecha ---
  const getDays = () => {
    let days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return days;
  };

  const getMonths = () => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return monthNames.map((month, index) => (
      <option key={index} value={index + 1}>
        {month}
      </option>
    ));
  };

  const getYears = () => {
    let years = [];
    const currentYear = new Date().getFullYear();

    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return years;
  };

  // --- Enviar Formulario ---
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Perfil enviado:", { nombre, apellido, genero, dia, mes, ano, foto });
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      
      {/* IZQUIERDA (Formulario) */}
      <div className="relative flex w-full flex-col justify-center bg-[#FFFCF2] p-8 md:w-1/2 lg:px-20">
        
        <div className="z-10 mx-auto w-full max-w-md">
          
          {/* Título */}
          <div className="mb-10 flex w-full justify-center">
            <div className="relative mb-0 inline-block text-center">
              <h1 className="font-bebas text-6xl font-bold tracking-[0.1em] text-black md:text-7xl">
                CREA TU PERFIL
              </h1>
            <div className="absolute -right-12 -top-14 animate-pulse">
              <svg width="80" height="100" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth=".5" className="text-gray-800">
                <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
              </svg>
            </div>
            </div>
          </div>

          {/* ------------------ FOTO DE PERFIL ------------------ */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              
              {/* Circulo */}
              <div className="h-32 w-32 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                {foto ? (
                  <img
                    src={foto}
                    alt="Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 text-sm"></span>
                )}
              </div>

              {/* Botón Editar */}
              <button
                type="button"
                onClick={() => document.getElementById('foto-input').click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#3b4d82] shadow-md transition-transform hover:scale-110"
              >
                <EditIcon />
              </button>

              {/* Input oculto */}
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>
          </div>

          {/* ------------------ FORMULARIO ------------------ */}
          <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
            
            {/* Nombre */}
            <div className="flex flex-col">
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border-b border-gray-400 bg-transparent py-2 text-gray-900 outline-none focus:border-black"
              />
            </div>

            {/* Apellido */}
            <div className="flex flex-col">
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="border-b border-gray-400 bg-transparent py-2 text-gray-900 outline-none focus:border-black"
              />
            </div>

            {/* Género */}
            <div className="flex flex-col">
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Género</label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2 text-gray-900 shadow-sm outline-none focus:border-[#737373] focus:ring-1 focus:ring-[#737373]"
              >
                <option value="" disabled>Selecciona una opción</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="no-decir">Prefiero no decirlo</option>
              </select>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="flex flex-col">
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Fecha de nacimiento</label>
              <div className="flex space-x-3">
                
                <select
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  className="flex-1 rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2"
                >
                  <option value="" disabled>Día</option>
                  {getDays()}
                </select>

                <select
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="flex-1 rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2"
                >
                  <option value="" disabled>Mes</option>
                  {getMonths()}
                </select>

                <select
                  value={año}
                  onChange={(e) => setAno(e.target.value)}
                  className="flex-1 rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2"
                >
                  <option value="" disabled>Año</option>
                  {getYears()}
                </select>
              </div>
            </div>

            {/* Boton Continuar */}
            <Link to="/Home"
              type="button"
              className="font-bebas tracking-[3px] w-full rounded-md  bg-[#3b4d82] py-3 font-medium text-white text-center shadow-md transition-all duration-150 border border-transparent hover:bg-transparent hover:border-[#3b4d82] hover:text-black"
            >
              Crear Cuenta
            </Link>

          </form>
        </div>
      </div>

      {/* ------------------ DERECHA ------------------ */}
      <div className="hidden h-screen w-1/2 bg-[#70AA77] md:flex"></div>
        <div className="pointer-events-none absolute bottom-0 right-0 w-full overflow-hidden">
            <span className="fixed top-[560px] -right-px text-[150px] font-bold text-gray-200 opacity-60 md:text-[145px] font-bebas tracking-[40px] leading-normal">
            B E F I T
            </span>
  </div>
    </div>
  );
}