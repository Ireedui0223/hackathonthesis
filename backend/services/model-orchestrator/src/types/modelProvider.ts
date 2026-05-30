import type { InferenceRequest, InferenceResponse, ModelInfo } from "@thesis/shared";

export interface ModelProviderAdapter {
  readonly provider: ModelInfo["provider"];
  canHandle(model: ModelInfo): boolean;
  runInference(model: ModelInfo, request: InferenceRequest): Promise<InferenceResponse>;
}
