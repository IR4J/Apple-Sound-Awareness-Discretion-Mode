import { useLayoutEffect, useRef, useState } from 'react'
import './App.css'
import Symbol from './Symbol'
import VolumeControl from './VolumeControl'
import usePlaybackClock from './usePlaybackClock'
import { ENVIRONMENT_THRESHOLDS } from './volumeGesture'

const TOTAL_DURATION = 218 // 0:41 + 2:57 = 3:38 (218 seconds)

const ENVIRONMENTS = [
  {
    id: 'nyc',
    name: 'New York City',
    description:
      'Louder background sounds make the threshold higher, giving you more room before your audio can be heard nearby.',
  },
  {
    id: 'library',
    name: 'Library',
    description:
      'Quieter background sounds make the threshold lower, lowering notfication will sound earlier so your audio stays private.',
  },
]

function EnvironmentControlItem({ scene, isExpanded, onSelect }) {
  const buttonRef = useRef(null)
  const contentRef = useRef(null)
  const [bounds, setBounds] = useState(null)

  useLayoutEffect(() => {
    function measure() {
      if (!buttonRef.current || !contentRef.current) return
      setBounds({
        collapsedWidth: buttonRef.current.offsetWidth,
        collapsedHeight: buttonRef.current.offsetHeight,
        expandedWidth: contentRef.current.offsetWidth,
        expandedHeight: contentRef.current.offsetHeight,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (buttonRef.current) observer.observe(buttonRef.current)
    if (contentRef.current) observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [])

  const style = bounds
    ? {
      width: `${isExpanded ? bounds.expandedWidth : bounds.collapsedWidth}px`,
      height: `${isExpanded ? bounds.expandedHeight : bounds.collapsedHeight}px`,
    }
    : undefined

  return (
    <div className={`control-item ${isExpanded ? 'expanded' : ''}`} style={style}>
      <div className="control-item-bg-container">
        <span className="control-item-bg" />
      </div>
      <button
        ref={buttonRef}
        type="button"
        id={`env-item-${scene.id}-button`}
        className="control-item-open"
        aria-expanded={isExpanded}
        onClick={onSelect}
      >
        <span className="control-item-label">
          <svg className="plus-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11.3" style={{ stroke: 'currentColor', fill: 'none' }} />
            <g transform="translate(7 7)" style={{ stroke: 'none', fill: 'currentColor' }}>
              <path d="m9 4h-3v-3c0-0.553-0.447-1-1-1s-1 0.447-1 1v3h-3c-0.553 0-1 0.447-1 1s0.447 1 1 1h3v3c0 0.553 0.447 1 1 1s1-0.447 1-1v-3h3c0.553 0 1-0.447 1-1s-0.447-1-1-1" />
            </g>
          </svg>
          {scene.name}
        </span>
      </button>
      <div
        tabIndex={-1}
        className="control-item-content"
        aria-hidden={!isExpanded}
        aria-labelledby={`env-item-${scene.id}-button`}
      >
        <div className="control-item-content-mask">
          <div ref={contentRef} className="control-item-content-inner">
            <p className="control-item-body">
              <strong className="control-item-title">{scene.name}.</strong> {scene.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
// ll
function App() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(24) // Starts around ~24% like the screenshot
  const [isFavorite, setIsFavorite] = useState(false)
  const [environment, setEnvironment] = useState('nyc')
  const [discretionEnabled, setDiscretionEnabled] = useState(true)
  const [isSeeking, setIsSeeking] = useState(false)
  const { currentTime, setCurrentTime, progressFillRef } = usePlaybackClock({
    initialTime: 41,
    duration: TOTAL_DURATION,
    isPlaying,
    isSeeking,
  })

  const remainingTime = TOTAL_DURATION - Math.floor(currentTime)

  return (
    <div className="app-wrapper">
      {/* Screen 1: "Talk about communication skills." */}
      <section className="communication-page">
        <div className="communication-skills-section">
          <h1 className="communication-headline">
            Talk about communication skills.
          </h1>

          <div className="subsection-anc-features">
            {/* Column 1: Live Translation */}
            <div className="subsection-anc-detail">
              <div className="icon-container">
                <svg viewBox="0 0 75 75" xmlns="http://www.w3.org/2000/svg">
                  <path d="m0 0h75v75h-75z" fill="none" />
                  <path
                    d="m23.1836 43h6.8164v3h-6.5366l-8.2583 6.5703c-.3789.2861-.8101.4287-1.2383.4287-.2979 0-.5938-.0693-.8706-.207-.6763-.3369-1.0962-1.0176-1.0962-1.7744v-5.0176h-1.3013c-4.2451 0-7.6987-3.583-7.6987-7.8604v-14.3828c0-4.2773 3.4536-7.7568 7.6987-7.7568h23.6025c3.9915 0 7.2815 3.0767 7.6606 7h-1.2632c-.6003 0-1.1851.0623-1.7588.1582-.2944-2.3384-2.2505-4.1582-4.6387-4.1582h-23.6024c-2.5908 0-4.6987 2.1338-4.6987 4.7568v14.3828c0 2.623 2.1079 4.8604 4.6987 4.8604h2.0859c1.2217 0 2.2153.9971 2.2153 2.2227v3.6572l6.7935-5.3877c.3936-.3174.8867-.4922 1.3901-.4922zm29.2668-.0337c1.1323-1.2549 1.9514-2.6479 2.4565-4.1787h-5.0051c.5356 1.5464 1.385 2.9387 2.5486 4.1787zm19.5496-9.2095v14.3828c0 4.2773-3.4536 7.7568-7.6987 7.7568h-1.3013v5.1211c0 .7568-.4199 1.4365-1.0967 1.7744-.2808.1396-.5825.209-.8823.209-.4194 0-.8354-.1348-1.1865-.3994l-8.2983-6.7051h-10.8374c-4.2451 0-7.6987-3.4795-7.6987-7.7568v-14.3828c0-3.6885 4-7.7568 7.6987-7.7568h23.6025c4.2451 0 7.6987 3.4795 7.6987 7.7568zm-22.3706-1.7568c.0244.1118.0366.2227.0886.3359l1.1023 2.3188c.168.3525.4321.5896.792.7119.3591.1228.7075.1147 1.0447-.0229.3674-.1838.6157-.4553.7461-.8152.1296-.3591.1182-.7151-.0344-1.0676l-.7305-1.4609-.4175-.835c-.1836-.3674-.4517-.6233-.8037-.7693-.3523-.1453-.7117-.1182-1.0791.0803-.3369.1689-.5664.429-.6887.7808-.085.2439-.0745.4922-.0198.7432zm4.8184 12.6653c1.5762-1.699 2.6553-3.658 3.2373-5.8777h1.6992c.4131 0 .7534-.1265 1.0215-.3789.2676-.2524.4019-.5774.4019-.9758 0-.3821-.1343-.7002-.4019-.9529-.2681-.2524-.6084-.3787-1.0215-.3787h-13.9595c-.3984 0-.7314.1262-.9988.3787-.2681.2527-.4019.5708-.4019.9529 0 .3984.1338.7234.4019.9758.2673.2524.6003.3789.9988.3789h1.7219c.5813 2.1892 1.6604 4.1482 3.2373 5.8777-.7659.5051-1.5769.9412-2.4338 1.3086-.8574.3674-1.7908.6658-2.801.8955-.3984.0769-.6968.2834-.8953.6199-.1992.3369-.2527.7043-.1609 1.1021.1067.3984.3364.6814.6887.8496.3521.1687.7578.1917 1.217.0688 1.1628-.26 2.2844-.6431 3.3635-1.1479 1.0791-.5051 2.1084-1.1169 3.0881-1.8369.9331.7349 1.9285 1.3472 2.9846 1.8369 1.0562.4902 2.1272.865 3.2144 1.125.4897.1228.9258.1074 1.3088-.0459.3821-.1528.6272-.4438.7346-.8726.1223-.4133.0952-.7808-.0803-1.1021-.1763-.3215-.4861-.52-.9299-.5969-.9954-.2297-1.9253-.5242-2.7896-.884-.865-.3591-1.6802-.7996-2.4453-1.3201zm-29.9895-21.6736 5.4092 14.4241c.1375.3499.168.6836.0918 1.0027-.0769.3188-.2373.5776-.4814.7747-.2446.1978-.5581.2961-.9397.2961-.7334 0-1.2229-.4102-1.4668-1.2305l-1.4211-3.9419h-6.5095l-1.4209 3.9419c-.2603.8203-.749 1.2305-1.467 1.2305-.3821 0-.6956-.0984-.9397-.2961-.2446-.197-.4053-.4558-.4814-.7747-.0767-.3191-.0537-.6528.0688-1.0027l5.3862-14.4241c.3972-.9871 1.1003-1.481 2.1089-1.481.9929 0 1.6807.4939 2.0627 1.481zm.3438 8.887-2.4407-6.8567.0571-.1616h-.1147l.0576.1616-2.4185 6.8567h4.8591z"
                    fill="#1d1d1f"
                  />
                </svg>
              </div>
              <div className="subsection-copy-block">
                <h3 className="inline-headline">
                  Live Translation<sup className="footnote-number">3</sup> powered
                  by Apple Intelligence.{' '}
                </h3>
                <p>
                  With Live Translation, communicating with people speaking
                  different languages has never been easier. After a simple press
                  and hold of the listening mode button, AirPods Max 2 translates
                  the language the person is speaking into your preferred language.
                </p>
              </div>
            </div>

            {/* Column 2: Conversation Awareness */}
            <div className="subsection-anc-detail">
              <div className="icon-container">
                <svg viewBox="0 0 58 75" xmlns="http://www.w3.org/2000/svg">
                  <path d="m0 0h58v75h-58z" fill="none" />
                  <path
                    d="m38.3438 61h-31.6876c-4.125 0-6.2158-1.5605-6.2158-4.6377 0-7.6499 8.8633-15.8403 22.0586-15.8403s22.0605 8.1904 22.0605 15.8403c0 3.0771-2.0908 4.6377-6.2158 4.6377zm-15.8438-24.5681c-6.028 0-10.75-5.082-10.75-11.5698 0-6.2275 4.822-11.2939 10.75-11.2939s10.75 5.0664 10.75 11.2939c0 6.4878-4.722 11.5698-10.75 11.5698zm19.0966.1426c3.1318-3.0933 4.8574-7.2217 4.8574-11.624 0-4.3442-1.6855-8.4336-4.7461-11.5142-.6436-.647-1.6865-.6489-2.334-.0078-.6465.6421-.6494 1.6865-.0078 2.3335 2.4424 2.458 3.7871 5.7217 3.7871 9.1885 0 3.5132-1.376 6.8076-3.875 9.2764-.6484.6401-.6553 1.6851-.0146 2.3335.3223.3267.748.4902 1.1738.4902.4189 0 .8379-.1582 1.1592-.4761zm8.0791 7.2359c4.9014-5.0874 7.6016-11.7803 7.6016-18.8462 0-7.0273-2.6738-13.6934-7.5293-18.7705-.6299-.6582-1.6719-.6807-2.333-.0518-.6582.6299-.6816 1.6743-.0518 2.3325 4.2646 4.46 6.6133 10.3164 6.6133 16.4897 0 6.2075-2.3711 12.0874-6.6777 16.5562-.6318.6562-.6123 1.7007.0439 2.333.3193.3086.7324.4619 1.1445.4619.4326 0 .8643-.1689 1.1885-.5049z"
                    fill="#1d1d1f"
                  />
                </svg>
              </div>
              <div className="subsection-copy-block">
                <h3 className="inline-headline">
                  Conversation Awareness.<sup className="footnote-number">4</sup>{' '}
                </h3>
                <p>
                  When you start speaking, Conversation Awareness automatically
                  lowers the volume of what you’re listening to and amplifies the
                  voices in front of you — helping you stay connected and making
                  conversations feel natural. And when you’re done talking, your
                  music seamlessly returns to its previous volume.
                </p>
              </div>
            </div>

            {/* Column 3: Loud Sound Reduction and Personalized Volume */}
            <div className="subsection-anc-detail">
              <div className="icon-container">
                <svg viewBox="0 0 63 75" xmlns="http://www.w3.org/2000/svg">
                  <path d="m0 0h63v75h-63z" fill="none" />
                  <path
                    d="m35.972 52.0448c-1.1152.7043-2.1206 1.4974-3 2.3579v-34.599c0-.8281.6714-1.5 1.5-1.5s1.5.6719 1.5 1.5zm-9.5-28.0448c-.8286 0-1.5.6719-1.5 1.5v24c0 .8281.6714 1.5 1.5 1.5s1.5-.6719 1.5-1.5v-24c0-.8281-.6714-1.5-1.5-1.5zm-8-13h.02c-.8286 0-1.5205.6719-1.52 1.501v50c.0005.8281.7104 1.499 1.5386 1.499h-.0386c.8286 0 1.5005-.6719 1.5-1.501v-50c-.0005-.8281-.6719-1.499-1.5-1.499zm-7.9986 10.8574c-.8281 0-1.5015.6719-1.5015 1.5v28.2852c0 .8281.6714 1.5 1.5 1.5.8281 0 1.5-.6719 1.5-1.5v-28.2852c0-.8281-.6699-1.5-1.4985-1.5zm-8.0014 9.1787c-.8281 0-1.5.6719-1.5 1.5v10.9277c0 .8281.6709 1.5361 1.4995 1.5361.8281 0 1.5005-.708 1.5005-1.5361v-10.9277c0-.8281-.6714-1.5-1.5-1.5zm44.8867 20.6482c-9.5798 0-15.5332 6.5756-15.5332 11.3313 0 1.4125 1.1069 2.3002 2.8608 2.3002h25.3372c1.7271 0 2.8406-.8877 2.8406-2.3002 0-4.7557-5.9397-11.3313-15.5054-11.3313zm.01-3.1667c4.0215 0 7.3289-3.5453 7.3289-8.14 0-4.39-3.3469-7.8953-7.3289-7.8953-3.9761 0-7.3223 3.5332-7.3223 7.9373 0 4.5527 3.3074 8.098 7.3223 8.098z"
                    fill="#1d1d1f"
                  />
                </svg>
              </div>
              <div className="subsection-copy-block">
                <h3 className="inline-headline">
                  Discretion Mode. A little more awareness.{' '}
                </h3>
                <p>
                  Stay in your music, and in the moment. A gentle pause adapts
                  to your surroundings, making turning it up a conscious choice.
                  Keep pushing to move through the resistance. Try it below,
                  from the city to the library.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 2: Scroll-Animated iPhone 18 Pro Music Player */}
      <section className={`music-showcase-section environment-${environment}`} id="demo" aria-label="Discretion Mode interactive demo">
        <div className="environment-backdrop" aria-hidden="true">
          <div className={`environment-photo photo-nyc ${environment === 'nyc' ? 'is-visible' : ''}`} />
          <div className={`environment-photo photo-library ${environment === 'library' ? 'is-visible' : ''}`} />
        </div>
        <div className="demo-stage-layout">
          <aside className="environment-panel" aria-label="Demo settings">
            <div className="environment-options" role="group" aria-label="Choose environment">
              {ENVIRONMENTS.map((scene) => (
                <EnvironmentControlItem
                  key={scene.id}
                  scene={scene}
                  isExpanded={environment === scene.id}
                  onSelect={() => setEnvironment(scene.id)}
                />
              ))}
            </div>
            <div className="mode-setting-pill">
              <span>Discretion Mode</span>
              <button
                type="button"
                role="switch"
                aria-checked={discretionEnabled}
                aria-label="Discretion Mode"
                className={`mode-switch ${discretionEnabled ? 'is-on' : ''}`}
                onClick={() => setDiscretionEnabled((enabled) => !enabled)}
              >
                <span />
              </button>
            </div>
          </aside>
          <div className="iphone-stage">
            {/* iPhone Screen Interior */}
            <div className="iphone-screen">
              {/* Slowly Moving Animated Mesh Gradient Background */}
              <div className="animated-gradient-bg">
                <div className="gradient-blob blob-1" />
                <div className="gradient-blob blob-2" />
                <div className="gradient-blob blob-3" />
                <div className="gradient-blob blob-4" />
              </div>

              {/* iOS Status Bar */}
              {/* <div className="ios-status-bar">
                <div className="status-left"> */}
              {/* <span className="status-time">5:40</span> */}
              {/* Crescent Moon Focus Icon */}
              {/* <svg className="status-moon" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.2 1.2a6.9 6.9 0 0 0 8.6 8.6 6.8 6.8 0 0 1-6.5 4.8A6.9 6.9 0 0 1 1.4 7.7c0-3 1.9-5.6 4.8-6.5z" />
                  </svg> */}
              {/* </div>

                <div className="status-right"> */}
              {/* Cellular Bars */}
              {/* <svg className="status-signal" viewBox="0 0 18 12" fill="currentColor">
                    <rect x="0.5" y="7.5" width="2.8" height="4.5" rx="1" />
                    <rect x="4.8" y="5.5" width="2.8" height="6.5" rx="1" />
                    <rect x="9.1" y="3" width="2.8" height="9" rx="1" opacity="0.38" />
                    <rect x="13.4" y="0.5" width="2.8" height="11.5" rx="1" opacity="0.38" />
                  </svg> */}
              {/* Wi-Fi */}
              {/* <svg className="status-wifi" viewBox="0 0 16 12" fill="currentColor">
                    <path d="M8 9.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm-3.1-2a4.5 4.5 0 0 1 6.2 0l1.2-1.3a6.3 6.3 0 0 0-8.6 0l1.2 1.3zm-2.6-2.7a8.2 8.2 0 0 1 11.4 0L15 3.6a10 10 0 0 0-14 0l1.3 1.3z" />
                  </svg> */}
              {/* Green Charging Battery */}
              {/* <div className="status-battery">
                    <div className="battery-body">
                      <div className="battery-fill" />
                      <svg className="battery-bolt" viewBox="0 0 10 14" fill="#fff">
                        <path d="M6.2 0L0.8 7.6h3.8L3.8 14l5.4-7.6H5.4L6.2 0z" />
                      </svg>
                    </div>
                    <div className="battery-cap" />
                  </div>
                </div>
              </div> */}

              {/* Dismiss Sheet Grabber Pill */}
              <div className="sheet-grabber-wrap">
                <div className="sheet-grabber" />
              </div>

              {/* Album Artwork */}
              <div className={`album-art-container ${isPlaying ? 'playing' : 'paused'}`}>
                <img
                  src="/imgs/album-art.png"
                  alt="My Ashes Blow Away — Pearly Drops"
                  className="album-art-img"
                />
              </div>

              {/* Track Info & Action Icons */}
              <div className="track-header-row">
                <div className="track-titles">
                  <h2 className="track-name">My Ashes Blow Away</h2>
                  <p className="track-artist">Pearly Drops</p>
                </div>
                <div className="track-actions">
                  <button
                    type="button"
                    className={`track-icon-btn ${isFavorite ? 'favorited' : ''}`}
                    onClick={() => setIsFavorite((f) => !f)}
                    aria-label="Favorite song"
                    aria-pressed={isFavorite}
                  >
                    <Symbol name={isFavorite ? 'star.fill' : 'star'} />
                  </button>
                  <button type="button" className="track-icon-btn" aria-label="More options">
                    <Symbol name="ellipsis" />
                  </button>
                </div>
              </div>

              {/* Interactive Song Progress Scrubber */}
              <div className="scrubber-section">
                <div className={`slider-track-wrapper ${isSeeking ? 'is-dragging' : ''}`}>
                  <div className="slider-track">
                    <div
                      ref={progressFillRef}
                      className="slider-fill playback-fill"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={TOTAL_DURATION}
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="range-overlay-input"
                    aria-label="Song progress"
                    aria-valuetext={`${formatTime(currentTime)} of ${formatTime(TOTAL_DURATION)}`}
                    onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setIsSeeking(true) }}
                    onPointerUp={() => setIsSeeking(false)}
                    onPointerCancel={() => setIsSeeking(false)}
                    onLostPointerCapture={() => setIsSeeking(false)}
                  />
                </div>

                <div className="scrubber-meta-row">
                  <span className="time-label">{formatTime(currentTime)}</span>
                  <span className="lossless-badge">
                    <Symbol name="waveform.path" className="lossless-icon" />
                    Lossless
                  </span>
                  <span className="time-label">-{formatTime(remainingTime)}</span>
                </div>
              </div>

              {/* Playback Controls (Rewind, Play/Pause, Fast Forward) */}
              <div className="transport-controls">
                <button
                  type="button"
                  className="transport-btn secondary"
                  onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
                  aria-label="Previous / Rewind 10 seconds"
                >
                  <Symbol name="backward.fill" />
                </button>

                <button
                  type="button"
                  className="transport-btn primary-play-pause"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <Symbol name={isPlaying ? 'pause.fill' : 'play.fill'} />
                </button>

                <button
                  type="button"
                  className="transport-btn secondary"
                  onClick={() => setCurrentTime((t) => Math.min(TOTAL_DURATION, t + 10))}
                  aria-label="Next / Fast-forward 10 seconds"
                >
                  <Symbol name="forward.fill" />
                </button>
              </div>

              <VolumeControl key={`${environment}-${discretionEnabled}`} value={volume} onChange={setVolume}
                discretionEnabled={discretionEnabled} threshold={ENVIRONMENT_THRESHOLDS[environment]} />

              {/* Bottom Utility Row (Lyrics, AirPlay, Queue) */}
              <div className="bottom-utility-row">
                <button type="button" className="utility-btn" aria-label="Lyrics">
                  <Symbol name="quote.bubble" />
                </button>

                <button type="button" className="utility-btn" aria-label="AirPods">
                  <Symbol name="airpods.pro" />
                </button>

                <button type="button" className="utility-btn" aria-label="Up Next Queue">
                  <Symbol name="list.bullet" />
                </button>
              </div>
              <div className="home-indicator" aria-hidden="true" />
            </div>

            {/* iPhone 18 Pro Hardware Bezel Overlay */}
            <img
              src="/imgs/iphone-bezel.png"
              alt=""
              aria-hidden="true"
              className="iphone-bezel-overlay"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
