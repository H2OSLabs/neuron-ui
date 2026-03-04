// ============================================================
// PageListPanel — Project mode page list sidebar
// ============================================================

import { useCallback } from 'react'
import { FileText, Plus, X } from 'lucide-react'
import { useProjectStore } from '../stores/project-store'

export function PageListPanel() {
  const projectSchema = useProjectStore((s) => s.projectSchema)
  const activePageIndex = useProjectStore((s) => s.activePageIndex)
  const setActivePage = useProjectStore((s) => s.setActivePage)
  const addPage = useProjectStore((s) => s.addPage)
  const removePage = useProjectStore((s) => s.removePage)

  const handleAddPage = useCallback(() => {
    addPage({
      version: '1.0.0',
      page: { id: `page-${Date.now()}`, name: '新建页面' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: { direction: 'vertical' },
          children: [],
        },
      ],
    })
  }, [addPage])

  const handleRemovePage = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation()
      if (!projectSchema || projectSchema.pages.length <= 1) return
      if (confirm('确定删除此页面？')) {
        removePage(index)
      }
    },
    [projectSchema, removePage],
  )

  if (!projectSchema) return null

  return (
    <div className="flex flex-col h-full">
      {/* Project name */}
      <div className="px-3 py-2 border-b border-[var(--gray-11)]">
        <div
          className="text-xs font-medium truncate"
          style={{ color: 'var(--gray-04)' }}
        >
          {projectSchema.project.name}
        </div>
      </div>

      {/* Page list */}
      <div className="flex-1 overflow-y-auto py-1">
        {projectSchema.pages.map((page, index) => (
          <button
            key={page.page.id}
            onClick={() => setActivePage(index)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors group ${
              index === activePageIndex
                ? 'bg-[var(--gray-13)] text-[var(--gray-02)]'
                : 'text-[var(--gray-05)] hover:bg-[var(--gray-14)] hover:text-[var(--gray-03)]'
            }`}
          >
            <FileText size={14} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{page.page.name}</div>
              {page.page.route && (
                <div
                  className="truncate"
                  style={{ color: 'var(--gray-08)', fontSize: '10px' }}
                >
                  {page.page.route}
                </div>
              )}
            </div>
            {/* Delete button (hidden for single page) */}
            {projectSchema.pages.length > 1 && (
              <span
                onClick={(e) => handleRemovePage(e, index)}
                className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded hover:bg-[var(--gray-11)] transition-opacity"
                style={{ color: 'var(--gray-07)' }}
              >
                <X size={12} />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add page button */}
      <div className="px-2 py-2 border-t border-[var(--gray-11)]">
        <button
          onClick={handleAddPage}
          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md border border-dashed border-[var(--gray-10)] hover:border-[var(--blue)] hover:text-[var(--blue)] transition-colors"
          style={{ color: 'var(--gray-06)' }}
        >
          <Plus size={12} />
          <span>添加页面</span>
        </button>
      </div>
    </div>
  )
}
