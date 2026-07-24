// Proves the Vitest setup works end to end: plain assertions, jsdom rendering,
// and the jest-dom matchers are all wired up.

import { render, screen } from '@testing-library/react';

describe('test harness', () => {
  it('runs assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders React into jsdom and exposes jest-dom matchers', () => {
    render(<p>ready</p>);
    expect(screen.getByText('ready')).toBeInTheDocument();
  });
});
