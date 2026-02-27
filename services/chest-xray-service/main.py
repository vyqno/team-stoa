"""
Chest X-Ray Pneumonia Detection Service
Deployed as a FastAPI service on HuggingFace Spaces (Docker SDK).
Runs the model locally using transformers pipeline.
"""

import os
import base64
import time
import torch
from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image

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

MODEL_ID = os.environ.get("MODEL_ID", "dima806/chest_xray_pneumonia_detection")

# Load model at startup (downloads weights on first run, cached after)
print(f"Loading model: {MODEL_ID}...")
processor = AutoImageProcessor.from_pretrained(MODEL_ID)
model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
print("Model loaded!")


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
    # Decode base64 image
    try:
        image_data = req.image
        if "," in image_data and image_data.startswith("data:"):
            image_data = image_data.split(",", 1)[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    # Run inference locally
    start = time.time()
    try:
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=-1)[0]
        
        probs_lst = probs.tolist()
        results = []
        for i, p in enumerate(probs_lst):
            results.append({"label": model.config.id2label[i], "score": p})
        results.sort(key=lambda x: x["score"], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Model inference failed: {str(e)}")

    latency_ms = int((time.time() - start) * 1000)

    # Parse results — pipeline returns list of {label, score}
    predictions = [
        Prediction(label=r["label"], score=round(r["score"], 4))
        for r in results
    ]

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
