import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = {
  needRefresh: false,
  offlineReady: false,
  updateServiceWorker: vi.fn(),
};

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => {
    const [needRefresh, setNeedRefresh] = useState(state.needRefresh);
    const [offlineReady, setOfflineReady] = useState(state.offlineReady);
    return {
      needRefresh: [needRefresh, setNeedRefresh],
      offlineReady: [offlineReady, setOfflineReady],
      updateServiceWorker: state.updateServiceWorker,
    };
  },
}));

import { PwaUpdate } from './PwaUpdate';

beforeEach(() => {
  state.needRefresh = false;
  state.offlineReady = false;
  state.updateServiceWorker.mockReset();
});

describe('PwaUpdate', () => {
  it('renders nothing when neither state is active', () => {
    const { container } = render(<PwaUpdate />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the reload prompt when a new version is available', async () => {
    state.needRefresh = true;
    const user = userEvent.setup();
    render(<PwaUpdate />);

    expect(screen.getByRole('status')).toHaveTextContent(/new version is available/i);
    await user.click(screen.getByRole('button', { name: /reload/i }));
    expect(state.updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('announces offline readiness and lets the user dismiss it', async () => {
    state.offlineReady = true;
    const user = userEvent.setup();
    render(<PwaUpdate />);

    expect(screen.getByRole('status')).toHaveTextContent(/ready to work offline/i);
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('has no accessibility violations while showing the reload prompt', async () => {
    state.needRefresh = true;
    const { container } = render(<PwaUpdate />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
