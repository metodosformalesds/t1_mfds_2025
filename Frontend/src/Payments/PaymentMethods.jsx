// src/PaymentMethods.jsx
import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { 
    getPaymentMethods, 
    createSetupIntent, 
    savePaymentMethod, 
    deletePaymentMethod,
    setDefaultPaymentMethod
} from "../utils/api";

export default function PaymentMethods() {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [showConfirm, setShowConfirm] = useState({ visible: false, pmId: null });
    const [error, setError] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [defaultPaymentId, setDefaultPaymentId] = useState(null);

    // ====================
    // Fetch Payment Methods
    // ====================
    async function fetchPaymentMethods() {
        setLoading(true);
        setError(null);

        try {
            const data = await getPaymentMethods();
            setPaymentMethods(data.payment_methods || []);
            const defaultMethod = data.payment_methods?.find(pm => pm.is_default);
            if (defaultMethod) {
                setDefaultPaymentId(defaultMethod.payment_id);
            }
        } catch (err) {
            console.error('Error al cargar métodos de pago:', err);
            setError(err.message || 'Error al cargar métodos de pago');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    // Abrir modales

    function handleOpenAdd() {
        setError(null);
        setShowAddModal(true);
    }

    function handleOpenEdit(pm) {
        setError(null);
        setEditingCard(pm);
        setShowEditModal(true);
    }

    // Establecer tarjeta como predeterminada
    async function handleSetDefault(pmId) {
        setLoading(true);
        setError(null);

        try {
            await setDefaultPaymentMethod(pmId);
            await fetchPaymentMethods();
        } catch (err) {
            console.error('Error al establecer tarjeta predeterminada:', err);
            setError(err.message || 'Error al establecer tarjeta predeterminada');
        } finally {
            setLoading(false);
        }
    }

    // Actualizar nombre del titular (Stripe solo permite actualizar billing_details)
    async function handleUpdateCard(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const newCardholderName = e.target.cardholder_name.value;

        // Nota: Stripe no permite editar los números de tarjeta directamente.
        // Para cambiar número de tarjeta, el usuario debe eliminar la actual y agregar una nueva.
        // Solo podemos actualizar billing_details (nombre del titular).
        try {
            // Por ahora, Stripe API no expone directamente un endpoint para actualizar solo billing_details
            // de un PaymentMethod existente. La forma estándar es:
            // 1. Mostrar un mensaje al usuario que no se puede cambiar la tarjeta
            // 2. Sugerir agregar una nueva tarjeta y eliminar la anterior
            // 3. Para actualizar el nombre, necesitaríamos un endpoint backend personalizado
            
            // Si el backend implementa actualización de billing_details:
            // await updatePaymentMethodBillingDetails(editingCard.payment_id, newCardholderName);
            
            setError('Por el momento, para cambiar información de la tarjeta debes agregar una nueva y eliminar la anterior.');
            await new Promise(resolve => setTimeout(resolve, 2000));
            setShowEditModal(false);
        } catch (err) {
            console.error('Error al actualizar tarjeta:', err);
            setError(err.message || 'Error al actualizar información');
        } finally {
            setLoading(false);
        }
    }

    // Agregar tarjeta
    async function handleAddCard(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validación: Stripe debe estar cargado
            if (!stripe || !elements) {
                setError('Stripe no está cargado correctamente. Por favor, recarga la página.');
                setLoading(false);
                return;
            }

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setError('No se pudo acceder al elemento de tarjeta.');
                setLoading(false);
                return;
            }

            // 1. Crear SetupIntent en el backend
            const intent = await createSetupIntent();
            if (!intent.client_secret) {
                throw new Error('No se recibió client_secret del servidor');
            }

            // 2. Confirmar con Stripe (validación de tarjeta en el lado de Stripe)
            const result = await stripe.confirmCardSetup(intent.client_secret, {
                payment_method: {
                    card: cardElement,
                    billing_details: { 
                        name: e.target.cardholder_name.value.trim()
                    }
                }
            });

            // 3. Manejo de errores de Stripe
            if (result.error) {
                // Errores comunes de Stripe:
                // - card_declined: Tarjeta declinada
                // - expired_card: Tarjeta expirada
                // - incorrect_cvc: CVC incorrecto
                // - processing_error: Error de procesamiento
                // - incorrect_number: Número de tarjeta incorrecto
                setError(result.error.message);
                setLoading(false);
                return;
            }

            // 4. Verificar que tenemos el payment_method
            if (!result.setupIntent?.payment_method) {
                throw new Error('No se recibió el método de pago de Stripe');
            }

            // 5. Guardar en backend
            // Si es la primera tarjeta, establecerla como predeterminada automáticamente
            const isFirstCard = paymentMethods.length === 0;
            await savePaymentMethod(result.setupIntent.payment_method, isFirstCard);

            // 6. Recargar lista de tarjetas
            await fetchPaymentMethods();
            
            // 7. Cerrar modal
            setShowAddModal(false);
            
            // 8. Limpiar el formulario
            cardElement.clear();
        } catch (err) {
            console.error('Error al agregar tarjeta:', err);
            setError(err.message || 'Error al agregar la tarjeta. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    }



    // Eliminar tarjeta
    async function handleDetachPaymentMethod(pmId) {
        setLoading(true);
        setError(null);

        try {
            // Eliminar del backend (también elimina de Stripe)
            await deletePaymentMethod(pmId);
            
            // Recargar lista actualizada desde el backend
            // El backend automáticamente establecerá otra tarjeta como predeterminada si es necesario
            await fetchPaymentMethods();
            
            // Cerrar modal de confirmación
            setShowConfirm({ visible: false, pmId: null });
        } catch (err) {
            console.error('Error al eliminar tarjeta:', err);
            setError(err.message || 'Error al eliminar la tarjeta');
        } finally {
            setLoading(false);
        }
    }

    // ====================
    // UI Render

    return (
        <div className="min-h-screen bg-[#F7F3E7] p-6 md:p-12">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                
                <button 
                    onClick={() => navigate(-1)}
                    className="text-2xl hover:bg-gray-200 rounded-full p-2 transition-colors"
                >
                    <svg className="size-8" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.9585 21.5H34.0418M8.9585 21.5L19.7085 32.25M8.9585 21.5L19.7085 10.75" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <h1 className="text-2xl font-semibold">Método de Pago</h1>
            </div>

            <p className="text-gray-700 mb-6">Gestiona tus tarjetas y cuentas de pago</p>

            {/* CARDS BOX */}
            <div className="bg-white rounded-xl shadow p-6">
                {/* Stripe Title */}
                <div className="flex items-center gap-3 ml-2 mb-4">
                    <svg className="size-16" viewBox="0 0 360 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M360 77.4001C360 51.8001 347.6 31.6001 323.9 31.6001C300.1 31.6001 285.7 51.8001 285.7 77.2001C285.7 107.3 302.7 122.5 327.1 122.5C339 122.5 348 119.8 354.8 116V96.0001C348 99.4001 340.2 101.5 330.3 101.5C320.6 101.5 312 98.1001 310.9 86.3001H359.8C359.8 85.0001 360 79.8001 360 77.4001ZM310.6 67.9001C310.6 56.6001 317.5 51.9001 323.8 51.9001C329.9 51.9001 336.4 56.6001 336.4 67.9001H310.6Z" fill="#533AFD"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M247.1 31.6001C237.3 31.6001 231 36.2001 227.5 39.4001L226.2 33.2001H204.2V149.8L229.2 144.5L229.3 116.2C232.9 118.8 238.2 122.5 247 122.5C264.9 122.5 281.2 108.1 281.2 76.4001C281.1 47.4001 264.6 31.6001 247.1 31.6001ZM241.1 100.5C235.2 100.5 231.7 98.4001 229.3 95.8001L229.2 58.7001C231.8 55.8001 235.4 53.8001 241.1 53.8001C250.2 53.8001 256.5 64.0001 256.5 77.1001C256.5 90.5001 250.3 100.5 241.1 100.5Z" fill="#533AFD"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M169.8 25.7L194.9 20.3V0L169.8 5.3V25.7Z" fill="#533AFD"/>
                    <path d="M194.9 33.3H169.8V120.8H194.9V33.3Z" fill="#533AFD"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M142.9 40.7L141.3 33.3H119.7V120.8H144.7V61.5C150.6 53.8 160.6 55.2 163.7 56.3V33.3C160.5 32.1 148.8 29.9 142.9 40.7Z" fill="#533AFD"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M92.8999 11.6001L68.4999 16.8001L68.3999 96.9001C68.3999 111.7 79.4999 122.6 94.2999 122.6C102.5 122.6 108.5 121.1 111.8 119.3V99.0001C108.6 100.3 92.7999 104.9 92.7999 90.1001V54.6001H111.8V33.3001H92.7999L92.8999 11.6001Z" fill="#533AFD"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M25.3 58.7001C25.3 54.8001 28.5 53.3001 33.8 53.3001C41.4 53.3001 51 55.6001 58.6 59.7001V36.2001C50.3 32.9001 42.1 31.6001 33.8 31.6001C13.5 31.6001 0 42.2001 0 59.9001C0 87.5001 38 83.1001 38 95.0001C38 99.6001 34 101.1 28.4 101.1C20.1 101.1 9.5 97.7001 1.1 93.1001V116.9C10.4 120.9 19.8 122.6 28.4 122.6C49.2 122.6 63.5 112.3 63.5 94.4001C63.4 64.6001 25.3 69.9001 25.3 58.7001Z" fill="#533AFD"/>
                    </svg>
                    <div>
                        <p className="font-semibold">Tarjetas de Crédito/Débito</p>
                        <p className="text-sm text-gray-600">Procesado por Stripe</p>
                    </div>
                </div>

                {/* LISTADO */}
                <div className="space-y-4 mb-4">
                    {paymentMethods.length === 0 && (
                        <p className="text-sm text-gray-600">No tienes tarjetas guardadas.</p>
                    )}

                    {paymentMethods.map(pm => (
                        <div key={pm.payment_id} className="bg-[#EBEFE6] rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">
                                        {pm.card_brand.toUpperCase()} •••• {pm.card_last4}
                                    </p>
                                    {pm.is_default && (
                                        <span className="bg-[#70AA77] text-white text-xs px-2 py-1 rounded-full">
                                            Predeterminada
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Expira: {String(pm.card_exp_month).padStart(2, '0')}/{pm.card_exp_year}
                                </p>
                                {pm.cardholder_name && (
                                    <p className="text-sm text-gray-500">
                                        {pm.cardholder_name}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 mt-3 md:mt-0 flex-wrap">
                                {!pm.is_default && (
                                    <button
                                        className="bg-[#31478F] hover:bg-[#2a3f7f] text-white px-4 py-2 rounded-3xl text-sm disabled:opacity-50"
                                        onClick={() => handleSetDefault(pm.payment_id)}
                                        disabled={loading}
                                    >
                                        Hacer predeterminada
                                    </button>
                                )}

                                <button
                                    className="bg-[#70AA77] hover:bg-[#5f8a5f] text-white px-4 py-2 rounded-3xl text-sm"
                                    onClick={() => handleOpenEdit(pm)}
                                >
                                    Editar
                                </button>

                                <button
                                    className="bg-[#C05F5F] hover:bg-[#9b4b4b] text-white px-4 py-2 rounded-3xl text-sm"
                                    onClick={() => setShowConfirm({ visible: true, pmId: pm.payment_id })}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                <button className="bg-[#31478F] hover:bg-[#2a3f7f] text-white px-6 py-2 rounded-3xl" onClick={handleOpenAdd}>
                    Agregar Tarjeta
                </button>

                {error && <p className="text-red-600 mt-4">{error}</p>}
            </div>

            {/* MODALES */}
            {/* --- Add Card Modal --- */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Agregar nueva Tarjeta</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-2xl">✕</button>
                        </div>

                        <form onSubmit={handleAddCard} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Nombre del titular</label>
                                <input
                                    type="text"
                                    name="cardholder_name"
                                    placeholder="Como aparece en la tarjeta"
                                    required
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Tarjeta</label>
                                <div className="p-3 border rounded-lg">
                                    <CardElement options={{ hidePostalCode: true }} />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={!stripe || loading}
                                    className="flex-1 bg-[#31478F] hover:bg-[#2a3f7f] text-white rounded-3xl py-2 disabled:opacity-50"
                                >
                                    {loading ? "Guardando..." : "Guardar Tarjeta"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)} 
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 rounded-3xl py-2"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Edit Card Modal --- */}
            {showEditModal && editingCard && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Editar Tarjeta</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-2xl">✕</button>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center text-sm text-gray-700">
                            Solo puedes editar el nombre del titular. Para cambiar la tarjeta añade una nueva.
                        </div>

                        <form onSubmit={handleUpdateCard} className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-semibold text-gray-600 mb-2">Tarjeta actual:</p>
                                <p className="font-medium">{editingCard.card_brand.toUpperCase()} •••• {editingCard.card_last4}</p>
                                <p className="text-sm text-gray-600">
                                    Expira: {String(editingCard.card_exp_month).padStart(2, '0')}/{editingCard.card_exp_year}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Nombre del titular</label>
                                <input
                                    type="text"
                                    name="cardholder_name"
                                    defaultValue={editingCard.cardholder_name || ""}
                                    placeholder="Nombre como aparece en la tarjeta"
                                    required
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-[#31478F] hover:bg-[#2a3f7f] text-white rounded-3xl py-2 disabled:opacity-50"
                                >
                                    {loading ? "Actualizando..." : "Guardar Cambios"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 rounded-3xl py-2"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Confirm Delete Modal --- */}
            {showConfirm.visible && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">¿Eliminar esta tarjeta?</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Esta acción no se puede deshacer.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDetachPaymentMethod(showConfirm.pmId)}
                                disabled={loading}
                                className="flex-1 bg-[#C05F5F] hover:bg-[#9b4b4b] text-white rounded-3xl py-2"
                            >
                                {loading ? "Eliminando..." : "Sí, eliminar"}
                            </button>

                            <button
                                onClick={() => setShowConfirm({ visible: false, pmId: null })}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 rounded-3xl py-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
