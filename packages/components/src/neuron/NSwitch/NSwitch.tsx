import { Switch } from '../../ui/switch'
import { cn } from '../../lib/utils'
import type { NSwitchProps } from './NSwitch.types'

function NSwitch({
  label,
  checked,
  disabled = false,
  onCheckedChange,
  className,
}: NSwitchProps) {
  const id = label ? `nswitch-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined

  return (
    <div
      data-neuron-component="NSwitch"
      className={cn('flex items-center space-x-2', className)}
    >
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="h-[18px] w-[40px] [&>span]:h-[14px] [&>span]:w-[14px] [&>span]:data-[state=checked]:translate-x-[22px]"
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

export { NSwitch }
