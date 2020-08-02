import ConfigStore from 'app/stores/configStore';

function changeFavicon(theme: 'dark' | 'light'): void {
  const n = document.querySelector<HTMLLinkElement>('[rel="icon"][type="image/png"]');
  if (!n) {
    return;
  }

  const path = n.href.split('/sentry/')[0];
  n.href = `${path}/sentry/images/${theme === 'dark' ? 'favicon-dark' : 'favicon'}.png`;
}

export function prefersDark(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function handleColorSchemeChange(e: MediaQueryListEvent): void {
  const isDark = e.media === '(prefers-color-scheme: dark)' && e.matches;
  const type = isDark ? 'dark' : 'light';
  changeFavicon(type);
  ConfigStore.set('theme', type);
}

export function setupFavicon(): void {
  // Set favicon to dark on load
  if (prefersDark()) {
    changeFavicon('dark');
    ConfigStore.set('theme', 'dark');
  }

  // Watch for changes in preferred color scheme
  window.matchMedia('(prefers-color-scheme: light)').addListener(handleColorSchemeChange);
  window.matchMedia('(prefers-color-scheme: dark)').addListener(handleColorSchemeChange);
}
