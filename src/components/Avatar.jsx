// A round photo, or the person's initials when there is no photo.
export default function Avatar({ name, photo, size = 72 }) {
  const initials = name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const style = { width: size, height: size, fontSize: size * 0.36 }

  return photo
    ? <img className="avatar" src={photo} alt={`Photo of ${name}`} style={style} />
    : <span className="avatar is-initials" style={style} aria-hidden="true">{initials}</span>
}
