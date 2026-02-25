// ============================================================
// ComponentPanel — Left sidebar showing draggable components by category
// ============================================================

import { useState } from 'react'
import {
  Type,
  Tag,
  CircleUserRound,
  MousePointerClick,
  Table,
  BarChart3,
  Loader,
  Calendar,
  GalleryHorizontal,
  ListCollapse,
  CreditCard,
  ArrowLeftRight,
  SquareDashedBottom,
  Inbox,
  FormInput,
  TextCursorInput,
  AlignLeft,
  List,
  Search,
  CheckSquare,
  CircleDot,
  ToggleLeft,
  CalendarDays,
  SlidersHorizontal,
  KeyRound,
  Group,
  Square,
  PanelTop,
  AlertTriangle,
  PanelRight,
  PanelBottom,
  LayoutList,
  ScrollText,
  ChevronsDownUp,
  MessageSquare,
  Columns3,
  Ratio,
  Minus,
  ToggleRight,
  LayoutGrid,
  MessageCircle,
  Keyboard,
  Bell,
  AlertCircle,
  Loader2,
  ChevronRight,
  PanelLeft,
  MoreVertical,
  MoreHorizontal,
  Menu,
  Navigation,
  Terminal,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { useEditorStore } from '../stores/editor-store'
import { useSelectionStore } from '../stores/selection-store'
import type { ComponentGroup } from '../types'
import componentRegistryData from '@neuron-ui/metadata/builder-registry/component-registry.json'

// ---- Icon Mapping ----

const ICON_MAP: Record<string, LucideIcon> = {
  'type': Type,
  'tag': Tag,
  'user-circle': CircleUserRound,
  'mouse-pointer-click': MousePointerClick,
  'table': Table,
  'bar-chart-3': BarChart3,
  'loader': Loader,
  'calendar': Calendar,
  'gallery-horizontal': GalleryHorizontal,
  'list-collapse': ListCollapse,
  'credit-card': CreditCard,
  'arrow-left-right': ArrowLeftRight,
  'square-dashed': SquareDashedBottom,
  'inbox': Inbox,
  'form-input': FormInput,
  'text-cursor-input': TextCursorInput,
  'align-left': AlignLeft,
  'list': List,
  'search': Search,
  'check-square': CheckSquare,
  'circle-dot': CircleDot,
  'toggle-left': ToggleLeft,
  'calendar-days': CalendarDays,
  'sliders-horizontal': SlidersHorizontal,
  'key-round': KeyRound,
  'group': Group,
  'square': Square,
  'panel-top': PanelTop,
  'alert-triangle': AlertTriangle,
  'panel-right': PanelRight,
  'panel-bottom': PanelBottom,
  'layout-list': LayoutList,
  'scroll': ScrollText,
  'chevrons-down-up': ChevronsDownUp,
  'message-square': MessageSquare,
  'columns-3': Columns3,
  'ratio': Ratio,
  'minus': Minus,
  'toggle-right': ToggleRight,
  'layout-grid': LayoutGrid,
  'message-circle': MessageCircle,
  'keyboard': Keyboard,
  'bell': Bell,
  'alert-circle': AlertCircle,
  'loader-2': Loader2,
  'chevron-right': ChevronRight,
  'panel-left': PanelLeft,
  'more-vertical': MoreVertical,
  'more-horizontal': MoreHorizontal,
  'menu': Menu,
  'navigation': Navigation,
  'terminal': Terminal,
}

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Square
}

// ---- Component Data ----

const groups: ComponentGroup[] = componentRegistryData.groups as ComponentGroup[]

// ---- Generate unique ID ----

let idCounter = 0

function generateId(componentName: string): string {
  idCounter += 1
  return `${componentName.toLowerCase()}-${Date.now()}-${idCounter}`
}

// ---- ComponentPanel ----

export function ComponentPanel() {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const addNode = useEditorStore((s) => s.addNode)
  const select = useSelectionStore((s) => s.select)

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const handleAddComponent = (
    name: string,
    defaultProps: Record<string, unknown>,
  ) => {
    const id = generateId(name)
    const node = {
      id,
      component: name,
      props: { ...defaultProps },
      children: [],
    }
    addNode('', node)
    select(id)
  }

  return (
    <div
      className="editor-panel flex h-full w-full flex-col overflow-y-auto"
      style={{ background: 'var(--gray-13)' }}
    >
      {/* Panel header */}
      <div
        className="sticky top-0 z-10 border-b px-3 py-2.5"
        style={{
          background: 'var(--gray-13)',
          borderColor: 'var(--gray-11)',
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--gray-03)' }}
        >
          Components
        </h2>
      </div>

      {/* Groups */}
      <div className="flex-1 p-1.5">
        {groups.map((group) => {
          const isCollapsed = !!collapsedGroups[group.label]

          return (
            <div key={group.label} className="mb-1">
              {/* Group header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:opacity-80"
                style={{ color: 'var(--gray-03)' }}
              >
                <ChevronDown
                  size={12}
                  className="shrink-0 transition-transform"
                  style={{
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
                  }}
                />
                <span className="text-xs font-medium">{group.label}</span>
                <span
                  className="ml-auto text-[10px]"
                  style={{ color: 'var(--gray-06)' }}
                >
                  {group.components.length}
                </span>
              </button>

              {/* Component list */}
              {!isCollapsed && (
                <div className="mt-0.5 grid grid-cols-2 gap-1 px-1">
                  {group.components.map((comp) => {
                    const IconComponent = getIcon(comp.icon)

                    return (
                      <button
                        key={comp.name}
                        type="button"
                        onClick={() =>
                          handleAddComponent(comp.name, comp.defaultProps)
                        }
                        className="flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all hover:shadow-sm"
                        style={{
                          borderColor: 'var(--gray-10)',
                          background: 'var(--gray-14)',
                          color: 'var(--gray-02)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--blue)'
                          e.currentTarget.style.background = 'var(--gray-12)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--gray-10)'
                          e.currentTarget.style.background = 'var(--gray-14)'
                        }}
                        title={comp.name}
                      >
                        <IconComponent
                          size={18}
                          strokeWidth={1.5}
                          style={{ color: 'var(--gray-04)' }}
                        />
                        <span
                          className="w-full truncate text-[10px] leading-tight"
                          style={{ color: 'var(--gray-03)' }}
                        >
                          {comp.name.replace(/^N/, '')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
