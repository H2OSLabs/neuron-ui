// ============================================================
// SwitchEditor — Boolean toggle property editor
// ============================================================

export interface SwitchEditorProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export function SwitchEditor({ label, value, onChange }: SwitchEditorProps) {
  const id = `prop-${label}`

  return (
    <div className="flex items-center justify-between gap-2">
      <label
        htmlFor={id}
        className="text-xs font-medium"
        style={{ color: 'var(--gray-03)' }}
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
        style={{
          background: value ? 'var(--blue)' : 'var(--gray-08)',
        }}
      >
        <span
          className="pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform"
          style={{
            background: 'var(--gray-14)',
            transform: value ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}
