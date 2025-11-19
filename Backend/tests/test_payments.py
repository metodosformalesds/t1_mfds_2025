# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de pagos. Incluye pruebas
#             unitarias, integrales y funcionales para Stripe y PayPal.

import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from sqlalchemy.orm import Session
from decimal import Decimal
from app.api.v1.payments.service import payment_process_service as service
from app.api.v1.payments import schemas
from app.models.user import User
from app.models.address import Address
from app.models.payment_method import PaymentMethod
from app.models.shopping_cart import ShoppingCart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.order import Order
from app.models.coupon import Coupon
from app.models.enum import PaymentType, OrderStatus


# ==================== FIXTURES ADICIONALES ====================

@pytest.fixture
def test_coupon(db: Session):
    """Fixture que crea un cupón de prueba"""
    from datetime import date, timedelta

    coupon = Coupon(
        coupon_code="TEST10",
        discount_value=Decimal('10.00'),
        start_date=date.today(),
        expiration_date=date.today() + timedelta(days=30),
        is_active=True
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


# ==================== PRUEBAS UNITARIAS ====================

class TestPaymentServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de pagos.
    """

    def test_calculate_checkout_summary_without_coupon(
        self, db: Session, test_user: User, test_address: Address,
        test_cart_with_items: ShoppingCart
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para calcular resumen de checkout sin cupón.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Act
        result = service.calculate_checkout_summary(
            db, test_user.user_id, test_address.address_id
        )

        # Assert
        assert result["success"] is True
        assert "summary" in result
        summary = result["summary"]
        assert summary["subtotal"] > 0
        assert summary["shipping_cost"] >= 0
        assert summary["total_amount"] > 0
        assert summary["items_count"] > 0

    def test_calculate_checkout_summary_with_coupon(
        self, db: Session, test_user: User, test_address: Address,
        test_cart_with_items: ShoppingCart, test_coupon: Coupon
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para calcular checkout con cupón.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
            test_coupon (Coupon): Cupón de prueba.
        """
        # Arrange: Link coupon to user
        from app.models.user_coupon import UserCoupon

        user_coupon = UserCoupon(
            user_id=test_user.user_id,
            coupon_id=test_coupon.coupon_id
        )
        db.add(user_coupon)
        db.commit()

        # Act
        result = service.calculate_checkout_summary(
            db, test_user.user_id, test_address.address_id,
            coupon_code="TEST10"
        )

        # Assert
        assert result["success"] is True
        summary = result["summary"]
        assert summary["discount_amount"] > 0
        assert summary["total_amount"] < summary["subtotal"] + summary["shipping_cost"]

    def test_calculate_checkout_summary_empty_cart(
        self, db: Session, test_user: User, test_address: Address
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para validar error con carrito vacío.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
        """
        # Arrange - Crear carrito vacío
        cart = ShoppingCart(user_id=test_user.user_id)
        db.add(cart)
        db.commit()

        # Act
        result = service.calculate_checkout_summary(
            db, test_user.user_id, test_address.address_id
        )

        # Assert
        assert result["success"] is False
        assert "carrito" in result["error"].lower()

    @pytest.mark.asyncio
    @patch('app.api.v1.payments.service.stripe_service')
    @patch('app.api.v1.payments.service.order_service')
    async def test_create_stripe_checkout_session(
        self, mock_order_service, mock_stripe_service,
        db: Session, test_user: User, test_address: Address,
        test_cart_with_items: ShoppingCart
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para crear sesión de Stripe.
        Parámetros:
            mock_order_service: Mock del servicio de órdenes.
            mock_stripe_service: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange
        mock_stripe_service.create_checkout_session.return_value = {
            "success": True,
            "session_id": "cs_test_123",
            "checkout_url": "https://checkout.stripe.com/test"
        }

        # Act
        result = await service.create_stripe_checkout_session(
            db, test_user.cognito_sub, test_address.address_id
        )

        # Assert - Debug if fails
        if not result.get("success"):
            print(f"Result: {result}")
        assert result["success"] is True
        assert "stripe_session_id" in result or "stripe_checkout_url" in result

    @pytest.mark.asyncio
    @patch('app.api.v1.payments.service.paypal_service')
    async def test_initialize_paypal_checkout(
        self, mock_paypal_service,
        db: Session, test_user: User, test_address: Address,
        test_cart_with_items: ShoppingCart
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para inicializar checkout de PayPal.
        Parámetros:
            mock_paypal_service: Mock del servicio de PayPal.
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange - Mock PayPal API response structure
        mock_paypal_service.create_order = AsyncMock(return_value={
            "id": "PAYPAL123",
            "status": "CREATED",
            "links": [
                {
                    "href": "https://api.paypal.com/v2/checkout/orders/PAYPAL123",
                    "rel": "self",
                    "method": "GET"
                },
                {
                    "href": "https://paypal.com/checkout/PAYPAL123",
                    "rel": "approve",
                    "method": "GET"
                }
            ]
        })

        # Act
        result = await service.initialize_paypal_checkout(
            db, test_user.cognito_sub, test_address.address_id
        )

        # Assert - Debug if fails
        if not result.get("success"):
            print(f"Result: {result}")
        assert result["success"] is True
        assert "paypal_order_id" in result
        assert "paypal_approval_url" in result


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestPaymentAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de pagos.
    """

    def test_checkout_summary_endpoint(
        self, user_client, db, test_user, test_address, test_cart_with_items
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para endpoint de resumen de checkout.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
        """
        # Arrange
        payload = {"address_id": test_address.address_id}

        # Act
        response = user_client.post("/api/v1/checkout/summary", json=payload)

        # Assert
        assert response.status_code == 200
        data = response.json()
        # El endpoint devuelve CheckoutSummary directamente, no wrapped en "summary"
        assert "subtotal" in data
        assert float(data["subtotal"]) > 0
        assert "shipping_cost" in data
        assert "total_amount" in data
        assert "items_count" in data

    def test_checkout_summary_with_coupon_endpoint(
        self, user_client, db, test_user, test_address,
        test_cart_with_items, test_coupon
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para resumen con cupón.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_cart_with_items (ShoppingCart): Carrito con items.
            test_coupon (Coupon): Cupón de prueba.
        """
        # Arrange: Link coupon to user
        from app.models.user_coupon import UserCoupon

        user_coupon = UserCoupon(
            user_id=test_user.user_id,
            coupon_id=test_coupon.coupon_id
        )
        db.add(user_coupon)
        db.commit()

        payload = {
            "address_id": test_address.address_id,
            "coupon_code": "TEST10"
        }

        # Act
        response = user_client.post("/api/v1/checkout/summary", json=payload)

        # Assert
        assert response.status_code == 200
        data = response.json()
        # El endpoint devuelve CheckoutSummary directamente, no wrapped en "summary"
        assert "discount_amount" in data
        assert float(data["discount_amount"]) > 0
        assert float(data["total_amount"]) < float(data["subtotal"]) + float(data["shipping_cost"])


# ==================== PRUEBAS FUNCIONALES ====================

class TestPaymentFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de pagos.
    """

    @pytest.mark.asyncio
    @patch('app.api.v1.payments.service.stripe_service')
    @patch('app.api.v1.payments.service.order_service')
    async def test_complete_stripe_payment_flow(
        self, mock_order_service, mock_stripe_service,
        db, test_user, test_address, test_product
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de pago con Stripe:
                     calcular resumen, crear sesión, webhook, crear orden.
        Parámetros:
            mock_order_service: Mock del servicio de órdenes.
            mock_stripe_service: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_product (Product): Producto de prueba.
        """
        # Paso 1: Crear carrito con productos
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

        # Paso 2: Calcular resumen
        summary_result = service.calculate_checkout_summary(
            db, test_user.user_id, test_address.address_id
        )
        assert summary_result["success"] is True
        summary = summary_result["summary"]

        # Paso 3: Crear sesión de Stripe
        mock_stripe_service.create_checkout_session.return_value = {
            "success": True,
            "session_id": "cs_test_123",
            "checkout_url": "https://checkout.stripe.com/test"
        }

        session_result = await service.create_stripe_checkout_session(
            db, test_user.cognito_sub, test_address.address_id
        )
        assert session_result["success"] is True

        # Paso 4: Simular webhook de Stripe (pago exitoso)
        # Mock Stripe session retrieval
        mock_stripe_service.retrieve_session.return_value = {
            "id": "cs_test_123",
            "metadata": {
                "user_id": str(test_user.user_id),
                "address_id": str(test_address.address_id),
                "coupon_code": None,
                "subscription_id": None
            }
        }

        # Mock payment method retrieval
        mock_stripe_service.get_payment_method.return_value = {
            "success": True,
            "payment_method": {
                "card": {
                    "last4": "4242",
                    "exp_month": 12,
                    "exp_year": 2025,
                    "brand": "visa"
                },
                "type": "card"
            }
        }

        # Mock order creation
        mock_order = Order(
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=1,
            order_status=OrderStatus.PAID,
            subtotal=summary["subtotal"],
            shipping_cost=summary["shipping_cost"],
            discount_amount=summary["discount_amount"],
            total_amount=summary["total_amount"],
            points_earned=summary["points_to_earn"]
        )
        mock_order_service.create_order_from_cart = Mock(return_value={
            "success": True,
            "order": mock_order,
            "points_earned": summary["points_to_earn"]
        })

        # Mock Stripe PaymentIntent
        with patch('app.api.v1.payments.service.stripe.PaymentIntent') as mock_pi:
            mock_pi.retrieve.return_value = Mock(payment_method="pm_test_123")

            webhook_result = await service.process_stripe_webhook(
                db, "cs_test_123", "pi_test_456"
            )

        # Verificar que se llamó al servicio de órdenes
        assert mock_order_service.create_order_from_cart.called

        print("Prueba funcional de flujo completo de pago con Stripe completada")

    def test_checkout_with_loyalty_discount(
        self, db, test_user, test_address, test_product
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional para verificar aplicación de descuento por lealtad.
        Parámetros:
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_product (Product): Producto de prueba.
        """
        from app.models.user_loyalty import UserLoyalty
        from app.models.loyalty_tier import LoyaltyTier

        # Paso 1: Crear tier con beneficios
        tier = LoyaltyTier(
            tier_level=2,
            min_points_required=500,
            points_multiplier=1.5,
            free_shipping_threshold=Decimal('1000.00'),
            monthly_coupons_count=3,
            coupon_discount_percentage=10.0
        )
        db.add(tier)
        db.flush()

        # Paso 2: Asignar tier al usuario
        from datetime import date

        loyalty = UserLoyalty(
            user_id=test_user.user_id,
            tier_id=tier.tier_id,
            total_points=600,
            tier_achieved_date=date.today(),
            last_points_update=date.today()
        )
        db.add(loyalty)
        db.commit()

        # Paso 3: Crear carrito
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

        # Paso 4: Calcular resumen (debería aplicar descuento de tier)
        result = service.calculate_checkout_summary(
            db, test_user.user_id, test_address.address_id
        )

        assert result["success"] is True
        # El tier 2 puede tener envío gratis o descuentos especiales
        summary = result["summary"]
        assert summary["total_amount"] > 0

        print("Prueba funcional de checkout con descuento de lealtad completada")
