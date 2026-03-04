// ============================================================
// NodeHoverToolbar — [编辑] and [Chat] buttons on hover
// Appears on the top-right of each hovered component
// ============================================================

import React from 'react'
import { Pencil, MessageCircle } from 'lucide-react'

interface NodeHoverToolbarProps {
  nodeId: string
  onEdit: (nodeId: string) => void
  onChat: (nodeId: string) => void
}

export function NodeHoverToolbar({ nodeId, onEdit, onChat }: NodeHoverToolbarProps) {
  return (
    <div className="absolute top-1 right-1 z-50 hidden group-hover:flex gap-1 bg-white border border-[var(--gray-11)] rounded-[8px] shadow-sm p-0.5">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit(nodeId)
        }}
        className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--gray-06)] hover:text-[var(--blue)] hover:bg-[var(--blue)]/10 rounded-[4px] transition-colors"
        title="编辑"
      >
        <Pencil size={12} />
        编辑
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onChat(nodeId)
        }}
        className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--gray-06)] hover:text-[var(--purple)] hover:bg-[var(--purple)]/10 rounded-[4px] transition-colors"
        title="Chat"
      >
        <MessageCircle size={12} />
        Chat
      </button>
    </div>
  )
}
