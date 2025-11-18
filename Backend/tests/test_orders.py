# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de órdenes. Incluye pruebas
#             unitarias, integrales y funcionales para operaciones de órdenes.

import pytest
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime
from app.api.v1.orders.service import order_service
from app.api.v1.orders import schemas
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.address import Address
from app.models.payment_method import PaymentMethod
from app.models.shopping_cart import ShoppingCart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import User
from app.models.enum import OrderStatus, PaymentType


# ==================== FIXTURES ADICIONALES ====================

@pytest.fixture
def test_address(db: Session, test_user: User):
    """Fixture que crea una dirección de prueba"""
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
def test_payment_method(db: Session, test_user: User):
    """Fixture que crea un método de pago de prueba"""
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


@pytest.fixture
def test_cart_with_items(db: Session, test_user: User, test_product: Product):
    """Fixture que crea un carrito con items"""
    cart = ShoppingCart(user_id=test_user.user_id)
    db.add(cart)
    db.flush()

    cart_item = CartItem(
        cart_id=cart.cart_id,
        product_id=test_product.product_id,
        quantity=2
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart)
    return cart


# ==================== PRUEBAS UNITARIAS ====================

class TestOrderServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de órdenes.
    """

    def test_create_order_from_cart_success(
        self, db: Session, test_user: User, test_address: Address,
        test_payment_method: PaymentMethod, test_cart_with_items: ShoppingCart
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para crear una orden desde el carrito.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange
        service = order_service
        subtotal = Decimal('1799.98')
        shipping_cost = Decimal('150.00')
        discount_amount = Decimal('0.00')
        total_amount = Decimal('1949.98')

        # Act
        result = service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            total_amount=total_amount,
            order_status=OrderStatus.PENDING
        )

        # Assert
        assert result["success"] is True
        assert "order" in result
        assert result["order"].subtotal == subtotal
        assert result["order"].total_amount == total_amount
        assert result["points_earned"] > 0

    def test_create_order_empty_cart(
        self, db: Session, test_user: User, test_address: Address,
        test_payment_method: PaymentMethod
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para validar error con carrito vacío.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
        """
        # Arrange
        service = order_service
        # Crear carrito vacío
        cart = ShoppingCart(user_id=test_user.user_id)
        db.add(cart)
        db.commit()

        # Act
        result = service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=Decimal('0'),
            shipping_cost=Decimal('0'),
            discount_amount=Decimal('0'),
            total_amount=Decimal('0')
        )

        # Assert
        assert result["success"] is False
        assert "carrito está vacío" in result["error"].lower()

    def test_get_order_by_id(
        self, db: Session, test_user: User, test_address: Address,
        test_payment_method: PaymentMethod, test_cart_with_items: ShoppingCart
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener una orden por ID.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange
        service = order_service
        # Crear orden primero
        result = service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=Decimal('1799.98'),
            shipping_cost=Decimal('150.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('1949.98')
        )
        order_id = result["order"].order_id

        # Act
        result = service.get_order_by_id(db, test_user.cognito_sub, order_id)

        # Assert
        assert result["success"] is True
        order = result["order"]
        assert order["order_id"] == order_id
        assert order["user_id"] == test_user.user_id

    def test_update_order_status(
        self, db: Session, test_user: User, test_address: Address,
        test_payment_method: PaymentMethod, test_cart_with_items: ShoppingCart
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para actualizar el estado de una orden.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange
        service = order_service
        result = service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=Decimal('1799.98'),
            shipping_cost=Decimal('150.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('1949.98')
        )
        order_id = result["order"].order_id

        # Act
        result = service.update_order_status(
            db, order_id, OrderStatus.PAID
        )

        # Assert
        assert result["success"] is True
        assert result["order"].order_status == OrderStatus.PAID

    def test_get_user_orders(
        self, db: Session, test_user: User, test_address: Address,
        test_payment_method: PaymentMethod, test_cart_with_items: ShoppingCart
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener órdenes de un usuario.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange
        service = order_service
        service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=Decimal('1799.98'),
            shipping_cost=Decimal('150.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('1949.98')
        )

        # Act
        result = service.get_user_orders(db, test_user.cognito_sub, limit=10, offset=0)

        # Assert
        assert result["success"] is True
        orders = result["orders"]
        total = result["total"]
        assert total >= 1
        assert len(orders) >= 1
        assert orders[0].user_id == test_user.user_id


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestOrderAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de órdenes.
    """

    def test_get_user_orders_endpoint(
        self, user_client, db, test_user, test_address,
        test_payment_method, test_cart_with_items
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener órdenes del usuario.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange - Crear orden
        service = order_service
        service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=Decimal('1799.98'),
            shipping_cost=Decimal('150.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('1949.98')
        )

        # Act
        response = user_client.get("/api/v1/orders/")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "orders" in data
        assert isinstance(data["orders"], list)

    def test_get_order_detail_endpoint(
        self, user_client, db, test_user, test_address,
        test_payment_method, test_cart_with_items
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener detalle de una orden.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange
        service = order_service
        result = service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=Decimal('1799.98'),
            shipping_cost=Decimal('150.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('1949.98')
        )
        order_id = result["order"].order_id

        # Act
        response = user_client.get(f"/api/v1/orders/{order_id}")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["order_id"] == order_id


# ==================== PRUEBAS FUNCIONALES ====================

class TestOrderFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de órdenes.
    """

    def test_complete_order_flow(
        self, db, test_user, test_address, test_payment_method,
        test_product
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de una orden:
                     agregar al carrito, crear orden, actualizar estado.
        Parámetros:
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_product (Product): Producto de prueba.
        """
        # Paso 1: Crear carrito con items
        cart = ShoppingCart(user_id=test_user.user_id)
        db.add(cart)
        db.flush()

        cart_item = CartItem(
            cart_id=cart.cart_id,
            product_id=test_product.product_id,
            quantity=3
        )
        db.add(cart_item)
        db.commit()

        # Paso 2: Crear orden
        service = order_service
        subtotal = test_product.price * Decimal('3')
        shipping_cost = Decimal('150.00')
        total_amount = subtotal + shipping_cost

        result = service.create_order_from_cart(
            db=db,
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            discount_amount=Decimal('0.00'),
            total_amount=total_amount
        )

        assert result["success"] is True
        order = result["order"]

        # Paso 3: Verificar que el carrito se vació
        db.refresh(cart)
        cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.cart_id).all()
        assert len(cart_items) == 0

        # Paso 4: Actualizar estado a PAID
        service.update_order_status(db, order.order_id, OrderStatus.PAID)

        # Paso 5: Actualizar estado a SHIPPED
        service.update_order_status(db, order.order_id, OrderStatus.SHIPPED)

        # Paso 6: Verificar estado final
        result = service.get_order_by_id(db, test_user.cognito_sub, order.order_id)
        assert result["success"] is True
        final_order = result["order"]
        assert final_order["order_status"] == OrderStatus.SHIPPED.value

        print("Prueba funcional de flujo completo de orden completada")
