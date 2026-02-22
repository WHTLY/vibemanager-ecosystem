import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App.jsx';

const mockData = {
  lastUpdated: '2025-01-15T12:00:00.000Z',
  projects: [
    { id: 'P1', name: 'Proj One', health: 'GREEN', department: 'Eng', blockers: [], statusText: '', next: '' },
    { id: 'P2', name: 'Proj Two', health: 'RED', department: 'Eng', blockers: [{ id: 'b1', title: 'Blocker' }], statusText: '', next: '' },
  ],
};

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    })));
  });

  it('shows loading then projects and filter by health', async () => {
    render(<App />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
    await screen.findByText('Proj One');
    expect(screen.getByText('Proj Two')).toBeInTheDocument();
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();

    const criticalBtn = screen.getByRole('button', { name: /Critical/ });
    fireEvent.click(criticalBtn);
    expect(screen.getByText('Proj Two')).toBeInTheDocument();
    expect(screen.queryByText('Proj One')).not.toBeInTheDocument();

    const healthyBtn = screen.getByRole('button', { name: /Healthy/ });
    fireEvent.click(healthyBtn);
    expect(screen.getByText('Proj One')).toBeInTheDocument();
    expect(screen.queryByText('Proj Two')).not.toBeInTheDocument();
  });
});
