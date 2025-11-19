# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de autenticación. Incluye pruebas
#             unitarias, integrales y funcionales para operaciones de auth con Cognito.

import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from sqlalchemy.orm import Session
from datetime import date
from app.api.v1.auth.service import CognitoService
from app.api.v1.auth import schemas
from app.models.user import User
from app.models.enum import AuthType, UserRole, Gender
from app.core.security import hash_password, verify_password


# ==================== PRUEBAS UNITARIAS ====================

class TestCognitoServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de autenticación.
    """

    @pytest.mark.asyncio
    @patch('app.api.v1.auth.service.boto3.client')
    async def test_sign_up_success(self, mock_boto_client, db: Session):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria que verifica el registro exitoso de un usuario.
        Parámetros:
            mock_boto_client: Mock del cliente de boto3.
            db (Session): Sesión de base de datos de prueba.
        """
        # Arrange
        mock_cognito = MagicMock()
        mock_cognito.sign_up.return_value = {
            "UserSub": "test-cognito-sub-123"
        }
        mock_boto_client.return_value = mock_cognito

        service = CognitoService()
        user_data = schemas.SignUpRequest(
            email="newuser@test.com",
            password="Test123!@#",
            first_name="New",
            last_name="User",
            gender="M",
            birth_date=date(1995, 5, 15)
        )

        # Act
        # Mock S3Service instance with async upload_profile_img method
        mock_s3_instance = MagicMock()
        mock_s3_instance.upload_profile_img = AsyncMock(return_value={
            "success": True,
            "file_url": "https://s3.amazonaws.com/bucket/test-image.jpg",
            "file_name": "profile_images/123/picture.jpg"
        })

        with patch('app.api.v1.auth.service.S3Service', return_value=mock_s3_instance):
            result = await service.sign_up(db, user_data, profile_image=None)

        # Assert
        assert result["success"] is True
        assert "user_sub" in result
        assert "user_id" in result

        # Verificar que el usuario se guardó en la BD
        user = db.query(User).filter(User.email == "newuser@test.com").first()
        assert user is not None
        assert user.first_name == "New"
        assert user.last_name == "User"

    @pytest.mark.asyncio
    @patch('app.api.v1.auth.service.boto3.client')
    async def test_sign_in_success(self, mock_boto_client):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para inicio de sesión exitoso.
        Parámetros:
            mock_boto_client: Mock del cliente de boto3.
        """
        # Arrange
        mock_cognito = MagicMock()
        mock_cognito.initiate_auth.return_value = {
            "AuthenticationResult": {
                "AccessToken": "mock-access-token",
                "IdToken": "mock-id-token",
                "RefreshToken": "mock-refresh-token",
                "ExpiresIn": 3600
            }
        }
        mock_boto_client.return_value = mock_cognito

        service = CognitoService()

        # Act
        # Handle both sync and async versions
        result = service.sign_in(
            email="test@example.com",
            password="Test123!@#"
        )
        # If result is a coroutine, await it
        if hasattr(result, '__await__'):
            result = await result

        # Assert
        assert result["success"] is True
        assert result["access_token"] == "mock-access-token"
        assert result["id_token"] == "mock-id-token"
        assert result["refresh_token"] == "mock-refresh-token"
        assert result["expires_in"] == 3600

    @pytest.mark.asyncio
    @patch('app.api.v1.auth.service.boto3.client')
    async def test_sign_in_invalid_credentials(self, mock_boto_client):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para credenciales inválidas.
        Parámetros:
            mock_boto_client: Mock del cliente de boto3.
        """
        # Arrange
        from botocore.exceptions import ClientError

        mock_cognito = MagicMock()

        # Mock exceptions attribute
        NotAuthorizedException = type('NotAuthorizedException', (Exception,), {})
        mock_cognito.exceptions.NotAuthorizedException = NotAuthorizedException

        # Configure side effect
        error_response = {'Error': {'Code': 'NotAuthorizedException', 'Message': 'Incorrect username or password'}}
        mock_cognito.initiate_auth.side_effect = NotAuthorizedException('Incorrect username or password')
        mock_boto_client.return_value = mock_cognito

        service = CognitoService()

        # Act
        result = service.sign_in(
            email="test@example.com",
            password="WrongPassword123!"
        )
        # If result is a coroutine, await it
        if hasattr(result, '__await__'):
            result = await result

        # Assert
        assert result["success"] is False
        assert "error" in result

    @pytest.mark.asyncio
    @patch('app.api.v1.auth.service.boto3.client')
    async def test_confirm_sign_up(self, mock_boto_client):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para confirmación de registro.
        Parámetros:
            mock_boto_client: Mock del cliente de boto3.
        """
        # Arrange
        mock_cognito = MagicMock()
        mock_cognito.confirm_sign_up.return_value = {}
        mock_boto_client.return_value = mock_cognito

        service = CognitoService()

        # Act
        result = service.confirm_sign_up(
            email="test@example.com",
            code="123456"
        )
        # If result is a coroutine, await it
        if hasattr(result, '__await__'):
            result = await result

        # Assert
        assert result["success"] is True
        mock_cognito.confirm_sign_up.assert_called_once()

    @pytest.mark.asyncio
    @patch('app.api.v1.auth.service.boto3.client')
    async def test_forgot_password(self, mock_boto_client):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para solicitud de recuperación de contraseña.
        Parámetros:
            mock_boto_client: Mock del cliente de boto3.
        """
        # Arrange
        mock_cognito = MagicMock()
        mock_cognito.forgot_password.return_value = {}
        mock_boto_client.return_value = mock_cognito

        service = CognitoService()

        # Act
        result = service.forgot_password(email="test@example.com")
        # If result is a coroutine, await it
        if hasattr(result, '__await__'):
            result = await result

        # Assert
        assert result["success"] is True
        mock_cognito.forgot_password.assert_called_once()

    @pytest.mark.asyncio
    @patch('app.api.v1.auth.service.boto3.client')
    async def test_refresh_token(self, mock_boto_client):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para renovación de token.
        Parámetros:
            mock_boto_client: Mock del cliente de boto3.
        """
        # Arrange
        mock_cognito = MagicMock()
        mock_cognito.initiate_auth.return_value = {
            "AuthenticationResult": {
                "AccessToken": "new-access-token",
                "IdToken": "new-id-token",
                "ExpiresIn": 3600
            }
        }
        mock_boto_client.return_value = mock_cognito

        service = CognitoService()

        # Act
        result = service.refresh_token(refresh_token="old-refresh-token")
        # If result is a coroutine, await it
        if hasattr(result, '__await__'):
            result = await result

        # Assert
        assert result["success"] is True
        assert result["access_token"] == "new-access-token"


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestAuthAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de autenticación.
    """

    @patch('app.services.s3_service.S3Service.upload_profile_img')
    @patch('app.api.v1.auth.service.cognito_service.sign_up')
    def test_signup_endpoint(self, mock_sign_up, mock_s3_upload, client, db):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para endpoint de registro.
        Parámetros:
            mock_sign_up: Mock del método sign_up del servicio.
            mock_s3_upload: Mock del método upload de S3.
            client (TestClient): Cliente HTTP de prueba.
            db (Session): Sesión de base de datos.
        """
        # Arrange
        mock_sign_up.return_value = {
            "success": True,
            "user_sub": "test-sub-456",
            "message": "Usuario registrado exitosamente"
        }
        mock_s3_upload.return_value = "https://s3.amazonaws.com/bucket/test-image.jpg"

        signup_data = {
            "email": "integration@test.com",
            "password": "IntegTest123!",
            "first_name": "Integration",
            "last_name": "Test",
            "gender": "F",
            "birth_date": "1992-03-20"
        }

        # Act
        response = client.post("/api/v1/auth/signup", data=signup_data)

        # Assert - Debug if fails
        if response.status_code not in [200, 201]:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.json()}")
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["success"] is True

    @patch('app.api.v1.auth.service.cognito_service.sign_in')
    def test_signin_endpoint(self, mock_sign_in, client):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para endpoint de login.
        Parámetros:
            mock_sign_in: Mock del método sign_in del servicio.
            client (TestClient): Cliente HTTP de prueba.
        """
        # Arrange
        mock_sign_in.return_value = {
            "success": True,
            "access_token": "test-access-token",
            "id_token": "test-id-token",
            "refresh_token": "test-refresh-token",
            "expires_in": 3600
        }

        signin_data = {
            "email": "test@example.com",
            "password": "Test123!@#"
        }

        # Act
        response = client.post("/api/v1/auth/login", json=signin_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data


# ==================== PRUEBAS FUNCIONALES ====================

class TestAuthFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de autenticación.
    """

    @patch('app.services.s3_service.S3Service.upload_profile_img')
    @patch('app.api.v1.auth.service.cognito_service.sign_in')
    @patch('app.api.v1.auth.service.cognito_service.confirm_sign_up')
    @patch('app.api.v1.auth.service.cognito_service.sign_up')
    def test_complete_registration_flow(self, mock_sign_up, mock_confirm, mock_sign_in, mock_s3_upload, client, db):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de registro:
                     registro, confirmación y primer login.
        Parámetros:
            mock_sign_up: Mock del método sign_up del servicio.
            mock_confirm: Mock del método confirm_sign_up del servicio.
            mock_sign_in: Mock del método sign_in del servicio.
            mock_s3_upload: Mock del método upload de S3.
            client (TestClient): Cliente HTTP de prueba.
            db (Session): Sesión de base de datos.
        """
        # Arrange
        mock_sign_up.return_value = {
            "success": True,
            "user_sub": "flow-test-sub",
            "message": "Usuario registrado exitosamente"
        }
        mock_confirm.return_value = {"success": True, "message": "Email confirmado"}
        mock_sign_in.return_value = {
            "success": True,
            "access_token": "flow-access-token",
            "id_token": "flow-id-token",
            "refresh_token": "flow-refresh-token",
            "expires_in": 3600
        }
        mock_s3_upload.return_value = "https://s3.amazonaws.com/bucket/test-image.jpg"

        # Paso 1: Registro
        signup_data = {
            "email": "flowtest@example.com",
            "password": "FlowTest123!",
            "first_name": "Flow",
            "last_name": "Test"
        }

        signup_response = client.post("/api/v1/auth/signup", data=signup_data)  # Use data for form

        assert signup_response.status_code in [200, 201]
        signup_result = signup_response.json()
        assert signup_result["success"] is True

        # Paso 2: Confirmación
        confirm_data = {
            "email": "flowtest@example.com",
            "code": "123456"
        }
        confirm_response = client.post("/api/v1/auth/confirm", json=confirm_data)
        assert confirm_response.status_code == 200

        # Paso 3: Login
        signin_data = {
            "email": "flowtest@example.com",
            "password": "FlowTest123!"
        }
        signin_response = client.post("/api/v1/auth/login", json=signin_data)
        assert signin_response.status_code == 200
        signin_result = signin_response.json()
        assert signin_result["success"] is True
        assert "access_token" in signin_result

        # Note: DB verification skipped because services are mocked
        # In a real functional test, the user would be created in the DB
        # but with mocks, we only verify API responses

        print("Prueba funcional de flujo completo de registro completada")

    @patch('app.api.v1.auth.service.cognito_service.confirm_forgot_password')
    @patch('app.api.v1.auth.service.cognito_service.forgot_password')
    def test_password_recovery_flow(self, mock_forgot, mock_confirm_forgot, client):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo de recuperación de contraseña.
        Parámetros:
            mock_forgot: Mock del método forgot_password del servicio.
            mock_confirm_forgot: Mock del método confirm_forgot_password del servicio.
            client (TestClient): Cliente HTTP de prueba.
        """
        # Arrange
        mock_forgot.return_value = {"success": True, "message": "Código enviado al email"}
        mock_confirm_forgot.return_value = {"success": True, "message": "Contraseña actualizada"}

        # Paso 1: Solicitar recuperación
        forgot_data = {"email": "forgot@example.com"}
        forgot_response = client.post("/api/v1/auth/forgot-password", json=forgot_data)
        assert forgot_response.status_code == 200
        forgot_result = forgot_response.json()
        assert forgot_result["success"] is True

        # Paso 2: Confirmar nueva contraseña
        confirm_data = {
            "email": "forgot@example.com",
            "code": "123456",
            "new_password": "NewPassword123!"
        }
        confirm_response = client.post("/api/v1/auth/confirm-forgot-password", json=confirm_data)
        assert confirm_response.status_code == 200
        confirm_result = confirm_response.json()
        assert confirm_result["success"] is True

        print("Prueba funcional de recuperación de contraseña completada")

    def test_password_hashing(self):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional de hashing y verificación de contraseñas.
        """
        # Arrange
        password = "TestPassword123!"

        # Act
        hashed = hash_password(password)
        is_valid = verify_password(password, hashed)
        is_invalid = verify_password("WrongPassword", hashed)

        # Assert
        assert hashed != password
        assert is_valid is True
        assert is_invalid is False

        print("Prueba funcional de hashing de contraseñas completada")