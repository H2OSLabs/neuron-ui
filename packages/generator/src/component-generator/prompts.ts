// ============================================================
// Component Generation Prompts — Builds prompts for shadcn 二开
// ============================================================

export interface ComponentGenerationParams {
  componentName: string
  description: string
  propsDefinition: Record<string, string>
  styleContext: {
    primaryColor?: string
    backgroundColor?: string
    fontFamily?: string
    borderRadius?: string
    cssVariables?: Record<string, string>
  }
  apiContext?: {
    dataFields: string[]
    endpoint: string
  }
}

/**
 * Build the system + user prompt for generating a project-specific
 * React component based on shadcn/ui二次开发.
 */
export function buildComponentGenerationPrompt(params: ComponentGenerationParams): string {
  return `你是一个 React + TypeScript + Tailwind CSS + shadcn/ui 组件开发专家。

任务：基于 shadcn/ui 进行二次开发，生成一个名为 ${params.componentName} 的 React 组件。

## 组件描述
${params.description}

## Props 定义
${JSON.stringify(params.propsDefinition, null, 2)}

## 视觉风格
- 主色：${params.styleContext.primaryColor ?? '继承 shadcn 默认'}
- 背景色：${params.styleContext.backgroundColor ?? 'white'}
- 字体：${params.styleContext.fontFamily ?? '系统字体'}
- 圆角：${params.styleContext.borderRadius ?? '8px'}
${
  params.styleContext.cssVariables
    ? `- CSS 变量覆写：\n${Object.entries(params.styleContext.cssVariables)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join('\n')}`
    : ''
}

## 数据字段
${params.apiContext ? params.apiContext.dataFields.join(', ') : '无'}
${params.apiContext ? `\n## API 端点\n${params.apiContext.endpoint}` : ''}

## 要求
1. 必须在组件根元素上接受 data-node-id prop（由父层传入）用于编辑器定位
2. 使用 Tailwind CSS v4 工具类，不写内联样式
3. 从 shadcn/ui 导入基础组件（如 Table, Card, Button 等），进行二次封装
4. 导出 Props interface 和组件（命名导出）
5. 组件必须是纯展示性的（逻辑由父层通过 props 和 callbacks 传入）
6. 使用 forwardRef 传递 ref
7. 添加必要的 TypeScript 类型标注

请直接输出完整的 TypeScript 代码，不要解释。`
}
