# Model Orchestrator

Responsible for model registry, model selection, inference request routing, and future trained model integration.

## Routes

- `GET /health`
- `GET /models`
- `POST /inference/demo`

## Future Providers

The placeholder interfaces are designed to support:

- local model files
- Python model servers
- external model APIs
- GPU inference containers

No real trained model files are included in this scaffold.
