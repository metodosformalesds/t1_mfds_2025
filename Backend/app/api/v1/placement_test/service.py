import pandas as pd
import joblib
from pathlib import Path

# Cargar modelo y encoders al iniciar el servicio
BASE_DIR = Path(__file__).resolve().parent
model_path = BASE_DIR / "model_assets" / "befit_model_v4.pkl"
encoders_path = BASE_DIR / "model_assets" / "label_encoders_v4.pkl"
target_enc_path = BASE_DIR / "model_assets" / "target_encoder_v4.pkl"

model = joblib.load(model_path)
encoders = joblib.load(encoders_path)
target_encoder = joblib.load(target_enc_path)

def predict_plan(input_data: dict) -> dict:
    """Recibe un diccionario con las respuestas del test y devuelve la recomendación."""
    df = pd.DataFrame([input_data])

    # Aplicar los encoders a cada columna categórica
    for col, encoder in encoders.items():
        if col in df.columns:
            df[col] = encoder.transform(df[col])

    # Hacer predicción
    pred = model.predict(df)[0]
    plan = target_encoder.inverse_transform([pred])[0]

    # Diccionario de descripción y productos sugeridos 
    plan_details = {
        "BeStrong": {
            "description": "Plan enfocado en el aumento de masa muscular y fuerza.",
            "recommended_products": ["Proteína aislada", "Creatina", "Pre-entreno"]
        },
        "BeLean": {
            "description": "Plan centrado en la pérdida de grasa y tonificación.",
            "recommended_products": ["Proteína ligera", "Termogénicos", "Omega 3"]
        },
        "BeBalance": {
            "description": "Plan equilibrado para mantener un estado físico estable.",
            "recommended_products": ["Multivitamínico", "Colágeno", "Proteína media"]
        },
        "BeDefine": {
            "description": "Plan de definición muscular con enfoque en detalle y tono.",
            "recommended_products": ["L-Carnitina", "BCAA", "Proteína ligera"]
        },
        "BeNutri": {
            "description": "Plan basado en nutrición integral y balance alimenticio.",
            "recommended_products": ["Batidos meal replacement", "Fibra", "Omega 3"]
        },
    }

    details = plan_details.get(plan, {"description": "", "recommended_products": []})
    return {"recommended_plan": plan, **details}
