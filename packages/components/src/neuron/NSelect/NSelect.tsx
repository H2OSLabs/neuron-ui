import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import { cn } from '../../lib/utils'
import type { NSelectProps } from './NSelect.types'

function NSelect({
  options,
  placeholder = 'Select...',
  value,
  onValueChange,
  className,
}: NSelectProps) {
  return (
    <div data-neuron-component="NSelect" className={cn(className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { NSelect }
