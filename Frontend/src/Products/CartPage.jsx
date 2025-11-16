import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";

// Iconos SVG simples para no depender de librerías externas
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-red-500 transition-colors"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function CartPage() {
  // Obtenemos funciones y datos del Outlet (App.jsx)
  // IMPORTANTE: Asegúrate de pasar updateQuantity y removeFromCart en el context de App.jsx
  const { cartItems, updateQuantity, removeFromCart, allProducts, addToCart } = useOutletContext();
  
  // Lógica de cálculo de precios
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 2000 ? 0 : 150; // Ejemplo: Envío gratis si > 2000
  const discount = 0; // Lógica de cupón pendiente
  const total = subtotal + shipping - discount;

  // Filtramos productos para "Complementa tu pedido" (excluyendo los que ya están en el carrito)
  const recommendations = allProducts
    .filter(p => !cartItems.find(item => item.id === p.id))
    .slice(0, 4); // Tomamos solo 4

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10 px-4 font-sans text-[#1e1e1e]">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: LISTA DE ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-2xl font-extrabold mb-1">Tu Carrito</h1>
              <p className="text-gray-500 text-sm mb-6">{cartItems.length} productos</p>

              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
                  <Link to="/Productos" className="text-blue-600 font-semibold hover:underline">Ir a la tienda</Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-100 last:border-0">
                      {/* Imagen Placeholder */}
                      <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-300">
                         {/* Aquí iría: <img src={item.image} ... /> */}
                         <span className="text-xs">IMG</span>
                      </div>

                      {/* Detalles */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="font-bold text-xl">${item.price}</p>
                          </div>
                          <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                          <p className="text-green-600 text-xs mt-2 font-medium">En stock • 15 unidades disponibles</p>
                        </div>

                        {/* Controles de Cantidad */}
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-[#2D3A96] text-white flex items-center justify-center hover:bg-[#1e2a7a] transition"
                            >
                              <PlusIcon />
                            </button>
                            <span className="font-bold text-lg w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-[#2D3A96] text-white flex items-center justify-center hover:bg-[#1e2a7a] transition"
                            >
                              <MinusIcon />
                            </button>
                          </div>
                          
                          {/* Botón Eliminar */}
                          <button onClick={() => removeFromCart(item.id)} className="mb-1">
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuento</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-extrabold text-xl mb-6 border-t border-gray-100 pt-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Input Cupón */}
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Código de Descuento" 
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2D3A96]"
                />
                <button className="bg-[#5CA982] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#4a8c6b] transition">
                  Aplicar
                </button>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <Link to="/CheckoutPage" className="text-center block w-full bg-[#2D3A96] text-white py-3 rounded-full font-bold hover:bg-[#1e2a7a] transition shadow-lg shadow-blue-900/20">
                  Proceder al pago
                </Link>
                <Link to="/Productos" className="block w-full border border-[#2D3A96] text-[#2D3A96] py-3 rounded-full font-bold text-center hover:bg-blue-50 transition">
                  Continuar Comprando
                </Link>
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Pago 100% seguro
              </p>
            </div>
          </div>

        </div>

        {/* SECCIÓN INFERIOR: COMPLEMENTA TU PEDIDO */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-extrabold mb-6">Complementa tu pedido</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map(product => (
              <div key={product.id} className="flex flex-col group">
                <div className="bg-gray-50 rounded-xl h-40 w-full mb-4 flex items-center justify-center text-gray-300 group-hover:bg-gray-100 transition">
                  {/* <img src={product.image} ... /> */}
                  <span className="text-2xl font-bold text-gray-200">IMG</span>
                </div>
                <h3 className="font-bold text-sm mb-1 truncate">{product.title}</h3>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-[#5CA982] font-extrabold text-lg">${product.price}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="text-xs bg-[#F0F0F0] hover:bg-[#2D3A96] hover:text-white text-gray-600 px-3 py-1 rounded-full transition font-bold"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="text-gray-500 col-span-4 text-center">¡Ya tienes todo lo necesario!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}