# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de suscripciones. Incluye pruebas
#             unitarias, integrales y funcionales para suscripciones mensuales.

import pytest
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timedelta, UTC
from unittest.mock import patch, Mock
from app.api.v1.subscriptions.service import subscription_service
from app.api.v1.subscriptions import schemas
from app.models.subscription import Subscription
from app.models.fitness_profile import FitnessProfile
from app.models.payment_method import PaymentMethod
from app.models.address import Address
from app.models.user import User
from app.models.product import Product
from app.models.enum import SubscriptionStatus, PaymentType, Gender


# ==================== FIXTURES ADICIONALES ====================

@pytest.fixture
def test_fitness_profile(db: Session, test_user: User):
    """Fixture que crea un perfil fitness de prueba"""
    from datetime import date
    profile = FitnessProfile(
        user_id=test_user.user_id,
        test_date=date.today(),
        attributes={
            "recommended_plan": "BeStrong",
            "age": 25,
            "gender": "M",
            "activity_type": "weightlifting",
            "goal_declared": "muscle_gain"
        }
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@pytest.fixture
def test_active_subscription(
    db: Session, test_user: User, test_fitness_profile: FitnessProfile,
    test_payment_method: PaymentMethod
):
    """Fixture que crea una suscripción activa"""
    subscription = Subscription(
        user_id=test_user.user_id,
        profile_id=test_fitness_profile.profile_id,
        payment_method_id=test_payment_method.payment_id,
        subscription_status=SubscriptionStatus.ACTIVE,
        start_date=datetime.now(UTC),
        next_delivery_date=datetime.now(UTC) + timedelta(days=30),
        auto_renew=True,
        price=Decimal('499.00'),
        failed_payment_attempts=0
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


# ==================== PRUEBAS UNITARIAS ====================

class TestSubscriptionServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de suscripciones.
    """

    @patch('app.api.v1.subscriptions.service.stripe_service')
    def test_create_subscription_success(
        self, mock_stripe, db: Session, test_user: User,
        test_fitness_profile: FitnessProfile, test_payment_method: PaymentMethod,
        test_address: Address
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para crear suscripción exitosamente.
        Parámetros:
            mock_stripe: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_fitness_profile (FitnessProfile): Perfil fitness de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
            test_address (Address): Dirección de prueba.
        """
        # Arrange
        # Create products for subscription (service needs products matching "BeStrong")
        product1 = Product(
            name="BeStrong Protein",
            description="Proteína para BeStrong",
            brand="Test Brand",
            category="Proteínas",
            fitness_objectives=["muscle_gain"],
            physical_activities=["weightlifting"],
            nutritional_value="24g protein",
            price=Decimal('899.99'),
            stock=50,
            is_active=True
        )
        db.add(product1)
        db.commit()

        mock_stripe.create_payment_intent_with_saved_card.return_value = {
            "success": True,
            "payment_intent_id": "pi_test_123"
        }

        # Act
        result = subscription_service.create_subscription(
            db, test_user.user_id, test_payment_method.payment_id
        )

        # Assert
        assert result["success"] is True
        assert "subscription" in result
        assert result["subscription"].subscription_status == SubscriptionStatus.ACTIVE

    def test_create_subscription_without_fitness_profile(
        self, db: Session, test_user: User, test_payment_method: PaymentMethod
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para validar error sin perfil fitness.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
        """
        # Act
        result = subscription_service.create_subscription(
            db, test_user.user_id, test_payment_method.payment_id
        )

        # Assert
        assert result["success"] is False
        assert "posicionamiento" in result["error"].lower() or "fitness" in result["error"].lower()

    def test_get_user_subscription(
        self, db: Session, test_user: User, test_active_subscription: Subscription
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener suscripción del usuario.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_active_subscription (Subscription): Suscripción activa.
        """
        # Act
        result = subscription_service.get_user_subscription(db, test_user.user_id)

        # Assert
        assert result["has_subscription"] is True
        assert result["subscription"] is not None
        assert result["subscription"].subscription_id == test_active_subscription.subscription_id

    def test_pause_subscription(
        self, db: Session, test_user: User, test_active_subscription: Subscription
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para pausar suscripción activa.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_active_subscription (Subscription): Suscripción activa.
        """
        # Act
        result = subscription_service.pause_subscription(db, test_user.user_id)

        # Assert
        assert result["success"] is True
        assert result["subscription"].subscription_status == SubscriptionStatus.PAUSED

    def test_resume_subscription(
        self, db: Session, test_user: User, test_active_subscription: Subscription
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para reanudar suscripción pausada.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_active_subscription (Subscription): Suscripción activa.
        """
        # Arrange - Pausar primero
        test_active_subscription.subscription_status = SubscriptionStatus.PAUSED
        db.commit()

        # Act
        result = subscription_service.resume_subscription(db, test_user.user_id)

        # Assert
        assert result["success"] is True
        assert result["subscription"].subscription_status == SubscriptionStatus.ACTIVE

    def test_cancel_subscription(
        self, db: Session, test_user: User, test_active_subscription: Subscription
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para cancelar suscripción.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_active_subscription (Subscription): Suscripción activa.
        """
        # Act
        result = subscription_service.cancel_subscription(db, test_user.user_id)

        # Assert
        assert result["success"] is True
        assert result["subscription"].subscription_status == SubscriptionStatus.CANCELLED

    def test_update_payment_method(
        self, db: Session, test_user: User, test_active_subscription: Subscription
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para actualizar método de pago.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_active_subscription (Subscription): Suscripción activa.
        """
        # Arrange - Crear nuevo método de pago
        new_payment = PaymentMethod(
            user_id=test_user.user_id,
            payment_type=PaymentType.CREDIT_CARD,
            provider_ref="new_stripe_pm_456",
            last_four="5555",
            expiration_date="12/2026",
            is_default=False
        )
        db.add(new_payment)
        db.commit()

        # Act
        result = subscription_service.update_payment_method(
            db, test_user.user_id, new_payment.payment_id
        )

        # Assert
        assert result["success"] is True
        assert result["subscription"].payment_method_id == new_payment.payment_id

    def test_select_products_for_subscription(
        self, db: Session, test_fitness_profile: FitnessProfile
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para selección de productos personalizados.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_fitness_profile (FitnessProfile): Perfil fitness de prueba.
        """
        # Arrange - Crear productos relacionados
        products = []
        for i in range(5):
            product = Product(
                name=f"Producto BeStrong {i+1}",
                description=f"Descripción {i+1}",
                brand="Test Brand",
                category="Proteínas",
                physical_activities=["weightlifting"],
                fitness_objectives=["muscle_gain"],
                nutritional_value="Test",
                price=Decimal('299.99'),
                stock=50,
                is_active=True
            )
            db.add(product)
            products.append(product)
        db.commit()

        # Act
        selected_products = subscription_service._select_products_for_subscription(
            db, test_fitness_profile
        )

        # Assert
        assert len(selected_products) <= 3
        assert all(isinstance(p, Product) for p in selected_products)


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestSubscriptionAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de suscripciones.
    """

    def test_get_subscription_endpoint(
        self, user_client, db, test_user, test_active_subscription
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener suscripción via API.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_active_subscription (Subscription): Suscripción activa.
        """
        # Act
        response = user_client.get("/api/v1/subscriptions/my-subscription")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "subscription_id" in data
        assert data["subscription_status"] == SubscriptionStatus.ACTIVE.value

    def test_pause_subscription_endpoint(
        self, user_client, db, test_user, test_active_subscription
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para pausar suscripción via API.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_active_subscription (Subscription): Suscripción activa.
        """
        # Act
        response = user_client.patch("/api/v1/subscriptions/pause")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


# ==================== PRUEBAS FUNCIONALES ====================

class TestSubscriptionFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de suscripciones.
    """

    @patch('app.api.v1.subscriptions.service.stripe_service')
    def test_complete_subscription_lifecycle(
        self, mock_stripe_service,
        db, test_user, test_fitness_profile, test_payment_method, test_address
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del ciclo de vida completo de suscripción:
                     crear, pausar, reanudar, actualizar pago, cancelar.
        Parámetros:
            mock_order_service: Mock del servicio de órdenes.
            mock_stripe_service: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_fitness_profile (FitnessProfile): Perfil fitness.
            test_payment_method (PaymentMethod): Método de pago.
            test_address (Address): Dirección.
        """
        # Paso 1: Crear productos para suscripción
        product1 = Product(
            name="BeStrong Protein",
            description="Proteína para BeStrong",
            brand="Test Brand",
            category="Proteínas",
            fitness_objectives=["muscle_gain"],
            physical_activities=["weightlifting"],
            nutritional_value="24g protein",
            price=Decimal('899.99'),
            stock=50,
            is_active=True
        )
        db.add(product1)
        db.commit()

        # Paso 2: Crear suscripción
        mock_stripe_service.create_payment_intent_with_saved_card.return_value = {
            "success": True,
            "payment_intent_id": "pi_test_123"
        }

        result = subscription_service.create_subscription(
            db, test_user.user_id, test_payment_method.payment_id
        )
        assert result["success"] is True
        subscription = result["subscription"]

        # Paso 2: Verificar suscripción activa
        status = subscription_service.get_user_subscription(db, test_user.user_id)
        assert status["has_subscription"] is True

        # Paso 3: Pausar suscripción
        pause_result = subscription_service.pause_subscription(db, test_user.user_id)
        assert pause_result["success"] is True
        assert pause_result["subscription"].subscription_status == SubscriptionStatus.PAUSED

        # Paso 4: Reanudar suscripción
        resume_result = subscription_service.resume_subscription(db, test_user.user_id)
        assert resume_result["success"] is True
        assert resume_result["subscription"].subscription_status == SubscriptionStatus.ACTIVE

        # Paso 5: Actualizar método de pago
        new_payment = PaymentMethod(
            user_id=test_user.user_id,
            payment_type=PaymentType.DEBIT_CARD,
            provider_ref="new_pm_789",
            last_four="6666",
            expiration_date="06/2027",
            is_default=False
        )
        db.add(new_payment)
        db.commit()

        update_result = subscription_service.update_payment_method(
            db, test_user.user_id, new_payment.payment_id
        )
        assert update_result["success"] is True

        # Paso 6: Cancelar suscripción
        cancel_result = subscription_service.cancel_subscription(db, test_user.user_id)
        assert cancel_result["success"] is True
        assert cancel_result["subscription"].subscription_status == SubscriptionStatus.CANCELLED

        print("Prueba funcional de ciclo de vida de suscripción completada")
