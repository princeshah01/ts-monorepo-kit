/*
 * Centralized JSON serializer / deserializer.
 * Every part of the Redis package passes through these two functions.
 * If you ever need to swap to msgpack or add a reviver, change it here once.
 *
 */
export function serialize<T>(value: T): string {
  return JSON.stringify(value ?? null)
}

export function deserialize<T>(raw: string): T | null {
  if (raw === null) {
    return null
  }
  return JSON.parse(raw) as T
}
