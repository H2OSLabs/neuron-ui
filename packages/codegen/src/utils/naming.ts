// ============================================================
// Naming Utilities — Consistent name transforms for codegen
// ============================================================

/**
 * Convert a string to PascalCase.
 * Examples:
 *   "user list" → "UserList"
 *   "competition-list" → "CompetitionList"
 *   "my_page" → "MyPage"
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_match, char: string | undefined) =>
      char ? char.toUpperCase() : '',
    )
    .replace(/^(.)/, (_match, char: string) => char.toUpperCase())
}

/**
 * Convert a string to camelCase.
 * Examples:
 *   "user list" → "userList"
 *   "competition-list" → "competitionList"
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Derive the page component name from the Page Schema page.name.
 * Always appends "Page" suffix.
 * Example: "User List" → "UserListPage"
 */
export function toPageComponentName(pageName: string): string {
  const pascal = toPascalCase(pageName)
  return pascal.endsWith('Page') ? pascal : `${pascal}Page`
}

/**
 * Derive a hook function name from a dataSource key.
 * Example: "userList" → "useUserList", "createUser" → "useCreateUser"
 */
export function toHookName(dataSourceKey: string): string {
  const pascal = toPascalCase(dataSourceKey)
  return `use${pascal}`
}

/**
 * Extract HTTP method and path from an API string.
 * Example: "GET /api/users" → { method: "GET", path: "/api/users" }
 * Example: "/api/users" → { method: "GET", path: "/api/users" }
 */
export function parseApiString(api: string): { method: string; path: string } {
  const parts = api.trim().split(/\s+/)
  if (parts.length >= 2) {
    return { method: parts[0].toUpperCase(), path: parts.slice(1).join(' ') }
  }
  return { method: 'GET', path: parts[0] }
}
