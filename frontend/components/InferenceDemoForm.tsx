"use client";

import { FormEvent, useState } from "react";
import { runDemoInference } from "@/lib/apiClient";
import type { InferenceResponse } from "@/types/api";

type DemoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: InferenceResponse }
  | { status: "error"; error: string };

export function InferenceDemoForm() {
  const [input, setInput] = useState("Summarize the orchestral texture of this sample passage.");
  const [state, setState] = useState<DemoState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });

    const response = await runDemoInference({
      input,
    });

    if (!response.ok) {
      setState({
        status: "error",
        error: response.error,
      });
      return;
    }

    setState({
      status: "success",
      result: response.data,
    });
  }

  return (
    <form className="panel demo-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Demo input</span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={6}
          required
          minLength={3}
        />
      </label>
      <button className="button primary" disabled={state.status === "loading"} type="submit">
        {state.status === "loading" ? "Running..." : "Run demo inference"}
      </button>

      {state.status === "idle" ? (
        <p className="helper-text">The response is mocked by the model orchestrator for now.</p>
      ) : null}

      {state.status === "error" ? (
        <div className="result-panel" role="alert">
          <h2>Inference failed</h2>
          <p className="error-text">{state.error}</p>
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="result-panel">
          <h2>Mock inference result</h2>
          <p>{state.result.output}</p>
          <div className="meta">
            <span className="tag">model: {state.result.modelId}</span>
            <span className="tag">provider: {state.result.provider}</span>
            <span className="tag">confidence: {Math.round(state.result.confidence * 100)}%</span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
