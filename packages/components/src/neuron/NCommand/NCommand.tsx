import { forwardRef } from 'react'
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from 'cmdk'
import { cn } from '../../lib/utils'
import type { NCommandProps } from './NCommand.types'

const NCommand = forwardRef<HTMLDivElement, NCommandProps>(
  (
    {
      placeholder = 'Type a command or search...',
      items = [],
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Command
        ref={ref}
        data-neuron-component="NCommand"
        className={cn(
          'flex h-full w-full flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground',
          className,
        )}
        {...props}
      >
        <CommandInput
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </CommandEmpty>
          {items.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    )
  },
)
NCommand.displayName = 'NCommand'

export { NCommand }
