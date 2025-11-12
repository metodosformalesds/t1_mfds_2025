from app.core.database import get_db
from app.api.v1.shipping.schemas import Order, CreateOrder, OrderTrackingResponse
from app.api.v1.shipping.service import ShippingService
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, status, Depends

router = APIRouter(prefix="/shipping", tags=["Shipping"])

"""
Esta funcion crea un pedido con sus items
"""
@router.post("/crear-pedido/", response_model=Order, status_code=status.HTTP_201_CREATED)
def crear_pedido(pedido_in: CreateOrder, db: Session = Depends(get_db)):
    
    try:
        nuevo_pedido = ShippingService.create_order_db(db=db, order_in=pedido_in)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    return nuevo_pedido


"""
Esta funcion consulta el estado del envio, tracking, y lista de productos    
"""
@router.get("/rastrear-pedido/{pedido_id}", response_model=OrderTrackingResponse)
def rastrear_pedido( pedido_id: int, db: Session = Depends(get_db)):
    tracking_details = ShippingService.get_details(db=db, pedido_id=pedido_id)
    
    if not tracking_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Pedido no encontrado"
        )
        
    return tracking_details