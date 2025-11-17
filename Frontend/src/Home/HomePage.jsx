import { useCallback } from 'react';

export const ProfileIcon = () => (
  <svg
    viewBox="84 1999 20 20" // <-- 'viewBox' corregido para centrar el dibujo
    fill="#34A853"
    stroke="#34A853"
    xmlns="http://www.w3.org/2000/svg"
    className="w-11 h-12"
  >
    {/* Se eliminaron los <g> con 'transform' que rompían el ícono */}
    <path d="M100.562548,2016.99998 L87.4381713,2016.99998 C86.7317804,2016.99998 86.2101535,2016.30298 86.4765813,2015.66198 C87.7127655,2012.69798 90.6169306,2010.99998 93.9998492,2010.99998 C97.3837885,2010.99998 100.287954,2012.69798 101.524138,2015.66198 C101.790566,2016.30298 101.268939,2016.99998 100.562548,2016.99998 M89.9166645,2004.99998 C89.9166645,2002.79398 91.7489936,2000.99998 93.9998492,2000.99998 C96.2517256,2000.99998 98.0830339,2002.79398 98.0830339,2004.99998 C98.0830339,2007.20598 96.2517256,2008.99998 93.9998492,2008.99998 C91.7489936,2008.99998 89.9166645,2007.20598 89.9166645,2004.99998 M103.955674,2016.63598 C103.213556,2013.27698 100.892265,2010.79798 97.837022,2009.67298 C99.4560048,2008.39598 100.400241,2006.33098 100.053171,2004.06998 C99.6509769,2001.44698 97.4235996,1999.34798 94.7348224,1999.04198 C91.0232075,1998.61898 87.8750721,2001.44898 87.8750721,2004.99998 C87.8750721,2006.88998 88.7692896,2008.57398 90.1636971,2009.67298 C87.1074334,2010.79798 84.7871636,2013.27698 84.044024,2016.63598 C83.7745338,2017.85698 84.7789973,2018.99998 86.0539717,2018.99998 L101.945727,2018.99998 C103.221722,2018.99998 104.226185,2017.85698 103.955674,2016.63598" />
  </svg>
);

export const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#34a853"
    className="w-12 h-12"
  >
    <path
      d="M4 12.6111L8.92308 17.5L20 6.5"
      stroke="#348a53"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#34A853"
    className="w-12 h-12"
  >
    <path
      d="M16.5008 14.1502H16.5098M19 4.00098H6.2C5.0799 4.00098 4.51984 4.00098 4.09202 4.21896C3.71569 4.41071 3.40973 4.71667 3.21799 5.093C3 5.52082 3 6.08087 3 7.20098V16.801C3 17.9211 3 18.4811 3.21799 18.909C3.40973 19.2853 3.71569 19.5912 4.09202 19.783C4.51984 20.001 5.07989 20.001 6.2 20.001H17.8C18.9201 20.001 19.4802 20.001 19.908 19.783C20.2843 19.5912 20.5903 19.2853 20.782 18.909C21 18.4811 21 17.9211 21 16.801V11.201C21 10.0809 21 9.52082 20.782 9.093C20.5903 8.71667 20.2843 8.41071 19.908 8.21896C19.4802 8.00098 18.9201 8.00098 17.8 8.00098H7M16.9508 14.1502C16.9508 14.3987 16.7493 14.6002 16.5008 14.6002C16.2523 14.6002 16.0508 14.3987 16.0508 14.1502C16.0508 13.9017 16.2523 13.7002 16.5008 13.7002C16.7493 13.7002 16.9508 13.9017 16.9508 14.1502Z"
      stroke="#34a83f"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = ({ className = "w-5 h-5", filled = true }) => (
  <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.135-.662 1.456 0l1.86 3.844 4.251.618c.731.106 1.023.987.493 1.498l-3.076 2.998.726 4.234c.124.727-.638 1.282-1.296.953L10 15.118l-3.805 2.001c-.658.33-1.42-.226-1.296-.953l.726-4.234L2.55 8.844c-.53-.511-.238-1.392.493-1.498l4.25-.618L9.16 2.884z" clipRule="evenodd" />
  </svg>
);

// --- Component: Hero ---
const Hero = () => (
  <section className="relative w-full overflow-hidden bg-gray-900 md:h-[550px]">
    <img 
      className="absolute inset-0 h-full w-full object-cover opacity-50" 
      src="https://placehold.co/1440x624/000000/FFFFFF?text=Hero+Image" 
      alt="Suplementos para tu cuerpo" 
    />
    <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="md:w-1/2 md:pl-8 lg:pl-16">
        <h1 className="font-bebas text-6xl font-bold tracking-wide text-white md:text-[64px]">
          Suplementos diseñados <br />para <span className="text-green-400">tu cuerpo</span>
        </h1>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button className="font-bebas tracking-[1px] rounded-lg bg-blue-800 px-14 py-4 text-2xl font-regular text-white shadow-lg transition hover:bg-blue-700">
            Explora la suscripción
          </button>
          <button className="font-bebas tracking-[1px] rounded-lg border-2 border-green-400 px-10 py-4 text-2xl font-regular text-white shadow-lg transition hover:bg-green-400 hover:text-black">
            Productos
          </button>
        </div>
      </div>
    </div>
  </section>
);

// --- Component: ProductCard ---
const ProductCard = ({ product }) => (
  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
    <div className="relative">
      <img 
        className="h-72 w-full object-cover" 
        src={product.imageSrc} 
        alt={product.title} 
      />
      {product.tag && (
        <span className="absolute left-4 top-4 rounded-full border border-green-500 bg-white px-3 py-1 text-sm font-semibold text-green-600">
          {product.tag}
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col p-4">
      <h3 className="text-lg font-semibold text-black">{product.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{product.description}</p>
      
      <div className="my-2 flex items-center">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={i < product.rating} />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-500">({product.reviewCount})</span>
      </div>

      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <p className="text-3xl font-bold text-black">${product.price}</p>
          <span className="text-sm text-gray-500">MXN</span>
        </div>
        <button className="rounded-2xl bg-blue-800 px-8 py-3 font-semibold text-white transition hover:bg-blue-700">
          Ver
        </button>
      </div>
    </div>
  </div>
);

// --- Component: FeaturedProducts ---
const FeaturedProducts = () => {
  const products = [
    { id: 1, title: "Proteina Whey Gold Standard", description: "2.27kg Chocolate Flavor", price: 899, rating: 5, reviewCount: 322, tag: "Recomendado para ti", imageSrc: "https://placehold.co/305x300/CCCCCC/FFFFFF?text=Proteina" },
    { id: 2, title: "Creatina Monohidratada", description: "500g Sin Sabor", price: 499, rating: 4, reviewCount: 210, tag: "Popular", imageSrc: "https://placehold.co/305x300/CCCCCC/FFFFFF?text=Creatina" },
    { id: 3, title: "Multivitamínico Opti-Men", description: "90 Tabletas", price: 350, rating: 5, reviewCount: 180, tag: "Esencial", imageSrc: "https://placehold.co/305x300/CCCCCC/FFFFFF?text=Vitaminas" },
    { id: 4, title: "Pre-Entrenamiento C4", description: "30 Servicios Fruit Punch", price: 599, rating: 4, reviewCount: 250, tag: "", imageSrc: "https://placehold.co/305x300/CCCCCC/FFFFFF?text=Pre-Workout" },
  ];

  return (
    <section className="bg-green-100 py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-bebas text-6xl font-bold text-black">
          Productos destacados
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Component: StepCard (Reusable for HowItWorks and PersonalizedPlan) ---
const StepCard = ({ number, title, description, icon }) => (
  <div className="flex h-full flex-col rounded-2xl bg-white p-6 text-center shadow-lg">
    {number && (
      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#459385] text-5xl font-bold text-white">
        {number}
      </div>
    )}
    {icon && (
      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
        {icon}
      </div>
    )}
    <h3 className="font-poppins text-2xl font-semibold text-black">{title}</h3>
    <p className="mt-2 flex-1 text-base text-gray-700">{description}</p>
  </div>
);

// --- Component: HowItWorks ---
const HowItWorks = () => {
  const steps = [
    { id: 1, title: "Completa tu perfil", description: "Responde un test rápido sobre tus objetivos, nivel de actividad física y preferencias alimenticias.", icon: <ProfileIcon /> },
    { id: 2, title: "Recibe Recomendaciones", description: "Nuestro algoritmo inteligente selecciona los mejores productos para ti de marcas certificadas.", icon: <CheckIcon /> },
    { id: 3, title: "Compra o Suscríbete", description: "Suscríbete para tener beneficios, personaliza tu perfil.", icon: <CardIcon /> },
  ];

  return (
    <section className="bg-[#FFFCF2] py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-bebas tracking-[2px] text-center text-7xl font-regular text-black">
          Cómo funciona BEFIT
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(step => (
            <StepCard key={step.id} title={step.title} description={step.description} icon={step.icon} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Component: PersonalizedPlan ---
const PersonalizedPlan = () => {
  const steps = [
    { id: 1, number: 1, title: "Completa el Test", description: "Responde preguntas sobre tus objetivos: ganar masa, perder grasa, mantener energía o mejorar rendimiento." },
    { id: 2, number: 2, title: "Genera tu Perfil", description: "El sistema crea un perfil nutricional y de entrenamiento basado en tus respuestas y características." },
    { id: 3, number: 3, title: "Recibe Recomendaciones", description: "Accede a un plan de suplementos y nutrición curado por expertos y ajustado a tus necesidades." },
    { id: 4, number: 4, title: "Actualiza Cuando Quieras", description: "Modifica tus objetivos o repite el test en cualquier momento para ajustar las recomendaciones." },
  ];

  return (
    <section className="bg-[#FFFCF2] py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-bebas text-6xl font-bold text-black">
          Tu Plan Personalizado
        </h2>
        <p className="mt-4 text-center text-xl text-cyan-700">
          Responde nuestro test y recibe recomendaciones diseñadas específicamente para ti
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(step => (
            <StepCard key={step.id} number={step.number} title={step.title} description={step.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Component: TestimonialCard ---
const TestimonialCard = ({ testimonial }) => (
  <div className="flex h-full flex-col rounded-xl bg-white p-6 shadow-lg">
    <div className="flex items-center">
      <img className="h-12 w-12 rounded-full object-cover" src={testimonial.imageSrc} alt={testimonial.name} />
      <div className="ml-4">
        <h4 className="font-semibold text-black">{testimonial.name}</h4>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={true} className="h-4 w-4" />
          ))}
        </div>
      </div>
    </div>
    <p className="mt-4 flex-1 text-base italic text-gray-600">
      "{testimonial.quote}"
    </p>
  </div>
);

// --- Component: Testimonials ---
const Testimonials = () => {
  const testimonials = [
    { id: 1, name: "María Rodríguez", quote: "Las recomendaciones personalizadas son increíbles. Nunca había encontrado productos que funcionaran tan bien para mis objetivos. ¡Y los precios son inmejorables!", imageSrc: "https://placehold.co/48x48/E0E0E0/000000?text=MR" },
    { id: 2, name: "Juan Pérez", quote: "El plan de suscripción me ahorra tiempo y dinero. Los productos llegan justo cuando los necesito. ¡Excelente servicio!", imageSrc: "https://placehold.co/48x48/E0E0E0/000000?text=JP" },
    { id: 3, name: "Ana García", quote: "Me encanta la variedad y la calidad de las marcas. El test fue súper fácil y acertó perfecto con lo que buscaba. ¡Totalmente recomendado!", imageSrc: "https://placehold.co/48x48/E0E0E0/000000?text=AG" },
  ];

  return (
    <section className="bg-green-100 py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-bebas text-6xl font-bold text-black">
          Lo que dicen nuestros clientes
        </h2>
        <p className="mt-4 text-center text-lg text-gray-700">
          Miles de personas ya transformaron su vida con BeFit
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map(item => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>
      </div>
    </section>
  );
};



// --- MODIFICATION: Create a mock useNavigate hook ---
const useNavigate = () => {
  return (path) => {
    console.log(`Mock navigation to: ${path}`);
  };
};

// --- Main Component (Internal) ---
// --- MODIFICATION: Renamed to HomeViewClientInternal ---
const HomeViewClientInternal = () => {
  const navigate = useNavigate();

  const onBefitWhiteClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onProfileRound1342IconClick = useCallback(() => {
    // Navigate to profile page
    console.log("Navigate to profile");
    navigate("/profile"); // Example navigation
  }, [navigate]);

  const onCartClick = useCallback(() => {
    // Navigate to cart page
    console.log("Navigate to cart");
    navigate("/cart"); // Example navigation
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FFFCF2] font-poppins text-black">
      <main>
        <Hero />
        <HowItWorks />
        <FeaturedProducts />
        <PersonalizedPlan />
        <Testimonials />
      </main>
    </div>
  );
};

const Home = () => {
  return (
    <HomeViewClientInternal />
  );
};

// --- MODIFICATION: Export App as the default ---
export default Home;