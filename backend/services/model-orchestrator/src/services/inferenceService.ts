import type { InferenceRequest, InferenceResponse, ModelInfo } from "@thesis/shared";

export async function runDemoInference(model: ModelInfo, request: InferenceRequest): Promise<InferenceResponse> {
  const normalizedInput = request.input.trim();

  return {
    modelId: model.id,
    output: `Demo inference accepted ${normalizedInput.length} characters for future ${model.provider} routing.`,
    confidence: 0.72,
    provider: model.provider,
    metadata: {
      mode: "placeholder",
      inputLength: normalizedInput.length,
      routedAt: new Date().toISOString(),
    },
  };
}
