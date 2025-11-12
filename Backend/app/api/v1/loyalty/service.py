from sqlalchemy.orm import Session
from typing import Dict
from datetime import date
from app.models.user import User
from app.models.user_loyalty import UserLoyalty
from app.models.loyalty_tier import LoyaltyTier
from app.models.point_history import PointHistory

class LoyaltyService:
    
    def get_user_loyalty_status(self, db: Session, cognito_sub: str) -> Dict:
        """
        Obtiene toda la informacion relacionada al programa de puntos del usuario
        """
        try:
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
            if not user or not user.account_status:
                return {"success": False, "error": "Usuario no encontrado o inactivo"}
            
            user_loyalty = db.query(UserLoyalty).filter(
                UserLoyalty.user_id == user.user_id
            ).first()
            
            # Si el usuario no tiene un record de puntos (usuarios nuevos) lo crea
            if not user_loyalty:
                tier_1 = db.query(LoyaltyTier).order_by(LoyaltyTier.tier_level).first()
                
                user_loyalty = UserLoyalty(
                    user_id=user.user_id,
                    tier_id=tier_1.tier_id,
                    total_points=0,
                    tier_achieved_date=date.today(),
                    last_points_update=date.today()
                )
                db.add(user_loyalty)
                db.commit()
                db.refresh(user_loyalty)
            
            current_tier = user_loyalty.loyalty_tier
            
            # Calculo de auxiliares
            points_to_next = None
            next_tier_level = None
            
            next_tier = db.query(LoyaltyTier).filter(
                LoyaltyTier.tier_level > current_tier.tier_level
            ).order_by(LoyaltyTier.tier_level).first()
            
            if next_tier:
                points_to_next = next_tier.min_points_required - user_loyalty.total_points
                next_tier_level = next_tier.tier_level
            
            # Descripcion de beneficios actuales - tambien aux
            current_benefits = {
                "monthly_coupons": current_tier.monthly_coupons_count,
                "coupon_discount": current_tier.coupon_discount_percentage,
            }
            
            # envio gratis de tiers
            if current_tier.free_shipping_threshold == 0:
                current_benefits["free_shipping"] = "Envío gratis en todas las compras"
            elif current_tier.free_shipping_threshold > 0:
                current_benefits["free_shipping"] = f"Envío gratis en compras mayores a ${current_tier.free_shipping_threshold}"
            else:
                current_benefits["free_shipping"] = "No incluido"
            
            return {
                "success": True,
                "loyalty": {
                    "loyalty_id": user_loyalty.loyalty_id,
                    "user_id": user_loyalty.user_id,
                    "total_points": user_loyalty.total_points,
                    "tier_level": current_tier.tier_level,
                    "tier_achieved_date": user_loyalty.tier_achieved_date,
                    "last_points_update": user_loyalty.last_points_update,
                    "points_to_next_tier": points_to_next,
                    "next_tier_level": next_tier_level,
                    "current_benefits": current_benefits
                }
            }
        except Exception as e:
            return {"success": False, "error": f"Error al obtener estado de lealtad: {str(e)}"}
    
    def get_all_tiers(self, db: Session) -> Dict:
        """
        Obtiene informacion de todos los tiers
        """
        try:
            tiers = db.query(LoyaltyTier).order_by(LoyaltyTier.tier_level).all()
            
            return {
                "success": True,
                "tiers": tiers
            }
        except Exception as e:
            return {"success": False, "error": f"Error al obtener niveles de lealtad: {str(e)}"}
    
    def get_tier_by_id(self, db: Session, tier_id: int) -> Dict:
        """
        Obtiene informacion de un tier especifico
        """
        try:
            tier = db.query(LoyaltyTier).filter(LoyaltyTier.tier_id == tier_id).first()
            
            if not tier:
                return {"success": False, "error": "Nivel no encontrado"}
            
            return {
                "success": True,
                "tier": tier
            }
        except Exception as e:
            return {"success": False, "error": f"Error al obtener nivel: {str(e)}"}
    
    def get_point_history(self, db: Session, cognito_sub: str, limit: int = 50) -> Dict:
        """
        Obtiene historial de puntos de un usuario
        """
        try:
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
            if not user or not user.account_status:
                return {"success": False, "error": "Usuario no encontrado o inactivo"}
            
            user_loyalty = db.query(UserLoyalty).filter(
                UserLoyalty.user_id == user.user_id
            ).first()
            
            if not user_loyalty:
                return {"success": False, "error": "Información de programa de puntos no encontrada"}
            
            history = db.query(PointHistory).filter(
                PointHistory.loyalty_id == user_loyalty.loyalty_id
            ).order_by(PointHistory.event_date.desc()).limit(limit).all()
            
            return {
                "success": True,
                "history": history,
                "total": len(history)
            }
        except Exception as e:
            return {"success": False, "error": f"Error al obtener historial: {str(e)}"}

loyalty_service = LoyaltyService()