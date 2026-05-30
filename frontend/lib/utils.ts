export function formatScore(value?: number) {
  return typeof value === "number" ? value.toFixed(1) : "0.0";
}
