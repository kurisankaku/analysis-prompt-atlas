// tests/react-smoke.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function Hello() { return <p>検索準備OK</p>; }

describe('react toolchain', () => {
  it('renders a component in jsdom', () => {
    render(<Hello />);
    expect(screen.getByText('検索準備OK')).toBeTruthy();
  });
});
