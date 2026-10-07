import { site } from '../config/site'

// The two overlapping circles on their own. Also used for map pins and
// empty screens.
export function LogoMark({ width = 46 }) {
  return (
    <svg viewBox="2 10 60 44" width={width} height={(width * 44) / 60} aria-hidden="true">
      <circle cx="24" cy="32" r="20" fill="var(--moss)" />
      <circle cx="40" cy="32" r="20" fill="var(--marigold)" />
      <path d="M32 13.670a20 20 0 0 1 0 36.660a20 20 0 0 1 0-36.660z" fill="var(--paper)" />
      <path d="M30 25h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="var(--moss)" />
    </svg>
  )
}

// Two overlapping circles, owners and veterinarians, with a clear space
// where they meet. The same artwork is in public/favicon.svg.
export default function Logo() {
  // Colour one part of the name, e.g. the "Care" in "ClearCare Vet".
  const [before, after] = site.highlight && site.name.includes(site.highlight)
    ? site.name.split(site.highlight)
    : [site.name, null]

  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-name">
        {before}{after != null && <><span className="logo-highlight">{site.highlight}</span>{after}</>}
      </span>
    </span>
  )
}
