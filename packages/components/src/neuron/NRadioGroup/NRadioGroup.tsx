import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'
import { cn } from '../../lib/utils'
import type { NRadioGroupProps } from './NRadioGroup.types'

function NRadioGroup({
  options,
  value,
  onValueChange,
  className,
}: NRadioGroupProps) {
  return (
    <RadioGroup
      data-neuron-component="NRadioGroup"
      value={value}
      onValueChange={onValueChange}
      className={cn(className)}
    >
      {options.map((option) => {
        const id = `nradio-${option.value}`
        return (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={id}
              disabled={option.disabled}
            />
            <label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </label>
          </div>
        )
      })}
    </RadioGroup>
  )
}

export { NRadioGroup }
