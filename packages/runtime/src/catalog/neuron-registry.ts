// ============================================================
// Neuron Registry: Component name → React implementation mapping
// Maps all 53 N-components from @neuron-ui/components to the renderer
// ============================================================

import React from 'react'
import {
  // P0 Core
  NButton, NText, NBadge, NAvatar, NInput, NLabel, NSeparator, NSpinner,
  // P1 Container
  NCard, NDialog, NAlertDialog, NSheet, NDrawer, NAspectRatio, NScrollArea,
  NTabs, NBreadcrumb, NSidebar, NCollapsible,
  // P2 Form
  NInputGroup, NCombobox, NSelect, NCheckbox, NRadioGroup, NSwitch,
  NTextarea, NDatePicker, NSlider, NInputOTP, NField,
  // P3 Display
  NDataTable, NCalendar, NCarousel, NDropdownMenu, NContextMenu,
  NEmpty, NAccordion, NAlert, NProgress, NSkeleton, NHoverCard,
  NPagination, NChart,
  // P4 Auxiliary
  NToast, NToggle, NToggleGroup, NResizable, NTooltip, NPopover,
  NCommand, NMenubar, NNavigationMenu, NKbd,
} from '@neuron-ui/components'

import type { ComponentRegistry, RegistryComponentProps, ActionSchema } from '../types'

type P = RegistryComponentProps

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>

/** Helper to render a component with generic props, bypassing strict type checks at the boundary */
function render(Component: AnyComponent, props: Record<string, unknown>, children?: React.ReactNode): React.ReactElement {
  return children !== undefined
    ? render(Component, props, children)
    : render(Component, props)
}

/** Create the default neuron component registry */
export function createNeuronRegistry(): ComponentRegistry {
  return {
    // ── P0 Core ──

    NButton: ({ props, onAction }: P) => {
      const handleClick = () => {
        if (props.__action && onAction) {
          onAction(props.__action as ActionSchema)
        }
      }
      return render(NButton, {
        label: props.label,
        variant: props.variant,
        size: props.size,
        icon: props.icon,
        disabled: props.disabled,
        onClick: handleClick,
      })
    },

    NText: ({ props }: P) =>
      render(NText, {
        text: props.text,
        size: props.size,
        weight: props.weight,
        color: props.color,
        as: props.as,
      }),

    NBadge: ({ props }: P) =>
      render(NBadge, {
        label: props.label,
        color: props.color,
        variant: props.variant,
        size: props.size,
      }),

    NAvatar: ({ props }: P) =>
      render(NAvatar, {
        src: props.src,
        name: props.name,
        size: props.size,
        shape: props.shape,
        status: props.status,
      }),

    NInput: ({ props }: P) =>
      render(NInput, {
        placeholder: props.placeholder,
        type: props.type,
        size: props.size,
        disabled: props.disabled,
        value: props.value,
        defaultValue: props.defaultValue,
      }),

    NLabel: ({ props }: P) =>
      render(NLabel, {
        text: props.text,
        htmlFor: props.htmlFor,
      }),

    NSeparator: ({ props }: P) =>
      render(NSeparator, {
        orientation: props.orientation as 'horizontal' | 'vertical',
      }),

    NSpinner: ({ props }: P) =>
      render(NSpinner, {
        size: props.size,
      }),

    // ── P1 Container ──

    NCard: ({ props, children }: P) =>
      render(NCard, {
        title: props.title,
        description: props.description,
        variant: props.variant,
      }, children),

    NDialog: ({ props, children }: P) =>
      render(NDialog, {
        title: props.title,
        description: props.description,
        open: props.__open,
        onOpenChange: props.__onOpenChange as (open: boolean) => void,
      }, children),

    NAlertDialog: ({ props, onAction }: P) =>
      render(NAlertDialog, {
        title: props.title,
        description: props.description,
        open: props.__open,
        onOpenChange: props.__onOpenChange as (open: boolean) => void,
        onConfirm: () => {
          if (props.__action && onAction) {
            onAction(props.__action as ActionSchema)
          }
        },
      }),

    NSheet: ({ props, children }: P) =>
      render(NSheet, {
        title: props.title,
        description: props.description,
        side: props.side as 'left' | 'right' | 'top' | 'bottom',
        open: props.__open,
        onOpenChange: props.__onOpenChange as (open: boolean) => void,
      }, children),

    NDrawer: ({ props, children }: P) =>
      render(NDrawer, {
        title: props.title,
        description: props.description,
        open: props.__open,
        onOpenChange: props.__onOpenChange as (open: boolean) => void,
      }, children),

    NAspectRatio: ({ props, children }: P) =>
      render(NAspectRatio, {
        ratio: props.ratio,
      }, children),

    NScrollArea: ({ props, children }: P) =>
      render(NScrollArea, {
        orientation: props.orientation,
        maxHeight: props.maxHeight,
      }, children),

    NTabs: ({ props, children }: P) =>
      render(NTabs, {
        tabs: props.items as Array<{ id: string; label: string }>,
        defaultValue: props.defaultValue,
      }, children),

    NBreadcrumb: ({ props }: P) =>
      render(NBreadcrumb, {
        items: props.items as Array<{ label: string; href?: string }>,
      }),

    NSidebar: ({ props, children }: P) =>
      render(NSidebar, {
        title: props.title,
      }, children),

    NCollapsible: ({ props, children }: P) =>
      render(NCollapsible, {
        title: props.title,
        defaultOpen: props.defaultOpen,
      }, children),

    // ── P2 Form ──

    NInputGroup: ({ props, children }: P) =>
      render(NInputGroup, {
        label: props.label,
        description: props.description,
      }, children),

    NCombobox: ({ props }: P) =>
      render(NCombobox, {
        placeholder: props.placeholder,
        options: props.options as Array<{ label: string; value: string }>,
      }),

    NSelect: ({ props }: P) =>
      render(NSelect, {
        placeholder: props.placeholder,
        options: props.options as Array<{ label: string; value: string }>,
        value: props.value,
      }),

    NCheckbox: ({ props }: P) =>
      render(NCheckbox, {
        label: props.label,
        disabled: props.disabled,
      }),

    NRadioGroup: ({ props }: P) =>
      render(NRadioGroup, {
        options: props.options as Array<{ label: string; value: string }>,
        orientation: props.orientation as 'horizontal' | 'vertical',
      }),

    NSwitch: ({ props }: P) =>
      render(NSwitch, {
        label: props.label,
        disabled: props.disabled,
      }),

    NTextarea: ({ props }: P) =>
      render(NTextarea, {
        placeholder: props.placeholder,
        rows: props.rows,
      }),

    NDatePicker: ({ props }: P) =>
      render(NDatePicker, {
        placeholder: props.placeholder,
        mode: props.mode,
      }),

    NSlider: ({ props }: P) =>
      render(NSlider, {
        min: props.min,
        max: props.max,
        step: props.step,
        defaultValue: props.defaultValue,
      }),

    NInputOTP: ({ props }: P) =>
      render(NInputOTP, {
        length: props.length,
      }),

    NField: ({ props, children }: P) =>
      render(NField, {
        label: props.label,
        description: props.description,
        error: props.error,
        required: props.required,
      }, children),

    // ── P3 Display ──

    NDataTable: ({ props }: P) =>
      render(NDataTable, {
        columns: props.columns as Array<{ key: string; label: string; sortable?: boolean }>,
        data: (props.data ?? props.__resolvedData ?? []) as Array<Record<string, unknown>>,
      }),

    NCalendar: ({ props }: P) =>
      render(NCalendar, {
        mode: props.mode,
      }),

    NCarousel: ({ props }: P) =>
      render(NCarousel, {
        items: props.items as Array<{ src: string; alt?: string }>,
        autoPlay: props.autoPlay,
        interval: props.interval,
      }),

    NDropdownMenu: ({ props, onAction }: P) =>
      render(NDropdownMenu, {
        trigger: props.trigger,
        items: props.items as Array<{ label: string; action?: string }>,
        onSelect: (action: string) => {
          if (onAction) onAction({ name: action, params: {} })
        },
      }),

    NContextMenu: ({ props, children, onAction }: P) =>
      render(NContextMenu, {
        items: props.items as Array<{ label: string; action?: string }>,
        onSelect: (action: string) => {
          if (onAction) onAction({ name: action, params: {} })
        },
      }, children),

    NEmpty: ({ props }: P) =>
      render(NEmpty, {
        title: props.title,
        description: props.description,
      }),

    NAccordion: ({ props }: P) =>
      render(NAccordion, {
        items: props.items as Array<{ title: string; content: string }>,
        type: props.type as 'single' | 'multiple',
      }),

    NAlert: ({ props }: P) =>
      render(NAlert, {
        title: props.title,
        description: props.description,
        variant: props.variant,
      }),

    NProgress: ({ props }: P) =>
      render(NProgress, {
        value: props.value,
        max: props.max,
      }),

    NSkeleton: ({ props }: P) =>
      render(NSkeleton, {
        width: props.width,
        height: props.height,
      }),

    NHoverCard: ({ props, children }: P) =>
      render(NHoverCard, {
        trigger: props.trigger,
      }, children),

    NPagination: ({ props }: P) =>
      render(NPagination, {
        total: props.total,
        pageSize: props.pageSize,
        current: props.current,
      }),

    NChart: ({ props }: P) =>
      render(NChart, {
        type: props.type,
        data: props.data as Array<{ label: string; value: number }>,
        width: props.width,
        height: props.height,
        showLegend: props.showLegend,
      }),

    // ── P4 Auxiliary ──

    NToast: ({ props }: P) =>
      render(NToast, {
        title: props.title,
        description: props.description,
        variant: props.variant,
      }),

    NToggle: ({ props }: P) =>
      render(NToggle, {
        label: props.label,
        variant: props.variant,
        size: props.size,
      }),

    NToggleGroup: ({ props }: P) =>
      render(NToggleGroup, {
        items: props.items as Array<{ label: string; value: string }>,
        type: props.type as 'single' | 'multiple',
      }),

    NResizable: ({ props, children }: P) =>
      render(NResizable, {
        direction: props.direction as 'horizontal' | 'vertical',
      }, children),

    NTooltip: ({ props, children }: P) =>
      render(NTooltip, {
        content: props.content,
        side: props.side as 'top' | 'right' | 'bottom' | 'left',
      }, children),

    NPopover: ({ props, children }: P) =>
      render(NPopover, {
        trigger: props.trigger,
      }, children),

    NCommand: ({ props }: P) =>
      render(NCommand, {
        placeholder: props.placeholder,
        items: props.items as Array<{ label: string; value: string; group?: string }>,
      }),

    NMenubar: ({ props }: P) =>
      render(NMenubar, {
        menus: props.menus as Array<{ label: string; items: Array<{ label: string }> }>,
      }),

    NNavigationMenu: ({ props }: P) =>
      render(NNavigationMenu, {
        items: props.items as Array<{ label: string; href?: string }>,
      }),

    NKbd: ({ props }: P) =>
      render(NKbd, {
        keys: props.keys,
      }),
  }
}
