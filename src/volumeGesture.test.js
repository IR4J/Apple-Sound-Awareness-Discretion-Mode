import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createVolumeGesture, moveVolumeGesture, PUSH_DISTANCE, ENVIRONMENT_THRESHOLDS } from './volumeGesture.js'

for (const [environment, threshold] of Object.entries(ENVIRONMENT_THRESHOLDS)) {
  test(`${environment}: volume follows the pointer below the environment boundary`, () => {
    const gesture = createVolumeGesture(24, threshold)
    assert.deepEqual(moveVolumeGesture(gesture, threshold - 5, 120), { value: threshold - 5, resistance: 0, blocked: false })
  })

  test(`${environment}: clicking above the boundary cannot bypass resistance`, () => {
    for (const target of [threshold + 1, threshold + 8, 100]) {
      const gesture = createVolumeGesture(24, threshold)
      assert.deepEqual(moveVolumeGesture(gesture, target, 200), { value: threshold, resistance: 0, blocked: true })
    }
  })

  test(`${environment}: the bar stretches until the deliberate push completes`, () => {
    const gesture = createVolumeGesture(24, threshold)
    moveVolumeGesture(gesture, threshold + 2, 200)
    assert.deepEqual(moveVolumeGesture(gesture, threshold + 8, 200 + PUSH_DISTANCE / 2), { value: threshold, resistance: 0.5, blocked: true })
    assert.deepEqual(moveVolumeGesture(gesture, threshold + 15, 200 + PUSH_DISTANCE), { value: threshold + 15, resistance: 0, blocked: false })
    assert.equal(moveVolumeGesture(gesture, 100, 280).value, 100)
  })

  test(`${environment}: returning below the boundary rearms it during the same drag`, () => {
    const gesture = createVolumeGesture(threshold + 15, threshold)
    assert.equal(moveVolumeGesture(gesture, threshold + 10, 200).value, threshold + 10)
    assert.equal(moveVolumeGesture(gesture, threshold - 5, 170).value, threshold - 5)
    assert.equal(moveVolumeGesture(gesture, threshold + 15, 220).value, threshold)
  })

  test(`${environment}: releasing a blocked drag requires a fresh push next time`, () => {
    const first = createVolumeGesture(24, threshold)
    moveVolumeGesture(first, threshold + 8, 200)
    moveVolumeGesture(first, threshold + 10, 212)
    const next = createVolumeGesture(threshold, threshold)
    assert.deepEqual(moveVolumeGesture(next, 100, 230), { value: threshold, resistance: 0, blocked: true })
  })

  test(`${environment}: pen pressure offers an equivalent deliberate push`, () => {
    const gesture = createVolumeGesture(threshold, threshold)
    assert.equal(moveVolumeGesture(gesture, threshold + 8, 200, 0.5).value, threshold)
    assert.equal(moveVolumeGesture(gesture, threshold + 8, 200, 0.8).value, threshold + 8)
  })

  test(`${environment}: dragging outside the track stays within the valid range`, () => {
    const gesture = createVolumeGesture(95, threshold)
    assert.equal(moveVolumeGesture(gesture, 130, 350).value, 100)
    assert.equal(moveVolumeGesture(gesture, -20, -30).value, 0)
  })
}

test('the same volume movement meets resistance in the library before NYC', () => {
  const target = (ENVIRONMENT_THRESHOLDS.nyc + ENVIRONMENT_THRESHOLDS.library) / 2
  const city = moveVolumeGesture(createVolumeGesture(24, ENVIRONMENT_THRESHOLDS.nyc), target, 200)
  const library = moveVolumeGesture(createVolumeGesture(24, ENVIRONMENT_THRESHOLDS.library), target, 200)
  assert.equal(city.value, target)
  assert.equal(city.blocked, false)
  assert.equal(library.value, ENVIRONMENT_THRESHOLDS.library)
  assert.equal(library.blocked, true)
})
