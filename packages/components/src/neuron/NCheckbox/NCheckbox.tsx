import { Checkbox } from '../../ui/checkbox'
import { cn } from '../../lib/utils'
import type { NCheckboxProps } from './NCheckbox.types'

function NCheckbox({
  label,
  checked,
  disabled = false,
  onCheckedChange,
  className,
}: NCheckboxProps) {
  const id = label ? `ncheckbox-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined

  return (
    <div
      data-neuron-component="NCheckbox"
      className={cn('flex items-center space-x-2', className)}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
    </div>
  )
}

export { NCheckbox }
