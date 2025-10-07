// src/__tests__/env.test.jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

function Hello() {
  return <h1>TaskFlow Frontend Ready</h1>;
}

test('顯示 smoke 標題', () => {
  render(<Hello />);
  expect(screen.getByText(/TaskFlow Frontend Ready/i)).toBeInTheDocument();
});
