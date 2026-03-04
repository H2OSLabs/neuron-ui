import { describe, it, expect, vi } from 'vitest'
import { parseApiInput } from '../input-parser/api-parser'
import { parseStyleInput } from '../input-parser/style-parser'
import type { AIProvider } from '../types'

function createMockProvider(response: string): AIProvider {
  return { generate: vi.fn().mockResolvedValue(response) }
}

function createErrorProvider(): AIProvider {
  return { generate: vi.fn().mockRejectedValue(new Error('AI error')) }
}

describe('parseApiInput', () => {
  it('parses valid API endpoint response', async () => {
    const mockResponse = `Here are the endpoints:
[{"method":"GET","path":"/users","description":"List users","responseShape":{"id":"number","name":"string"}}]`
    const provider = createMockProvider(mockResponse)

    const result = await parseApiInput('GET /users - list all users', provider)

    expect(result.endpoints).toHaveLength(1)
    expect(result.endpoints[0].method).toBe('GET')
    expect(result.endpoints[0].path).toBe('/users')
    expect(result.rawInput).toBe('GET /users - list all users')
  })

  it('parses multiple endpoints', async () => {
    const mockResponse = `[
      {"method":"GET","path":"/users","description":"List"},
      {"method":"POST","path":"/users","description":"Create","requestBody":{"name":"string"}}
    ]`
    const provider = createMockProvider(mockResponse)

    const result = await parseApiInput('user endpoints', provider)
    expect(result.endpoints).toHaveLength(2)
    expect(result.endpoints[1].method).toBe('POST')
    expect(result.endpoints[1].requestBody).toEqual({ name: 'string' })
  })

  it('returns empty endpoints on no JSON match', async () => {
    const provider = createMockProvider('No endpoints found in input')

    const result = await parseApiInput('random text', provider)
    expect(result.endpoints).toEqual([])
    expect(result.rawInput).toBe('random text')
  })

  it('returns empty endpoints on AI error', async () => {
    const provider = createErrorProvider()

    const result = await parseApiInput('some api docs', provider)
    expect(result.endpoints).toEqual([])
    expect(result.rawInput).toBe('some api docs')
  })

  it('sends correct prompt to AI provider', async () => {
    const provider = createMockProvider('[]')
    await parseApiInput('my api docs', provider)

    expect(provider.generate).toHaveBeenCalledTimes(1)
    const messages = (provider.generate as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(messages).toHaveLength(1)
    expect(messages[0].role).toBe('user')
    expect(messages[0].content).toContain('my api docs')
  })
})

describe('parseStyleInput', () => {
  it('parses full style response', async () => {
    const mockResponse = `{"colors":{"primary":"#3B82F6","background":"#FFFFFF","text":"#1A1A1A"},"fontFamily":"Inter","borderRadius":"8px","spacing":{"sm":"4px","md":"8px","lg":"16px"},"cssVariables":{"--primary":"#3B82F6"}}`
    const provider = createMockProvider(mockResponse)

    const result = await parseStyleInput('primary blue, white bg', provider)
    expect(result.colors.primary).toBe('#3B82F6')
    expect(result.fontFamily).toBe('Inter')
    expect(result.borderRadius).toBe('8px')
    expect(result.spacing?.sm).toBe('4px')
    expect(result.cssVariables?.['--primary']).toBe('#3B82F6')
    expect(result.rawInput).toBe('primary blue, white bg')
  })

  it('handles partial response (only colors)', async () => {
    const mockResponse = `{"colors":{"primary":"#FF0000"},"fontFamily":null,"borderRadius":null,"spacing":null,"cssVariables":null}`
    const provider = createMockProvider(mockResponse)

    const result = await parseStyleInput('red theme', provider)
    expect(result.colors.primary).toBe('#FF0000')
    expect(result.fontFamily).toBeUndefined()
    expect(result.borderRadius).toBeUndefined()
    expect(result.spacing).toBeUndefined()
    expect(result.cssVariables).toBeUndefined()
  })

  it('returns empty colors when no JSON found', async () => {
    const provider = createMockProvider('I could not parse any styles')

    const result = await parseStyleInput('ambiguous input', provider)
    expect(result.colors).toEqual({})
    expect(result.rawInput).toBe('ambiguous input')
  })

  it('returns empty colors on AI error', async () => {
    const provider = createErrorProvider()

    const result = await parseStyleInput('some styles', provider)
    expect(result.colors).toEqual({})
    expect(result.rawInput).toBe('some styles')
  })

  it('sends correct prompt to AI provider', async () => {
    const provider = createMockProvider('{"colors":{}}')
    await parseStyleInput('dark theme', provider)

    expect(provider.generate).toHaveBeenCalledTimes(1)
    const messages = (provider.generate as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(messages[0].content).toContain('dark theme')
  })
})
