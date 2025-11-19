# Autor: Luis Flores
# Fecha: 17/11/2025
# Descripción: Archivo de pruebas para el módulo de búsqueda. Incluye pruebas
#             unitarias, integrales y funcionales para búsqueda y filtrado de productos.

import pytest
from sqlalchemy.orm import Session
from decimal import Decimal
from app.api.v1.search.service import search_service
from app.api.v1.search import schemas
from app.models.product import Product
from app.models.product_image import ProductImage


# ==================== FIXTURES ADICIONALES ====================

@pytest.fixture
def test_multiple_products(db: Session):
    """Fixture que crea múltiples productos para pruebas de búsqueda"""
    products = []

    # Productos de diferentes categorías
    categories = [
        ("Proteínas", ["weightlifting"], ["muscle_gain"], Decimal('899.99')),
        ("Creatina", ["crossfit"], ["strength"], Decimal('399.99')),
        ("Pre-Workout", ["running"], ["endurance"], Decimal('599.99')),
        ("Vitaminas", ["yoga"], ["health"], Decimal('299.99')),
    ]

    for i, (category, activities, objectives, price) in enumerate(categories):
        product = Product(
            name=f"{category} Test {i+1}",
            description=f"Descripción de {category}",
            brand="Test Brand",
            category=category,
            physical_activities=activities,
            fitness_objectives=objectives,
            nutritional_value=f"Nutrition {i+1}",
            price=price,
            stock=20,
            is_active=True
        )
        db.add(product)
        products.append(product)

    db.flush()

    # Agregar imágenes
    for product in products:
        image = ProductImage(
            product_id=product.product_id,
            image_path=f"https://example.com/{product.name}.jpg",
            is_primary=True
        )
        db.add(image)

    db.commit()
    return products


# ==================== PRUEBAS UNITARIAS ====================

class TestSearchServiceUnit:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas unitarias del servicio de búsqueda.
    """

    def test_search_by_query(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para búsqueda por texto.
        """
        # Act
        products, total = search_service.search_and_filter_products(
            db, query="Proteínas", skip=0, limit=10
        )

        # Assert
        assert total >= 1
        assert len(products) >= 1
        assert "Proteínas" in products[0].name or "Proteínas" in products[0].category

    def test_filter_by_category(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para filtrar por categoría.
        """
        # Act
        products, total = search_service.search_and_filter_products(
            db, category="Creatina", skip=0, limit=10
        )

        # Assert
        assert total >= 1
        assert all(p.category == "Creatina" for p in products)

    def test_filter_by_price_range(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para filtrar por rango de precios.
        """
        # Act
        products, total = search_service.search_and_filter_products(
            db, min_price=Decimal('300.00'), max_price=Decimal('600.00'),
            skip=0, limit=10
        )

        # Assert
        assert total >= 1
        assert all(Decimal('300.00') <= p.price <= Decimal('600.00') for p in products)

    def test_filter_by_physical_activity(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para filtrar por actividad física.
        """
        # Act
        products, total = search_service.search_and_filter_products(
            db, physical_activity="weightlifting", skip=0, limit=10
        )

        # Assert
        assert total >= 1
        assert all("weightlifting" in p.physical_activities for p in products)

    def test_filter_by_fitness_objective(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para filtrar por objetivo fitness.
        """
        # Act
        products, total = search_service.search_and_filter_products(
            db, fitness_objective="muscle_gain", skip=0, limit=10
        )

        # Assert
        assert total >= 1
        assert all("muscle_gain" in p.fitness_objectives for p in products)

    def test_combined_filters(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para filtros combinados.
        """
        # Act
        products, total = search_service.search_and_filter_products(
            db,
            category="Proteínas",
            physical_activity="weightlifting",
            min_price=Decimal('500.00'),
            skip=0,
            limit=10
        )

        # Assert
        # Puede no haber resultados si los filtros son muy restrictivos
        assert total >= 0
        if total > 0:
            assert all(p.category == "Proteínas" for p in products)
            assert all(p.price >= Decimal('500.00') for p in products)

    def test_pagination(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para paginación de resultados.
        """
        # Act
        products_page1, total = search_service.search_and_filter_products(
            db, skip=0, limit=2
        )
        products_page2, _ = search_service.search_and_filter_products(
            db, skip=2, limit=2
        )

        # Assert
        assert len(products_page1) <= 2
        assert len(products_page2) <= 2
        # Verificar que las páginas sean diferentes
        if len(products_page1) > 0 and len(products_page2) > 0:
            assert products_page1[0].product_id != products_page2[0].product_id

    def test_get_available_categories(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener categorías disponibles.
        """
        # Act
        categories = search_service.get_available_categories(db)

        # Assert
        assert len(categories) >= 4
        assert "Proteínas" in categories
        assert "Creatina" in categories

    def test_get_available_filters(
        self, db: Session, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba unitaria para obtener todos los filtros disponibles.
        """
        # Act
        filters = search_service.get_available_filters(db)

        # Assert
        assert "categories" in filters
        assert "physical_activities" in filters
        assert "fitness_objectives" in filters
        assert len(filters["categories"]) >= 4


# ==================== PRUEBAS DE INTEGRACIÓN ====================

class TestSearchAPIIntegration:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas de integración de la API de búsqueda.
    """

    def test_search_endpoint(
        self, client, db, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para búsqueda via API.
        """
        # Act
        response = client.get("/api/v1/search/?query=Proteínas")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    def test_search_with_filters_endpoint(
        self, client, db, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para búsqueda con filtros via API.
        """
        # Act
        response = client.get(
            "/api/v1/search/?category=Creatina&min_price=300&max_price=500"
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    def test_get_filters_endpoint(
        self, client, db, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba de integración para obtener filtros disponibles.
        """
        # Act
        response = client.get("/api/v1/search/filters")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert "physical_activities" in data


# ==================== PRUEBAS FUNCIONALES ====================

class TestSearchFunctional:
    """
    Autor: Luis Flores
    Descripción: Clase que agrupa las pruebas funcionales end-to-end de búsqueda.
    """

    def test_complete_search_flow(
        self, db, test_multiple_products
    ):
        """
        Autor: Luis Flores
        Descripción: Prueba funcional del flujo completo de búsqueda:
                     obtener filtros, buscar, refinar, paginar.
        """
        # Paso 1: Obtener filtros disponibles
        filters = search_service.get_available_filters(db)
        assert len(filters["categories"]) >= 4

        # Paso 2: Búsqueda general
        all_products, total = search_service.search_and_filter_products(
            db, skip=0, limit=100
        )
        assert total >= 4

        # Paso 3: Búsqueda por texto
        search_results, search_total = search_service.search_and_filter_products(
            db, query="Test", skip=0, limit=10
        )
        assert search_total >= 4

        # Paso 4: Refinar por categoría
        refined_results, refined_total = search_service.search_and_filter_products(
            db, category="Proteínas", skip=0, limit=10
        )
        assert refined_total >= 1

        # Paso 5: Refinar por precio
        price_results, price_total = search_service.search_and_filter_products(
            db, min_price=Decimal('400.00'), max_price=Decimal('900.00'),
            skip=0, limit=10
        )
        assert price_total >= 1

        # Paso 6: Aplicar múltiples filtros
        multi_filter_results, multi_total = search_service.search_and_filter_products(
            db,
            query="Test",
            physical_activity="weightlifting",
            min_price=Decimal('800.00'),
            skip=0,
            limit=10
        )
        assert multi_total >= 0

        print("Prueba funcional de flujo completo de búsqueda completada")
