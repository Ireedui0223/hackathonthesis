import type { InferenceRequest, InferenceResponse } from "@thesis/shared";
import { runDemoInference } from "./inferenceService";
import { findModel } from "./modelRegistry";

export async function runDemoPipeline(request: InferenceRequest): Promise<InferenceResponse> {
  const model = findModel(request.modelId);

  if (model.status === "disabled") {
    throw new Error(`Model is registered but disabled: ${model.id}`);
  }

  // Future orchestration steps belong here: preprocessing, model selection, inference, postprocessing, audit logging.
  return runDemoInference(model, request);
}
