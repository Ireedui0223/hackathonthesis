import type { ModelInfo } from "@thesis/shared";

const registeredModels: ModelInfo[] = [
  {
    id: "demo-orchestral-classifier",
    name: "Demo Orchestral Classifier",
    description: "Placeholder classifier for validating orchestration, request routing, and UI integration.",
    provider: "placeholder",
    status: "placeholder",
    version: "0.0.0",
  },
  {
    id: "future-score-analysis-model",
    name: "Future Score Analysis Model",
    description: "Reserved registry entry for a trained model that can analyze score or arrangement features.",
    provider: "python-server",
    status: "disabled",
  },
  {
    id: "future-gpu-inference-model",
    name: "Future GPU Inference Model",
    description: "Reserved entry for a dedicated GPU inference container.",
    provider: "gpu-container",
    status: "disabled",
  },
];

export function listModels(): ModelInfo[] {
  return registeredModels;
}

export function findModel(modelId?: string): ModelInfo {
  const selectedModel = modelId
    ? registeredModels.find((model) => model.id === modelId)
    : registeredModels.find((model) => model.status === "placeholder");

  if (!selectedModel) {
    throw new Error(`Model not found: ${modelId ?? "default"}`);
  }

  return selectedModel;
}
