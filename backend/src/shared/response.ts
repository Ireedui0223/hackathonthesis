export function ok<T>(data: T, message = "OK") {
  return { success: true, data, message };
}

export function created<T>(data: T, message = "Created") {
  return { success: true, data, message };
}
