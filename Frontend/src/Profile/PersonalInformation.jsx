import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, updateProfileImage } from "../utils/api";

// --- Iconos SVG ---

const ArrowLeftIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        />
    </svg>
);

const PencilIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-4"
    >
        <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
    </svg>
);

const EnvelopeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5"
    >
        <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.161V6a2 2 0 0 0-2-2H3Z" />
        <path d="M19 8.839 10.772 13.1a2.75 2.75 0 0 1-2.544 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
);

const LockClosedIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5"
    >
        <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
            clipRule="evenodd"
        />
    </svg>
);

// --- Componente de Input (Helper) ---
const FormInput = ({ id, label, ...props }) => (
    <div>
        <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            {label}
        </label>
        <input
            id={id}
            {...props}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
    </div>
);

// --- Componente de Select (Helper) ---
const FormSelect = ({ id, label, children, ...props }) => (
    <div>
        <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            {label}
        </label>
        <select
            id={id}
            {...props}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
            {children}
        </select>
    </div>
);

// --- Componente Principal ---
const PersonalInfo = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: ""
    });

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar perfil del usuario desde el backend
            const data = await getUserProfile();
            
            setUserData(data);
            setFormData({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                gender: data.gender || "",
                date_of_birth: data.date_of_birth || ""
            });
        } catch (err) {
            console.error("Error loading user profile:", err);
            setError("Error al cargar el perfil. Por favor, intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setError("Por favor selecciona un archivo de imagen válido.");
                return;
            }
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("La imagen no debe superar los 5MB.");
                return;
            }
            setSelectedImage(file);
            setError(null);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage) return;

        try {
            setSaving(true);
            setError(null);

            // Subir imagen al backend
            const result = await updateProfileImage(selectedImage);
            setUserData(prev => ({ ...prev, profile_image_url: result.profile_image_url }));
            
            setSuccessMessage("Imagen de perfil actualizada exitosamente.");
            setSelectedImage(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error uploading image:", err);
            setError("Error al subir la imagen. Por favor, intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            // Validaciones básicas
            if (!formData.first_name.trim() || !formData.last_name.trim()) {
                setError("El nombre y apellido son obligatorios.");
                setSaving(false);
                return;
            }

            // Actualizar perfil en el backend
            const updatedData = await updateUserProfile(formData);
            setUserData(updatedData);
            
            setSuccessMessage("Perfil actualizado exitosamente.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Error al actualizar el perfil. Por favor, intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleChangePasswordClick = () => {
        // TODO: Navegar a la página de cambio de contraseña
        console.log("Navigate to change password page");
    };

    // Parsear fecha de nacimiento para los selectores
    const parseDateOfBirth = () => {
        if (!formData.date_of_birth) return { day: "", month: "", year: "" };
        const date = new Date(formData.date_of_birth);
        return {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear()
        };
    };

    const { day, month, year } = parseDateOfBirth();

    const handleDateChange = (field, value) => {
        const currentDate = parseDateOfBirth();
        const newDate = { ...currentDate, [field]: parseInt(value) };
        
        if (newDate.year && newDate.month !== "" && newDate.day) {
            const dateString = `${newDate.year}-${String(newDate.month + 1).padStart(2, '0')}-${String(newDate.day).padStart(2, '0')}`;
            setFormData(prev => ({ ...prev, date_of_birth: dateString }));
        }
    };

    const monthNames = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31478F] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 md:p-10">
                    {/* Encabezado */}
                    <header className="flex items-center pb-4 border-b border-gray-300">
                        <button 
                            onClick={handleBackClick}
                            className="text-gray-600 hover:text-gray-900"
                            type="button"
                        >
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 ml-4">
                            Información Personal
                        </h1>
                    </header>

                    {/* Mensajes de estado */}
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    {/* Contenido Principal */}
                    <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6 md:mt-8">
                        {/* Columna Izquierda (Avatar) */}
                        <section className="lg:col-span-4 flex flex-col items-center">
                            <div className="relative">
                                {userData?.profile_image_url ? (
                                    <img 
                                        src={userData.profile_image_url} 
                                        alt="Profile" 
                                        className="size-36 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="size-36 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-4xl font-bold">
                                        {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                                    </div>
                                )}
                                <label className="absolute bottom-2 right-1 bg-[#31478F] text-white p-2 rounded-full hover:bg-opacity-90 transition-colors shadow-md cursor-pointer">
                                    <PencilIcon />
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {selectedImage && (
                                <button
                                    onClick={handleImageUpload}
                                    disabled={saving}
                                    className="mt-3 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {saving ? "Subiendo..." : "Guardar imagen"}
                                </button>
                            )}
                            <h2 className="text-2xl font-bold text-gray-800 mt-4">
                                {userData?.first_name} {userData?.last_name}
                            </h2>
                        </section>

                        {/* Columna Derecha (Formulario) */}
                        <section className="lg:col-span-8">
                            <form onSubmit={handleSubmit}>
                                {/* Datos Personales */}
                                <fieldset>
                                    <legend className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-300 w-full">
                                        Datos personales
                                    </legend>
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput
                                            id="first_name"
                                            name="first_name"
                                            label="Nombre"
                                            type="text"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <FormInput
                                            id="last_name"
                                            name="last_name"
                                            label="Apellido"
                                            type="text"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <FormSelect
                                            id="gender"
                                            name="gender"
                                            label="Género"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="prefer_not_say">Prefiero no decir</option>
                                        </FormSelect>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha de nacimiento
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={day}
                                                    onChange={(e) => handleDateChange('day', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="">Día</option>
                                                    {Array.from({ length: 31 }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            {i + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={month}
                                                    onChange={(e) => handleDateChange('month', e.target.value)}
                                                    className="flex-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="">Mes</option>
                                                    {monthNames.map((name, idx) => (
                                                        <option key={idx} value={idx}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={year}
                                                    onChange={(e) => handleDateChange('year', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="">Año</option>
                                                    {Array.from({ length: 100 }, (_, i) => (
                                                        <option key={i} value={2025 - i}>
                                                            {2025 - i}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>

                                {/* Cuenta */}
                                <fieldset className="mt-10">
                                    <legend className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-300 w-full">
                                        Cuenta
                                    </legend>
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Correo/Cuenta externa
                                            </label>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">
                                                <EnvelopeIcon />
                                                <span>{userData?.email}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contraseña
                                            </label>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">
                                                <LockClosedIcon />
                                                <span>••••••••••••</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleChangePasswordClick}
                                                className="block text-right text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2 w-full"
                                            >
                                                Cambiar contraseña &gt;
                                            </button>
                                        </div>
                                    </div>
                                </fieldset>

                                {/* Botón de Guardar */}
                                <div className="mt-10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-[#31478F] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;
