import { useState, useEffect, useRef, useCallback } from 'react'

const MODES = {
  work:  { label: '專注',  duration: 25 * 60, color: '#e05c3a' },
  short: { label: '短休息', duration:  5 * 60, color: '#3a8f6f' },
  long:  { label: '長休息', duration: 15 * 60, color: '#3a6bbf' },
}
const SESSIONS_BEFORE_LONG = 4

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function App() {
  const [mode, setMode]           = useState('work')
  const [timeLeft, setTimeLeft]   = useState(MODES.work.duration)
  const [running, setRunning]     = useState(false)
  const [sessions, setSessions]   = useState(0)
  const [completed, setCompleted] = useState(0)
  const [cfg, setCfg]             = useState({ work: 25, short: 5, long: 15 })
  const [showSettings, setShowSettings] = useState(false)
  const timerRef = useRef(null)

  const getTotal = useCallback(
    (m = mode) => (m === 'work' ? cfg.work : m === 'short' ? cfg.short : cfg.long) * 60,
    [cfg, mode]
  )

  const switchMode = useCallback(
    (next) => {
      clearInterval(timerRef.current)
      setMode(next)
      setTimeLeft(getTotal(next))
      setRunning(false)
    },
    [getTotal]
  )

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ;[0, 0.15, 0.3].forEach((d) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = 880; o.type = 'sine'
        g.gain.setValueAtTime(0.4, ctx.currentTime + d)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.3)
        o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.35)
      })
    } catch {}
  }

  const handleComplete = useCallback(() => {
    beep()
    if (mode === 'work') {
      setSessions((s) => {
        const next = s + 1
        switchMode(next % SESSIONS_BEFORE_LONG === 0 ? 'long' : 'short')
        return next
      })
      setCompleted((c) => c + 1)
    } else {
      switchMode('work')
    }
  }, [mode, switchMode])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current); handleComplete(); return 0 }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [running, handleComplete])

  const reset = () => {
    clearInterval(timerRef.current)
    setRunning(false)
    setTimeLeft(getTotal())
  }

  const accent  = MODES[mode].color
  const total   = getTotal()
  const radius  = 110
  const circ    = 2 * Math.PI * radius
  const offset  = circ * (timeLeft / total)

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Mono', monospace; background: #1a1410; min-height: 100vh;
           display: flex; align-items: center; justify-content: center; }
    .app { width: 340px; background: #221c16; border-radius: 24px; padding: 28px 24px 24px;
           box-shadow: 0 32px 80px rgba(0,0,0,.6); position: relative; overflow: hidden; }
    .glow { position: absolute; top: -60px; right: -60px; width: 200px; height: 200px;
            border-radius: 50%; pointer-events: none; transition: background .6s; }
    .header { display: flex; justify-content: space-between; align-items: center;
               margin-bottom: 20px; position: relative; z-index: 1; }
    .title { font-family: 'DM Serif Display', serif; font-size: 20px; color: #f0ebe3; }
    .icon-btn { background: none; border: none; cursor: pointer; color: #7a6f65;
                font-size: 18px; padding: 4px; transition: color .2s; }
    .icon-btn:hover { color: #f0ebe3; }
    .tabs { display: flex; gap: 5px; background: #1a1410; border-radius: 11px;
             padding: 4px; margin-bottom: 24px; }
    .tab { flex: 1; padding: 7px 4px; border: none; border-radius: 7px; background: transparent;
            color: #7a6f65; font-family: 'DM Mono', monospace; font-size: 11px; cursor: pointer;
            transition: all .2s; }
    .tab.active { color: #fff; }
    .ring-wrap { display: flex; justify-content: center; margin-bottom: 24px; position: relative; }
    .ring-svg { transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: #2e2620; stroke-width: 8; }
    .ring-fg { fill: none; stroke-width: 8; stroke-linecap: round;
               transition: stroke-dashoffset .95s linear, stroke .6s; }
    .ring-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                   text-align: center; }
    .time { font-family: 'DM Serif Display', serif; font-size: 48px; color: #f0ebe3;
            letter-spacing: -2px; line-height: 1; }
    .mode-lbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
                margin-top: 4px; transition: color .6s; }
    .controls { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
    .btn-main { padding: 13px 36px; border: none; border-radius: 50px; color: #fff;
                font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
                cursor: pointer; letter-spacing: 1px; transition: opacity .2s, transform .1s; }
    .btn-main:hover { opacity: .88; }
    .btn-main:active { transform: scale(.97); }
    .btn-reset { padding: 13px 18px; border: 1.5px solid #3a3028; border-radius: 50px;
                 background: transparent; color: #7a6f65; font-family: 'DM Mono', monospace;
                 font-size: 14px; cursor: pointer; transition: all .2s; }
    .btn-reset:hover { border-color: #7a6f65; color: #f0ebe3; }
    .dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #2e2620; transition: background .3s; }
    .stats { text-align: center; color: #7a6f65; font-size: 11px; letter-spacing: .5px; }
    .stats span { color: #f0ebe3; }
    .overlay { position: absolute; inset: 0; background: #221c16; border-radius: 24px;
               padding: 28px 24px; display: flex; flex-direction: column; gap: 18px; z-index: 10; }
    .overlay-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: #f0ebe3; }
    .row { display: flex; justify-content: space-between; align-items: center; }
    .row-label { color: #a09085; font-size: 12px; }
    .num-input { width: 60px; background: #1a1410; border: 1.5px solid #3a3028; border-radius: 8px;
                 color: #f0ebe3; font-family: 'DM Mono', monospace; font-size: 14px;
                 padding: 6px 8px; text-align: center; outline: none; transition: border-color .2s; }
    .num-input:focus { border-color: ${accent}; }
    .btn-close { margin-top: auto; padding: 12px; border: 1.5px solid #3a3028; border-radius: 12px;
                 background: transparent; color: #a09085; font-family: 'DM Mono', monospace;
                 font-size: 13px; cursor: pointer; transition: all .2s; }
    .btn-close:hover { border-color: #7a6f65; color: #f0ebe3; }
  `

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="glow" style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }} />

        {/* Settings overlay */}
        {showSettings && (
          <div className="overlay">
            <div className="overlay-title">設定</div>
            <div className="row">
              <span className="row-label">專注時間（分鐘）</span>
              <input className="num-input" type="number" min={1} max={60}
                value={cfg.work} onChange={(e) => setCfg((c) => ({ ...c, work: +e.target.value }))} />
            </div>
            <div className="row">
              <span className="row-label">短休息（分鐘）</span>
              <input className="num-input" type="number" min={1} max={30}
                value={cfg.short} onChange={(e) => setCfg((c) => ({ ...c, short: +e.target.value }))} />
            </div>
            <div className="row">
              <span className="row-label">長休息（分鐘）</span>
              <input className="num-input" type="number" min={1} max={30}
                value={cfg.long} onChange={(e) => setCfg((c) => ({ ...c, long: +e.target.value }))} />
            </div>
            <button className="btn-close" onClick={() => { setShowSettings(false); reset() }}>
              儲存並關閉
            </button>
          </div>
        )}

        <div className="header">
          <div className="title">🍅 番茄鐘</div>
          <button className="icon-btn" onClick={() => setShowSettings(true)}>⚙</button>
        </div>

        <div className="tabs">
          {Object.entries(MODES).map(([key, val]) => (
            <button key={key}
              className={`tab ${mode === key ? 'active' : ''}`}
              style={mode === key ? { background: accent } : {}}
              onClick={() => switchMode(key)}>
              {val.label}
            </button>
          ))}
        </div>

        <div className="ring-wrap">
          <svg className="ring-svg" width="240" height="240" viewBox="0 0 240 240">
            <circle className="ring-bg" cx="120" cy="120" r={radius} />
            <circle className="ring-fg" cx="120" cy="120" r={radius}
              stroke={accent}
              strokeDasharray={circ}
              strokeDashoffset={circ - offset} />
          </svg>
          <div className="ring-center">
            <div className="time">{fmt(timeLeft)}</div>
            <div className="mode-lbl" style={{ color: accent }}>{MODES[mode].label}</div>
          </div>
        </div>

        <div className="controls">
          <button className="btn-main" style={{ background: accent }}
            onClick={() => setRunning((r) => !r)}>
            {running ? '暫停' : '開始'}
          </button>
          <button className="btn-reset" onClick={reset}>↺</button>
        </div>

        <div className="dots">
          {Array.from({ length: SESSIONS_BEFORE_LONG }).map((_, i) => (
            <div key={i} className="dot"
              style={{ background: i < sessions % SESSIONS_BEFORE_LONG ? accent : '#2e2620' }} />
          ))}
        </div>

        <div className="stats">
          今日完成 <span>{completed}</span> 個番茄 · 第 <span>{Math.floor(sessions / SESSIONS_BEFORE_LONG) + 1}</span> 輪
        </div>
      </div>
    </>
  )
}
