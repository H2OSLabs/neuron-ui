import { getBaseRole } from './base-role'
import { getContextInjection } from './context-injection'
import { getOutputFormat } from './output-format'
import { getConstraints } from './constraints'
import { selectExamples } from './example-selector'
import type { PageType, FormContainer } from '../types'

export interface SystemPromptOptions {
  pageType?: PageType
  formContainer?: FormContainer
}

/**
 * Build the complete system prompt by composing modular sections.
 * Each section can be independently iterated or replaced.
 */
export function buildSystemPrompt(options?: SystemPromptOptions): string {
  const pageType = options?.pageType ?? 'auto'

  const sections = [
    getBaseRole(),
    '',
    getContextInjection(),
    '',
    getOutputFormat(),
    '',
    getConstraints({ pageType, formContainer: options?.formContainer }),
    '',
    selectExamples(pageType),
  ]

  return sections.join('\n')
}

/**
 * Build the user prompt from API list and task case.
 */
export function buildUserPrompt(apiList: string, taskCase: string): string {
  return `请根据以下 API 列表和任务描述生成 Page Schema:

## API 列表
${apiList}

## 任务描述
${taskCase}

请直接输出 JSON 对象。`
}

/**
 * Build a retry prompt with validation error feedback.
 */
export function buildRetryPrompt(previousOutput: string, errors: Array<{ path: string; message: string }>): string {
  const errorList = errors.map(e => `- ${e.path}: ${e.message}`).join('\n')

  return `上次生成的 Page Schema 存在以下校验错误：

${errorList}

上次的输出:
${previousOutput}

请修正这些错误，重新输出完整的 Page Schema JSON。注意：
1. 修复所有列出的错误
2. 保持原有的正确部分不变
3. 直接输出 JSON，不要包含 markdown 代码块`
}

/**
 * Build a preview prompt for human-in-the-loop mode.
 */
export function buildPreviewPrompt(apiList: string, taskCase: string): string {
  return `请分析以下 API 列表和任务描述，给出你的理解摘要（不要生成 Page Schema）:

## API 列表
${apiList}

## 任务描述
${taskCase}

请以 JSON 格式输出你的分析:
{
  "detectedApis": [{ "method": "GET", "path": "/api/...", "description": "..." }],
  "suggestedPageType": "crud|dashboard|detail",
  "suggestedComponents": ["NComponent1", "NComponent2", ...],
  "suggestedLayout": "布局描述文字"
}`
}
