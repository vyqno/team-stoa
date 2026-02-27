"""
Chest X-Ray Pneumonia Detection Service
Deployed as a FastAPI service on HuggingFace Spaces (Docker SDK).
Uses HuggingFace Inference API for dima806/chest_xray_pneumonia_detection.
"""

import os
import base64
import io
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from huggingface_hub import InferenceClient

app = FastAPI(
    title="Chest X-Ray Pneumonia Detector",
    description="Detects pneumonia from chest X-ray images using a ViT-based model",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---

HF_TOKEN = os.environ.get("HF_TOKEN", "")
MODEL_ID = os.environ.get("MODEL_ID", "dima806/chest_xray_pneumonia_detection")

client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN,
)


# --- Models ---

class PredictRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded chest X-ray image (JPEG/PNG)")


class Prediction(BaseModel):
    label: str
    score: float


class PredictResponse(BaseModel):
    diagnosis: str = Field(..., description="Primary diagnosis (NORMAL or PNEUMONIA)")
    confidence: float = Field(..., description="Confidence score 0-1")
    predictions: list[Prediction] = Field(..., description="All class predictions")
    model: str = Field(..., description="Model used for inference")
    latency_ms: int = Field(..., description="Inference time in milliseconds")


# --- Routes ---

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "service": "chest-xray-pneumonia-detector",
    }


@app.post("/predict")
async def predict(req: PredictRequest) -> PredictResponse:
    if not HF_TOKEN:
        raise HTTPException(status_code=503, detail="HF_TOKEN not configured")

    # Decode base64 image
    try:
        # Handle data URI prefix if present (e.g., "data:image/png;base64,...")
        image_data = req.image
        if "," in image_data and image_data.startswith("data:"):
            image_data = image_data.split(",", 1)[1]

        image_bytes = base64.b64decode(image_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    # Call HuggingFace Inference API
    start = time.time()
    try:
        results = client.image_classification(
            io.BytesIO(image_bytes),
            model=MODEL_ID,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Model inference failed: {str(e)}")

    latency_ms = int((time.time() - start) * 1000)

    # Parse results — HF returns list of {label, score}
    predictions = [
        Prediction(label=r.label, score=round(r.score, 4))
        for r in results
    ]

    # Top prediction is the diagnosis
    top = predictions[0] if predictions else Prediction(label="UNKNOWN", score=0.0)

    return PredictResponse(
        diagnosis=top.label,
        confidence=round(top.score, 4),
        predictions=predictions,
        model=MODEL_ID,
        latency_ms=latency_ms,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
