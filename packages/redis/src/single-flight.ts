export class SingleFlight {
  private readonly flights = new Map<string, Promise<unknown>>()

  async do<T>(key: string, fn: () => Promise<T | null>): Promise<T | null> {
    const existing = this.flights.get(key)
    if (existing) {
      return existing as Promise<T | null>
    }

    const promise = fn().finally(() => {
      this.flights.delete(key)
    })

    this.flights.set(key, promise)
    return promise
  }

  get size(): number {
    return this.flights.size
  }
}
