import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export default function usePlaybackClock({ initialTime, duration, isPlaying, isSeeking }) {
  const [currentTime, updateTimeLabel] = useState(initialTime)
  const time = useRef(initialTime)
  const displayedSecond = useRef(Math.floor(initialTime))
  const progressFillRef = useRef(null)

  const paintProgress = useCallback((seconds) => {
    if (progressFillRef.current) {
      progressFillRef.current.style.transform = `scaleX(${seconds / duration})`
    }
  }, [duration])

  const setCurrentTime = useCallback((next) => {
    const requested = typeof next === 'function' ? next(time.current) : next
    time.current = Math.max(0, Math.min(duration, requested))
    displayedSecond.current = Math.floor(time.current)
    paintProgress(time.current)
    updateTimeLabel(time.current)
  }, [duration, paintProgress])

  useLayoutEffect(() => {
    paintProgress(time.current)
  }, [paintProgress])

  useEffect(() => {
    if (!isPlaying || isSeeking) return
    let frame
    let previous = performance.now()

    function tick(now) {
      // Real elapsed time keeps playback steady across different refresh rates.
      const elapsed = Math.max(0, now - previous) / 1000
      previous = now
      time.current = (time.current + elapsed) % duration
      paintProgress(time.current)

      // Only the bar needs frame updates; the rest of the UI updates each second.
      const second = Math.floor(time.current)
      if (second !== displayedSecond.current) {
        displayedSecond.current = second
        updateTimeLabel(time.current)
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, isPlaying, isSeeking, paintProgress])

  return { currentTime, setCurrentTime, progressFillRef }
}
