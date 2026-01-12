/**
 * @chunk 3.02 - ComponentCard Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Simplify icon rendering
vi.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: () => () => null,
    }
  )
})

vi.mock('../../src/services/componentService', () => {
  return {
    componentService: {
      publishComponent: vi.fn(() => Promise.resolve()),
      unpublishComponent: vi.fn(() => Promise.resolve()),
      archiveComponent: vi.fn(() => Promise.resolve()),
      unarchiveComponent: vi.fn(() => Promise.resolve()),
      duplicateComponent: vi.fn(() => Promise.resolve({ id: 'new-id', name: 'Copy' })),
      deleteComponent: vi.fn(() => Promise.resolve(true)),
      getImageUrl: vi.fn(() => null),
    },
  }
})

import { componentService } from '../../src/services/componentService'
import ComponentCard from '../../src/components/components/ComponentCard'

describe('ComponentCard', () => {
  const baseComponent = {
    id: 'comp-1',
    name: 'Button',
    description: 'A button',
    category: 'buttons',
    status: 'draft',
    variants: [],
    component_images: [],
  }

  const onRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Unarchive action for archived components and calls service', async () => {
    render(
      <MemoryRouter>
        <ComponentCard component={{ ...baseComponent, status: 'archived' }} onRefresh={onRefresh} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByLabelText('Component actions'))
    fireEvent.click(screen.getByText('Unarchive'))

    await waitFor(() => {
      expect(componentService.unarchiveComponent).toHaveBeenCalledWith('comp-1')
    })
    expect(onRefresh).toHaveBeenCalled()
  })

  it('shows Unpublish action for published components and calls service', async () => {
    render(
      <MemoryRouter>
        <ComponentCard component={{ ...baseComponent, status: 'published' }} onRefresh={onRefresh} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByLabelText('Component actions'))
    fireEvent.click(screen.getByText('Unpublish'))

    await waitFor(() => {
      expect(componentService.unpublishComponent).toHaveBeenCalledWith('comp-1')
    })
    expect(onRefresh).toHaveBeenCalled()
  })
})




