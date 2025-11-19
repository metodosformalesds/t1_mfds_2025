# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de métodos de pago. Incluye pruebas
#             unitarias, integrales y funcionales para gestión de tarjetas guardadas.

import pytest
from unittest.mock import patch, Mock
from sqlalchemy.orm import Session
from app.api.v1.payment_method.service import payment_method_service
from app.api.v1.payment_method import schemas
from app.models.payment_method import PaymentMethod
from app.models.user import User
from app.models.enum import PaymentType


# ==================== PRUEBAS UNITARIAS ====================

class TestPaymentMethodServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de métodos de pago.
    """

    def test_get_user_payment_methods(
        self, db: Session, test_user: User, test_payment_method: PaymentMethod
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener métodos de pago del usuario.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
        """
        # Act
        result = payment_method_service.get_user_payment_methods(
            db=db, cognito_sub=test_user.cognito_sub
        )

        # Assert
        assert result["success"] is True
        assert result["total"] >= 1
        assert len(result["payment_methods"]) >= 1

    def test_get_payment_method_by_id(
        self, db: Session, test_user: User, test_payment_method: PaymentMethod
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener método de pago específico.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
        """
        # Act
        result = payment_method_service.get_payment_method_by_id(
            db=db, cognito_sub=test_user.cognito_sub, payment_id=test_payment_method.payment_id
        )

        # Assert
        assert result["success"] is True
        assert result["payment_method"].payment_id == test_payment_method.payment_id

    @patch('app.api.v1.payment_method.service.stripe_service')
    def test_create_setup_intent_success(
        self, mock_stripe_service, db: Session, test_user: User
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para crear SetupIntent de Stripe.
        Parámetros:
            mock_stripe_service: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
        """
        # Arrange
        mock_stripe_service.get_or_create_customer.return_value = {
            "success": True,
            "customer_id": "cus_test_123"
        }
        mock_stripe_service.create_setup_intent.return_value = {
            "success": True,
            "client_secret": "seti_secret_test_123",
            "setup_intent_id": "seti_test_123"
        }

        # Act
        result = payment_method_service.create_setup_intent(db=db, cognito_sub=test_user.cognito_sub)

        # Assert
        assert result["success"] is True
        assert "client_secret" in result
        assert "setup_intent_id" in result

    @patch('app.api.v1.payment_method.service.stripe_service')
    def test_save_payment_method_from_setup(
        self, mock_stripe_service, db: Session, test_user: User
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para guardar tarjeta tras SetupIntent.
        Parámetros:
            mock_stripe_service: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
        """
        # Arrange
        # Set stripe_customer_id for the test user
        test_user.stripe_customer_id = "cus_test_123"
        db.commit()

        mock_stripe_service.get_payment_method.return_value = {
            "success": True,
            "payment_method": {
                "id": "pm_test_123",
                "type": "card",
                "card": {
                    "last4": "4242",
                    "exp_month": 12,
                    "exp_year": 2025,
                    "funding": "credit"
                }
            }
        }

        # Act
        result = payment_method_service.save_payment_method_from_setup(
            db=db, cognito_sub=test_user.cognito_sub, payment_method_id="pm_test_123", is_default=True
        )

        # Assert
        assert result["success"] is True
        assert result["payment_method"].last_four == "4242"
        assert result["payment_method"].is_default is True

    @patch('app.api.v1.payment_method.service.stripe_service')
    def test_delete_payment_method(
        self, mock_stripe_service, db: Session, test_user: User,
        test_payment_method: PaymentMethod
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para eliminar método de pago.
        Parámetros:
            mock_stripe_service: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
        """
        # Arrange
        mock_stripe_service.detach_payment_method.return_value = {
            "success": True
        }

        # Act
        result = payment_method_service.delete_payment_method(
            db, test_user.cognito_sub, test_payment_method.payment_id
        )

        # Assert
        assert result["success"] is True
        deleted = db.query(PaymentMethod).filter(
            PaymentMethod.payment_id == test_payment_method.payment_id
        ).first()
        assert deleted is None

    def test_set_default_payment_method(
        self, db: Session, test_user: User
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para establecer tarjeta por defecto.
        Parámetros:
            db (Session): Sesión de base de datos de prueba.
            test_user (User): Usuario de prueba.
        """
        # Arrange - Crear dos tarjetas
        pm1 = PaymentMethod(
            user_id=test_user.user_id,
            payment_type=PaymentType.CREDIT_CARD,
            provider_ref="pm_1",
            last_four="1111",
            expiration_date="12/2025",
            is_default=True
        )
        pm2 = PaymentMethod(
            user_id=test_user.user_id,
            payment_type=PaymentType.CREDIT_CARD,
            provider_ref="pm_2",
            last_four="2222",
            expiration_date="12/2026",
            is_default=False
        )
        db.add_all([pm1, pm2])
        db.commit()

        # Act
        result = payment_method_service.set_default_payment_method(
            db, test_user.cognito_sub, pm2.payment_id
        )

        # Assert
        assert result["success"] is True
        db.refresh(pm1)
        db.refresh(pm2)
        assert pm1.is_default is False
        assert pm2.is_default is True


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestPaymentMethodAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de métodos de pago.
    """

    def test_get_payment_methods_endpoint(
        self, user_client, db, test_user, test_payment_method
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener métodos de pago via API.
        Parámetros:
            user_client (TestClient): Cliente HTTP autenticado.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
            test_payment_method (PaymentMethod): Método de pago de prueba.
        """
        # Act
        response = user_client.get("/api/v1/payment-methods/")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["payment_methods"]) >= 1

    @patch('app.api.v1.payment_method.service.stripe_service')
    def test_create_setup_intent_endpoint(
        self, mock_stripe_service, user_client, test_user
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para crear SetupIntent via API.
        Parámetros:
            mock_stripe_service: Mock del servicio de Stripe.
            user_client (TestClient): Cliente HTTP autenticado.
            test_user (User): Usuario de prueba.
        """
        # Arrange
        mock_stripe_service.get_or_create_customer.return_value = {
            "success": True,
            "customer_id": "cus_test_123"
        }
        mock_stripe_service.create_setup_intent.return_value = {
            "success": True,
            "client_secret": "seti_secret_123",
            "setup_intent_id": "seti_123"
        }

        # Act
        response = user_client.post("/api/v1/payment-methods/setup-intent")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "client_secret" in data


# ==================== PRUEBAS FUNCIONALES ====================

class TestPaymentMethodFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de métodos de pago.
    """

    @patch('app.api.v1.payment_method.service.stripe_service')
    def test_complete_payment_method_flow(
        self, mock_stripe_service, db, test_user
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de métodos de pago:
                     crear SetupIntent, guardar tarjeta, cambiar default, eliminar.
        Parámetros:
            mock_stripe_service: Mock del servicio de Stripe.
            db (Session): Sesión de base de datos.
            test_user (User): Usuario de prueba.
        """
        # Paso 1: Crear SetupIntent
        mock_stripe_service.get_or_create_customer.return_value = {
            "success": True,
            "customer_id": "cus_test_123"
        }
        mock_stripe_service.create_setup_intent.return_value = {
            "success": True,
            "client_secret": "seti_secret_123",
            "setup_intent_id": "seti_123"
        }

        setup_result = payment_method_service.create_setup_intent(
            db, test_user.cognito_sub
        )
        assert setup_result["success"] is True

        # Paso 2: Guardar primera tarjeta
        mock_stripe_service.get_payment_method.return_value = {
            "success": True,
            "payment_method": {
                "id": "pm_1",
                "type": "card",
                "card": {
                    "last4": "4242",
                    "exp_month": 12,
                    "exp_year": 2025,
                    "funding": "credit"
                }
            }
        }

        save_result1 = payment_method_service.save_payment_method_from_setup(
            db, test_user.cognito_sub, "pm_1", is_default=True
        )
        assert save_result1["success"] is True
        pm1 = save_result1["payment_method"]

        # Paso 3: Guardar segunda tarjeta
        mock_stripe_service.get_payment_method.return_value = {
            "success": True,
            "payment_method": {
                "id": "pm_2",
                "type": "card",
                "card": {
                    "last4": "5555",
                    "exp_month": 6,
                    "exp_year": 2026,
                    "funding": "debit"
                }
            }
        }

        save_result2 = payment_method_service.save_payment_method_from_setup(
            db, test_user.cognito_sub, "pm_2", is_default=False
        )
        assert save_result2["success"] is True
        pm2 = save_result2["payment_method"]

        # Paso 4: Listar tarjetas
        list_result = payment_method_service.get_user_payment_methods(
            db, test_user.cognito_sub
        )
        assert list_result["total"] == 2

        # Paso 5: Cambiar tarjeta por defecto
        default_result = payment_method_service.set_default_payment_method(
            db, test_user.cognito_sub, pm2.payment_id
        )
        assert default_result["success"] is True

        # Paso 6: Eliminar primera tarjeta
        mock_stripe_service.detach_payment_method.return_value = {
            "success": True
        }

        delete_result = payment_method_service.delete_payment_method(
            db, test_user.cognito_sub, pm1.payment_id
        )
        assert delete_result["success"] is True

        # Paso 7: Verificar que solo queda una tarjeta
        final_list = payment_method_service.get_user_payment_methods(
            db, test_user.cognito_sub
        )
        assert final_list["total"] == 1

        print("Prueba funcional de gestión de métodos de pago completada")
