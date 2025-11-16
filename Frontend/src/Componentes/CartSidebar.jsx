import React from 'react';
import { Link } from 'react-router-dom';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const CartSidebar = ({ isOpen, onClose, cartItems, onRemove, onUpdateQuantity }) => {
  // Calcular total
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
            <CartIcon />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 h-[calc(100%-180px)]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <CartIcon />
              <p className="mt-2">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => {
                // --- CORRECCIÓN DE SEGURIDAD ---
                // Usamos 'item.title' porque así viene de Tienda.jsx.
                // Si por alguna razón no viene, usamos 'item.name' o un texto por defecto.
                const productTitle = item.title || item.name || "Producto";
                
                return (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                      <img 
                        // Aquí estaba el error. Ahora usamos la variable segura 'productTitle'
                        src={item.imageSrc || `https://placehold.co/300x400/png?text=${productTitle.split(' ')[0]}`} 
                        alt={productTitle} 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                            {productTitle}
                          </h3>
                          <button 
                              onClick={() => onRemove(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                          >
                             <TrashIcon /> 
                          </button>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-xs"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-xs font-bold text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-xs"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-bold text-[#D99030]">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</span>
          </div>
          <Link to="/CartPage" className="text-center block w-full bg-[#334173] hover:bg-[#253055] text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all hover:shadow-xl active:scale-[0.98]">
            Proceder al Pago
          </Link>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;