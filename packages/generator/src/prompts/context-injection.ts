import { loadManifestForPrompt } from '../context/load-manifest'
import { loadMappingForPrompt } from '../context/load-mapping'
import { loadRulesForPrompt } from '../context/load-rules'
import { loadTokensForPrompt } from '../context/load-tokens'

/**
 * Inject full metadata context into the prompt.
 * Dynamically loads from JSON files so the prompt always reflects current state.
 */
export function getContextInjection(): string {
  return `## 参考规则

### 组件清单（精简版）
${loadManifestForPrompt()}

### 字段→组件映射规则
${loadMappingForPrompt()}

### 组件嵌套约束
${loadRulesForPrompt()}

### 可用 Token 值
${loadTokensForPrompt()}`
}
