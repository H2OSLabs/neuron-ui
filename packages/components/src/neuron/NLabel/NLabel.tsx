import { Label } from '../../ui/label'
import { cn } from '../../lib/utils'
import type { NLabelProps } from './NLabel.types'

function NLabel({ label, htmlFor, required = false, className }: NLabelProps) {
  return (
    <Label
      htmlFor={htmlFor}
      data-neuron-component="NLabel"
      className={cn('text-gray-02', className)}
    >
      {label}
      {required && <span className="ml-1 text-error">*</span>}
    </Label>
  )
}

export { NLabel }
