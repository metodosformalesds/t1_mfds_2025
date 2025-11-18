# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de lealtad. Incluye pruebas
#             unitarias, integrales y funcionales para sistema de puntos y tiers.

import pytest
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timedelta, UTC, date
from app.api.v1.loyalty.service import loyalty_service
from app.api.v1.loyalty import schemas
from app.models.user_loyalty import UserLoyalty
from app.models.loyalty_tier import LoyaltyTier
from app.models.point_history import PointHistory
from app.models.coupon import Coupon
from app.models.user import User
from app.models.order import Order
from app.models.enum import OrderStatus


# ==================== FIXTURES ADICIONALES ====================

@pytest.fixture
def test_loyalty_tiers(db: Session):
    """Fixture que crea los tres tiers de lealtad"""
    tiers = [
        LoyaltyTier(
            tier_level=1,
            min_points_required=0,
            points_multiplier=1.0,
            free_shipping_threshold=Decimal('2000.00'),
            monthly_coupons_count=1,
            coupon_discount_percentage=5.0
        ),
        LoyaltyTier(
            tier_level=2,
            min_points_required=500,
            points_multiplier=1.5,
            free_shipping_threshold=Decimal('1000.00'),
            monthly_coupons_count=3,
            coupon_discount_percentage=10.0
        ),
        LoyaltyTier(
            tier_level=3,
            min_points_required=1500,
            points_multiplier=2.0,
            free_shipping_threshold=Decimal('500.00'),
            monthly_coupons_count=5,
            coupon_discount_percentage=15.0
        )
    ]
    db.add_all(tiers)
    db.commit()
    return tiers


@pytest.fixture
def test_user_loyalty(db: Session, test_user: User, test_loyalty_tiers):
    """Fixture que crea registro de lealtad para el usuario"""
    # Get tier 1 (first tier)
    tier_1 = test_loyalty_tiers[0]
    loyalty = UserLoyalty(
        user_id=test_user.user_id,
        tier_id=tier_1.tier_id,
        total_points=100,
        tier_achieved_date=date.today(),
        last_points_update=date.today()
    )
    db.add(loyalty)
    db.commit()
    db.refresh(loyalty)
    return loyalty


# ==================== PRUEBAS UNITARIAS ====================

class TestLoyaltyServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de lealtad.
    """

    def test_get_user_loyalty_status_existing(
        self, db: Session, test_user: User, test_user_loyalty: UserLoyalty,
        test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener estado de lealtad existente.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_user_loyalty (UserLoyalty): Lealtad del usuario.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Act
        result = loyalty_service.get_user_loyalty_status(db=db, cognito_sub=test_user.cognito_sub)

        # Assert
        assert "loyalty" in result
        loyalty = result["loyalty"]
        assert loyalty["user_id"] == test_user.user_id
        assert loyalty["total_points"] >= 0

    def test_get_user_loyalty_status_new_user(
        self, db: Session, test_user: User, test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para crear registro de lealtad para usuario nuevo.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba sin lealtad.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Act
        result = loyalty_service.get_user_loyalty_status(db=db, cognito_sub=test_user.cognito_sub)

        # Assert
        assert "loyalty" in result
        loyalty = result["loyalty"]
        assert loyalty["total_points"] == 0
        assert loyalty["tier_level"] == 1

    def test_add_points(
        self, db: Session, test_user_loyalty: UserLoyalty,
        test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para agregar puntos al usuario.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user_loyalty (UserLoyalty): Lealtad del usuario.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Arrange
        initial_points = test_user_loyalty.total_points
        points_to_add = 50

        # Crear orden mock
        order = Order(
            user_id=test_user_loyalty.user_id,
            address_id=1,
            payment_id=1,
            order_status=OrderStatus.PAID,
            subtotal=Decimal('500.00'),
            shipping_cost=Decimal('50.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('550.00'),
            points_earned=points_to_add
        )
        db.add(order)
        db.commit()

        # Act
        result = loyalty_service.add_points(
            db=db, loyalty_id=test_user_loyalty.loyalty_id, points=points_to_add, order_id=order.order_id
        )

        # Assert
        assert result["success"] is True
        assert result["points_added"] == points_to_add
        assert result["new_total"] == initial_points + points_to_add

        # Verificar historial
        history = db.query(PointHistory).filter(
            PointHistory.loyalty_id == test_user_loyalty.loyalty_id,
            PointHistory.order_id == order.order_id
        ).first()
        assert history is not None
        assert history.points_change == points_to_add

    def test_add_points_triggers_tier_upgrade(
        self, db: Session, test_user_loyalty: UserLoyalty,
        test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para verificar upgrade de tier al agregar puntos.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user_loyalty (UserLoyalty): Lealtad del usuario.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Arrange - Usuario en tier 1 con puntos cercanos a tier 2
        test_user_loyalty.total_points = 450
        db.commit()

        order = Order(
            user_id=test_user_loyalty.user_id,
            address_id=1,
            payment_id=1,
            order_status=OrderStatus.PAID,
            subtotal=Decimal('500.00'),
            shipping_cost=Decimal('50.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('550.00'),
            points_earned=100
        )
        db.add(order)
        db.commit()

        # Act - Agregar 100 puntos (450 + 100 = 550, suficiente para tier 2)
        result = loyalty_service.add_points(
            db=db, loyalty_id=test_user_loyalty.loyalty_id, points=100, order_id=order.order_id
        )

        # Assert
        db.refresh(test_user_loyalty)
        assert test_user_loyalty.loyalty_tier.tier_level == 2
        assert test_user_loyalty.total_points == 550

    def test_expire_points_for_user(
        self, db: Session, test_user: User, test_user_loyalty: UserLoyalty,
        test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para expirar puntos del usuario.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_user_loyalty (UserLoyalty): Lealtad del usuario.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Arrange - Usuario con puntos y fecha de expiración pasada
        tier_2 = test_loyalty_tiers[1]
        test_user_loyalty.total_points = 200
        test_user_loyalty.tier_id = tier_2.tier_id
        test_user_loyalty.points_expiration_date = datetime.now(UTC) - timedelta(days=1)
        db.commit()

        # Act
        result = loyalty_service.expire_points_for_user(db=db, cognito_sub=test_user.cognito_sub)

        # Assert
        assert result["points_expired"] == 200
        assert result["new_total"] == 0
        assert result["tier_reset"] is True
        assert result["new_tier_level"] == 1

        # Verificar historial
        history = db.query(PointHistory).filter(
            PointHistory.loyalty_id == test_user_loyalty.loyalty_id,
            PointHistory.points_change == -200
        ).first()
        assert history is not None

    def test_get_all_tiers(self, db: Session, test_loyalty_tiers):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener todos los tiers.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Act
        result = loyalty_service.get_all_tiers(db=db)

        # Assert
        assert result["success"] is True
        assert len(result["tiers"]) == 3

    def test_get_point_history(
        self, db: Session, test_user: User, test_user_loyalty: UserLoyalty
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener historial de puntos.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_user_loyalty (UserLoyalty): Lealtad del usuario.
        """
        # Arrange - Crear orden para el historial
        from datetime import date
        from app.models.order import Order
        from app.models.enum import OrderStatus
        from decimal import Decimal

        order = Order(
            user_id=test_user.user_id,
            address_id=1,
            payment_id=1,
            order_status=OrderStatus.PAID,
            subtotal=Decimal('100.00'),
            shipping_cost=Decimal('10.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('110.00'),
            points_earned=50
        )
        db.add(order)
        db.commit()

        # Crear historial de puntos ganados
        history1 = PointHistory(
            loyalty_id=test_user_loyalty.loyalty_id,
            order_id=order.order_id,
            points_change=50,
            event_type="earned",
            event_date=date.today()
        )
        # Crear historial de puntos expirados (sin order_id)
        history2 = PointHistory(
            loyalty_id=test_user_loyalty.loyalty_id,
            order_id=None,
            points_change=-20,
            event_type="expired",
            event_date=date.today()
        )
        db.add_all([history1, history2])
        db.commit()

        # Act
        result = loyalty_service.get_point_history(
            db=db, cognito_sub=test_user.cognito_sub, limit=10
        )

        # Assert
        assert result["success"] is True
        assert len(result["history"]) >= 2
        assert result["total"] >= 2

    def test_generate_random_coupon_code(self):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para generar código de cupón aleatorio.
        """
        # Act
        code1 = loyalty_service.generate_random_coupon_code(length=6)
        code2 = loyalty_service.generate_random_coupon_code(length=8)

        # Assert
        assert len(code1) == 6
        assert len(code2) == 8
        assert code1 != code2  # Deben ser diferentes
        assert code1.isalnum()

    def test_generate_monthly_coupons_tier1(
        self, db: Session, test_user: User, test_user_loyalty: UserLoyalty,
        test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para generar cupones para tier 1.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_user_loyalty (UserLoyalty): Lealtad del usuario (tier 1).
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Arrange - Usuario en tier 1 (already is tier 1 from fixture)
        tier_1 = test_loyalty_tiers[0]
        test_user_loyalty.tier_id = tier_1.tier_id
        db.commit()

        # Act
        coupon_codes = loyalty_service.generate_monthly_coupons_for_user(
            db=db, user_id=test_user.user_id
        )

        # Assert
        assert len(coupon_codes) == 1  # Tier 1 = 1 cupón
        coupon = db.query(Coupon).filter(Coupon.coupon_code == coupon_codes[0]).first()
        assert coupon.discount_value == 5.0


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestLoyaltyAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de lealtad.
    """

    def test_get_loyalty_status_endpoint(
        self, user_client, db, test_user, test_user_loyalty, test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener estado de lealtad via API.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_user_loyalty (UserLoyalty): Lealtad del usuario.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Act
        response = user_client.get("/api/v1/loyalty/me")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "loyalty_id" in data or "user_id" in data
        assert data["user_id"] == test_user.user_id

    def test_get_tiers_endpoint(
        self, client, db, test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener tiers via API (público).
        Parámetros:
            client (TestClient): Cliente HTTP sin autenticación.
            db (Session): Sesión de base de datos.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Act
        response = client.get("/api/v1/loyalty/tiers")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["tiers"]) == 3


# ==================== PRUEBAS FUNCIONALES ====================

class TestLoyaltyFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de lealtad.
    """

    def test_complete_loyalty_flow(
        self, db, test_user, test_loyalty_tiers
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de lealtad:
                     crear cuenta, ganar puntos, subir tiers, generar cupones, expirar.
        Parámetros:
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_loyalty_tiers: Tiers de lealtad.
        """
        # Paso 1: Nuevo usuario obtiene su estado (auto-creación)
        status = loyalty_service.get_user_loyalty_status(db=db, cognito_sub=test_user.cognito_sub)
        loyalty = status["loyalty"]
        assert loyalty["tier_level"] == 1
        assert loyalty["total_points"] == 0

        # Obtener objeto UserLoyalty para usar en add_points
        user_loyalty = db.query(UserLoyalty).filter(UserLoyalty.user_id == test_user.user_id).first()

        # Paso 2: Usuario hace compra y gana puntos (tier 1 -> 2)
        order1 = Order(
            user_id=test_user.user_id,
            address_id=1,
            payment_id=1,
            order_status=OrderStatus.PAID,
            subtotal=Decimal('2500.00'),
            shipping_cost=Decimal('100.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('2600.00'),
            points_earned=520
        )
        db.add(order1)
        db.commit()

        loyalty_service.add_points(db=db, loyalty_id=user_loyalty.loyalty_id, points=520, order_id=order1.order_id)
        db.refresh(user_loyalty)
        assert user_loyalty.total_points == 520
        assert user_loyalty.loyalty_tier.tier_level == 2  # Subió a tier 2

        # Paso 3: Generar cupones mensuales (tier 2 = 3 cupones al 10%)
        coupons = loyalty_service.generate_monthly_coupons_for_user(db=db, user_id=test_user.user_id)
        assert len(coupons) == 3

        # Paso 4: Usuario sigue comprando (tier 2 -> 3)
        order2 = Order(
            user_id=test_user.user_id,
            address_id=1,
            payment_id=1,
            order_status=OrderStatus.PAID,
            subtotal=Decimal('5000.00'),
            shipping_cost=Decimal('100.00'),
            discount_amount=Decimal('0.00'),
            total_amount=Decimal('5100.00'),
            points_earned=1020
        )
        db.add(order2)
        db.commit()

        loyalty_service.add_points(db=db, loyalty_id=user_loyalty.loyalty_id, points=1020, order_id=order2.order_id)
        db.refresh(user_loyalty)
        assert user_loyalty.loyalty_tier.tier_level == 3  # Subió a tier 3
        assert user_loyalty.total_points == 1540

        # Paso 5: Obtener historial de puntos
        history = loyalty_service.get_point_history(db=db, cognito_sub=test_user.cognito_sub, limit=50)
        assert history["total"] >= 2

        # Paso 6: Expirar puntos
        user_loyalty.points_expiration_date = datetime.now(UTC) - timedelta(days=1)
        db.commit()

        expire_result = loyalty_service.expire_points_for_user(db=db, cognito_sub=test_user.cognito_sub)
        assert expire_result["points_expired"] == 1540
        assert expire_result["new_tier_level"] == 1

        print("Prueba funcional de flujo completo de lealtad completada")
