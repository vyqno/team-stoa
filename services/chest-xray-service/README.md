---
title: Chest X-Ray Pneumonia Detector
emoji: 🫁
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
short_description: Pneumonia detection from chest X-ray images via HuggingFace
---

# Chest X-Ray Pneumonia Detector

FastAPI service that detects pneumonia from chest X-ray images using the [dima806/chest_xray_pneumonia_detection](https://huggingface.co/dima806/chest_xray_pneumonia_detection) model.

## API

### `POST /predict`

```json
{
  "image": "<base64-encoded chest X-ray image>"
}
```

**Response:**

```json
{
  "diagnosis": "PNEUMONIA",
  "confidence": 0.9523,
  "predictions": [
    { "label": "PNEUMONIA", "score": 0.9523 },
    { "label": "NORMAL", "score": 0.0477 }
  ],
  "model": "dima806/chest_xray_pneumonia_detection",
  "latency_ms": 342
}
```

### `GET /health`

Returns service health status.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_TOKEN` | Yes | HuggingFace API token |
| `MODEL_ID` | No | Model ID (default: `dima806/chest_xray_pneumonia_detection`) |

## Part of [Stoa](https://github.com/stoa-ai) — Decentralized AI Service Marketplace
