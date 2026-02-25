import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NAlertDialog } from './NAlertDialog'

describe('NAlertDialog', () => {
  it('renders with data-neuron-component attribute when open', () => {
    render(
      <NAlertDialog
        title="Confirm"
        description="Are you sure?"
        open
      />,
    )
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('data-neuron-component', 'NAlertDialog')
  })

  it('renders title text when open', () => {
    render(
      <NAlertDialog
        title="Delete Item"
        description="This action cannot be undone."
        open
      />,
    )
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
  })

  it('renders description text when open', () => {
    render(
      <NAlertDialog
        title="Confirm"
        description="This will permanently delete the item."
        open
      />,
    )
    expect(
      screen.getByText('This will permanently delete the item.'),
    ).toBeInTheDocument()
  })

  it('renders default button labels', () => {
    render(
      <NAlertDialog title="Confirm" description="Are you sure?" open />,
    )
    expect(screen.getByText('Continue')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders custom button labels', () => {
    render(
      <NAlertDialog
        title="Confirm"
        description="Are you sure?"
        confirmLabel="Delete"
        cancelLabel="Go Back"
        open
      />,
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })
})
