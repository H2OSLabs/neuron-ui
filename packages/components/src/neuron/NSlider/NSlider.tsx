import { Slider } from '../../ui/slider'
import { cn } from '../../lib/utils'
import type { NSliderProps } from './NSlider.types'

function NSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
  className,
}: NSliderProps) {
  return (
    <div data-neuron-component="NSlider" className={cn('w-full', className)}>
      <Slider
        value={value !== undefined ? [value] : undefined}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    </div>
  )
}

export { NSlider }
