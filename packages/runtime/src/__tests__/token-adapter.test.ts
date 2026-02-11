import { describe, it, expect } from 'vitest'
import {
  resolveColorToken,
  resolveSpacingToken,
  resolveRadiusToken,
  resolveToken,
} from '../adapter/token-adapter'

describe('resolveColorToken', () => {
  it('should resolve accent colors', () => {
    expect(resolveColorToken('blue')).toBe('#BEF1FF')
    expect(resolveColorToken('pink')).toBe('#FFC4E1')
    expect(resolveColorToken('green')).toBe('#C1F2CE')
  })

  it('should resolve semantic colors', () => {
    expect(resolveColorToken('error')).toBe('#E67853')
    expect(resolveColorToken('warning')).toBe('#E8A540')
    expect(resolveColorToken('success')).toBe('#6EC18E')
  })

  it('should resolve gray scale colors', () => {
    expect(resolveColorToken('01')).toBe('#5F5D57')
    expect(resolveColorToken('14')).toBe('#FCFCFC')
  })

  it('should return undefined for unknown colors', () => {
    expect(resolveColorToken('nonexistent')).toBeUndefined()
  })
})

describe('resolveSpacingToken', () => {
  it('should resolve spacing tokens', () => {
    expect(resolveSpacingToken('xs')).toBe('4px')
    expect(resolveSpacingToken('sm')).toBe('8px')
    expect(resolveSpacingToken('md')).toBe('16px')
    expect(resolveSpacingToken('xl')).toBe('32px')
  })
})

describe('resolveRadiusToken', () => {
  it('should resolve radius tokens', () => {
    expect(resolveRadiusToken('sm')).toBe('4px')
    expect(resolveRadiusToken('md')).toBe('8px')
    expect(resolveRadiusToken('full')).toBe('9999px')
  })
})

describe('resolveToken', () => {
  it('should resolve by category', () => {
    expect(resolveToken('color', 'blue')).toBe('#BEF1FF')
    expect(resolveToken('spacing', 'md')).toBe('16px')
    expect(resolveToken('radius', 'lg')).toBe('12px')
  })

  it('should return undefined for unknown category', () => {
    expect(resolveToken('unknown' as 'color', 'test')).toBeUndefined()
  })
})
