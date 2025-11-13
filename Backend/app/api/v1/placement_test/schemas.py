from pydantic import BaseModel

class PlacementTestInput(BaseModel):
    age: int
    gender: str
    exercise_freq: int
    activity_type: str
    activity_intensity: str
    diet_type: str
    diet_special: str
    supplements: str
    goal_declared: str
    sleep_hours: int

class PlacementTestOutput(BaseModel):
    recommended_plan: str
    description: str
    recommended_products: list[str]
