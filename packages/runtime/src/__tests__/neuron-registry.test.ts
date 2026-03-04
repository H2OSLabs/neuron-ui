import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { createNeuronRegistry } from '../catalog/neuron-registry'

describe('createNeuronRegistry', () => {
  const registry = createNeuronRegistry()

  it('returns a registry object', () => {
    expect(registry).toBeDefined()
    expect(typeof registry).toBe('object')
  })

  it('contains all P0 core components', () => {
    expect(registry.NButton).toBeDefined()
    expect(registry.NText).toBeDefined()
    expect(registry.NBadge).toBeDefined()
    expect(registry.NAvatar).toBeDefined()
    expect(registry.NInput).toBeDefined()
    expect(registry.NLabel).toBeDefined()
    expect(registry.NSeparator).toBeDefined()
    expect(registry.NSpinner).toBeDefined()
  })

  it('contains all P1 container components', () => {
    expect(registry.NCard).toBeDefined()
    expect(registry.NDialog).toBeDefined()
    expect(registry.NAlertDialog).toBeDefined()
    expect(registry.NSheet).toBeDefined()
    expect(registry.NDrawer).toBeDefined()
    expect(registry.NAspectRatio).toBeDefined()
    expect(registry.NScrollArea).toBeDefined()
    expect(registry.NTabs).toBeDefined()
    expect(registry.NBreadcrumb).toBeDefined()
    expect(registry.NSidebar).toBeDefined()
    expect(registry.NCollapsible).toBeDefined()
  })

  it('contains all P2 form components', () => {
    expect(registry.NInputGroup).toBeDefined()
    expect(registry.NCombobox).toBeDefined()
    expect(registry.NSelect).toBeDefined()
    expect(registry.NCheckbox).toBeDefined()
    expect(registry.NRadioGroup).toBeDefined()
    expect(registry.NSwitch).toBeDefined()
    expect(registry.NTextarea).toBeDefined()
    expect(registry.NDatePicker).toBeDefined()
    expect(registry.NSlider).toBeDefined()
    expect(registry.NInputOTP).toBeDefined()
    expect(registry.NField).toBeDefined()
  })

  it('contains all P3 display components', () => {
    expect(registry.NDataTable).toBeDefined()
    expect(registry.NCalendar).toBeDefined()
    expect(registry.NCarousel).toBeDefined()
    expect(registry.NDropdownMenu).toBeDefined()
    expect(registry.NContextMenu).toBeDefined()
    expect(registry.NEmpty).toBeDefined()
    expect(registry.NAccordion).toBeDefined()
    expect(registry.NAlert).toBeDefined()
    expect(registry.NProgress).toBeDefined()
    expect(registry.NSkeleton).toBeDefined()
    expect(registry.NHoverCard).toBeDefined()
    expect(registry.NPagination).toBeDefined()
    expect(registry.NChart).toBeDefined()
  })

  it('contains all P4 auxiliary components', () => {
    expect(registry.NToast).toBeDefined()
    expect(registry.NToggle).toBeDefined()
    expect(registry.NToggleGroup).toBeDefined()
    expect(registry.NResizable).toBeDefined()
    expect(registry.NTooltip).toBeDefined()
    expect(registry.NPopover).toBeDefined()
    expect(registry.NCommand).toBeDefined()
    expect(registry.NMenubar).toBeDefined()
    expect(registry.NNavigationMenu).toBeDefined()
    expect(registry.NKbd).toBeDefined()
  })

  it('each registry entry is a function', () => {
    for (const [name, factory] of Object.entries(registry)) {
      expect(typeof factory).toBe('function', `${name} should be a function`)
    }
  })

  it('has exactly 53 components', () => {
    expect(Object.keys(registry)).toHaveLength(53)
  })

  // Test that factory functions produce React elements
  describe('factory rendering', () => {
    const simpleProps = { props: {}, onAction: vi.fn() }

    it('NButton factory returns React element', () => {
      const el = registry.NButton({ props: { label: 'Click' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NButton calls onAction when __action is set', () => {
      const onAction = vi.fn()
      const el = registry.NButton({
        props: { label: 'Click', __action: { name: 'openDialog', params: { target: 'form' } } },
        onAction,
      })
      // Simulate click by extracting the onClick prop
      const onClick = (el as React.ReactElement<{ onClick: () => void }>).props.onClick
      onClick()
      expect(onAction).toHaveBeenCalledWith({ name: 'openDialog', params: { target: 'form' } })
    })

    it('NText factory returns React element', () => {
      const el = registry.NText({ props: { text: 'Hello' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NBadge factory returns React element', () => {
      const el = registry.NBadge({ props: { label: 'New' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NAvatar factory returns React element', () => {
      const el = registry.NAvatar({ props: { name: 'User' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NInput factory returns React element', () => {
      const el = registry.NInput({ props: { placeholder: 'Enter...' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NLabel factory returns React element', () => {
      const el = registry.NLabel({ props: { text: 'Name' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSeparator factory returns React element', () => {
      const el = registry.NSeparator(simpleProps)
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSpinner factory returns React element', () => {
      const el = registry.NSpinner(simpleProps)
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NCard factory returns React element with children', () => {
      const el = registry.NCard({ props: { title: 'Card' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NProgress factory returns React element', () => {
      const el = registry.NProgress({ props: { value: 50, label: 'Loading' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NAlert factory returns React element', () => {
      const el = registry.NAlert({ props: { title: 'Warning', variant: 'warning' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSkeleton factory returns React element', () => {
      const el = registry.NSkeleton({ props: { variant: 'text', lines: 3 }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NEmpty factory returns React element', () => {
      const el = registry.NEmpty({ props: { title: 'No Data' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NKbd factory returns React element', () => {
      const el = registry.NKbd({ props: { keys: ['Ctrl', 'C'] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NToggle factory returns React element', () => {
      const el = registry.NToggle({ props: { label: 'Bold' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NCheckbox factory returns React element', () => {
      const el = registry.NCheckbox({ props: { label: 'Accept' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSwitch factory returns React element', () => {
      const el = registry.NSwitch({ props: { label: 'Dark mode' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSlider factory returns React element', () => {
      const el = registry.NSlider({ props: { min: 0, max: 100 }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NTextarea factory returns React element', () => {
      const el = registry.NTextarea({ props: { placeholder: 'Type...' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NTooltip factory returns React element', () => {
      const el = registry.NTooltip({
        props: { content: 'Tip' },
        onAction: vi.fn(),
        children: React.createElement('span', null, 'Hover me'),
      })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NScrollArea factory returns React element', () => {
      const el = registry.NScrollArea({ props: {}, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NAspectRatio factory returns React element', () => {
      const el = registry.NAspectRatio({ props: { ratio: 16 / 9 }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NCollapsible factory returns React element', () => {
      const el = registry.NCollapsible({ props: { title: 'More' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NPagination factory returns React element', () => {
      const el = registry.NPagination({ props: { totalPages: 10, currentPage: 1 }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    // Components that need datasets/items
    it('NDataTable factory returns React element', () => {
      const el = registry.NDataTable({ props: { columns: [], data: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NAccordion factory returns React element', () => {
      const el = registry.NAccordion({ props: { items: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NResizable factory returns React element', () => {
      const el = registry.NResizable({ props: {}, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    // P1 containers
    it('NDialog factory returns React element', () => {
      const el = registry.NDialog({ props: { title: 'Edit' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NAlertDialog factory returns React element', () => {
      const el = registry.NAlertDialog({ props: { title: 'Confirm' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSheet factory returns React element', () => {
      const el = registry.NSheet({ props: { title: 'Panel' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NDrawer factory returns React element', () => {
      const el = registry.NDrawer({ props: { title: 'Drawer' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NTabs factory returns React element', () => {
      const el = registry.NTabs({ props: { tabs: [{ id: 't1', label: 'Tab 1' }] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NBreadcrumb factory returns React element', () => {
      const el = registry.NBreadcrumb({ props: { items: [{ label: 'Home' }] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSidebar factory returns React element', () => {
      const el = registry.NSidebar({ props: { title: 'Nav' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    // P2 form
    it('NInputGroup factory returns React element', () => {
      const el = registry.NInputGroup({ props: { label: 'Group' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NCombobox factory returns React element', () => {
      const el = registry.NCombobox({ props: { options: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NSelect factory returns React element', () => {
      const el = registry.NSelect({ props: { options: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NRadioGroup factory returns React element', () => {
      const el = registry.NRadioGroup({ props: { options: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NDatePicker factory returns React element', () => {
      const el = registry.NDatePicker({ props: {}, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NInputOTP factory returns React element', () => {
      const el = registry.NInputOTP({ props: { length: 6 }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NField factory returns React element', () => {
      const el = registry.NField({ props: { label: 'Field' }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    // P3 display
    it('NCalendar factory returns React element', () => {
      const el = registry.NCalendar({ props: {}, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NCarousel factory returns React element', () => {
      const el = registry.NCarousel({ props: { items: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NDropdownMenu factory returns React element', () => {
      const el = registry.NDropdownMenu({ props: { items: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NContextMenu factory returns React element', () => {
      const el = registry.NContextMenu({ props: { items: [] }, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NHoverCard factory returns React element', () => {
      const el = registry.NHoverCard({ props: {}, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NChart factory returns React element', () => {
      const el = registry.NChart({ props: { type: 'bar', data: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    // P4 auxiliary
    it('NToast factory returns React element', () => {
      const el = registry.NToast({ props: { title: 'Done' }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NToggleGroup factory returns React element', () => {
      const el = registry.NToggleGroup({ props: { items: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NPopover factory returns React element', () => {
      const el = registry.NPopover({ props: {}, onAction: vi.fn(), children: React.createElement('div') })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NCommand factory returns React element', () => {
      const el = registry.NCommand({ props: { items: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NMenubar factory returns React element', () => {
      const el = registry.NMenubar({ props: { menus: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })

    it('NNavigationMenu factory returns React element', () => {
      const el = registry.NNavigationMenu({ props: { items: [] }, onAction: vi.fn() })
      expect(React.isValidElement(el)).toBe(true)
    })
  })
})
