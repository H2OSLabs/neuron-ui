// ============================================================
// TextInput — String property editor (single-line or multiline)
// ============================================================

export interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}

export function TextInput({ label, value, onChange, multiline = false }: TextInputProps) {
  const id = `prop-${label}`

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium"
        style={{ color: 'var(--gray-03)' }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus:ring-1"
          style={{
            borderColor: 'var(--gray-09)',
            background: 'var(--gray-14)',
            color: 'var(--gray-01)',
            resize: 'vertical',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--blue)'
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--blue)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--gray-09)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus:ring-1"
          style={{
            borderColor: 'var(--gray-09)',
            background: 'var(--gray-14)',
            color: 'var(--gray-01)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--blue)'
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--blue)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--gray-09)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      )}
    </div>
  )
}
