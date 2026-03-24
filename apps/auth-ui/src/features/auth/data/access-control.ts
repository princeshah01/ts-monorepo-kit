const CLIENT_ACCESS: Record<string, boolean> = {
  "demo-sso-client": true,
  "google-style-sso": true,
  "admin-portal-sso": true,
  "restricted-client": false
}

export function getClientAccess(clientId: string | null): {
  isValidClientId: boolean
  hasAccess: boolean
} {
  if (!clientId) {
    return {
      isValidClientId: false,
      hasAccess: false
    }
  }

  const hasAccess = CLIENT_ACCESS[clientId]

  return {
    isValidClientId: typeof hasAccess === "boolean",
    hasAccess: hasAccess === true
  }
}
