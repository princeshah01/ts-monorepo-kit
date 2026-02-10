import crypto from "crypto"

function stableStringify(obj: Record<string, unknown>): string {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = obj[key]
          return acc
        },
        {} as Record<string, unknown>
      )
  )
}

function hash(input: string): string {
  // SHA-256 preferred, SHA-1 acceptable for cache keys
  return crypto.createHash("sha256").update(input).digest("hex")
}

type ResourceCacheInit = {
  resource: string
  redis: {
    cacheKey: (...parts: string[]) => string
  }
  ttl: {
    byId: number
    list: number
  }
}

type InvalidateByIdResult = {
  exact: string
  listPattern: string
}

export class ResourceCacheKeyBuilder {
  private resource: string
  private redis: ResourceCacheInit["redis"]
  private ttl: ResourceCacheInit["ttl"]

  constructor(init: ResourceCacheInit) {
    this.resource = init.resource
    this.redis = init.redis
    this.ttl = init.ttl
  }

  cacheKeyById(id: string): string {
    return this.redis.cacheKey(this.resource, "id", id)
  }

  cacheKeyForList(query?: Record<string, unknown>): string {
    const qHash = hash(stableStringify(query ?? {}))
    return this.redis.cacheKey(this.resource, "list", qHash)
  }

  invalidateById(id: string): InvalidateByIdResult {
    return {
      exact: this.redis.cacheKey(this.resource, "id", id),
      listPattern: this.redis.cacheKey(this.resource, "list", "*")
    }
  }

  invalidateAll(): string {
    return this.redis.cacheKey(this.resource, "*")
  }

  ttlById(): number {
    return this.ttl.byId
  }

  ttlForList(): number {
    return this.ttl.list
  }
}
