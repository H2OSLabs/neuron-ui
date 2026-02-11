import { NLabel } from '../NLabel'
import { cn } from '../../lib/utils'
import type { NFieldProps } from './NField.types'

function NField({
  label,
  required = false,
  error,
  children,
  className,
}: NFieldProps) {
  return (
    <div
      data-neuron-component="NField"
      className={cn('flex flex-col gap-1.5', className)}
    >
      <NLabel label={label} required={required} />
      {children}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  )
}

export { NField }
