// ============================================================
// NumberInput — Numeric property editor
// ============================================================

import React from 'react'

export interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberInput({ label, value, onChange, min, max, step = 1 }: NumberInputProps) {
  const id = `prop-${label}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '' || raw === '-') return
    const num = parseFloat(raw)
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium"
        style={{ color: 'var(--gray-03)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value ?? 0}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors"
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
    </div>
  )
}
