export type ModelProvider = "local-file" | "python-server" | "external-api" | "gpu-container" | "placeholder";

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: ModelProvider;
  status: "placeholder" | "available" | "disabled";
  version?: string;
}

export interface InferenceRequest {
  modelId?: string;
  input: string;
  parameters?: Record<string, string | number | boolean>;
}

export interface InferenceResponse {
  modelId: string;
  output: string;
  confidence: number;
  provider: ModelProvider;
  metadata: Record<string, string | number | boolean>;
}

export type ApiResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };
