# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de perfil de usuario. Incluye pruebas
#             unitarias, integrales y funcionales para gestión de perfiles.

import pytest
from unittest.mock import patch, Mock
from sqlalchemy.orm import Session
from datetime import date
from app.api.v1.user_profile.service import user_profile_service
from app.api.v1.user_profile import schemas
from app.models.user import User
from app.models.enum import Gender


# ==================== PRUEBAS UNITARIAS ====================

class TestUserProfileServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de perfil de usuario.
    """

    def test_get_user_profile(self, db: Session, test_user: User):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener perfil de usuario.
        """
        # Act
        result = user_profile_service.get_user_profile(db=db, cognito_sub=test_user.cognito_sub)

        # Assert
        assert result["success"] is True
        assert result["user"]["email"] == test_user.email
        assert result["user"]["first_name"] == test_user.first_name

    def test_update_user_profile(self, db: Session, test_user: User):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para actualizar perfil de usuario.
        """
        # Act
        result = user_profile_service.update_user_profile(
            db=db, cognito_sub=test_user.cognito_sub,
            first_name="Updated",
            last_name="Name"
        )

        # Assert
        assert result["success"] is True
        assert result["user"]["first_name"] == "Updated"
        assert result["user"]["last_name"] == "Name"

    def test_update_profile_image(
        self, db: Session, test_user: User
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para actualizar imagen de perfil.
        """
        # Arrange
        mock_s3_instance = Mock()
        mock_s3_instance.upload_profile_img.return_value = {
            "success": True,
            "file_url": "https://s3.amazonaws.com/test/profile.jpg"
        }
        mock_s3_instance.delete_profile_img.return_value = {"success": True}

        # Patch the s3_service instance
        original_s3 = user_profile_service.s3_service
        user_profile_service.s3_service = mock_s3_instance

        image_content = b"fake_image_content"

        try:
            # Act
            result = user_profile_service.update_profile_image(
                db=db, cognito_sub=test_user.cognito_sub, image_content=image_content
            )

            # Assert
            assert result["success"] is True
            assert "profile_picture_url" in result
        finally:
            # Restore original s3_service
            user_profile_service.s3_service = original_s3

    def test_soft_delete_account(self, db: Session, test_user: User):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para desactivar cuenta (soft delete).
        """
        # Act
        result = user_profile_service.soft_delete_account(db=db, cognito_sub=test_user.cognito_sub)

        # Assert
        assert result["success"] is True
        db.refresh(test_user)
        assert test_user.account_status is False

    def test_get_basic_profile(self, db: Session, test_user: User):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener perfil básico.
        """
        # Act
        result = user_profile_service.get_basic_profile(db=db, cognito_sub=test_user.cognito_sub)

        # Assert
        assert result["success"] is True
        user_data = result["user"]
        assert "user_id" in user_data
        assert "email" in user_data
        assert "first_name" in user_data


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestUserProfileAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de perfil.
    """

    def test_get_profile_endpoint(self, user_client, test_user):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener perfil via API.
        """
        # Act
        response = user_client.get("/api/v1/profile/me")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email

    def test_update_profile_endpoint(self, user_client):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para actualizar perfil via API.
        """
        # Arrange
        update_data = {
            "first_name": "Updated",
            "last_name": "User"
        }

        # Act
        response = user_client.put("/api/v1/profile/me", json=update_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "User"


# ==================== PRUEBAS FUNCIONALES ====================

class TestUserProfileFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de perfil.
    """

    def test_complete_profile_management_flow(
        self, db, test_user
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de gestión de perfil:
                     obtener, actualizar datos, actualizar imagen, desactivar.
        """
        # Paso 1: Obtener perfil inicial
        profile = user_profile_service.get_user_profile(db=db, cognito_sub=test_user.cognito_sub)
        assert profile["success"] is True

        # Paso 2: Actualizar información personal
        update_result = user_profile_service.update_user_profile(
            db=db, cognito_sub=test_user.cognito_sub,
            first_name="Juan",
            last_name="Pérez",
            gender="M",
            date_of_birth=date(1990, 1, 1)
        )
        assert update_result["success"] is True
        assert update_result["user"]["first_name"] == "Juan"

        # Paso 3: Actualizar imagen de perfil
        mock_s3_instance = Mock()
        mock_s3_instance.upload_profile_img.return_value = {
            "success": True,
            "file_url": "https://s3.amazonaws.com/test/new_profile.jpg"
        }
        mock_s3_instance.delete_profile_img.return_value = {"success": True}

        # Patch the s3_service instance
        original_s3 = user_profile_service.s3_service
        user_profile_service.s3_service = mock_s3_instance

        try:
            image_result = user_profile_service.update_profile_image(
                db=db, cognito_sub=test_user.cognito_sub, image_content=b"new_image_content"
            )
            assert image_result["success"] is True
        finally:
            # Restore original s3_service
            user_profile_service.s3_service = original_s3

        # Paso 4: Obtener perfil básico
        basic = user_profile_service.get_basic_profile(db=db, cognito_sub=test_user.cognito_sub)
        assert basic["success"] is True
        assert basic["user"]["first_name"] == "Juan"

        # Paso 5: Desactivar cuenta
        delete_result = user_profile_service.soft_delete_account(db=db, cognito_sub=test_user.cognito_sub)
        assert delete_result["success"] is True

        print("Prueba funcional de gestión de perfil completada")
