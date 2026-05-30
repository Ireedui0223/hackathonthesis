import type { ApiResponse, InferenceRequest, InferenceResponse, ModelInfo } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      return {
        ok: false,
        error: payload.ok === false ? payload.error : `Request failed with status ${response.status}`,
      };
    }

    return payload;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown API client error",
    };
  }
}

export function getModels() {
  return request<ModelInfo[]>("/api/models");
}

export function runDemoInference(input: InferenceRequest) {
  return request<InferenceResponse>("/api/inference/demo", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
