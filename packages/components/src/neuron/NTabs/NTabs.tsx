import { forwardRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs'
import { cn } from '../../lib/utils'
import type { NTabsProps } from './NTabs.types'

const NTabs = forwardRef<HTMLDivElement, NTabsProps>(
  (
    {
      tabs,
      defaultValue,
      value,
      onValueChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const activeDefault = defaultValue || (tabs.length > 0 ? tabs[0].id : undefined)

    return (
      <Tabs
        ref={ref}
        defaultValue={activeDefault}
        value={value}
        onValueChange={onValueChange}
        data-neuron-component="NTabs"
        className={cn(className)}
        {...props}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    )
  },
)
NTabs.displayName = 'NTabs'

// Re-export TabsContent for use with NTabs
export { NTabs, TabsContent as NTabsContent }
