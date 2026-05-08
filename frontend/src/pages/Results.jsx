import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import styles from './Results.module.css'
import { sendChatStream } from '../utils/api';
/* ─── Constants ─────────────────────────────────────────────── */
const CATEGORY_ICONS = {
  programming: '</>',
  libraries: '☰',
  analyst_tools: '◈',
  cloud: '☁',
  databases: '◫',
  webframeworks: '◻',
  other: '◎',
  os: '⊞',
}
const BAR_COLORS = {
  skill_match:   '#5b8dee',
  profile_match: '#9b6ddf',
  trend_score:   '#4caf82',
  market_share:  '#f0943a',
}
const BAR_TOOLTIPS = {
  ru: {
    skill_match:   'Насколько ваши технические навыки соответствуют требованиям профессии',
    profile_match: 'Насколько ваш профиль подходит для этого карьерного пути',
    trend_score:   'Тренд рыночного спроса на данную профессию',
    market_share:  'Доля рынка вакансий, занимаемая этой профессией',
  },
  en: {
    skill_match:   'How well your technical skills match the profession requirements',
    profile_match: 'How your overall profile fits this career path',
    trend_score:   'Market demand trend for this profession',
    market_share:  'Vacancy market share occupied by this profession',
  },
}

const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

const ChevronIcon = ({ dir = 'left' }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    {dir === 'left'  && <path d="M15 18l-6-6 6-6"/>}
    {dir === 'right' && <path d="M9 18l6-6-6-6"/>}
    {dir === 'down'  && <path d="M6 9l6 6 6-6"/>}
    {dir === 'up'    && <path d="M18 15l-6-6-6 6"/>}
  </svg>
)

/* ─── Copy Icon ──────────────────────────────────────────────── */
const CopyIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)
const CheckIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/* ─── Progress Ring ──────────────────────────────────────────── */
function ProgressRing({ value, size = 64, stroke = 5, color = '#5b8dee', animKey }) {
  const [progress, setProgress] = useState(0)
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = Math.round(value * 100)

  useEffect(() => {
    setProgress(0)
    const t = setTimeout(() => setProgress(pct), 80)
    return () => clearTimeout(t)
  }, [pct, animKey])

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - circ * progress / 100}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size < 60 ? '0.65rem' : '0.78rem',
        fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)',
      }}>{pct}%</div>
    </div>
  )
}

/* ─── Animated Bar ───────────────────────────────────────────── */
function AnimatedBar({ value, max = 1, color, animKey, tooltipText }) {
  const [width, setWidth] = useState(0)
  const pct = Math.round(value / max * 100)
  useEffect(() => {
    setWidth(0)
    const raf = requestAnimationFrame(() => {
      const t = setTimeout(() => setWidth(pct), 30)
      return () => clearTimeout(t)
    })
    return () => cancelAnimationFrame(raf)
  }, [pct, animKey])

  return (
    <div className={styles.barWrap}>
      <div className={`${styles.bar} ${tooltipText ? styles.barTooltipWrap : ''}`} data-tip={tooltipText}>
        <div className={styles.barFill} style={{ width: `${width}%`, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}/>
      </div>
      <span className={styles.barPct}>{pct}%</span>
    </div>
  )
}

/* ─── Radar Chart (4 axes: profession metrics) ─────────────────── */
function RadarChart({ data, animKey, lang }) {
  const RADAR_TOOLTIPS = {
    ru: { skill_match: 'Навыки', profile_match: 'Профиль', trend_score: 'Тренд', market_share: 'Рынок' },
    en: { skill_match: 'Skills', profile_match: 'Profile', trend_score: 'Trend', market_share: 'Market' },
  }
  const tips = RADAR_TOOLTIPS[lang] || RADAR_TOOLTIPS.en

  const axes = [
    { key: 'skill_match',   label: tips.skill_match,   color: '#5b8dee' },
    { key: 'profile_match', label: tips.profile_match, color: '#9b6ddf' },
    { key: 'trend_score',   label: tips.trend_score,   color: '#4caf82' },
    { key: 'market_share',  label: tips.market_share,  color: '#f0943a' },
  ]

  const [tooltip, setTooltip] = useState(null)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    setOpacity(0)
    const t = setTimeout(() => setOpacity(1), 60)
    return () => clearTimeout(t)
  }, [animKey])

  const size   = 300
  const cx     = size / 2
  const cy     = size / 2
  const r      = 100
  const n      = axes.length
  const levels = [0.25, 0.5, 0.75, 1.0]
  const angleOf = i => (Math.PI * 2 * i / n) - Math.PI / 2
  const pt = (i, ratio) => ({
    x: cx + r * ratio * Math.cos(angleOf(i)),
    y: cy + r * ratio * Math.sin(angleOf(i)),
  })

  const rings = levels.map(lvl =>
    axes.map((_, i) => pt(i, lvl))
      .map((p, j) => (j === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ') + ' Z'
  )

  const radarData = {
    skill_match:   Math.min(parseFloat(data.skill_match   ?? 0), 1),
    profile_match: Math.min(parseFloat(data.profile_match ?? 0), 1),
    trend_score:   Math.min(parseFloat(data.trend_score   ?? 0), 1),
    market_share:  Math.min(parseFloat(data.market_share  ?? 0) / 100, 1),
  }

  const polyPoints = axes.map((ax, i) => pt(i, radarData[ax.key] || 0))
  const polyPath   = polyPoints
    .map((p, j) => (j === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ') + ' Z'

  const labelPt = i => pt(i, 1.45)

  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`-36 -36 ${size + 72} ${size + 72}`}
        style={{ opacity, transition: 'opacity 0.5s ease', display: 'block' }}>
        {levels.map((lvl, i) => (
          <text key={i} x={cx + 4} y={cy - r * lvl - 4}
            fontSize="8" fill="var(--text-3)" fontFamily="var(--font-mono)" opacity="0.7">
            {Math.round(lvl * 100)}
          </text>
        ))}
        {rings.map((d, i) => (
          <path key={i} d={d} fill="none"
            stroke={i === levels.length - 1 ? 'var(--border-hover)' : 'var(--border)'}
            strokeWidth={i === levels.length - 1 ? 1.5 : 1}/>
        ))}
        {axes.map((_, i) => {
          const end = pt(i, 1)
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="var(--border)" strokeWidth="1"/>
        })}
        <path d={polyPath} fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="2.5"/>
        {polyPoints.map((p, i) => {
          const val = Math.round(radarData[axes[i].key] * 100)
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill={axes[i].color} stroke="var(--bg)" strokeWidth="2"/>
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" stroke="none"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, label: tips[axes[i].key], val, color: axes[i].color })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          )
        })}
        {axes.map((ax, i) => {
          const lp = labelPt(i)
          return (
            <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fill="var(--text-2)" fontFamily="var(--font-mono)" fontWeight="600">
              {ax.label}
            </text>
          )
        })}
      </svg>
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 44, top: tooltip.y + 20,
          background: 'var(--surface)', border: `1px solid ${tooltip.color}40`,
          borderRadius: '6px', padding: '5px 10px', fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)', color: 'var(--text)',
          pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <span style={{ color: tooltip.color, fontWeight: 700 }}>{tooltip.val}%</span> {tooltip.label}
        </div>
      )}
    </div>
  )
}
const SKILL_IMPLIES = {

    "react.js":         ["javascript"],
    "next.js":          ["javascript"],
    "vue.js":           ["javascript"],
    "nuxt.js":          ["javascript"],
    "angular":          ["typescript"],   
    "angular.js":       ["javascript"],
    "ember.js":         ["javascript"],
    "svelte":           ["javascript"],
    "gatsby":           ["javascript"],
    "express":          ["javascript"],
    "node.js":          ["javascript"],
    "deno":             ["typescript"],
    "fastify":          ["javascript"],

    "django":           ["python"],
    "flask":            ["python"],
    "fastapi":          ["python"],
    "scikit-learn":     ["python"],
    "tensorflow":       ["python"],
    "pytorch":          ["python"],
    "keras":            ["python"],
    "pandas":           ["python"],
    "numpy":            ["python"],
    "matplotlib":       ["python"],
    "seaborn":          ["python"],
    "plotly":           ["python"],
    "airflow":          ["python"],
    "pyspark":          ["python"],
    "nltk":             ["python"],
    "opencv":           ["python"],
    "hugging face":     ["python"],
    "selenium":         ["python"],
    "jupyter":          ["python"],

    "ruby on rails":    ["ruby"],
    "sinatra":          ["ruby"],

    "laravel":          ["php"],
    "symfony":          ["php"],
    "drupal":           ["php"],

    "spring":           ["java"],
    "play framework":   ["java"],        

    "android":          ["kotlin"],

    "ios":             ["swift"],

    "asp.net":          ["c#"],
    "asp.net core":     ["c#"],
    "blazor":           ["c#"],
    "unity":            ["c#"],

    "akka":             ["scala"],

    "gin":              ["go"],
    "fiber":            ["go"],

    "actix":            ["rust"],
    "tokio":            ["rust"],

    "flutter":          ["dart"],

    "ggplot2":          ["r"],
    "dplyr":            ["r"],
    "tidyr":            ["r"],
    "tidyverse":        ["r"],
    "rshiny":           ["r"],
    "mlr":              ["r"],

    "phoenix":          ["elixir"],

    "luminus":          ["clojure"],

    "simulink":         ["matlab"],

    "dax":              ["sql"],        

    "ionic":            ["typescript"],
    "capacitor":        ["typescript"],
    "cordova":          ["javascript"],
    "xamarin":          ["c#"],
    "react native":     ["javascript"],

    "ansible":          ["yaml"],
    "terraform":        ["hcl"],
    "puppet":           ["ruby"],
    "chef":             ["ruby"],
    "jenkins":          ["groovy"],
}

function SkillGapRadar({ results, formData, animKey, lang }) {
  const [tooltip, setTooltip] = useState(null)
  const [opacity, setOpacity]  = useState(0)
  console.log('=== GAP RADAR formData ===', JSON.stringify(formData))
  useEffect(() => {
    setOpacity(0)
    const t = setTimeout(() => setOpacity(1), 60)
    return () => clearTimeout(t)
  }, [animKey])

  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const baseSkills = new Set(
    (formData?.skills || []).map(s =>
      norm(typeof s === 'string' ? s : s.label || s.value || s.name || '')
    )
  )
  // Normalized student skill set
  const studentNorm = new Set(baseSkills)
let changed = true
while (changed) {
  changed = false
  for (const [skill, implies] of Object.entries(SKILL_IMPLIES)) {
    if (studentNorm.has(skill)) {
      for (const implied of implies) {
        if (!studentNorm.has(implied)) {
          studentNorm.add(implied)
          changed = true
        }
      }
    }
  }
}

  const studentHas = (skillKey) => {
  if (studentNorm.has(skillKey)) return true

  const bare = s => s.replace(/[_\d]/g, '').trim()
  const bareKey = bare(skillKey)

  for (const sk of studentNorm) {
    const bareSk = bare(sk)
    if (!bareSk || bareSk.length < 3) continue
    if (
      bareKey === bareSk ||
      bareKey.includes(bareSk) ||
      bareSk.includes(bareKey) ||
      skillKey.split('_')[0] === sk.split('_')[0]
    ) return true
  }
  return false
}

  // Get full_roadmap from results - all profession skills
  const fullRoadmap = results?.full_roadmap || {}

  // Collect axes: up to 10 skills from full_roadmap
  const axes = []
  for (const [cat, skills] of Object.entries(fullRoadmap)) {
    for (const skill of skills) {
      const key = norm(skill)
      if (!axes.find(a => a.key === key)) {
        axes.push({ key, label: cap(skill), cat })
      }
      if (axes.length >= 10) break
    }
    if (axes.length >= 10) break
  }

  if (axes.length < 3) return null

  const n      = axes.length
  const size   = 300
  const cx     = size / 2
  const cy     = size / 2
  const r      = 100
  const levels = [0.25, 0.5, 0.75, 1.0]

  const angleOf = i => (Math.PI * 2 * i / n) - Math.PI / 2
  const pt = (i, ratio) => ({
    x: cx + r * ratio * Math.cos(angleOf(i)),
    y: cy + r * ratio * Math.sin(angleOf(i)),
  })

  const rings = levels.map(lvl =>
    axes.map((_, i) => pt(i, lvl))
      .map((p, j) => (j === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ') + ' Z'
  )

  // Benchmark = always 1.0 (entire full_roadmap)
  const idealPoints = axes.map((_, i) => pt(i, 1.0))
  const idealPath = idealPoints.map((p, j) => (j === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ') + ' Z'

  // Student = 1.0 if known, 0 if not
  const studentValues = axes.map(ax => studentHas(ax.key) ? 1.0 : 0.0)
  // Filter zero points - draw only where there is knowledge
  // For polygon we put zeros in center (0.04 so it doesnt collapse)
  const studentPoints = axes.map((_, i) => pt(i, Math.max(studentValues[i], 0.04)))
  const studentPath = studentPoints.map((p, j) => (j === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ') + ' Z'

  const labelPt = i => pt(i, 1.45)

  const knownCount = studentValues.filter(v => v === 1.0).length
  const totalCount = axes.length

  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>

      {/* Counter */}
      <div style={{
        marginBottom: 8, fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
        color: 'var(--text-2)',
      }}>
        <span style={{ color: '#4caf82', fontWeight: 700 }}>{knownCount}</span>
        {' / '}{totalCount}{' '}
        {lang === 'ru' ? 'навыков уже есть' : 'skills already known'}
      </div>

      <svg width={size} height={size} viewBox={`-40 -40 ${size + 80} ${size + 80}`}
        style={{ opacity, transition: 'opacity 0.5s ease', display: 'block' }}>

        {/* Grid */}
        {rings.map((d, i) => (
          <path key={i} d={d} fill="none"
            stroke={i === levels.length - 1 ? 'var(--border-hover)' : 'var(--border)'}
            strokeWidth={i === levels.length - 1 ? 1.5 : 1} />
        ))}
        {axes.map((_, i) => {
          const end = pt(i, 1)
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
            stroke="var(--border)" strokeWidth="1" />
        })}

        {/* Benchmark - full profession profile */}
        <path d={idealPath} fill="#4caf82" fillOpacity="0.08"
          stroke="#4caf82" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Student - only what is known */}
        <path d={studentPath} fill="#5b8dee" fillOpacity="0.25"
          stroke="#5b8dee" strokeWidth="2.5" />

        {/* Points on each axis */}
        {axes.map((ax, i) => {
          const has = studentValues[i] === 1.0
          const p = pt(i, 1.0)
          return (
            <g key={i}>
              {has && (
                <circle cx={p.x} cy={p.y} r={5}
                  fill="#5b8dee"
                  stroke="var(--bg)" strokeWidth={2} />
              )}
              {/* hover zone stays for all */}
              <circle cx={p.x} cy={p.y} r="14"
                fill="transparent" style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, label: ax.label, has })}
                onMouseLeave={() => setTooltip(null)} />
            </g>
          )
        })}

        {/* Axis labels - green if known, gray if not */}
        {axes.map((ax, i) => {
          const lp = labelPt(i)
          const has = studentValues[i] === 1.0
          return (
            <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fontFamily="var(--font-mono)" fontWeight="600"
              fill={has ? '#5b8dee' : 'var(--text-3)'}>
              {ax.label.length > 10 ? ax.label.slice(0, 9) + '…' : ax.label}
            </text>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${cx - 85}, ${size + 18})`}>
          <circle cx="5" cy="5" r="4" fill="#5b8dee" />  {/* ← was #4caf82, became blue */}
          <text x="14" y="9" fontSize="10" fill="var(--text-2)" fontFamily="var(--font-mono)">
            {lang === 'ru' ? 'Знаете' : 'You know'}
          </text>
        </g>
        <g transform={`translate(${cx + 20}, ${size + 18})`}>
          <circle cx="5" cy="5" r="4" fill="#4caf82" />
          <text x="14" y="9" fontSize="10" fill="var(--text-2)" fontFamily="var(--font-mono)">
            {lang === 'ru' ? 'Нужно изучить' : 'To learn'}
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 44, top: tooltip.y + 20,
          background: 'var(--surface)',
          border: `1px solid ${tooltip.has ? '#4caf8240' : '#f0943a40'}`,
          borderRadius: '6px', padding: '5px 10px',
          fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
          color: 'var(--text)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <span style={{ color: tooltip.has ? '#4caf82' : '#f0943a', fontWeight: 700 }}>
            {tooltip.has ? '✓' : '✗'}
          </span>{' '}{tooltip.label}
        </div>
      )}
    </div>
  )
}


/* ─── Metric Bars ────────────────────────────────────────────── */
function MetricBars({ data, rows, animKey, lang }) {
  const tips = BAR_TOOLTIPS[lang] || BAR_TOOLTIPS.en
  return (
    <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
      {rows.map(({ key, label, max }) => {
        if (data[key] == null) return null
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{label}</span>
            </div>
            <AnimatedBar value={parseFloat(data[key])} max={max} color={BAR_COLORS[key]}
              animKey={animKey} tooltipText={tips[key]}/>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Score Rows ─────────────────────────────────────────────── */
function ProfScores({ p, rows, animKey }) {
  return (
    <div className={styles.profScores}>
      {rows.map(({ key, label, max }) =>
        p[key] != null ? (
          <div key={key} className={styles.scoreRow}>
            <span className={styles.scoreLabel}>{label}</span>
            <AnimatedBar
              value={parseFloat(p[key])}
              max={max}
              color={BAR_COLORS[key]}
              animKey={animKey}
              tooltipText={BAR_TOOLTIPS[key]}
            />
          </div>
        ) : null
      )}
    </div>
  )
}

/* ─── Vacancy trend ──────────────────────────────────────────── */
function VacancyTrend({ value }) {
  if (!value) return null
  const color = value > 500 ? '#4caf82' : value > 100 ? '#f0943a' : '#9b6ddf'
  const arrow = value > 500 ? '↑' : value > 100 ? '→' : '↓'
  return (
    <span style={{ color, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginRight: 4 }}>{arrow}</span>
  )
}

/* ─── Helpers ────────────────────────────────────────────────── */
const copyText = (text) => {
  // Modern API - works only on HTTPS/localhost
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }

  // Fallback for HTTP / local network
  const el = document.createElement('textarea')
  el.value = text
  el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
  document.body.appendChild(el)
  el.focus()
  el.select()
  try {
    document.execCommand('copy')
  } catch (e) {
    console.warn('Copy failed', e)
  }
  document.body.removeChild(el)
}

function orderedRows(allRows, sortBy) {
  const idx = allRows.findIndex(r => r.sortKey === sortBy)
  if (idx <= 0) return allRows
  return [allRows[idx], ...allRows.slice(0, idx), ...allRows.slice(idx + 1)]
}

const stripMarkdown = text => text
  .replace(/#{1,6}\s/g, '')
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/\*(.+?)\*/g, '$1')
  .replace(/_{1,3}(.+?)_{1,3}/g, '$1')
  .replace(/- /gm, '\u2022 ')
  .replace(/\[(.+?)\]\(.+?\)/g, '$1')
  .replace(/`(.+?)`/g, '$1')
  .replace(/```[\s\S]*?```/g, '')
  .replace(/> /gm, '')
  .trim()

/* ─── Course description modal ───────────────────────────────── */
function CourseModal({ course, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalMeta}>
            <span className={styles.modalPlatform}>{course.platform}</span>
            {course.rating && (
              <span className={styles.modalRating}>★ {course.rating}</span>
            )}
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <h3 className={styles.modalTitle}>{course.title}</h3>
        {course.description ? (
          <p className={styles.modalDesc}>{course.description}</p>
        ) : (
          <p className={styles.modalDescEmpty}>No description available.</p>
        )}
        {course.url && (
          <a href={course.url} target="_blank" rel="noopener noreferrer" className={styles.modalLink}>
            Open course →
          </a>
        )}
      </div>
    </div>
  )
}

/* ─── Deep Mode Button ───────────────────────────────────────── */
function DeepModeBtn({ active, onClick, lang }) {
  return (
    <button
      className={`${styles.deepModeBtn} ${active ? styles.deepModeBtnActive : ''}`}
      onClick={onClick}
      title={active ? (lang === 'ru' ? 'Выключить расширенный анализ' : 'Disable deep analysis') : (lang === 'ru' ? 'Включить расширенный анализ' : 'Enable deep analysis')}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 21H9l-.3-5.9A7 7 0 0 1 5 9a7 7 0 0 1 7-7z"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
      </svg>
      <span>{lang === 'ru' ? 'Думать' : 'Thinking'}</span>
      {active && (
        <span className={styles.deepModePulse}/>
      )}
    </button>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Results({ results, formData, onBack, onNewAnalysis }) {
  const { t, lang } = useApp()

  const [tab,          setTab]          = useState('best')
  const [doneSkills, setDoneSkills] = useState(new Set())
  const [sortBy,       setSortBy]       = useState('score')
  const [selectedProf, setSelectedProf] = useState(null)
  const [viewMode,     setViewMode]     = useState('bars')
  const [messages,     setMessages]     = useState([])
  const [input,        setInput]        = useState('')
  const [chatLoading,  setChatLoading]  = useState(false)
  const [deepMode,     setDeepMode]     = useState(false)
  const [copied,       setCopied]       = useState(null)
  const [leftOpen,     setLeftOpen]     = useState(true)
  const [rightOpen,    setRightOpen]    = useState(true)
  const [pdfLoading,   setPdfLoading]   = useState(false)
  const [openCats,     setOpenCats]     = useState(new Set())
  const [cardKey,      setCardKey]      = useState(0)
  const [copiedMsg,    setCopiedMsg]    = useState(null)
  const [activeCourse, setActiveCourse] = useState(null)   // ← for course modal

  const messagesEndRef = useRef(null)
  const greetedRef     = useRef(false)
  const textareaRef    = useRef(null)
  const abortRef       = useRef(null)

  const top_profession = results.top_profession
  const rawRoadmap     = results.roadmap_with_courses

  const ALL_SCORE_ROWS = [
    { key: 'skill_match',   label: t.results.skillMatch,      sortKey: 'skill',   max: 1   },
    { key: 'profile_match', label: t.results.classification,  sortKey: 'profile', max: 1   },
    { key: 'trend_score',   label: t.results.trend,           sortKey: 'trend',   max: 1   },
    { key: 'market_share',  label: t.results.marketShare,     sortKey: 'market',  max: 100 },
  ]

  const SORT_OPTIONS = [
    { key: 'score',   label: t.results.sortOptions.score   },
    { key: 'skill',   label: t.results.sortOptions.skill   },
    { key: 'profile', label: t.results.sortOptions.profile },
    { key: 'trend',   label: t.results.sortOptions.trend   },
    { key: 'market',  label: t.results.sortOptions.market  },
  ]

  const tabs = [
    { key: 'best',    label: t.results.tabs.best    },
    { key: 'all',     label: t.results.tabs.all     },
    { key: 'roadmap', label: t.results.tabs.roadmap },
  ]

  const allProfessions = Object.entries(results.final_scores)
    .map(([name, final_score]) => ({
      name,
      final_score,
      skill_match:   results.skill_scores?.[name]    ?? 0,
      profile_match: results.classification_scores?.[name] ?? 0,
      trend_score:   results.demand_scores?.[name]?.trend_score   ?? 0,
      market_share:  results.demand_scores?.[name]?.market_share != null
        ? parseFloat(results.demand_scores[name].market_share * 100).toFixed(1)
        : null,
      vacancies_per_week: results.demand_scores?.[name]?.predicted_vacancies ?? null,
    }))

  const sorted = [...allProfessions].sort((a, b) => {
    if (sortBy === 'score')   return (b.final_score ?? 0)  - (a.final_score ?? 0)
    if (sortBy === 'skill')   return (b.skill_match ?? 0)  - (a.skill_match ?? 0)
    if (sortBy === 'profile') return (b.profile_match ?? 0)- (a.profile_match ?? 0)
    if (sortBy === 'trend')   return (b.trend_score ?? 0)  - (a.trend_score ?? 0)
    if (sortBy === 'market')  return parseFloat(b.market_share ?? 0) - parseFloat(a.market_share ?? 0)
    return 0
  })

  const activeProfName = selectedProf || top_profession
  const activeProf     = sorted.find(p => p.name === activeProfName) || sorted[0]

  const roadmapAdapted = Object.fromEntries(
    Object.entries(rawRoadmap).map(([cat, skills]) => [
      cat,
      Object.entries(skills).map(([skill, data]) => ({
        skill,
        courses: (data.courses || []).map(c => ({
          title:       c.title,
          platform:    c.platform,
          rating:      c.rating,
          reviews:     c.num_reviews ?? c.reviews ?? null,
          url:         c.course_url || null,
          description: c.description || c.short_intro || null,
        })),
      })),
    ])
  )

  const roadmapPreview = Object.entries(roadmapAdapted).map(([cat, skills]) => ({
    cat,
    skill: skills[0]?.skill ? cap(skills[0].skill) : '',
    count: skills.length,
  }))

  const toggleSkill = (cat, skillName) => {
  const key = `${cat}::${skillName}`
  setDoneSkills(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })
}
  useEffect(() => {
    setOpenCats(new Set(Object.keys(roadmapAdapted)))
  }, [top_profession])

  const toggleCat = cat => setOpenCats(prev => {
    const next = new Set(prev)
    next.has(cat) ? next.delete(cat) : next.add(cat)
    return next
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    const staticMsg = lang === 'en'
      ? `Your top match is ${top_profession}. Use the chat below to ask anything about your results, roadmap, or next steps.`
      : `Ваша лучшая профессия — ${top_profession}. Задайте вопрос о результатах, роадмапе или следующих шагах.`
    setMessages([{ role: 'assistant', content: staticMsg, streaming: false }])
  }, [])

  useEffect(() => { return () => abortRef.current?.abort() }, [])

  /* ─── Send message ─────────────────────────────────────────── */
  const sendMessage = async (overrideMsg) => {
    const msg = (overrideMsg ?? input).trim()
    if (!msg || chatLoading) return

    const userMsg         = { role: 'user', content: msg }
    const historySnapshot = [...messages, userMsg]

    setMessages(p => [...p, userMsg, { role: 'assistant', content: '', streaming: true }])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setChatLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller


    
    try {
          const response = await sendChatStream(
              {
                session_id: results.session_id,
                history: historySnapshot,
                message: msg,
                deep: deepMode,
                lang: lang,
              },
              controller.signal
            );

      if (!response.ok) throw new Error('Stream failed')

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let full     = ''
      let thoughts = ''
      let buffer   = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split(/(?=data:)/)
        buffer = (parts[parts.length - 1]?.endsWith('\n') || parts[parts.length - 1]?.includes('[DONE]'))
          ? ''
          : (parts.pop() ?? '')

        for (const part of parts) {
          const text = part.replace(/^data:\s*/, '').trim()
          if (!text || text === '[DONE]') continue

          try {
            const data = JSON.parse(text)
            if (data.type === 'thought') {
              thoughts += data.content
            } else if (data.content) {
              full += data.content
            }
          } catch {
            full += text
          }

          setMessages(p => {
            const updated = [...p]
            updated[updated.length - 1] = {
              role: 'assistant', content: stripMarkdown(full), thoughts, streaming: true,
            }
            return updated
          })
        }
      }

      setMessages(p => {
        const updated = [...p]
        updated[updated.length - 1] = {
          role: 'assistant', content: stripMarkdown(full) || t.errors.api, thoughts, streaming: false,
        }
        return updated
      })

    } catch (err) {
      if (err.name === 'AbortError') return
      setMessages(p => {
        const updated = [...p]
        updated[updated.length - 1] = {
          role: 'assistant', content: t.errors.api, thoughts: '', streaming: false,
        }
        return updated
      })
    } finally {
      setChatLoading(false)
    }
  }

  const handleSelectProf = name => {
    setSelectedProf(name)
    setTab('best')
    setCardKey(k => k + 1)
  }

  const handleCopyRoadmap = () => {
    const lines = []
    Object.entries(roadmapAdapted).forEach(([cat, skills]) => {
      lines.push(cat.toUpperCase())
      skills.forEach(s => {
        lines.push(`  - ${cap(s.skill)}`)
        s.courses.forEach(c => lines.push(`    ${c.title} (${c.platform})`))
      })
    })
    copyText(`Career Roadmap: ${top_profession}\n\n` + lines.join('\n'))
    setCopied('roadmap')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleShare = () => {
    const text = `My career match: ${top_profession} ${activeProf?.final_score ? Math.round(activeProf.final_score * 100) + '%' : ''} — Build Career`
    if (navigator.share) {
      navigator.share({ title: 'Build Career', text }).catch(() => {})
    } else {
      copyText(text)
      setCopied('share')
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleExportPdf = () => {
  setPdfLoading(true)
  const rows = orderedRows(ALL_SCORE_ROWS, 'score')

  // Remove garbage from strings
  const clean = str => String(str || '')
    .replace(/[★✓□◎*·•]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const scoreLines = rows
    .filter(r => activeProf?.[r.key] != null)
    .map(r => `<div class="score-row">
      <span class="score-label">${r.label}</span>
      <div class="score-bar-wrap">
        <div class="score-bar">
          <div class="score-fill" style="width:${Math.round(parseFloat(activeProf[r.key]) / r.max * 100)}%;background:${BAR_COLORS[r.key]}"></div>
        </div>
        <span class="score-pct">${Math.round(parseFloat(activeProf[r.key]) / r.max * 100)}%</span>
      </div>
    </div>`).join('')

  const skillWord = (n) => lang === 'ru'
    ? `${n} ${n === 1 ? 'навык' : n < 5 ? 'навыка' : 'навыков'}`
    : `${n} ${n === 1 ? 'skill' : 'skills'}`

  const roadmapSections = Object.entries(roadmapAdapted).map(([cat, skills]) =>
    `<div class="rm-section">
      <div class="rm-cat">
        <span>${cat.replace(/_/g, ' ').toUpperCase()}</span>
        <span class="rm-count">${skillWord(skills.length)}</span>
      </div>
      ${skills.map(s => `<div class="rm-skill">
        <span class="rm-check">□</span>
        <div class="rm-skill-body">
          <span class="rm-skill-name">${clean(cap(s.skill))}</span>
          ${s.courses.slice(0, 2).map(c => {
            const rating = c.rating && !isNaN(parseFloat(c.rating))
              ? `<span class="rm-rating">★ ${parseFloat(c.rating).toFixed(1)}</span>`
              : ''
            const reviews = c.reviews && Number(c.reviews) > 10
              ? `<span class="rm-reviews">${Number(c.reviews).toLocaleString()} ${lang === 'ru' ? 'отзывов' : 'reviews'}</span>`
              : ''
            return `<div class="rm-course">
              <span class="rm-platform">${clean(c.platform)}</span>
              <span class="rm-title">${clean(c.title)}</span>
              <span class="rm-meta">${rating}${reviews}</span>
            </div>`
          }).join('')}
        </div>
      </div>`).join('')}
    </div>`
  ).join('')


  // Username from formData
  const userName = formData?.name || formData?.fullName || ''
  const headerSub = userName
    ? `${lang === 'ru' ? 'для' : 'for'} ${userName} · ${new Date().toLocaleDateString()}`
    : new Date().toLocaleDateString()

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Career Roadmap: ${top_profession}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,Segoe UI,sans-serif;color:#1e1e1c;font-size:13px;line-height:1.5}
    .header{background:#5b8dee;color:white;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
    .header-title{font-size:15px;font-weight:700}
    .header-sub{font-size:11px;opacity:0.8}
    .body{padding:24px}
    .prof-name{font-size:22px;font-weight:800;letter-spacing:-0.03em;margin-bottom:4px}
    .prof-sub{font-size:12px;color:#888;margin-bottom:18px}
    .section-title{font-size:9px;font-weight:700;letter-spacing:0.1em;color:#999;text-transform:uppercase;font-family:monospace;margin-bottom:10px}
    .scores{margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #eee}
    .score-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
    .score-label{font-size:11px;color:#666;font-family:monospace;min-width:130px}
    .score-bar-wrap{flex:1;display:flex;align-items:center;gap:8px}
    .score-bar{flex:1;height:5px;background:#eee;border-radius:3px;overflow:hidden}
    .score-fill{height:100%;border-radius:3px}
    .score-pct{font-size:11px;font-family:monospace;color:#444;min-width:34px;text-align:right}
    .rm-section{margin-bottom:20px;break-inside:avoid}
    .rm-cat{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:monospace;color:#5b8dee;background:#f0f4ff;padding:5px 10px;border-radius:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
    .rm-count{font-weight:400;opacity:0.7;font-size:9px}
    .rm-skill{display:flex;gap:8px;margin-bottom:10px;padding-left:4px}
    .rm-check{font-size:12px;color:#bbb;margin-top:1px;flex-shrink:0;font-family:monospace}
    .rm-skill-body{flex:1}
    .rm-skill-name{font-size:13px;font-weight:600;display:block;margin-bottom:4px}
    .rm-course{display:flex;gap:8px;align-items:center;margin-top:3px}
    .rm-platform{font-size:10px;font-family:monospace;color:#aaa;min-width:48px;flex-shrink:0}
    .rm-title{font-size:11px;color:#555;flex:1}
    .rm-meta{display:flex;gap:6px;align-items:center;flex-shrink:0}
    .rm-rating{font-size:10px;color:#e8a045;font-family:monospace;white-space:nowrap}
    .rm-reviews{font-size:10px;color:#bbb;font-family:monospace;white-space:nowrap}
    .footer{margin-top:32px;padding-top:12px;border-top:1px solid #eee;font-size:10px;color:#bbb;font-family:monospace}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:12mm 14mm}}
  </style></head>
  <body>
    <div class="header">
      <span class="header-title">Build Career — Career Roadmap</span>
      <span class="header-sub">${headerSub}</span>
    </div>
    <div class="body">
      <div class="prof-name">${top_profession}</div>
      <div class="prof-sub">${lang === 'ru' ? 'Персональный план обучения на основе вашего профиля' : 'Personalized learning roadmap based on your profile'}</div>
      <div class="section-title">${lang === 'ru' ? 'Ваши показатели' : 'Your scores'}</div>
      <div class="scores">${scoreLines}</div>
      <div class="section-title">${lang === 'ru' ? 'План обучения' : 'Learning roadmap'}</div>
      ${roadmapSections}
      <div class="footer">Generated by Build Career · buildcareer.app</div>
    </div>
  </body></html>`

  const win = window.open('', '_blank', 'width=800,height=900')
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
  setPdfLoading(false)
}

  const layoutClass = [
    styles.layout,
    !leftOpen  ? styles.layoutLeftClosed  : '',
    !rightOpen ? styles.layoutRightClosed : '',
  ].filter(Boolean).join(' ')

  const animKey = `${activeProfName}${tab}${cardKey}`

  return (
    <div className={layoutClass}>
      {/* ─ LEFT TOGGLE ─ */}
      <button
        className={[styles.sidebarToggle, styles.sidebarToggleLeft, !leftOpen ? styles.sidebarToggleLeftClosed : ''].join(' ')}
        onClick={() => setLeftOpen(v => !v)}
        title={leftOpen ? t.results.collapseLeft : t.results.expandLeft}
      >
        <ChevronIcon dir={leftOpen ? 'left' : 'right'}/>
      </button>

      {/* ─ RIGHT TOGGLE ─ */}
      <button
        className={[styles.sidebarToggle, styles.sidebarToggleRight, !rightOpen ? styles.sidebarToggleRightClosed : ''].join(' ')}
        onClick={() => setRightOpen(v => !v)}
        title={rightOpen ? t.results.collapseRight : t.results.expandRight}
      >
        <ChevronIcon dir={rightOpen ? 'right' : 'left'}/>
      </button>

      {/* ─ LEFT SIDEBAR ─ */}
      <aside className={styles.sidebar}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.results.back}
        </button>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarLabel}>{t.results.sidebarLabels.recommendation}</div>
          <div className={styles.sidebarProfession}>{activeProfName}</div>
          {activeProf?.final_score != null && (
            <div style={{ marginTop: 8 }}>
              <ProgressRing value={activeProf.final_score} size={56} stroke={4} color="var(--accent)" animKey={animKey}/>
            </div>
          )}
        </div>

        {sorted.length > 1 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>{t.results.sidebarLabels.scores}</div>
            <div className={styles.sidebarScores}>
              {sorted.map(p => (
                <div key={p.name}
                  className={`${styles.sidebarScoreRow} ${p.name === activeProfName ? styles.sidebarScoreRowActive : ''}`}
                  onClick={() => handleSelectProf(p.name)}
                >
                  <span className={styles.sidebarScoreKey}>{p.name}</span>
                  <span className={styles.sidebarScoreVal}>
                    {typeof p.final_score === 'number' ? Math.round(p.final_score * 100) + '%' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {roadmapPreview.length > 0 && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>{t.results.sidebarLabels.roadmapOverview}</div>
            <div className={styles.roadmapPreview}>
              {roadmapPreview.map(({ cat, skill, count }) => (
                <div key={cat} className={styles.roadmapPreviewItem} onClick={() => setTab('roadmap')}>
                  <span className={styles.roadmapPreviewIcon}>{CATEGORY_ICONS[cat] || '◎'}</span>
                  <div className={styles.roadmapPreviewBody}>
                    <span className={styles.roadmapPreviewCat}>{cat.replace(/_/g, ' ')}</span>
                    <span className={styles.roadmapPreviewSkill}>{skill}{count > 1 ? ` +${count - 1}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.roadmapPreviewBtn} onClick={() => setTab('roadmap')}>
              {t.results.viewFullRoadmap}
            </button>
          </div>
        )}

        <div className={styles.sidebarActions}>
          <button className={styles.actionBtn} onClick={handleCopyRoadmap}>
            {copied === 'roadmap' ? <CheckIcon size={12}/> : <CopyIcon size={12}/>}
            {copied === 'roadmap' ? t.results.copied : t.results.copyRoadmap}
          </button>
          <button className={styles.actionBtn} onClick={handleShare}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {copied === 'share' ? t.results.copied : t.results.shareResults}
          </button>
          <button className={styles.actionBtn} onClick={handleExportPdf} disabled={pdfLoading}>
            {pdfLoading
              ? <span className={styles.spinner}/>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            }
            {pdfLoading ? '...' : t.results.downloadPdf}
          </button>
          <button className={styles.actionBtnNew} onClick={() => { onNewAnalysis?.(); onBack?.() }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7-7 7 7"/>
            </svg>
            {t.results.newAnalysis}
          </button>
        </div>
      </aside>

      {/* ─ MAIN ─ */}
      <main className={styles.main}>
        <div className={styles.tabsSticky}>
          <div className={styles.tabs}>
            {tabs.map(({ key, label }) => (
              <button key={key} className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
                onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tabContent} key={`${tab}${activeProfName}${cardKey}`}>

          {/* ─ BEST MATCH ─ */}
          {tab === 'best' && activeProf && (() => {
            const rows = orderedRows(ALL_SCORE_ROWS, 'score')
            return (
              <div className={styles.bestCard}>
                <div className={styles.bestHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <ProgressRing value={activeProf.final_score ?? 0} size={72} stroke={5}
                      color="#5b8dee" animKey={animKey}/>
                    <div>
                      <div className={styles.bestRank}>#{1} {t.results.bestMatch}</div>
                      <div className={styles.bestName}>{activeProf.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className={styles.topBadge}>{t.results.bestMatch.toUpperCase()}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['bars', 'radar', 'gap'].map(m => (
                        <button key={m} onClick={() => setViewMode(m)} style={{
                          padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: viewMode === m ? 'var(--accent-light)' : 'transparent',
                          color: viewMode === m ? 'var(--accent)' : 'var(--text-3)',
                          fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                          cursor: 'pointer', transition: 'all var(--transition)',
                        }}>
                          {m === 'bars' ? 'Bars' : m === 'radar' ? 'Radar' : (lang === 'ru' ? 'Разрыв' : 'Gap')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {viewMode === 'bars' && (
                  <ProfScores p={activeProf} rows={rows} animKey={animKey} lang={lang}/>
                )}
                {viewMode === 'radar' && (
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '16px 0 8px', flexWrap: 'wrap' }}>
                    <RadarChart data={activeProf} animKey={animKey} lang={lang}/>
                    <MetricBars data={activeProf} rows={rows} animKey={animKey} lang={lang}/>
                  </div>
                )}
                {viewMode === 'gap' && (
                  <div style={{ padding: '16px 0 8px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                      {lang === 'ru'
                        ? 'Синий — ваши навыки, зеленый — эталон профессии'
                        : 'Blue — your skills, green — profession ideal'}
                    </p>
                    <div style={{
                        display: 'flex', gap: 24, alignItems: 'center',
                        padding: '16px 0 8px', flexWrap: 'wrap',
                      }}>
                        <SkillGapRadar results={results} formData={results._formData} animKey={animKey} lang={lang} />
                        <MetricBars data={activeProf} rows={rows} animKey={animKey} lang={lang} />
                      </div>
                  </div>
                )}

                {activeProf.vacancies_per_week && (
                  <div className={styles.demandRow}>
                    <div className={styles.demandItem}>
                      <VacancyTrend value={activeProf.vacancies_per_week}/>
                      {activeProf.vacancies_per_week.toLocaleString()} {t.results.vacanciesWeek}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ─ ALL PROFESSIONS ─ */}
          {tab === 'all' && (
            <>
              <div className={styles.sortBar}>
                <span className={styles.sortLabel}>{t.results.sortBy}</span>
                {SORT_OPTIONS.map(({ key, label }) => (
                  <button key={key}
                    className={`${styles.sortBtn} ${sortBy === key ? styles.sortBtnActive : ''}`}
                    onClick={() => setSortBy(key)}>{label}
                  </button>
                ))}
              </div>
              <div className={styles.allGrid}>
                {sorted.map((p, i) => {
                  const rows = orderedRows(ALL_SCORE_ROWS, sortBy)
                  const aKey = `${p.name}${sortBy}`
                  return (
                    <div key={p.name} className={`${styles.profCard} ${i === 0 ? styles.profCardTop : ''}`}>
                      <div className={styles.profHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ProgressRing value={p.final_score ?? 0} size={40} stroke={3}
                            color={BAR_COLORS.skill_match} animKey={aKey}/>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={styles.profRank}>#{i+1}</span>
                            <span className={styles.profName}>{p.name}</span>
                            {i === 0 && <span className={styles.topBadge}>{t.results.bestMatch.toUpperCase()}</span>}
                          </div>
                        </div>
                      </div>
                      <ProfScores p={p} rows={rows} animKey={aKey} lang={lang}/>
                      {p.vacancies_per_week && (
                        <div className={styles.demandRow}>
                          <div className={styles.demandItem}>
                            <VacancyTrend value={p.vacancies_per_week}/>
                            {p.vacancies_per_week.toLocaleString()} {t.results.vacanciesWeek}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ─ ROADMAP ─ */}
          {tab === 'roadmap' && (
  <>
    <p className={styles.roadmapHint}>
      {t.results.skillsToLearn} <strong>{top_profession}</strong>
    </p>
    <div className={styles.roadmap}>
      {Object.entries(roadmapAdapted).map(([cat, skills]) => {
        const isOpen = openCats.has(cat)

        // Sorting: uncompleted at top, completed at bottom
        const sorted = [...skills].sort((a, b) => {
          const aDone = doneSkills.has(`${cat}::${a.skill}`)
          const bDone = doneSkills.has(`${cat}::${b.skill}`)
          return aDone - bDone
        })

        const doneCount = skills.filter(s => doneSkills.has(`${cat}::${s.skill}`)).length

        return (
          <div key={cat} className={styles.roadmapCat}>
            <button className={styles.catHeader} onClick={() => toggleCat(cat)}>
              <span className={styles.catIcon}>{CATEGORY_ICONS[cat] || '◎'}</span>
              <span className={styles.catName}>{cat.replace(/_/g, ' ').toUpperCase()}</span>
              <span className={styles.catCount}>{skills.length} skills</span>
              {/* progress inside category */}
              {doneCount > 0 && (
                <span style={{
                  fontSize: '0.68rem', fontFamily: 'var(--font-mono)',
                  color: '#1f533c', marginLeft: 6,
                }}>
                  {doneCount}/{skills.length} ✓
                </span>
              )}
              <span style={{ marginLeft: 'auto', color: 'var(--text-3)', display: 'flex' }}>
                <ChevronIcon dir={isOpen ? 'up' : 'down'}/>
              </span>
            </button>

            {isOpen && (
              <div className={styles.skillList}>
                {sorted.map((s, i) => {
                  const isDone = doneSkills.has(`${cat}::${s.skill}`)
                  return (
                    <div key={i} className={styles.skillItem}
                      style={{ opacity: isDone ? 0.45 : 1, transition: 'opacity 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {/* Clickable checkbox */}
                        <button
                          onClick={() => toggleSkill(cat, s.skill)}
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            border: `1.5px solid ${isDone ? '#4caf82' : 'var(--border)'}`,
                            background: isDone ? '#4caf82' : 'transparent',
                            flexShrink: 0, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            padding: 0,
                          }}
                        >
                          {isDone && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                        <span className={styles.skillName} style={{
                          margin: 0,
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-3)' : 'var(--text)',
                          transition: 'color 0.2s ease',
                        }}>
                          {cap(s.skill)}
                        </span>
                      </div>

                      {!isDone && s.courses.length > 0 && (
                        <div className={styles.courses}>
                          {s.courses.map((c, j) => (
                            <div key={j} className={styles.courseWrap}>
                              <div className={styles.course} style={{ cursor: 'pointer' }}
                                onClick={() => setActiveCourse(c)}>
                                <span className={styles.coursePlatform}>{c.platform}</span>
                                <span className={styles.courseTitle}>{c.title}</span>
                                <span className={styles.courseMeta}>
                                  {c.rating && <span className={styles.courseRating}>★ {c.rating}</span>}
                                  {c.reviews != null && (
                                    <span className={styles.courseReviews}>
                                      {Number(c.reviews).toLocaleString()} reviews
                                    </span>
                                  )}
                                </span>
                              </div>
                              <button className={styles.courseCopyBtn}
                                onClick={e => {
                                  e.preventDefault()
                                  const text = c.url ? `${c.title} (${c.platform}): ${c.url}` : `${c.title} (${c.platform})`
                                  copyText(text)
                                  setCopiedMsg(`course-${j}-${i}`)
                                  setTimeout(() => setCopiedMsg(null), 2000)
                                }}>
                                {copiedMsg === `course-${j}-${i}` ? <CheckIcon/> : <CopyIcon/>}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  </>
)}
        </div>
      </main>

      {/* ─ RIGHT CHAT ─ */}
      <aside className={styles.chatSidebar}>
        <div className={styles.chatHeader}>
          <div className={styles.chatDot}/>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className={styles.chatTitle}>{t.results.chatTitle}</span>
        </div>

        <div className={styles.chatMessages}>
          {messages.length === 0 && (
            <div className={styles.chatEmpty}>
              <span className={styles.chatEmptyIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </span>
              <span>Ask anything about your results</span>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAi}`}>
              <div className={styles.msgOuter}>
                {m.thoughts && !m.streaming && (
                  <details className={styles.thoughtBlock}>
                    <summary>{lang === 'ru' ? 'Размышления' : 'Thoughts'}</summary>
                    <div className={styles.thoughtContent}>{m.thoughts}</div>
                  </details>
                )}
                <div className={`${styles.msgBubble} ${m.streaming ? styles.msgStreaming : ''}`}>
                  {m.content}
                  {m.streaming && !m.content && (
                    <span style={{
                      display: 'inline-block', width: 2, height: '0.9em',
                      background: 'var(--accent)', marginLeft: 2,
                      verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite',
                    }}/>
                  )}
                </div>
                {!m.streaming && m.content && (
                  <button
                    className={`${styles.msgCopyBtn} ${m.role === 'user' ? styles.msgCopyBtnUser : styles.msgCopyBtnAi}`}
                    title="Copy"
                    onClick={() => {
                      copyText(m.content)
                      setCopiedMsg(`msg-${i}`)
                      setTimeout(() => setCopiedMsg(null), 2000)
                    }}
                  >
                    {copiedMsg === `msg-${i}` ? <CheckIcon size={10}/> : <CopyIcon size={10}/>}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {messages.length === 1 && messages[0]?.role === 'assistant' && !messages[0]?.streaming && (
            <div className={styles.chatSuggestions}>
              {t.results.suggestions.map(q => (
                <button key={q} className={styles.suggestion} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* Typing */}
          {chatLoading && messages[messages.length - 1]?.content === '' && (
            <div className={`${styles.msg} ${styles.msgAi}`}>
              <div className={styles.msgBubble}>
                <div className={styles.typing}><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        <div className={styles.chatBottom}>
          <div className={styles.chatToolbar}>
            <DeepModeBtn active={deepMode} onClick={() => setDeepMode(v => !v)} lang={lang}/>
          </div>
          <div className={styles.chatInput}>
            <textarea
              ref={textareaRef}
              className={styles.chatInputField}
              value={input}
              rows={1}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
              }}
              placeholder={t.results.chatPlaceholder}
            />
            <button className={styles.chatSend} onClick={() => sendMessage()} disabled={chatLoading || !input.trim()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ─ COURSE MODAL ─ */}
      {activeCourse && (
        <CourseModal course={activeCourse} onClose={() => setActiveCourse(null)}/>
      )}

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
