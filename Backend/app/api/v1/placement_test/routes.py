from fastapi import APIRouter, HTTPException
from .schemas import PlacementTestInput, PlacementTestOutput
from .service import predict_plan

router = APIRouter(prefix="/placement-test", tags=["Placement Test"])

@router.post("/", response_model=PlacementTestOutput)
def placement_test_endpoint(data: PlacementTestInput):
    try:
        result = predict_plan(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
