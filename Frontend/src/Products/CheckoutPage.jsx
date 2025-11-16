import { useOutletContext, Link, useNavigate } from 'react-router-dom';

// Icono de flecha hacia atrás
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default function CheckoutPage() {
  const navigate = useNavigate();
  // Asumimos que el context del Outlet nos da cartItems y allProducts
  const { cartItems, allProducts } = useOutletContext();

  // Datos de ejemplo para dirección y método de pago
  const defaultAddress = {
    name: "Nombre Apellido",
    street: "Calle Ejemplo 1234, Fraccionamiento tal",
    city: "Ciudad tal, Estado tal, País",
    zip: "CP 12345",
    phone: "Tel. 000 123 4567"
  };

  const defaultCard = {
    type: "VISA",
    lastFour: "4532",
    expiry: "10/2029"
  };

  // Lógica de cálculo de precios (la misma que en CartPage)
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 2000 ? 0 : 150; // Ejemplo: Envío gratis si > 2000
  const discount = 0; // Lógica de cupón pendiente
  const total = subtotal + shipping - discount;

  // Función para manejar la finalización de la orden
  const handleCompleteOrder = () => {
    alert("¡Orden completada! (Esta es solo una simulación)");
    // Aquí iría la lógica real para procesar el pago y vaciar el carrito
    // navigate('/order-confirmation'); // Redirigir a una página de confirmación
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10 px-4 font-sans text-[#1e1e1e]">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: DETALLES DEL CHECKOUT */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} aria-label="Volver atrás" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <BackArrowIcon />
                </button>
                <h1 className="text-2xl font-extrabold">Checkout</h1>
              </div>
              <hr className="border-gray-100 mb-6" />

              {/* Sección: Dirección de envío */}
              <h2 className="text-xl font-bold mb-4">Dirección de envío</h2>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                <p className="font-bold text-lg mb-2">Casa</p>
                <p className="text-gray-700 text-sm">{defaultAddress.street}</p>
                <p className="text-gray-700 text-sm">{defaultAddress.city}</p>
                <p className="text-gray-700 text-sm">{defaultAddress.zip}</p>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <p className="text-gray-700">{defaultAddress.name}</p>
                  <p className="text-gray-700">{defaultAddress.phone}</p>
                </div>
              </div>
              <Link to="/addresses" className="text-blue-600 font-semibold hover:underline flex items-center gap-1 mb-10">
                Seleccionar otra dirección 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </Link>

              {/* Sección: Método de pago */}
              <h2 className="text-xl font-bold mb-4">Método de pago</h2>
              
              {/* Tarjeta Principal */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-4">
                <p className="font-bold text-lg mb-3">Tarjeta principal</p>
                <div className="flex items-center gap-4">
                  {/* Icono de Visa - Placeholder SVG */}
                  <svg width="40" height="25" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="60" rx="8" fill="#1A1F71"/>
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial">VISA</text>
                  </svg>
                  <div>
                    <p className="font-semibold text-lg">**** **** **** {defaultCard.lastFour}</p>
                    <p className="text-gray-500 text-sm">Vence {defaultCard.expiry}</p>
                  </div>
                </div>
              </div>

              {/* Opción de PayPal */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                <p className="font-bold text-lg mb-3">PayPal</p>
                <div className="flex items-center gap-4">
                  {/* Icono de PayPal - Placeholder SVG */}
                  <svg width="40" height="25" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="60" rx="8" fill="#003087"/>
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#009CDE" fontSize="20" fontWeight="bold" fontFamily="Arial">PayPal</text>
                  </svg>
                  <p className="font-semibold text-lg text-gray-700">Pagar con PayPal</p>
                </div>
              </div>

              <Link to="/payment-methods" className="text-blue-600 font-semibold hover:underline flex items-center gap-1 mb-10">
                Seleccionar otro método de pago
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </Link>

              {/* Botón Completar Orden */}
              <button
                onClick={handleCompleteOrder}
                className="w-full bg-[#2D3A96] text-white py-3 rounded-full font-bold hover:bg-[#1e2a7a] transition shadow-lg shadow-blue-900/20"
              >
                Completar orden
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Resumen del Pedido</h2>
                <Link to="/carrito" className="text-blue-600 text-sm hover:underline">Editar</Link>
              </div>
              
              <div className="space-y-4 mb-6 border-b border-gray-100 pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {/* Imagen Placeholder */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
                      {/* Aquí iría: <img src={item.image} ... /> */}
                      IMG
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1">{item.title}</p>
                      <p className="text-gray-500 text-xs">{item.quantity} x ${item.price}</p>
                    </div>
                    <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuento:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-extrabold text-xl border-t border-gray-100 pt-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}