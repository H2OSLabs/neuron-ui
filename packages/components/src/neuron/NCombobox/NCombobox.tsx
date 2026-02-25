import { useState } from 'react'
import { Command } from 'cmdk'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { NComboboxProps } from './NCombobox.types'

function NCombobox({
  options,
  placeholder = 'Select...',
  value,
  searchable = true,
  onValueChange,
  className,
}: NComboboxProps) {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(value ?? '')
  const [search, setSearch] = useState('')

  const currentValue = value !== undefined ? value : internalValue

  const selectedLabel = options.find((opt) => opt.value === currentValue)?.label

  const handleSelect = (optionValue: string) => {
    const newValue = optionValue === currentValue ? '' : optionValue
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
    setSearch('')
  }

  return (
    <div data-neuron-component="NCombobox" className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setOpen(!open)}
      >
        <span className={cn(!selectedLabel && 'text-muted-foreground')}>
          {selectedLabel || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <Command shouldFilter={searchable}>
            {searchable && (
              <div className="flex items-center border-b px-3">
                <Command.Input
                  placeholder="Search..."
                  value={search}
                  onValueChange={setSearch}
                  className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}
            <Command.List className="max-h-60 overflow-auto p-1">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {currentValue === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                  {option.label}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  )
}

export { NCombobox }
