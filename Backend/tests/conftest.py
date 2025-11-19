# Autor: Luis Flores
# Fecha: 14/11/2025
# Descripción: Archivo de configuración de pytest con fixtures compartidos para todos los tests.
#             Incluye configuración de base de datos de prueba, cliente HTTP y datos de prueba.

import pytest
import os

# ============================================================================
# IMPORTANTE: Configurar TODAS las variables de entorno ANTES de importar app
# ============================================================================
os.environ["COGNITO_REGION"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AWS_REGION"] = "us-east-1"
os.environ["AWS_ACCESS_KEY_ID"] = "test-access-key-id"
os.environ["AWS_SECRET_ACCESS_KEY"] = "test-secret-access-key"
os.environ["COGNITO_USER_POOL_ID"] = "test-pool-id"
os.environ["COGNITO_CLIENT_ID"] = "test-client-id"
os.environ["S3_BUCKET_NAME"] = "test-bucket"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret"
os.environ["STRIPE_API_KEY"] = "pk_test_12345"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_12345"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test_12345"
os.environ["PAYPAL_CLIENT_ID"] = "test-paypal-client-id"
os.environ["PAYPAL_CLIENT_SECRET"] = "test-paypal-secret"
os.environ["PAYPAL_API_BASE_URL"] = "https://api.sandbox.paypal.com"
os.environ["APP_URL"] = "http://localhost:3000"

# Ahora sí podemos importar la aplicación
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import date
from decimal import Decimal

from app.main import app
from app.core.database import Base, get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.shopping_cart import ShoppingCart
from app.models.cart_item import CartItem
from app.models.address import Address
from app.models.payment_method import PaymentMethod
from app.models.enum import UserRole, AuthType, Gender, PaymentType
from app.core.security import hash_password

# Configuración de base de datos en memoria para tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Autor: Luis Flores
    Descripción: Fixture que proporciona una sesión de base de datos de prueba.
                 Se crea una nueva base de datos en memoria para cada test y se limpia al finalizar.
    Retorna:
        Session: Sesión de base de datos SQLAlchemy para testing.
    """
    # Crear las tablas
    Base.metadata.create_all(bind=engine)
    
    # Crear sesión
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        # Limpiar las tablas después del test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Autor: Luis Flores
    Descripción: Fixture que proporciona un cliente HTTP de prueba (no autenticado) para FastAPI.
                 Sobrescribe la dependencia de base de datos con la BD de prueba.
    Parámetros:
        db (Session): Sesión de base de datos de prueba.
    Retorna:
        TestClient: Cliente HTTP para hacer peticiones a la API.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_client(db, test_admin):
    """
    Autor: Luis Flores
    Descripción: Fixture de cliente HTTP autenticado como Administrador.
                 Sobrescribe 'get_db' y 'get_current_user'.
    Parámetros:
        db (Session): Sesión de base de datos de prueba.
        test_admin (User): Fixture de usuario administrador.
    Retorna:
        TestClient: Cliente HTTP autenticado como admin.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_get_current_user():
        return test_admin

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    with TestClient(app) as test_client:
        yield test_client
        
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def user_client(db, test_user):
    """
    Autor: Luis Flores
    Descripción: Fixture de cliente HTTP autenticado como Usuario regular.
                 Sobrescribe 'get_db' y 'get_current_user'.
    Parámetros:
        db (Session): Sesión de base de datos de prueba.
        test_user (User): Fixture de usuario regular.
    Retorna:
        TestClient: Cliente HTTP autenticado como usuario.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_get_current_user():
        return test_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    with TestClient(app) as test_client:
        yield test_client
        
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """
    Autor: Luis Flores
    Descripción: Fixture que crea un usuario de prueba en la base de datos.
    Parámetros:
        db (Session): Sesión de base de datos.
    Retorna:
        User: Usuario de prueba creado.
    """
    user = User(
        cognito_sub="test-user-123",
        email="test@example.com",
        password_hash=hash_password("Test123!"),
        first_name="Test",
        last_name="User",
        gender=Gender.MALE,
        date_of_birth=date(1990, 1, 1),
        auth_type=AuthType.EMAIL,
        role=UserRole.USER,
        account_status=True,
        stripe_customer_id="cus_test_123"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db):
    """
    Autor: Luis Flores
    Descripción: Fixture que crea un usuario administrador de prueba.
    Parámetros:
        db (Session): Sesión de base de datos.
    Retorna:
        User: Usuario administrador de prueba.
    """
    admin = User(
        cognito_sub="test-admin-456",
        email="admin@example.com",
        password_hash=hash_password("Admin123!"),
        first_name="Admin",
        last_name="User",
        gender=Gender.FEMALE,
        date_of_birth=date(1985, 5, 15),
        auth_type=AuthType.EMAIL,
        role=UserRole.ADMIN,
        account_status=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def test_product(db):
    """
    Autor: Luis Flores
    Descripción: Fixture que crea un producto de prueba con imagen.
    Parámetros:
        db (Session): Sesión de base de datos.
    Retorna:
        Product: Producto de prueba creado.
    """
    product = Product(
        name="Whey Protein Test",
        description="Proteína de prueba para tests",
        brand="Test Brand",
        category="Proteínas",
        physical_activities=["weightlifting", "crossfit"],
        fitness_objectives=["muscle_gain", "recovery"],
        nutritional_value="24g proteína por servida",
        price=Decimal('899.99'),
        stock=50,
        is_active=True
    )
    db.add(product)
    db.flush()
    
    # Agregar imagen
    image = ProductImage(
        product_id=product.product_id,
        image_path="https://example.com/test-image.jpg",
        is_primary=True
    )
    db.add(image)
    db.commit()
    db.refresh(product)
    return product


@pytest.fixture
def test_cart(db, test_user):
    """
    Autor: Luis Flores
    Descripción: Fixture que crea un carrito de compras de prueba.
    Parámetros:
        db (Session): Sesión de base de datos.
        test_user (User): Usuario de prueba.
    Retorna:
        ShoppingCart: Carrito de compras de prueba.
    """
    cart = ShoppingCart(user_id=test_user.user_id)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


@pytest.fixture
def test_cart_with_items(db, test_user, test_product):
    """
    Autor: Luis Flores
    Descripción: Fixture que crea un carrito con items de prueba.
    Parámetros:
        db (Session): Sesión de base de datos.
        test_user (User): Usuario de prueba.
        test_product (Product): Producto de prueba.
    Retorna:
        ShoppingCart: Carrito con items de prueba.
    """
    from app.models.shopping_cart import ShoppingCart
    from app.models.cart_item import CartItem

    cart = ShoppingCart(user_id=test_user.user_id)
    db.add(cart)
    db.commit()
    db.refresh(cart)

    # Add 2 items to cart
    cart_item = CartItem(
        cart_id=cart.cart_id,
        product_id=test_product.product_id,
        quantity=2
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart)

    return cart


@pytest.fixture
def mock_cognito_token():
    """
    Autor: Luis Flores
    Descripción: Fixture que proporciona un token JWT mock para pruebas.
    Retorna:
        str: Token JWT de prueba.
    """
    return "mock-jwt-token-for-testing"


@pytest.fixture
def test_address(db, test_user):
    """
    Autor: Luis Flores
    Descripción: Fixture que crea una dirección de prueba.
    Parámetros:
        db (Session): Sesión de base de datos.
        test_user (User): Usuario de prueba.
    Retorna:
        Address: Dirección de prueba creada.
    """
    address = Address(
        user_id=test_user.user_id,
        address_name="Casa",
        address_line1="Calle Test 123",
        address_line2="Depto 4B",
        country="México",
        state="Chihuahua",
        city="Juárez",
        zip_code="32000",
        recipient_name="Test User",
        phone_number="1234567890",
        is_default=True
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@pytest.fixture
def test_payment_method(db, test_user):
    """
    Autor: Luis Flores
    Descripción: Fixture que crea un método de pago de prueba.
    Parámetros:
        db (Session): Sesión de base de datos.
        test_user (User): Usuario de prueba.
    Retorna:
        PaymentMethod: Método de pago de prueba creado.
    """
    payment = PaymentMethod(
        user_id=test_user.user_id,
        payment_type=PaymentType.CREDIT_CARD,
        provider_ref="test_stripe_pm_123",
        last_four="4242",
        expiration_date="12/2025",
        is_default=True
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment