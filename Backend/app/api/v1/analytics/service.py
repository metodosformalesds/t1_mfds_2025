from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Any, Optional
from datetime import datetime, timedelta
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User
from app.models.review import Review
from app.api.v1.analytics.schemas import AdminDashboardStats, SalesStats, ProductStats, ProductReportItem, UserStats, SalesReport, SalesReportItem

"""Servicio para estadísticas del administrador"""
class AdminStatsService:
    """
    Obtiene todas las estadísticas para el dashboard del admin
    """
    @staticmethod
    def get_dashboard_stats(db: Session) -> AdminDashboardStats:
        sales_stats = AdminStatsService._get_sales_stats(db)
        
        user_stats = AdminStatsService._get_user_stats(db)
        
        total_products = db.query(Product).filter(Product.is_active == True).count()
        low_stock_products = db.query(Product).filter(
            and_(Product.is_active == True, Product.stock < 10)
        ).count()
        
        pending_reviews = db.query(Review).count()
        
        return AdminDashboardStats(
            sales=sales_stats,
            users=user_stats,
            total_products=total_products,
            low_stock_products=low_stock_products,
            pending_reviews=pending_reviews
        )
    
    """Obtiene estadísticas de ventas"""
    @staticmethod
    def _get_sales_stats(db: Session) -> SalesStats:
        total_sales_query = db.query(
            func.sum(Order.total_amount).label('total'),
            func.count(Order.order_id).label('count')
        ).filter(Order.status == 'completed')
        
        result = total_sales_query.first()
        total_sales = float(result.total) if result.total else 0.0
        total_orders = result.count if result.count else 0
        
        total_products_sold = db.query(
            func.sum(OrderItem.quantity)
        ).join(Order).filter(
            #Order.status == 'completed'
            Order.status == "pending"
        ).scalar() or 0
        
        average_order_value = total_sales / total_orders if total_orders > 0 else 0.0
        
        top_products_query = db.query(
            Product.product_id,
            Product.name,
            func.sum(OrderItem.quantity).label('total_sold'),
            func.sum(OrderItem.subtotal).label('total_revenue'),
            Product.average_rating,
            func.count(Review.review_id).label('total_reviews')
        ).join(
            OrderItem, Product.product_id == OrderItem.product_id
        ).join(
            Order, OrderItem.order_id == Order.order_id
        ).outerjoin(
            Review, Product.product_id == Review.product_id
        ).filter(
            Order.status == 'completed'
        ).group_by(
            Product.product_id
        ).order_by(
            func.sum(OrderItem.quantity).desc()
        ).limit(10)
        
        top_products = []
        for row in top_products_query.all():
            top_products.append(ProductStats(
                product_id=row.product_id,
                name=row.name,
                total_sold=row.total_sold or 0,
                total_revenue=float(row.total_revenue or 0),
                average_rating=float(row.average_rating or 0),
                total_reviews=row.total_reviews or 0
            ))
        
        return SalesStats(
            total_sales=round(total_sales, 2),
            total_orders=total_orders,
            total_products_sold=total_products_sold,
            average_order_value=round(average_order_value, 2),
            top_selling_products=top_products
        )
    """Obtiene estadísticas de usuarios"""
    @staticmethod
    def _get_user_stats(db: Session) -> UserStats:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.account_status == True).count()
        
        # Usuarios nuevos este mes
        start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = db.query(User).filter(
            User.created_at >= start_of_month
        ).count()
        
        # Usuarios con al menos una orden
        users_with_orders = db.query(func.count(func.distinct(Order.user_id))).scalar() or 0
        
        return UserStats(
            total_users=total_users,
            active_users=active_users,
            new_users_this_month=new_users_this_month,
            users_with_orders=users_with_orders
        )
    
    """
    Genera un reporte de ventas para un período específico
    """
    @staticmethod
    def generate_sales_report(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> SalesReport:
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
        
        # Ventas por día
        daily_sales = db.query(
            func.date(Order.created_at).label('date'),
            func.sum(Order.total_amount).label('total_sales'),
            func.count(Order.order_id).label('total_orders')
        ).filter(
            and_(
                Order.status == 'completed',
                Order.created_at >= start_date,
                Order.created_at <= end_date
            )
        ).group_by(
            func.date(Order.created_at)
        ).order_by(
            func.date(Order.created_at)
        ).all()
        
        details = []
        total_sales = 0.0
        total_orders = 0
        
        for row in daily_sales:
            sales = float(row.total_sales or 0)
            orders = row.total_orders or 0
            avg_order = sales / orders if orders > 0 else 0.0
            
            details.append(SalesReportItem(
                date=row.date,
                total_sales=round(sales, 2),
                total_orders=orders,
                average_order_value=round(avg_order, 2)
            ))
            
            total_sales += sales
            total_orders += orders
        
        summary = {
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "total_sales": round(total_sales, 2),
            "total_orders": total_orders,
            "average_order_value": round(total_sales / total_orders if total_orders > 0 else 0, 2),
            "days_in_period": len(details)
        }
        
        return SalesReport(
            report_type="sales",
            start_date=start_date,
            end_date=end_date,
            summary=summary,
            details=details
        )
    
    @staticmethod
    def get_product_report(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[ProductReportItem]:
        """
        Genera un reporte de productos con ventas y métricas
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
        
        query = db.query(
            Product.product_id,
            Product.name,
            Product.category.label('category_name'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_sold'),
            func.coalesce(func.sum(OrderItem.subtotal), 0).label('revenue'),
            Product.stock,
            Product.average_rating
        ).outerjoin(
            OrderItem, Product.product_id == OrderItem.product_id
        ).outerjoin(
            Order, and_(
                OrderItem.order_id == Order.order_id,
                Order.created_at >= start_date,
                Order.created_at <= end_date,
                Order.status == 'completed'
            )
        ).group_by(
            Product.product_id,
            Product.category
        ).order_by(
            func.sum(OrderItem.quantity).desc()
        )
        
        report = []
        for row in query.all():
            report.append(ProductReportItem(
                product_id=row.product_id,
                name=row.name,
                category=row.category_name or "Sin categoría",
                total_sold=row.total_sold,
                revenue=float(row.revenue),
                current_stock=row.stock,
                average_rating=float(row.average_rating or 0)
            ))
        
        return report
    
    """
    Obtiene productos con stock bajo
     """
    @staticmethod
    def get_low_stock_products(db: Session, threshold: int = 10) -> List[Product]:
        return db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.stock < threshold
            )
        ).order_by(Product.stock.asc()).all()