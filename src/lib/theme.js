// Light and dark mode. With nothing saved the site follows the device
// setting. Choosing a mode saves it and sets <html data-theme="...">, which
// styles/tokens.css reads. index.html applies the saved choice before the
// page paints so there is no flash.
const KEY = 'clearcare-theme'

export function currentTheme() {
  const chosen = document.documentElement.dataset.theme
  if (chosen) return chosen
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* storage unavailable: the choice lasts for this visit */
  }
}
