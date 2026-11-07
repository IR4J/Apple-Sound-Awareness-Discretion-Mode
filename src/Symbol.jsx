// Masks retain Apple's exported SF Symbol silhouettes while inheriting color.
export default function Symbol({ name, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`sf-symbol ${className}`}
      style={{ '--symbol-url': `url('/symbols/${name}.png')` }}
    />
  )
}
