<h1 align="center">Equipo 1 – BeFit </h1>
<h3 align="center">T1 - MFDS / 2025</h3>

---

## 👥 Integrantes

| Matrícula | Nombre |
|------------|---------|
| 🗿 222804 | **Diego Alejandro Jasso Fernández** |
| 🗿 222835 | **Anna Lizbeth Barajas Sandoval** |
| 🗿 215460 | **Gabriel Alberto Vilchis Ríos** |
| 🗿 223046 | **Luis Ubaldo Flores Pineda** |
| 🗿 223229 | **Ricardo Rodríguez Ponce** |

## 🌐 Enlaces del proyecto 
| Recurso | Enlace |
|----------|--------|
| Documento SRS <img src="https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/idncaAgFGT.svg?c=1bxid64Mup7aczewSAYMX&t=1755572716016" width="20"> | [Documento SRS](https://docs.google.com/document/d/1cNEzRZLqyLAov2j3rIimDQ4FeCpK6pAe/edit?usp=sharing&ouid=100779215857562916985&rtpof=true&sd=true) |
| Carpeta del proyecto <img src="https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/idncaAgFGT.svg?c=1bxid64Mup7aczewSAYMX&t=1755572716016" width="20"> | [Carpeta del proyecto](https://drive.google.com/drive/folders/1-89uiM6H_JUMykYk7smQ1IoS_YTvPfO0?usp=sharing) |
| Cronograma de actividades <img src="https://cdn.brandfetch.io/idU6lzwMYA/theme/light/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1678376731571" width="20"> | [Cronograma de actividades](https://app.clickup.com/9017313759/v/s/90171635782) |
| Diagrama de Gantt <img src="https://cdn.brandfetch.io/idM6BU9PqJ/w/150/h/150/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1755681232908" width="20"> | [Diagrama de Gantt](https://docs.google.com/spreadsheets/d/1o7dNqU7Jxi7ucojEVMmcOWRPgSNp3zA9nR-aOBnljX4/edit?usp=sharing) |
| Prototipo del proyecto <img src="https://cdn.brandfetch.io/idZHcZ_i7F/theme/light/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" width="15"> | [Prototipo del proyecto](https://www.figma.com/design/WaS7B5Rg99ll3yqHYbcc5B/BeFit-Prototype?node-id=0-1&t=EOAzZqQikuIRQCX2-1) |
| Deployment AWS <img src="https://cdn.brandfetch.io/idVoqFQ-78/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B" width="20"> | https://frontend.d34s9corpodswj.amplifyapp.com/ |
| Presentación Ejecutiva <img src="https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/idncaAgFGT.svg?c=1bxid64Mup7aczewSAYMX&t=1755572716016" width="20"> | [Presentación Ejecutiva](https://docs.google.com/presentation/d/1fEga5ncM2CfUvp7k2cFZSsOFCJLBZvDYWGEVPykqIM0/edit?usp=drive_link) |
| Presentación Final <img src="https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/idncaAgFGT.svg?c=1bxid64Mup7aczewSAYMX&t=1755572716016" width="20"> | Disponible más adelante... |

## ⚙️ Tecnologías Utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/TailwindCSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=FF9900"/>
</p>

<br>

---
<h1 align="center"> T1- MFDS 2025 - APP </h1>

## Instrucciones de uso - Backend
Para instalar las dependencias requeridas ubicadas en "requirements.txt", es necesario realizar los siguientes pasos:

1. Para crear el ambiente virtual:
 ```bash
python -m venv venv
```
2. Para activar el ambiente virtual: ./venv/Scripts/activate
 ```bash
./venv/Scripts/activate
```
4. Para desactivar el ambiente virtual:
 ```bash
deactivate
```
6. Para instalar las dependencias: pip install -r requirements.txt
 ```bash
pip install -r requirements.txt
```

## Levantar el server de FastAPI
Para leventar el server de fastapi mediante la uvicorn, es necesario realizar lo siguiente:

```bash
cd Backend 
uvicorn app.main:app --reload
```

Para cerrar el server una vez que se este ejecutando: ctrl + c

---

## Instrucciones de uso - Frontend

### Requisitos previos
Tener Node.js instalado en el sistema. Se puede descargar desde [nodejs.org](https://nodejs.org/). Se recomienda la versión LTS (Long Term Support).

Verificar si Node.js y npm están instalados correctamente:

```bash
node --version
npm --version
```

### 1. Instalación de dependencias
Navegar a la carpeta del Frontend e instalar las dependencias desde package.json:

```bash
cd Frontend
npm install
```

### 2. Levantar el servidor de desarrollo
Para iniciar el servidor de desarrollo con Vite:

```bash
npm run dev
```

---

## Estructura del Proyecto

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # Punto de entrada de FastAPI
│   ├── config.py                    # Configuración y variables de entorno
│   │
│   ├── api/                         # Endpoints organizados por módulos
│   │   ├── __init__.py
│   │   ├── deps.py                  # Dependencias compartidas
│   │   │
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py            # Router principal v1
│   │   │   │
│   │   │   ├── address/             # Módulo de Direcciones de envío
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Lizbeth
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── admin/               # Módulo Administrador
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Luis
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── analytics/           # Módulo de Análitica
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Gabriel
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── auth/                # Módulo Auth/User con Cognito
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Gabriel
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── cart/                # Módulo Carrito de compras
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Luis
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── loyalty/             # Módulo Programa de puntos/lealtad
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Lizbeth
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── orders/              # Módulo Órdenes
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Lizbeth
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── payment_method/      # Módulo Métodos de pago
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Lizbeth
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── payments/            # Módulo Procesamiento de pagos
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Lizbeth
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── placement_test/      # Módulo Test de posicionamiento
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Diego
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── products/            # Módulo Productos
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Luis
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   └── search/              # Módulo Búsqueda y filtrado
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Lizbeth
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── shipping/            # Módulo Shipping
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Gabriel
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   └── user_profile/        # Módulo perfil
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py        # Lizbeth
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │
│   ├── models/                      # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── fitness_profile.py
│   │   ├── product.py
│   │   ├── category.py
│   │   ├── shopping_cart.py
│   │   ├── cart_item.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   ├── payment_method.py
│   │   ├── address.py
│   │   ├── review.py
│   │   ├── product_image.py
│   │   └── coupon.py
│   │   └── enum.py
│   │   └── loyalty_tier.py
│   │   └── point_history.py
│   │   └── subscription.py
│   │   └── user_coupon.py
│   │   └── user_loyalty.py
│   │
│   ├── core/                        # Funcionalidad core
│   │   ├── __init__.py
│   │   ├── security.py              # JWT, hashing
│   │   └── database.py              # Conexión DB
│   │
│   ├── services/                    # Servicios externos
│   │   ├── __init__.py
│   │   ├── stripe_service.py
│   │   ├── paypal_service.py
│   │   ├── scheduler.py
│   │   └── s3_service.py
│   
├── alembic/                         # Migraciones de DB
│   ├── versions/
│   └── env.py
│
├── tests/                           # Tests unitarios e integración
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_productos.py
│   ├── test_carrito.py
│   ├── test_pagos.py
│   ├── test_ordenes.py
│   └── ...
│
├── .env.example                     # Variables de entorno ejemplo
├── .gitignore
├── alembic.ini
├── requirements.txt
└── README.md

Frontend/
├── public/                     # Archivos estáticos accesibles públicamente
│   ├── Befitcolor.png          # Logo o imagen principal del proyecto
│   └── vite.svg                # Icono por defecto de Vite
│
├── src/                        # Código fuente del frontend
│   ├── Admin/                  # Componentes y vistas relacionadas con el panel de administrador
│   ├── Componentes/            # Componentes reutilizables de la aplicación
│   ├── Home/                   # Código correspondiente a la página de inicio
│   ├── Login/                  # Componentes y lógica para autenticación
│   ├── Payments/               # Módulo para manejo de pagos y pasarelas
│   ├── PositioningTest/        # Pruebas o experimentos de posicionamiento y layout
│   ├── Products/               # Vistas y componentes enfocados en productos
│   ├── Profile/                # Módulo para el perfil del usuario
│   ├── assets/                 # Recursos locales (imágenes, íconos, fuentes)
│   │
│   ├── utils/                  # Utilidades y funciones auxiliares
│   │   ├── api.js              # Configuración de endpoints y cliente API
│   │   └── auth.js             # Funciones relacionadas con autenticación/token
│   │
│   ├── App.css                 # Estilos globales de la aplicación
│   ├── App.jsx                 # Componente raíz del proyecto
│   ├── index.css               # Estilos base y configuración general
│   └── main.jsx                # Punto de entrada principal (monta React)
│
├── .gitignore                  # Especifica archivos/carpetas ignoradas por Git
├── README.md                   # Documentación principal del proyecto
├── eslint.config.js            # Configuración de ESLint para mantener estilo y calidad
├── index.html                  # Plantilla HTML principal usada por Vite
├── package-lock.json           # Versionado preciso de dependencias instaladas
├── package.json                # Scripts del proyecto, dependencias y metadatos
├── postcss.config.js           # Configuración de PostCSS
├── rd                          # (Archivo o carpeta personalizada del proyecto)
├── tailwind.config.js          # Configuración de Tailwind CSS
└── vite.config.js              # Configuración del bundler Vite
```
---

## Credenciales de Uso
