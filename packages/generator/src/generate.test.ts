import { describe, it, expect, vi } from 'vitest'
import { generatePage, previewGeneration } from './generate'
import { autoFix } from './auto-fix'
import { fallbackGenerate } from './fallback'
import { buildSystemPrompt, buildUserPrompt } from './prompts/system-prompt'
import { selectExamples } from './prompts/example-selector'
import type { AIProvider, Message } from './types'
import type { PageSchema } from '@neuron-ui/metadata'

// Mock AI provider that returns a valid CRUD Page Schema
function createMockProvider(response: string): AIProvider {
  return {
    generate: vi.fn().mockResolvedValue(response),
  }
}

const VALID_CRUD_RESPONSE = JSON.stringify({
  version: '1.0.0',
  page: { id: 'test-crud', name: 'Test CRUD' },
  dataSources: {
    list: { api: 'GET /api/items', autoFetch: true },
  },
  tree: [{
    id: 'root',
    component: 'NResizable',
    props: { direction: 'vertical' },
    children: [
      {
        id: 'table',
        component: 'NDataTable',
        props: { columns: [{ key: 'name', label: 'Name' }], data: [] },
        binding: { dataSource: 'list', field: 'data' },
      },
    ],
  }],
})

describe('buildSystemPrompt', () => {
  it('should build a system prompt', () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain('neuron-ui')
    expect(prompt).toContain('组件清单')
    expect(prompt).toContain('映射规则')
    expect(prompt).toContain('嵌套约束')
    expect(prompt).toContain('Token')
  })

  it('should include CRUD constraints when pageType is crud', () => {
    const prompt = buildSystemPrompt({ pageType: 'crud' })
    expect(prompt).toContain('NDataTable')
    expect(prompt).toContain('NAlertDialog')
  })

  it('should include dashboard constraints when pageType is dashboard', () => {
    const prompt = buildSystemPrompt({ pageType: 'dashboard' })
    expect(prompt).toContain('NChart')
    expect(prompt).toContain('统计卡片')
  })
})

describe('buildUserPrompt', () => {
  it('should include API list and task case', () => {
    const prompt = buildUserPrompt('GET /api/users', '用户管理页面')
    expect(prompt).toContain('GET /api/users')
    expect(prompt).toContain('用户管理页面')
  })
})

describe('selectExamples', () => {
  it('should return examples for crud', () => {
    const examples = selectExamples('crud')
    expect(examples).toContain('示例 1')
    expect(examples).toContain('示例 2')
  })

  it('should return examples for dashboard', () => {
    const examples = selectExamples('dashboard')
    expect(examples).toContain('仪表盘')
  })

  it('should return examples for auto', () => {
    const examples = selectExamples('auto')
    expect(examples).toContain('示例 1')
  })
})

describe('generatePage', () => {
  it('should generate a valid Page Schema from AI response', async () => {
    const provider = createMockProvider(VALID_CRUD_RESPONSE)

    const result = await generatePage({
      apiList: 'GET /api/items',
      taskCase: 'Test CRUD page',
      provider,
    })

    expect(result.pageSchema).toBeDefined()
    expect(result.pageSchema.version).toBe('1.0.0')
    expect(result.metadata.generatedBy).toBe('ai')
    expect(result.metadata.retries).toBe(0)
    expect(result.metadata.degraded).toBeUndefined()
  })

  it('should handle markdown-wrapped JSON response', async () => {
    const wrappedResponse = '```json\n' + VALID_CRUD_RESPONSE + '\n```'
    const provider = createMockProvider(wrappedResponse)

    const result = await generatePage({
      apiList: 'GET /api/items',
      taskCase: 'Test',
      provider,
    })

    expect(result.pageSchema.version).toBe('1.0.0')
  })

  it('should fallback on completely invalid response', async () => {
    const provider = createMockProvider('This is not JSON at all.')

    const result = await generatePage({
      apiList: 'GET /api/items',
      taskCase: 'Test',
      provider,
      maxRetries: 0,
    })

    expect(result.metadata.degraded).toBe(true)
    expect(result.metadata.suggestedActions).toBeDefined()
  })

  it('should retry on validation failure', async () => {
    const badResponse = JSON.stringify({
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [{ id: 'root', component: 'NUnknownComponent' }],
    })

    const provider: AIProvider = {
      generate: vi.fn()
        .mockResolvedValueOnce(badResponse)
        .mockResolvedValueOnce(VALID_CRUD_RESPONSE),
    }

    const result = await generatePage({
      apiList: 'GET /api/items',
      taskCase: 'Test',
      provider,
      maxRetries: 1,
    })

    expect(result.pageSchema.version).toBe('1.0.0')
    expect((provider.generate as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2)
  })
})

describe('autoFix', () => {
  it('should fix duplicate IDs', () => {
    const schema: PageSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [
        {
          id: 'root', component: 'NResizable',
          children: [
            { id: 'dup', component: 'NText', props: { text: 'A' } },
            { id: 'dup', component: 'NText', props: { text: 'B' } },
          ],
        },
      ],
    }

    const errors = [{ path: 'tree[0].children[1].id', message: 'Duplicate node id: "dup"', severity: 'error' as const, rule: 'format' as const }]
    const result = autoFix(schema, errors)

    const ids = new Set<string>()
    function collectIds(nodes: PageSchema['tree']): void {
      for (const n of nodes) {
        ids.add(n.id)
        if (n.children) collectIds(n.children)
      }
    }
    collectIds(result.schema.tree)

    // All IDs should be unique
    expect(ids.size).toBe(3) // root, dup, dup-2
    expect(result.fixesApplied.length).toBeGreaterThan(0)
  })

  it('should fix raw hex colors', () => {
    const schema: PageSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [
        { id: 'badge', component: 'NBadge', props: { label: 'test', color: '#BEF1FF' } },
      ],
    }

    const errors = [{ path: 'tree[0].props.color', message: 'Raw color value', severity: 'warning' as const, rule: 'token' as const }]
    const result = autoFix(schema, errors)

    expect(result.schema.tree[0].props?.['color']).toBe('blue')
    expect(result.fixesApplied).toContain('Fixed 1 raw color values → token keys')
  })
})

describe('fallbackGenerate', () => {
  it('should generate a CRUD skeleton', () => {
    const result = fallbackGenerate('GET /api/items', 'Test', 'crud', 2, [])
    expect(result.pageSchema.tree).toHaveLength(1)
    expect(result.metadata.degraded).toBe(true)
    expect(result.pageSchema.dataSources).toBeDefined()
  })

  it('should generate a dashboard skeleton', () => {
    const result = fallbackGenerate('GET /api/stats', 'Dashboard', 'dashboard', 2, [])
    expect(result.pageSchema.tree[0].component).toBe('NResizable')
    expect(result.metadata.degraded).toBe(true)
  })

  it('should generate a detail skeleton', () => {
    const result = fallbackGenerate('GET /api/item/:id', 'Detail', 'detail', 2, [])
    expect(result.pageSchema.tree[0].component).toBe('NCard')
    expect(result.metadata.degraded).toBe(true)
  })

  it('should generate an auto skeleton', () => {
    const result = fallbackGenerate('unknown', 'Unknown', 'auto', 2, [])
    expect(result.metadata.degraded).toBe(true)
    expect(result.metadata.suggestedActions).toHaveLength(3)
  })
})

describe('previewGeneration', () => {
  it('should return a preview with detected APIs', async () => {
    const previewResponse = JSON.stringify({
      detectedApis: [{ method: 'GET', path: '/api/users', description: 'Get users' }],
      suggestedPageType: 'crud',
      suggestedComponents: ['NDataTable', 'NButton'],
      suggestedLayout: 'CRUD table with actions',
    })
    const provider = createMockProvider(previewResponse)

    const preview = await previewGeneration({
      apiList: 'GET /api/users',
      taskCase: 'User management',
      provider,
    })

    expect(preview.detectedApis).toHaveLength(1)
    expect(preview.suggestedPageType).toBe('crud')
    expect(preview.suggestedComponents).toContain('NDataTable')
    expect(typeof preview.confirm).toBe('function')
    expect(typeof preview.abort).toBe('function')
  })

  it('should handle abort', async () => {
    const provider = createMockProvider('{}')
    const preview = await previewGeneration({
      apiList: 'GET /api/users',
      taskCase: 'Test',
      provider,
    })

    preview.abort()
    await expect(preview.confirm()).rejects.toThrow('aborted')
  })
})
