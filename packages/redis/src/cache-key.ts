import crypto from "node:crypto"

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

interface ResourceCacheKeyBuilderProps {
  namespace: string
  cacheKeyPrefix: string
}

export class ResourceCacheKeyBuilder {
  private readonly ns: string
  private readonly cacheKeyPrefix: string

  constructor(props: ResourceCacheKeyBuilderProps) {
    this.ns = props.namespace
    this.cacheKeyPrefix = props.cacheKeyPrefix
  }
  cacheKeyById(resource: string, id: string): string {
    return `${this.ns}:${this.cacheKeyPrefix}:${resource}:id:${id}`
  }

  cacheKeyForList(resource: string, query?: Record<string, unknown>): string {
    const qHash = hash(stableStringify(query ?? {}))
    return `${this.ns}:${this.cacheKeyPrefix}:${resource}:list:${qHash}`
  }
  invalidateById(
    resource: string,
    id: string
  ): { exact: string; listPattern: string } {
    return {
      exact: `${this.ns}:${this.cacheKeyPrefix}:${resource}:id:${id}`,
      listPattern: `${this.ns}:${this.cacheKeyPrefix}:${resource}:list:*`
    }
  }
  invalidateAll(resource?: string): string {
    const basePattern = `${this.ns}:${this.cacheKeyPrefix}:`
    if (resource) {
      return `${basePattern}${resource}:*`
    }
    return `${basePattern}*`
  }
}
