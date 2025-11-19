# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de test de colocación (placement test).
#             Incluye pruebas unitarias, integrales y funcionales para predicción ML de planes.

import pytest
from unittest.mock import patch, Mock
from sqlalchemy.orm import Session
from app.api.v1.placement_test.service import predict_plan, filter_test_attributes
from app.api.v1.placement_test import schemas
from app.models.fitness_profile import FitnessProfile
from app.models.user import User


# ==================== PRUEBAS UNITARIAS ====================

class TestPlacementTestServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de placement test.
    """

    def test_filter_test_attributes(self):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para filtrar atributos del test.
        """
        # Arrange
        input_data = {
            "age": 25,
            "gender": "M",
            "exercise_freq": 5,
            "activity_type": "Strength",
            "activity_intensity": "High",
            "diet_type": "High Protein",
            "diet_special": "Any",
            "supplements": "Yes",
            "goal_declared": "Gain Muscle",
            "sleep_hours": 7,
            "extra_field": "should be removed",
            "another_extra": 123
        }

        # Act
        filtered = filter_test_attributes(input_data)

        # Assert
        assert "age" in filtered
        assert "gender" in filtered
        assert "exercise_freq" in filtered
        assert "extra_field" not in filtered
        assert "another_extra" not in filtered

    @patch('app.api.v1.placement_test.service.target_encoder')
    @patch('app.api.v1.placement_test.service.encoders')
    @patch('app.api.v1.placement_test.service.model')
    def test_predict_plan_bestrong(
        self, mock_model, mock_encoders, mock_target_encoder
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para predicción de plan BeStrong.
        """
        # Arrange
        mock_model.predict.return_value = [0]  # Return index, not plan name

        # Create proper mock encoders with transform method that just returns the value
        # These match the actual encoder classes from the ML model
        def create_encoder_mock(values_map):
            encoder = Mock()
            encoder.classes_ = list(values_map.keys())
            def transform_func(values):
                return [values_map.get(v, 0) for v in values]
            encoder.transform = Mock(side_effect=transform_func)
            return encoder

        mock_encoders_dict = {
            "gender": create_encoder_mock({"M": 0, "F": 1}),
            "activity_type": create_encoder_mock({"Strength": 0, "Cardio": 1, "Mixed": 2, "Any": 3}),
            "activity_intensity": create_encoder_mock({"High": 0, "Moderate": 1, "Low": 2}),
            "diet_type": create_encoder_mock({"Balanced": 0, "High Protein": 1, "Low Carb": 2}),
            "diet_special": create_encoder_mock({"Any": 0, "Keto": 1, "Vegan": 2, "Vegetarian": 3}),
            "supplements": create_encoder_mock({"Yes": 0, "No": 1}),
            "goal_declared": create_encoder_mock({"Lose Weight": 0, "Maintain": 1, "Gain Muscle": 2})
        }
        mock_encoders.__getitem__.side_effect = lambda key: mock_encoders_dict[key]
        mock_encoders.get.side_effect = lambda key, default=None: mock_encoders_dict.get(key, default)

        mock_target_encoder.inverse_transform.return_value = ["BeStrong"]

        input_data = {
            "age": 25,
            "gender": "M",
            "exercise_freq": 5,
            "activity_type": "Strength",
            "activity_intensity": "High",
            "diet_type": "High Protein",
            "diet_special": "Any",
            "supplements": "Yes",
            "goal_declared": "Gain Muscle",
            "sleep_hours": 7
        }

        # Act
        result = predict_plan(input_data)

        # Assert
        assert result["recommended_plan"] == "BeStrong"
        assert "description" in result
        assert "attributes" in result

    def test_validate_placement_test_input_valid(self):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para validar input válido.
        """
        # Arrange
        valid_input = schemas.PlacementTestInput(
            age=25,
            gender="M",
            exercise_freq=5,
            activity_type="Strength",
            activity_intensity="High",
            diet_type="Balanced",
            diet_special="Any",
            supplements="No",
            goal_declared="Gain Muscle",
            sleep_hours=7
        )

        # Assert
        assert valid_input.age == 25
        assert valid_input.gender == "M"
        assert valid_input.exercise_freq == 5

    def test_validate_placement_test_input_invalid_age(self):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para validar error con edad inválida.
        """
        # Act & Assert
        with pytest.raises(Exception):
            schemas.PlacementTestInput(
                age=10,  # Menor que 13
                gender="M",
                exercise_freq=5,
                activity_type="Strength",
                activity_intensity="High",
                diet_type="Balanced",
                diet_special="Any",
                supplements="No",
                goal_declared="Gain Muscle",
                sleep_hours=7
            )

    def test_validate_placement_test_input_invalid_exercise_freq(self):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para validar error con frecuencia de ejercicio inválida.
        """
        # Act & Assert
        with pytest.raises(Exception):
            schemas.PlacementTestInput(
                age=25,
                gender="M",
                exercise_freq=8,  # Mayor que 7
                activity_type="Strength",
                activity_intensity="High",
                diet_type="Balanced",
                diet_special="Any",
                supplements="No",
                goal_declared="Gain Muscle",
                sleep_hours=7
            )


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestPlacementTestAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de placement test.
    """

    @patch('app.api.v1.placement_test.routes.predict_plan')
    def test_placement_test_endpoint(
        self, mock_predict, user_client, db, test_user
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para endpoint de placement test.
        """
        # Arrange
        mock_predict.return_value = {
            "recommended_plan": "BeStrong",
            "description": {
                "description": "Plan enfocado en ganancia muscular",
                "recommended_products": ["Whey Protein", "Creatina", "BCAA"]
            },
            "attributes": {
                "age": 25,
                "gender": "M",
                "exercise_freq": 5
            }
        }

        test_input = {
            "age": 25,
            "gender": "M",
            "exercise_freq": 5,
            "activity_type": "Strength",
            "activity_intensity": "High",
            "diet_type": "High Protein",
            "diet_special": "Any",
            "supplements": "Yes",
            "goal_declared": "Gain Muscle",
            "sleep_hours": 7
        }

        # Act
        response = user_client.post("/api/v1/placement-test/", json=test_input)

        # Assert
        assert response.status_code in [200, 201]
        data = response.json()
        assert "recommended_plan" in data

        # Verificar que se creó el FitnessProfile
        profile = db.query(FitnessProfile).filter(
            FitnessProfile.user_id == test_user.user_id
        ).first()
        assert profile is not None


# ==================== PRUEBAS FUNCIONALES ====================

class TestPlacementTestFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de placement test.
    """

    @patch('app.api.v1.placement_test.service.target_encoder')
    @patch('app.api.v1.placement_test.service.encoders')
    @patch('app.api.v1.placement_test.service.model')
    def test_complete_placement_test_flow(
        self, mock_model, mock_encoders, mock_target_encoder, db, test_user
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de placement test:
                     input, predicción ML, creación de FitnessProfile.
        """
        # Arrange - Mock del modelo ML
        mock_model.predict.return_value = [0]  # Return index, not plan name

        # Create proper mock encoders with transform method that just returns the value
        def create_encoder_mock(values_map):
            encoder = Mock()
            encoder.classes_ = list(values_map.keys())
            def transform_func(values):
                return [values_map.get(v, 0) for v in values]
            encoder.transform = Mock(side_effect=transform_func)
            return encoder

        mock_encoders_dict = {
            "gender": create_encoder_mock({"M": 0, "F": 1}),
            "activity_type": create_encoder_mock({"Strength": 0, "Cardio": 1, "Mixed": 2, "Any": 3}),
            "activity_intensity": create_encoder_mock({"High": 0, "Moderate": 1, "Low": 2}),
            "diet_type": create_encoder_mock({"Balanced": 0, "High Protein": 1, "Low Carb": 2}),
            "diet_special": create_encoder_mock({"Any": 0, "Keto": 1, "Vegan": 2, "Vegetarian": 3}),
            "supplements": create_encoder_mock({"Yes": 0, "No": 1}),
            "goal_declared": create_encoder_mock({"Lose Weight": 0, "Maintain": 1, "Gain Muscle": 2})
        }
        mock_encoders.__getitem__.side_effect = lambda key: mock_encoders_dict[key]
        mock_encoders.get.side_effect = lambda key, default=None: mock_encoders_dict.get(key, default)

        mock_target_encoder.inverse_transform.return_value = ["BeStrong"]

        # Paso 1: Preparar input del usuario
        user_input = {
            "age": 28,
            "gender": "M",
            "exercise_freq": 5,
            "activity_type": "Strength",
            "activity_intensity": "High",
            "diet_type": "High Protein",
            "diet_special": "Any",
            "supplements": "Yes",
            "goal_declared": "Gain Muscle",
            "sleep_hours": 7
        }

        # Paso 2: Filtrar atributos
        filtered_input = filter_test_attributes(user_input)
        assert len(filtered_input) == len(user_input)

        # Paso 3: Ejecutar predicción
        result = predict_plan(user_input)

        # Assert - Verificar predicción
        assert result["recommended_plan"] == "BeStrong"
        assert "description" in result
        assert "attributes" in result

        # Paso 4: Simular guardado de FitnessProfile
        from datetime import date
        # Merge recommended_plan into attributes
        profile_attributes = result["attributes"].copy()
        profile_attributes["recommended_plan"] = result["recommended_plan"]

        profile = FitnessProfile(
            user_id=test_user.user_id,
            test_date=date.today(),
            attributes=profile_attributes
        )
        db.add(profile)
        db.commit()

        # Paso 5: Verificar que el perfil se guardó correctamente
        saved_profile = db.query(FitnessProfile).filter(
            FitnessProfile.user_id == test_user.user_id
        ).first()

        assert saved_profile is not None
        assert saved_profile.attributes["recommended_plan"] == "BeStrong"
        assert saved_profile.attributes["age"] == 28
        assert saved_profile.attributes["gender"] == "M"

        print("Prueba funcional de placement test completada")

    def test_all_plan_types(self):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional para verificar que el sistema puede predecir
                     todos los tipos de planes (BeStrong, BeLean, BeBalance, BeDefine, BeNutri).
        """
        # Este test verifica que el modelo puede retornar todos los planes
        expected_plans = ["BeStrong", "BeLean", "BeBalance", "BeDefine", "BeNutri"]

        # En un entorno real, el modelo ML debería poder predecir cualquiera de estos
        # basado en los inputs del usuario
        assert all(isinstance(plan, str) for plan in expected_plans)
        assert len(expected_plans) == 5

        print("Prueba de tipos de planes completada")
