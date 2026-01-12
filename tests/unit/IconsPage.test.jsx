/**
 * IconsPage Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../src/services/iconService', () => ({
  iconService: {
    getIcons: vi.fn(),
    deleteIcon: vi.fn(),
    bulkDelete: vi.fn(),
    createIcon: vi.fn(),
    importFromUrl: vi.fn(),
  },
}));

import IconsPage from '../../src/pages/IconsPage';
import { iconService } from '../../src/services/iconService';

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>);

describe('IconsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    iconService.getIcons.mockResolvedValue([
      {
        id: 'i1',
        name: 'Arrow Right',
        slug: 'arrow-right',
        style: 'outline',
        svg_text: '<svg viewBox="0 0 24 24"><path d=""/></svg>',
      },
      {
        id: 'i2',
        name: 'Arrow Left',
        slug: 'arrow-left',
        style: 'outline',
        svg_text: '<svg viewBox="0 0 24 24"><path d=""/></svg>',
      },
    ]);
    iconService.bulkDelete.mockResolvedValue(true);
    iconService.deleteIcon.mockResolvedValue(true);
  });

  it('renders the Icons page header and actions', async () => {
    renderWithRouter(<IconsPage />);

    expect(screen.getByText('Icon Library')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();

    // Wait for icons to load
    expect(await screen.findByText('Arrow Right')).toBeInTheDocument();
  });

  it('visually selects icons when clicked and enables bulk delete', async () => {
    const { container } = renderWithRouter(<IconsPage />);
    await screen.findByText('Arrow Right');

    const arrowRightCard = screen.getByText('Arrow Right').closest('.icon-card');
    expect(arrowRightCard).toBeInTheDocument();

    fireEvent.click(arrowRightCard);

    await waitFor(() => {
      expect(container.querySelector('.icon-card--selected')).toBeInTheDocument();
    });

    expect(screen.getByText(/Delete \(1\)/)).toBeInTheDocument();
  });

  it('bulk delete calls iconService.bulkDelete with selected ids', async () => {
    renderWithRouter(<IconsPage />);
    await screen.findByText('Arrow Right');

    // Select 2 icons
    fireEvent.click(screen.getByText('Arrow Right').closest('.icon-card'));
    fireEvent.click(screen.getByText('Arrow Left').closest('.icon-card'));

    // Confirm bulk delete
    vi.stubGlobal('confirm', vi.fn(() => true));

    fireEvent.click(screen.getByText(/Delete \(2\)/));

    await waitFor(() => {
      expect(iconService.bulkDelete).toHaveBeenCalledWith(['i1', 'i2']);
    });

    vi.unstubAllGlobals();
  });

  it('Import modal shows Icons8 as coming soon (not a dead-end flow)', async () => {
    renderWithRouter(<IconsPage />);
    await screen.findByText('Arrow Right');

    fireEvent.click(screen.getByText('Import'));

    expect(await screen.findByText('Import Icon')).toBeInTheDocument();
    expect(screen.getByText('Icons8 (Coming Soon)')).toBeInTheDocument();
    expect(screen.getByText('Icons8 integration is coming soon')).toBeInTheDocument();
  });
});


