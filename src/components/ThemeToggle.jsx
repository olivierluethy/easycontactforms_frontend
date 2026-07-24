// Light/dark switch for the top bar.

import { useTheme } from '../theme/ThemeProvider.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const goingTo = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${goingTo} mode`}
      title={`Switch to ${goingTo} mode`}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
