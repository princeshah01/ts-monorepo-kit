// Serializer utilities for Redis values
export function serialize<T>(value: T): string {
  return JSON.stringify(value ?? null)
}

// Deserialize a Redis value, returning null if the value is not valid JSON or is null

export function deserialize<T>(raw: string): T | null {
  if (raw === null) {
    return null
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
