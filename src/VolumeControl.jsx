import { useRef, useState } from 'react'
import Symbol from './Symbol'
import { createVolumeGesture, moveVolumeGesture } from './volumeGesture'

export default function VolumeControl({ value, onChange, discretionEnabled, threshold }) {
  const gesture = useRef(null)
  const stepArmed = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [resistance, setResistance] = useState(0)
  const [stepHint, setStepHint] = useState(false)
  const aboveThreshold = discretionEnabled && value > threshold

  function movePointer(event) {
    if (!gesture.current) return
    const { left, width } = event.currentTarget.getBoundingClientRect()
    const raw = ((event.clientX - left) / width) * 100
    const next = discretionEnabled
      ? moveVolumeGesture(gesture.current, raw, event.clientX, event.pointerType === 'pen' ? event.pressure : 0)
      : { value: Math.max(0, Math.min(100, raw)), resistance: 0, blocked: false }
    onChange(Math.round(next.value))
    setBlocked(next.blocked)
    setResistance(next.resistance)
    stepArmed.current = false
    setStepHint(false)
  }

  function beginPointer(event) {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    gesture.current = createVolumeGesture(value, threshold)
    setDragging(true)
    movePointer(event)
  }

  function endPointer(event) {
    if (!gesture.current) return
    gesture.current = null
    setDragging(false)
    setBlocked(false)
    setResistance(0)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function requestStep(next) {
    next = Math.max(0, Math.min(100, next))
    if (discretionEnabled && value <= threshold && next > threshold) {
      if (value === threshold && stepArmed.current) {
        onChange(next)
        stepArmed.current = false
        setStepHint(false)
      } else {
        onChange(threshold)
        stepArmed.current = true
        setStepHint(true)
      }
    } else {
      onChange(next)
      stepArmed.current = false
      setStepHint(false)
    }
  }

  function keyDown(event) {
    const changes = { ArrowRight: 2, ArrowUp: 2, ArrowLeft: -2, ArrowDown: -2, PageUp: 10, PageDown: -10 }
    if (!(event.key in changes) && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    // A held key cannot accidentally dismiss the threshold; press again.
    if (event.repeat && stepArmed.current) return
    requestStep(event.key === 'Home' ? 0 : event.key === 'End' ? 100 : value + changes[event.key])
  }

  const message = blocked ? 'Keep pushing to continue'
    : stepHint ? 'Press again to continue' : ''

  return (
    <div className={`volume-control ${aboveThreshold ? 'above-threshold' : ''} ${blocked ? 'at-barrier' : ''}`}>
      <div className="volume-row">
        <button type="button" className="volume-icon-btn" onClick={() => requestStep(value - 8)} aria-label="Decrease volume">
          <Symbol name="speaker.fill" />
        </button>
        <div
          className={`slider-track-wrapper volume-slider-wrapper ${dragging ? 'is-dragging' : ''}`}
          style={{ '--threshold': `${threshold}%`, '--strain': resistance, '--warmth': aboveThreshold ? (value - threshold) / (100 - threshold) : 0 }}
        >
          <div className="slider-track">
            <div className="slider-fill volume-fill" style={{ width: `${value}%` }}>
              <div className="volume-warm-fill" />
            </div>
          </div>
          <span className="liquid-meniscus" />
          <input
            type="range" min="0" max="100" step="1" value={value}
            aria-label="Volume" aria-valuetext={`${value} percent${aboveThreshold ? ', above discretion level' : ''}`}
            aria-describedby="volume-hint" className="range-overlay-input"
            onChange={(event) => { if (!gesture.current) requestStep(Number(event.target.value)) }}
            onKeyDown={keyDown} onPointerDown={beginPointer} onPointerMove={movePointer}
            onPointerUp={endPointer} onPointerCancel={endPointer} onLostPointerCapture={endPointer}
          />
        </div>
        <button type="button" className="volume-icon-btn" onClick={() => requestStep(value + 8)} aria-label="Increase volume">
          <Symbol name="speaker.wave.3.fill" />
        </button>
      </div>
      <span id="volume-hint" className="sr-only" role="status">{message}</span>
    </div>
  )
}
