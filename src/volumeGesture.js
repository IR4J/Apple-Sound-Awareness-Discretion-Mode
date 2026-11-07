export const ENVIRONMENT_THRESHOLDS = { nyc: 80, library: 45 }
export const PUSH_DISTANCE = 24

const clamp = (value) => Math.max(0, Math.min(100, value))

export function createVolumeGesture(volume, threshold) {
  return { unlocked: volume > threshold, contactX: null, threshold }
}

// Extra travel, rather than device-specific force sensing, makes the liquid
// barrier work with a mouse, a trackpad, a finger, and a pressure-sensitive pen.
export function moveVolumeGesture(gesture, rawVolume, clientX, pressure = 0) {
  const requested = clamp(rawVolume)
  const { threshold } = gesture
  if (requested <= threshold) {
    gesture.unlocked = false
    gesture.contactX = null
    return { value: requested, resistance: 0, blocked: false }
  }
  if (gesture.unlocked) {
    return { value: requested, resistance: 0, blocked: false }
  }

  gesture.contactX ??= clientX
  const resistance = Math.max(0, Math.min(1, (clientX - gesture.contactX) / PUSH_DISTANCE))
  if (resistance >= 1 || pressure > 0.75) {
    gesture.unlocked = true
    return { value: requested, resistance: 0, blocked: false }
  }
  return { value: threshold, resistance, blocked: true }
}
