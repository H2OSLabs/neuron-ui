import { describe, it, expect, vi } from 'vitest'
import { generateComponent } from '../component-generator'
import { buildComponentGenerationPrompt } from '../component-generator'
import type { AIProvider } from '../types'
import type { ComponentGenerationParams } from '../component-generator'

function createMockProvider(response: string): AIProvider {
  return { generate: vi.fn().mockResolvedValue(response) }
}

const baseParams: ComponentGenerationParams = {
  componentName: 'UserCard',
  description: 'A card displaying user profile info',
  propsDefinition: { name: 'string', avatar: 'string', role: 'string' },
  styleContext: {
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    borderRadius: '12px',
  },
}

describe('buildComponentGenerationPrompt', () => {
  it('includes component name in prompt', () => {
    const prompt = buildComponentGenerationPrompt(baseParams)
    expect(prompt).toContain('UserCard')
  })

  it('includes description in prompt', () => {
    const prompt = buildComponentGenerationPrompt(baseParams)
    expect(prompt).toContain('A card displaying user profile info')
  })

  it('includes props definition', () => {
    const prompt = buildComponentGenerationPrompt(baseParams)
    expect(prompt).toContain('"name"')
    expect(prompt).toContain('"avatar"')
  })

  it('includes style context', () => {
    const prompt = buildComponentGenerationPrompt(baseParams)
    expect(prompt).toContain('#3B82F6')
    expect(prompt).toContain('Inter')
    expect(prompt).toContain('12px')
  })

  it('includes CSS variables when provided', () => {
    const params: ComponentGenerationParams = {
      ...baseParams,
      styleContext: {
        ...baseParams.styleContext,
        cssVariables: { '--primary': '#3B82F6', '--bg': '#FFF' },
      },
    }
    const prompt = buildComponentGenerationPrompt(params)
    expect(prompt).toContain('--primary')
    expect(prompt).toContain('--bg')
  })

  it('includes API context when provided', () => {
    const params: ComponentGenerationParams = {
      ...baseParams,
      apiContext: { dataFields: ['id', 'name', 'email'], endpoint: 'GET /api/users' },
    }
    const prompt = buildComponentGenerationPrompt(params)
    expect(prompt).toContain('id, name, email')
    expect(prompt).toContain('GET /api/users')
  })

  it('uses defaults when style context is minimal', () => {
    const params: ComponentGenerationParams = {
      ...baseParams,
      styleContext: {},
    }
    const prompt = buildComponentGenerationPrompt(params)
    expect(prompt).toContain('继承 shadcn 默认')
    expect(prompt).toContain('系统字体')
  })
})

describe('generateComponent', () => {
  it('returns generated code on success', async () => {
    const code = `import { Card } from '@/components/ui/card'\nexport function UserCard() { return <Card /> }`
    const provider = createMockProvider(code)

    const result = await generateComponent(baseParams, provider)
    expect(result.success).toBe(true)
    expect(result.componentName).toBe('UserCard')
    expect(result.code).toContain('Card')
  })

  it('extracts code from markdown code block', async () => {
    const response = "Here's the component:\n```tsx\nexport function UserCard() { return <div /> }\n```\nDone."
    const provider = createMockProvider(response)

    const result = await generateComponent(baseParams, provider)
    expect(result.success).toBe(true)
    expect(result.code).toBe('export function UserCard() { return <div /> }')
    expect(result.code).not.toContain('```')
  })

  it('returns error on AI failure', async () => {
    const provider: AIProvider = {
      generate: vi.fn().mockRejectedValue(new Error('API timeout')),
    }

    const result = await generateComponent(baseParams, provider)
    expect(result.success).toBe(false)
    expect(result.code).toBe('')
    expect(result.error).toContain('API timeout')
    expect(result.componentName).toBe('UserCard')
  })

  it('handles response without code block markers', async () => {
    const rawCode = 'export const UserCard = () => <div>Hello</div>'
    const provider = createMockProvider(rawCode)

    const result = await generateComponent(baseParams, provider)
    expect(result.success).toBe(true)
    expect(result.code).toBe(rawCode)
  })

  it('passes correct messages to AI provider', async () => {
    const provider = createMockProvider('export function UserCard() {}')
    await generateComponent(baseParams, provider)

    expect(provider.generate).toHaveBeenCalledTimes(1)
    const messages = (provider.generate as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(messages).toHaveLength(1)
    expect(messages[0].role).toBe('user')
    expect(messages[0].content).toContain('UserCard')
  })
})
