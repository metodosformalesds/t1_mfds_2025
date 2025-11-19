{
/*
 * Autor: Diego Jasso
 * Componente: ShippingAddresses
 * Descripción: Permite al usuario visualizar, añadir, editar, eliminar y establecer como predeterminadas sus direcciones de envío. Gestiona el estado de las direcciones y las operaciones CRUD a través de la API del backend.
 */
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getAddresses, 
    createAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
} from '../utils/api';

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

const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5"
    >
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5V4.75Z" />
    </svg>
);

// --- Componente de Tarjeta de Dirección (Reutilizable) ---
const AddressCard = ({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isDeleting = false
}) => {
    const formatAddressLines = () => {
        const lines = [
            address.address_line1,
            address.address_line2,
            `${address.city}, ${address.state}, ${address.country}`,
            `CP ${address.zip_code}`
        ];
        return lines.filter(line => line); // Eliminar líneas null/undefined
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Lado Izquierdo: Dirección */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{address.address_name}</h3>
                        {address.is_default && (
                            <span className="text-xs font-medium bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                                Predeterminado
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-0.5">
                        {formatAddressLines().map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>

                {/* Lado Derecho: Contacto y Botones */}
                <div className="flex-1 flex flex-col items-start md:items-end md:text-right">
                    <div className="text-sm text-gray-600 mb-4">
                        <p className="font-semibold text-gray-800">{address.recipient_name}</p>
                        <p>{address.phone_number}</p>
                    </div>
                    <div className="flex gap-2">
                        {!address.is_default && (
                            <button 
                                onClick={() => onSetDefault(address.address_id)}
                                className="bg-blue-100 text-blue-800 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                Predeterminar
                            </button>
                        )}
                        <button 
                            onClick={() => onEdit(address)}
                            className="bg-green-100 text-green-800 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-green-200 transition-colors"
                        >
                            Editar
                        </button>
                        <button 
                            onClick={() => onDelete(address.address_id)}
                            disabled={isDeleting}
                            className="bg-red-100 text-red-800 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? "..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Modal de Formulario de Dirección ---
const AddressFormModal = ({ address, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        address_name: address?.address_name || "",
        address_line1: address?.address_line1 || "",
        address_line2: address?.address_line2 || "",
        country: address?.country || "México",
        state: address?.state || "",
        city: address?.city || "",
        zip_code: address?.zip_code || "",
        recipient_name: address?.recipient_name || "",
        phone_number: address?.phone_number || "",
        is_default: address?.is_default || false
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!formData.address_name.trim() || !formData.address_line1.trim() || 
            !formData.city.trim() || !formData.state.trim() || !formData.zip_code.trim() ||
            !formData.recipient_name.trim() || !formData.phone_number.trim()) {
            setError("Por favor completa todos los campos obligatorios.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error("Error saving address:", err);
            setError("Error al guardar la dirección. Por favor, intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {address ? "Editar dirección" : "Nueva dirección"}
                    </h2>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la dirección *
                                </label>
                                <input
                                    type="text"
                                    name="address_name"
                                    value={formData.address_name}
                                    onChange={handleChange}
                                    placeholder="Ej: Casa, Oficina, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección (línea 1) *
                                </label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleChange}
                                    placeholder="Calle, número, colonia"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección (línea 2)
                                </label>
                                <input
                                    type="text"
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleChange}
                                    placeholder="Depto, piso, etc. (opcional)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ciudad *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código Postal *
                                </label>
                                <input
                                    type="text"
                                    name="zip_code"
                                    value={formData.zip_code}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    País *
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del destinatario *
                                </label>
                                <input
                                    type="text"
                                    name="recipient_name"
                                    value={formData.recipient_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="Ej: 811 123 4567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_default"
                                        checked={formData.is_default}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Establecer como dirección predeterminada
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-[#31478F] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---
const ShippingAddresses = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    // Cargar direcciones al montar el componente
    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar direcciones desde el backend
            const data = await getAddresses();
            
            setAddresses(data.addresses || []);
        } catch (err) {
            console.error("Error loading addresses:", err);
            setError("Error al cargar las direcciones. Por favor, intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setShowModal(true);
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setShowModal(true);
    };

    const handleSaveAddress = async (formData) => {
        try {
            if (editingAddress) {
                // Actualizar dirección en el backend
                const updated = await updateAddress(editingAddress.address_id, formData);
                
                setAddresses(prev => prev.map(addr => 
                    addr.address_id === editingAddress.address_id ? updated : addr
                ));
                setSuccessMessage("Dirección actualizada exitosamente.");
            } else {
                // Crear nueva dirección en el backend
                const newAddress = await createAddress(formData);
                
                setAddresses(prev => [...prev, newAddress]);
                setSuccessMessage("Dirección agregada exitosamente.");
            }

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error saving address:", err);
            throw err;
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta dirección?")) {
            return;
        }

        try {
            setDeletingId(addressId);
            setError(null);

            // Eliminar dirección desde el backend
            await deleteAddress(addressId);
            
            setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
            setSuccessMessage("Dirección eliminada exitosamente.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error deleting address:", err);
            setError("Error al eliminar la dirección. Por favor, intenta de nuevo.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            setError(null);

            // Establecer dirección predeterminada en el backend
            await setDefaultAddress(addressId);
            
            setAddresses(prev => prev.map(addr => ({
                ...addr,
                is_default: addr.address_id === addressId
            })));
            
            setSuccessMessage("Dirección predeterminada actualizada.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error setting default address:", err);
            setError("Error al establecer la dirección predeterminada.");
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31478F] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando direcciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Encabezado */}
                <header className="flex items-center pb-4 border-b border-gray-300">
                    <button 
                        onClick={handleBackClick}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800 ml-4">
                        Direcciones de envío
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

                <main className="mt-6">
                    <h2 className="text-lg text-gray-600 mb-4">
                        Gestiona tus direcciones de envío
                    </h2>

                    {/* Lista de Direcciones */}
                    {addresses.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                            <p className="text-gray-600 mb-4">No tienes direcciones registradas</p>
                            <button
                                onClick={handleAddAddress}
                                className="bg-[#31478F] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors inline-flex items-center gap-2"
                            >
                                <PlusIcon />
                                Agregar primera dirección
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-5">
                                {addresses.map((address) => (
                                    <AddressCard
                                        key={address.address_id}
                                        address={address}
                                        onEdit={handleEditAddress}
                                        onDelete={handleDeleteAddress}
                                        onSetDefault={handleSetDefaultAddress}
                                        isDeleting={deletingId === address.address_id}
                                    />
                                ))}
                            </div>

                            {/* Botón de Agregar */}
                            <div className="flex justify-end mt-8">
                                <button
                                    onClick={handleAddAddress}
                                    className="bg-[#31478F] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <PlusIcon />
                                    Agregar dirección
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Modal de Formulario */}
            {showModal && (
                <AddressFormModal
                    address={editingAddress}
                    onClose={() => {
                        setShowModal(false);
                        setEditingAddress(null);
                    }}
                    onSave={handleSaveAddress}
                />
            )}
        </div>
    );
};

export default ShippingAddresses;