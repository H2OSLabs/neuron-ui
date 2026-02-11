// ============================================================
// SelectEditor — Dropdown select for enum properties
// ============================================================

export interface SelectEditorProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function SelectEditor({ label, value, options, onChange }: SelectEditorProps) {
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
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors"
        style={{
          borderColor: 'var(--gray-09)',
          background: 'var(--gray-14)',
          color: 'var(--gray-01)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237E7C76' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          paddingRight: '28px',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--blue)'
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--blue)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-09)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
