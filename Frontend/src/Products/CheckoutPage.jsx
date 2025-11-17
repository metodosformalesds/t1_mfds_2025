import React from 'react'; // <-- AÑADIDO: Necesario para JSX
import { useOutletContext, Link, useNavigate } from 'react-router-dom';

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const VisaIcon = ({ className }) => (
  <svg 
    viewBox="0 0 780 500" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  > 
    <path 
      d="M40,0h700c22.092,0,40,17.909,40,40v420c0,22.092-17.908,40-40,40H40c-22.091,0-40-17.908-40-40V40 C0,17.909,17.909,0,40,0z" 
      fill="#0E4595" 
    />
    <path 
      d="m293.2 348.73l33.361-195.76h53.36l-33.385 195.76h-53.336zm246.11-191.54c-10.57-3.966-27.137-8.222-47.822-8.222-52.725 0-89.865 26.55-90.18 64.603-0.299 28.13 26.514 43.822 46.752 53.186 20.771 9.595 27.752 15.714 27.654 24.283-0.131 13.121-16.586 19.116-31.922 19.116-21.357 0-32.703-2.967-50.227-10.276l-6.876-3.11-7.489 43.823c12.463 5.464 35.51 10.198 59.438 10.443 56.09 0 92.5-26.246 92.916-66.882 0.199-22.269-14.016-39.216-44.801-53.188-18.65-9.055-30.072-15.099-29.951-24.268 0-8.137 9.668-16.839 30.557-16.839 17.449-0.27 30.09 3.535 39.938 7.5l4.781 2.26 7.232-42.429m137.31-4.223h-41.232c-12.773 0-22.332 3.487-27.941 16.234l-79.244 179.4h56.031s9.16-24.123 11.232-29.418c6.125 0 60.555 0.084 68.338 0.084 1.596 6.853 6.49 29.334 6.49 29.334h49.514l-43.188-195.64zm-65.418 126.41c4.412-11.279 21.26-54.723 21.26-54.723-0.316 0.522 4.379-11.334 7.074-18.684l3.605 16.879s10.219 46.729 12.354 56.528h-44.293zm-363.3-126.41l-52.24 133.5-5.567-27.13c-9.725-31.273-40.025-65.155-73.898-82.118l47.766 171.2 56.456-0.064 84.004-195.39h-56.521" 
      fill="#ffffff" 
    />
    <path 
      d="m146.92 152.96h-86.041l-0.681 4.073c66.938 16.204 111.23 55.363 129.62 102.41l-18.71-89.96c-3.23-12.395-12.597-16.094-24.186-16.527" 
      fill="#F2AE14" 
    />
  </svg>
);

const PaypalIcon = ({ className }) => (
  <svg 
    viewBox="0 0 750 471" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g fillRule="nonzero" fill="none">
      <path 
        d="M697.115385,0 L52.8846154,0 C23.7240385,0 0,23.1955749 0,51.7065868 L0,419.293413 C0,447.804425 23.7240385,471 52.8846154,471 L697.115385,471 C726.274038,471 750,447.804425 750,419.293413 L750,51.7065868 C750,23.1955749 726.274038,0 697.115385,0 Z" 
        fill="#FFFFFF"
      />
      <g transform="translate(54.000000, 150.000000)">
        <path 
          d="M109.272795,8.45777679 C101.24875,2.94154464 90.7780357,0.176741071 77.8606518,0.176741071 L27.8515268,0.176741071 C23.8915714,0.176741071 21.7038036,2.15719643 21.2882232,6.11333036 L0.972553571,133.638223 C0.761419643,134.890696 1.07477679,136.03617 1.90975893,137.077509 C2.73996429,138.120759 3.78416964,138.639518 5.03473214,138.639518 L28.7887321,138.639518 C32.9550446,138.639518 35.2450357,136.663839 35.6653929,132.701973 L41.2905357,98.3224911 C41.4959375,96.6563482 42.2286964,95.3016518 43.4792589,94.2584018 C44.7288661,93.2170625 46.2918304,92.5358929 48.1671964,92.2234911 C50.0425625,91.9139554 51.8109286,91.7582321 53.4808929,91.7582321 C55.1460804,91.7582321 57.124625,91.8633214 59.4203482,92.0706339 C61.7103393,92.2789018 63.170125,92.3801696 63.7958839,92.3801696 C81.7145625,92.3801696 95.7793304,87.3311071 105.991143,77.2224732 C116.198179,67.1176607 121.307429,53.1054375 121.307429,35.1829375 C121.307429,22.8903571 117.293018,13.9826071 109.272795,8.45777679 Z M83.4877054,46.7484911 C82.4425446,54.0426429 79.7369732,58.8328036 75.3614375,61.1256607 C70.9849464,63.4213839 64.7340446,64.5620804 56.6087321,64.5620804 L46.2937411,64.8754375 L51.6083929,31.43125 C52.0230179,29.1412589 53.3767589,27.9948304 55.6705714,27.9948304 L61.6109821,27.9948304 C69.9416964,27.9948304 75.9881518,29.1957143 79.7388839,31.5879286 C83.4877054,33.985875 84.7382679,39.041625 83.4877054,46.7484911 Z" 
          fill="#003087"
        />
        <path 
          d="M637.026411,0.176741071 L613.899125,0.176741071 C611.601491,0.176741071 610.248705,1.32316964 609.835991,3.61507143 L589.518411,133.638223 L589.205054,134.263027 C589.205054,135.310098 589.622545,136.295071 590.457527,137.233232 C591.286777,138.169482 592.332893,138.638562 593.581545,138.638562 L614.212482,138.638562 C618.16575,138.638562 620.354473,136.662884 620.776741,132.701018 L641.092411,4.86276786 L641.092411,4.55227679 C641.091455,1.63557143 639.732938,0.176741071 637.026411,0.176741071 Z" 
          fill="#009CDE"
        />
        <path 
          d="M357.599732,50.4973125 C357.599732,49.4578839 357.18033,48.4662232 356.352036,47.5299732 C355.516098,46.5927679 354.576982,46.1217768 353.538509,46.1217768 L329.471152,46.1217768 C327.174473,46.1217768 325.300063,47.1688482 323.845054,49.24675 L290.714223,98.0081786 L276.962812,51.1240268 C275.916696,47.7917411 273.62575,46.1217768 270.086152,46.1217768 L246.641687,46.1217768 C245.597482,46.1217768 244.659321,46.5918125 243.831027,47.5299732 C242.995089,48.4662232 242.580464,49.4588393 242.580464,50.4973125 C242.580464,50.9176696 244.612509,57.0615714 248.674687,68.9385714 C252.736866,80.8174821 257.113357,93.6326429 261.80225,107.38692 C266.491143,121.137375 268.936857,128.434393 269.147036,129.262688 C252.059518,152.602063 243.51767,165.104821 243.51767,166.769054 C243.51767,169.480357 244.871411,170.833143 247.580804,170.833143 L271.648161,170.833143 C273.940062,170.833143 275.814473,169.793714 277.274259,167.709125 L356.976839,52.6850804 C357.391464,52.2704554 357.599732,51.5443839 357.599732,50.4973125 Z" 
          fill="#003087"
        />
        <path 
          d="M581.704545,46.1217768 L557.948634,46.1217768 C555.030018,46.1217768 553.263562,49.5601071 552.638759,56.4367679 C547.215196,48.1060536 537.323429,43.9330536 522.943393,43.9330536 C507.940464,43.9330536 495.174982,49.5601071 484.655545,60.8123036 C474.13133,72.0654554 468.872089,85.2990625 468.872089,100.508348 C468.872089,112.80475 472.465187,122.597161 479.653295,129.887491 C486.842357,137.185464 496.479045,140.827286 508.568134,140.827286 C514.608857,140.827286 520.755625,139.574813 527.006527,137.076554 C533.258384,134.576384 538.150768,131.244098 541.698964,127.07492 C541.698964,127.284143 541.486875,128.220393 541.073205,129.886536 C540.652848,131.5565 540.447446,132.808973 540.447446,133.637268 C540.447446,136.975286 541.798321,138.637607 544.511536,138.637607 L566.079679,138.637607 C570.032946,138.637607 572.32867,136.661929 572.952518,132.700063 L585.768634,51.1230714 C585.974036,49.8725089 585.661634,48.7279911 584.830473,47.6847411 C583.994536,46.6443571 582.955107,46.1217768 581.704545,46.1217768 Z M540.916527,107.696455 C535.60283,112.906018 529.196205,115.509366 521.694741,115.509366 C515.649241,115.509366 510.756857,113.845134 507.004214,110.509027 C503.252527,107.180563 501.377161,102.595804 501.377161,96.7566607 C501.377161,89.0517054 503.981464,82.5361696 509.191982,77.2224732 C514.395812,71.9087768 520.860714,69.2519286 528.571402,69.2519286 C534.400036,69.2519286 539.245607,70.9715714 543.104295,74.4089464 C546.956295,77.8472768 548.888027,82.5896696 548.888027,88.6323036 C548.887071,96.1328125 546.229268,102.489759 540.916527,107.696455 Z" 
          fill="#009CDE"
        />
        <path 
          d="M226.639375,46.1217768 L202.885375,46.1217768 C199.963893,46.1217768 198.196482,49.5601071 197.570723,56.4367679 C191.944625,48.1060536 182.04617,43.9330536 167.877268,43.9330536 C152.874339,43.9330536 140.109813,49.5601071 129.588464,60.8123036 C119.06425,72.0654554 113.805009,85.2990625 113.805009,100.508348 C113.805009,112.80475 117.400018,122.597161 124.58908,129.887491 C131.778143,137.185464 141.41292,140.827286 153.500098,140.827286 C159.331598,140.827286 165.378054,139.574813 171.628,137.076554 C177.878902,134.576384 182.880196,131.244098 186.630929,127.07492 C185.794991,129.575089 185.380366,131.763813 185.380366,133.637268 C185.380366,136.975286 186.734107,138.637607 189.4435,138.637607 L211.009732,138.637607 C214.965866,138.637607 217.260634,136.661929 217.886393,132.700063 L230.700598,51.1230714 C230.906,49.8725089 230.593598,48.7279911 229.763393,47.6847411 C228.929366,46.6443571 227.888982,46.1217768 226.639375,46.1217768 Z M185.850402,107.851223 C180.53575,112.962384 174.02117,115.509366 166.316214,115.509366 C160.269759,115.509366 155.425143,113.845134 151.781411,110.509027 C148.132902,107.180563 146.311036,102.595804 146.311036,96.7566607 C146.311036,89.0517054 148.914384,82.5361696 154.125857,77.2224732 C159.331598,71.9087768 165.791723,69.2519286 173.504321,69.2519286 C179.335821,69.2519286 184.180437,70.9715714 188.039125,74.4089464 C191.891125,77.8472768 193.820946,82.5896696 193.820946,88.6323036 C193.820946,96.3420357 191.164098,102.751527 185.850402,107.851223 Z" 
          fill="#003087"
        />
        <path 
          d="M464.337964,8.45777679 C456.314875,2.94154464 445.846071,0.176741071 432.926777,0.176741071 L383.230054,0.176741071 C379.05992,0.176741071 376.767062,2.15719643 376.353393,6.11333036 L356.037723,133.637268 C355.826589,134.889741 356.138991,136.035214 356.974929,137.076554 C357.802268,138.119804 358.849339,138.638563 360.099902,138.638563 L385.728312,138.638563 C388.228482,138.638563 389.894625,137.285777 390.729607,134.576384 L396.356661,98.3215357 C396.563018,96.6553929 397.292911,95.3006964 398.544429,94.2574464 C399.794991,93.2161071 401.356045,92.5349375 403.233321,92.2225357 C405.107732,91.913 406.876098,91.7572768 408.547018,91.7572768 C410.212205,91.7572768 412.19075,91.8623661 414.483607,92.0696786 C416.775509,92.2779464 418.238161,92.3792143 418.859143,92.3792143 C436.780687,92.3792143 450.843545,87.3301518 461.055357,77.2215179 C471.265259,67.1167054 476.370687,53.1044821 476.370687,35.1819821 C476.371643,22.8903571 472.358187,13.9826071 464.337964,8.45777679 Z M432.301018,59.8750982 C427.716259,63.0000714 420.839598,64.5620804 411.672946,64.5620804 L401.670357,64.8754375 L406.985009,31.43125 C407.397723,29.1412589 408.751464,27.9948304 411.047187,27.9948304 L416.671375,27.9948304 C421.254223,27.9948304 424.900821,28.2030982 427.614036,28.6186786 C430.318652,29.0390357 432.926777,30.3373661 435.426946,32.5251339 C437.929027,34.7138571 439.177679,37.8923304 439.177679,42.0595982 C439.177679,50.8106696 436.882911,56.7482143 432.301018,59.8750982 Z" 
          fill="#009CDE"
        />
      </g>
    </g>
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
    // MODIFICACIÓN: Reemplazar alert() por un método no bloqueante
    console.log("¡Orden completada! (Esta es solo una simulación)");
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
                  
                  {/* --- MODIFICACIÓN: Se reemplaza el SVG placeholder por el componente VisaIcon --- */}
                  <VisaIcon className="w-10 h-6" />
                  
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
                  
                  {/* --- MODIFICACIÓN: Se reemplaza el SVG placeholder por el componente PaypalIcon --- */}
                  <PaypalIcon className="w-10 h-6" />
                  
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