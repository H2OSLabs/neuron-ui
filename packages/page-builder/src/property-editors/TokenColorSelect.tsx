// ============================================================
// TokenColorSelect — Color token picker with swatches
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { colors } from '@neuron-ui/tokens'

export interface TokenColorSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
}

// Build a flat list of color tokens with their hex values
interface ColorOption {
  token: string
  hex: string
  group: string
}

function buildColorOptions(): ColorOption[] {
  const options: ColorOption[] = []

  // Gray scale: gray-01 through gray-14
  for (const [key, hex] of Object.entries(colors.gray)) {
    options.push({ token: `gray-${key}`, hex, group: 'gray' })
  }

  // Accent colors
  for (const [key, hex] of Object.entries(colors.accent)) {
    options.push({ token: key, hex, group: 'accent' })
  }

  // Semantic colors
  for (const [key, hex] of Object.entries(colors.semantic)) {
    options.push({ token: key, hex, group: 'semantic' })
  }

  return options
}

const COLOR_OPTIONS = buildColorOptions()

function getHexForToken(token: string): string | undefined {
  return COLOR_OPTIONS.find((c) => c.token === token)?.hex
}

export function TokenColorSelect({ label, value, onChange }: TokenColorSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const currentHex = getHexForToken(value)

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      <label
        className="text-xs font-medium"
        style={{ color: 'var(--gray-03)' }}
      >
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm text-left transition-colors"
        style={{
          borderColor: isOpen ? 'var(--blue)' : 'var(--gray-09)',
          background: 'var(--gray-14)',
          color: 'var(--gray-01)',
          boxShadow: isOpen ? '0 0 0 1px var(--blue)' : 'none',
        }}
      >
        {currentHex ? (
          <span
            className="inline-block h-4 w-4 shrink-0 rounded border"
            style={{ background: currentHex, borderColor: 'var(--gray-09)' }}
          />
        ) : (
          <span
            className="inline-block h-4 w-4 shrink-0 rounded border"
            style={{
              background: 'repeating-conic-gradient(var(--gray-10) 0% 25%, var(--gray-14) 0% 50%) 50% / 8px 8px',
              borderColor: 'var(--gray-09)',
            }}
          />
        )}
        <span className="truncate">{value || 'Select color...'}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 max-h-64 w-60 overflow-y-auto rounded-lg border p-2 shadow-lg"
          style={{
            background: 'var(--gray-14)',
            borderColor: 'var(--gray-09)',
          }}
        >
          {/* Gray scale section */}
          <div className="mb-2">
            <div
              className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--gray-05)' }}
            >
              Gray
            </div>
            <div className="grid grid-cols-7 gap-1">
              {COLOR_OPTIONS.filter((c) => c.group === 'gray').map((c) => (
                <button
                  key={c.token}
                  type="button"
                  title={c.token}
                  onClick={() => {
                    onChange(c.token)
                    setIsOpen(false)
                  }}
                  className="h-6 w-full rounded border transition-transform hover:scale-110"
                  style={{
                    background: c.hex,
                    borderColor: value === c.token ? 'var(--blue)' : 'var(--gray-09)',
                    borderWidth: value === c.token ? '2px' : '1px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Accent section */}
          <div className="mb-2">
            <div
              className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--gray-05)' }}
            >
              Accent
            </div>
            <div className="grid grid-cols-5 gap-1">
              {COLOR_OPTIONS.filter((c) => c.group === 'accent').map((c) => (
                <button
                  key={c.token}
                  type="button"
                  title={c.token}
                  onClick={() => {
                    onChange(c.token)
                    setIsOpen(false)
                  }}
                  className="flex h-6 items-center justify-center rounded border transition-transform hover:scale-110"
                  style={{
                    background: c.hex,
                    borderColor: value === c.token ? 'var(--blue)' : 'var(--gray-09)',
                    borderWidth: value === c.token ? '2px' : '1px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Semantic section */}
          <div>
            <div
              className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--gray-05)' }}
            >
              Semantic
            </div>
            <div className="grid grid-cols-3 gap-1">
              {COLOR_OPTIONS.filter((c) => c.group === 'semantic').map((c) => (
                <button
                  key={c.token}
                  type="button"
                  onClick={() => {
                    onChange(c.token)
                    setIsOpen(false)
                  }}
                  className="flex h-7 items-center justify-center gap-1 rounded border text-[10px] font-medium transition-transform hover:scale-105"
                  style={{
                    background: c.hex,
                    borderColor: value === c.token ? 'var(--blue)' : 'var(--gray-09)',
                    borderWidth: value === c.token ? '2px' : '1px',
                    color: 'var(--gray-01)',
                  }}
                >
                  {c.token}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
