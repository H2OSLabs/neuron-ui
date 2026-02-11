// ============================================================
// DataSourceLayer: Converts Page Schema dataSources → API calls → DataProvider
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { PageSchema, DataProvider, ActionHandlers } from '../types'
import { DataContextProvider } from '../renderer/DataContext'
import { ActionProvider } from '../renderer/ActionContext'
import { parseApi } from './createDataProvider'

interface DataSourceLayerProps {
  /** Page Schema */
  schema: PageSchema
  /** Data provider for API calls */
  dataProvider: DataProvider
  /** Action handler overrides */
  actionOverrides?: Partial<ActionHandlers>
  /** Children */
  children: React.ReactNode
}

export function DataSourceLayer({
  schema,
  dataProvider,
  actionOverrides,
  children,
}: DataSourceLayerProps) {
  const [dataModel, setDataModel] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  // Dialog/sheet open state management
  const [overlayState, setOverlayState] = useState<Record<string, boolean>>({})

  // Initialize: fetch all autoFetch dataSources
  useEffect(() => {
    if (!schema.dataSources) {
      setLoading(false)
      return
    }

    const init = async () => {
      const model: Record<string, unknown> = {}
      const entries = Object.entries(schema.dataSources ?? {})

      await Promise.allSettled(
        entries.map(async ([key, ds]) => {
          if (ds.autoFetch === false) return
          const { method, path } = parseApi(ds.api)
          try {
            const data = await dataProvider.fetch({ method, path }, ds.params)
            model[`dataSources/${key}`] = { data, params: ds.params }
          } catch (err) {
            console.warn(`[neuron-ui] Failed to fetch dataSource "${key}":`, err)
            model[`dataSources/${key}`] = { data: null, params: ds.params, error: String(err) }
          }
        }),
      )

      setDataModel(model)
      setLoading(false)
    }

    init()
  }, [schema.dataSources, dataProvider])

  // Refresh a data source
  const refreshDataSource = useCallback(
    async (dataSourceKey: string) => {
      const ds = schema.dataSources?.[dataSourceKey]
      if (!ds) return
      const { method, path } = parseApi(ds.api)
      const data = await dataProvider.fetch({ method, path }, ds.params)
      setDataModel(prev => ({
        ...prev,
        [`dataSources/${dataSourceKey}`]: { data, params: ds.params },
      }))
    },
    [schema.dataSources, dataProvider],
  )

  // Build action handlers
  const handlers = useMemo<ActionHandlers>(
    () => ({
      openDialog: (params) => {
        setOverlayState(prev => ({ ...prev, [params.target as string]: true }))
      },
      closeDialog: (params) => {
        setOverlayState(prev => ({ ...prev, [params.target as string]: false }))
      },
      openSheet: (params) => {
        setOverlayState(prev => ({ ...prev, [params.target as string]: true }))
      },
      closeSheet: (params) => {
        setOverlayState(prev => ({ ...prev, [params.target as string]: false }))
      },
      submitForm: async (params) => {
        const { method, path } = parseApi(params.api as string)
        await dataProvider.mutate({ method, path }, params.body)
      },
      deleteItem: async (params) => {
        const api = (params.api as string).replace('{id}', params.id as string)
        const { method, path } = parseApi(api)
        await dataProvider.mutate({ method, path })
      },
      refresh: async (params) => {
        await refreshDataSource(params.dataSource as string)
      },
      navigate: (params) => {
        if (actionOverrides?.navigate) {
          actionOverrides.navigate(params)
        } else {
          window.location.href = params.target as string
        }
      },
      toast: (params) => {
        if (actionOverrides?.toast) {
          actionOverrides.toast(params)
        } else {
          console.log(`[neuron-ui toast] ${params.variant}: ${params.message}`)
        }
      },
      ...actionOverrides,
    }),
    [dataProvider, refreshDataSource, actionOverrides],
  )

  // Merge overlay state into data model so components can access it
  const mergedData = useMemo(
    () => ({ ...dataModel, __overlayState: overlayState }),
    [dataModel, overlayState],
  )

  if (loading) return null

  return (
    <DataContextProvider initialData={mergedData}>
      <ActionProvider handlers={handlers}>{children}</ActionProvider>
    </DataContextProvider>
  )
}
