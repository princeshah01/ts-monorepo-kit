import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { getClientAccess } from "../data/access-control"

export function useAuthAccess() {
  const [searchParams] = useSearchParams()

  const clientId = searchParams.get("clientId")

  const accessResult = useMemo(() => getClientAccess(clientId), [clientId])

  return {
    clientId,
    queryString: searchParams.toString(),
    ...accessResult
  }
}
