import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { DataContextValue } from '../types'

const DataContext = createContext<DataContextValue | null>(null)

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataContext must be used within DataProvider')
  return ctx
}

// Get value at a dot-separated or slash-separated path
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.replace(/^\//, '').split(/[./]/)
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

// Set value at a path (immutable)
function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = path.replace(/^\//, '').split(/[./]/)
  const result = { ...obj }
  let current: Record<string, unknown> = result
  for (let i = 0; i < parts.length - 1; i++) {
    const next = current[parts[i]]
    current[parts[i]] =
      typeof next === 'object' && next !== null
        ? { ...(next as Record<string, unknown>) }
        : {}
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
  return result
}

export function DataContextProvider({
  initialData,
  children,
}: {
  initialData: Record<string, unknown>
  children: React.ReactNode
}) {
  const [data, setDataState] = useState(initialData)

  const setData = useCallback((path: string, value: unknown) => {
    setDataState((prev) => setByPath(prev, path, value))
  }, [])

  const getData = useCallback(
    (path: string) => {
      return getByPath(data, path)
    },
    [data],
  )

  const value = useMemo(
    () => ({ data, setData, getData }),
    [data, setData, getData],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export { DataContext }
