import { describe, it, expect } from 'vitest'
import { colors, spacing, radius, fontFamily, fontSize } from '../index'

describe('colors', () => {
  it('colors.gray has 14 entries (keys: 01 through 14)', () => {
    const grayKeys = Object.keys(colors.gray)
    expect(grayKeys).toHaveLength(14)
    for (let i = 1; i <= 14; i++) {
      const key = String(i).padStart(2, '0')
      expect(colors.gray).toHaveProperty(key)
    }
  })

  it('colors.accent has 10 entries (pink, yellow, lime, green, blue, purple, lavender, peach, mint, coral)', () => {
    const accentKeys = Object.keys(colors.accent)
    expect(accentKeys).toHaveLength(10)
  })

  it('colors.semantic has 3 entries (error, warning, success)', () => {
    const semanticKeys = Object.keys(colors.semantic)
    expect(semanticKeys).toHaveLength(3)
    expect(colors.semantic).toHaveProperty('error')
    expect(colors.semantic).toHaveProperty('warning')
    expect(colors.semantic).toHaveProperty('success')
  })

  it('all color values start with #', () => {
    const allValues = [
      ...Object.values(colors.gray),
      ...Object.values(colors.accent),
      ...Object.values(colors.semantic),
    ]
    for (const value of allValues) {
      expect(value).toMatch(/^#/)
    }
  })
})

describe('spacing', () => {
  it('spacing has 10 entries', () => {
    const spacingKeys = Object.keys(spacing)
    expect(spacingKeys).toHaveLength(10)
  })

  it('all spacing values end with px', () => {
    for (const value of Object.values(spacing)) {
      expect(value).toMatch(/px$/)
    }
  })
})

describe('radius', () => {
  it('radius has 5 entries (sm, md, lg, xl, full)', () => {
    const radiusKeys = Object.keys(radius)
    expect(radiusKeys).toHaveLength(5)
    expect(radius).toHaveProperty('sm')
    expect(radius).toHaveProperty('md')
    expect(radius).toHaveProperty('lg')
    expect(radius).toHaveProperty('xl')
    expect(radius).toHaveProperty('full')
  })
})

describe('typography', () => {
  it('fontFamily has 2 entries (heading, body)', () => {
    expect(fontFamily).toHaveProperty('heading')
    expect(fontFamily).toHaveProperty('body')
  })

  it('fontSize has 7 entries', () => {
    const fontSizeKeys = Object.keys(fontSize)
    expect(fontSizeKeys).toHaveLength(7)
  })

  it('each fontSize entry has value, weight, lineHeight properties', () => {
    for (const entry of Object.values(fontSize)) {
      expect(entry).toHaveProperty('value')
      expect(entry).toHaveProperty('weight')
      expect(entry).toHaveProperty('lineHeight')
    }
  })

  it('fontFamily.heading contains Asul', () => {
    expect(fontFamily.heading).toContain('Asul')
  })

  it('fontFamily.body contains Swei Gothic CJK SC', () => {
    expect(fontFamily.body).toContain('Swei Gothic CJK SC')
  })
})
