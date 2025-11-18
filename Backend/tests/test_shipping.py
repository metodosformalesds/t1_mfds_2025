# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de envíos. Incluye pruebas
#             unitarias, integrales y funcionales para rastreo de pedidos.

import pytest
from sqlalchemy.orm import Session
from decimal import Decimal
from app.api.v1.shipping.service import shipping_service
from app.api.v1.shipping import schemas
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.models.address import Address
from app.models.payment_method import PaymentMethod
from app.models.enum import OrderStatus


# ==================== PRUEBAS UNITARIAS ====================

class TestShippingServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de envíos.
    """

    def test_generate_tracking_number(self):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para generar número de rastreo.
        """
        # Act
        tracking1 = shipping_service.generate_tracking_number()
        tracking2 = shipping_service.generate_tracking_number()

        # Assert
        assert tracking1 is not None
        assert len(tracking1) > 0
        assert tracking1 != tracking2  # Deben ser únicos

    def test_get_order_tracking_details(
        self, db: Session, test_user: User, test_address: Address,
        test_payment_method: PaymentMethod, test_product: Product
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener detalles de rastreo.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_address (Address): Dirección de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_product (Product): Producto de prueba.
        """
        # Arrange - Crear orden
        order = Order(
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            order_status=OrderStatus.SHIPPED,
            tracking_number=shipping_service.generate_tracking_number(),
            subtotal=Decimal('899.99'),
            shipping_cost=Decimal('50.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('949.99'),
            points_earned=189
        )
        db.add(order)
        db.flush()

        order_item = OrderItem(
            order_id=order.order_id,
            product_id=test_product.product_id,
            quantity=1,
            unit_price=test_product.price,
            subtotal=test_product.price
        )
        db.add(order_item)
        db.commit()

        # Act
        details = shipping_service.get_details(db, order.order_id)

        # Assert
        assert details is not None
        assert details.order_id == order.order_id
        assert details.tracking_number == order.tracking_number
        assert details.order_status == OrderStatus.SHIPPED.value
        assert len(details.product_names) >= 1


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestShippingAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de envíos.
    """

    def test_tracking_endpoint(
        self, client, db, test_user, test_address,
        test_payment_method, test_product
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para rastreo de pedido via API.
        """
        # Arrange - Crear orden
        order = Order(
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            order_status=OrderStatus.SHIPPED,
            tracking_number="TEST123456",
            subtotal=Decimal('899.99'),
            shipping_cost=Decimal('50.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('949.99'),
            points_earned=189
        )
        db.add(order)
        db.flush()

        order_item = OrderItem(
            order_id=order.order_id,
            product_id=test_product.product_id,
            quantity=1,
            unit_price=test_product.price,
            subtotal=test_product.price
        )
        db.add(order_item)
        db.commit()

        # Act
        response = client.get(f"/api/v1/shipping/rastrear-pedido/{order.order_id}")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["order_id"] == order.order_id
        assert data["tracking_number"] == "TEST123456"


# ==================== PRUEBAS FUNCIONALES ====================

class TestShippingFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de envíos.
    """

    def test_order_tracking_lifecycle(
        self, db, test_user, test_address, test_payment_method, test_product
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del ciclo de vida de rastreo de orden:
                     crear orden, generar tracking, actualizar estados, consultar tracking.
        """
        # Paso 1: Crear orden con tracking
        tracking_number = shipping_service.generate_tracking_number()
        order = Order(
            user_id=test_user.user_id,
            address_id=test_address.address_id,
            payment_id=test_payment_method.payment_id,
            order_status=OrderStatus.PENDING,
            tracking_number=tracking_number,
            subtotal=Decimal('1799.98'),
            shipping_cost=Decimal('100.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('1899.98'),
            points_earned=379
        )
        db.add(order)
        db.flush()

        order_item = OrderItem(
            order_id=order.order_id,
            product_id=test_product.product_id,
            quantity=2,
            unit_price=test_product.price,
            subtotal=test_product.price * 2
        )
        db.add(order_item)
        db.commit()

        # Paso 2: Verificar tracking inicial
        details = shipping_service.get_details(db, order.order_id)
        assert details.order_status == OrderStatus.PENDING.value

        # Paso 3: Actualizar estado a PAID
        order.order_status = OrderStatus.PAID
        db.commit()

        details = shipping_service.get_details(db, order.order_id)
        assert details.order_status == OrderStatus.PAID.value

        # Paso 4: Actualizar estado a SHIPPED
        order.order_status = OrderStatus.SHIPPED
        db.commit()

        details = shipping_service.get_details(db, order.order_id)
        assert details.order_status == OrderStatus.SHIPPED.value
        assert details.tracking_number == tracking_number

        # Paso 5: Actualizar estado a DELIVERED
        order.order_status = OrderStatus.DELIVERED
        db.commit()

        details = shipping_service.get_details(db, order.order_id)
        assert details.order_status == OrderStatus.DELIVERED.value

        print("Prueba funcional de ciclo de vida de rastreo completada")
