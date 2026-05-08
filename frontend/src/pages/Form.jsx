import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import styles from './Form.module.css'

const TECH_SKILLS = [
  { key: 'python',           label: 'Python'           },
  { key: 'java',             label: 'Java'             },
  { key: 'c_cpp',            label: 'C/C++'            },
  { key: 'sql',              label: 'SQL'              },
  { key: 'machine_learning', label: 'Machine Learning' },
  { key: 'data_analysis',    label: 'Data Analysis'    },
  { key: 'cloud_computing',  label: 'Cloud Computing'  },
  { key: 'cybersecurity',    label: 'Cybersecurity'    },
  { key: 'web_development',  label: 'Web Development'  },
  { key: 'devops',           label: 'DevOps'           },
  { key: 'networking',       label: 'Networking'       },
]

const SOFT_KEYS = ['communication', 'leadership', 'problem_solving', 'teamwork', 'adaptability']
const FIELDS    = ['Data Science', 'Computer Science', 'Software Engineering', 'AI', 'Cybersecurity']

// Autocomplete suggestions list - add as many as you want here
const SKILL_SUGGESTIONS = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost',
  'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
  'Cloud Computing', 'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'DevOps', 'CI/CD', 'Git', 'Linux', 'Bash', 'Networking', 'Cybersecurity',
  'Web Development', 'React', 'Vue', 'Angular', 'FastAPI', 'Django', 'Flask', 'Node.js',
  'Spark', 'Hadoop', 'Kafka', 'Airflow', 'dbt', 'Tableau', 'Power BI', 'Excel',
  'R', 'MATLAB', 'Scala', 'Julia',
  'API Design', 'REST', 'GraphQL', 'Microservices', 'System Design', 'Agile', 'Scrum',
]

const DEFAULT = {
  skills: [], gpa: '', field_of_study: 'Computer Science',
  python: 0, java: 0, c_cpp: 0, sql: 0, machine_learning: 0,
  data_analysis: 0, cloud_computing: 0, cybersecurity: 0,
  web_development: 0, devops: 0, networking: 0,
  communication: 3, leadership: 3, problem_solving: 3, teamwork: 3, adaptability: 3,
}

const ChevronIcon = ({ dir = 'left' }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    {dir === 'left'  && <path d="M15 18l-6-6 6-6"/>}
    {dir === 'right' && <path d="M9 18l6-6-6-6"/>}
  </svg>
)

export default function Form({ onSubmit, loading }) {
  const { t, lang } = useApp()
  const [form,       setForm]       = useState(DEFAULT)
  const [skillInput, setSkillInput] = useState('')
  const [errors,     setErrors]     = useState({})
  const [tipIdx,     setTipIdx]     = useState(0)
  const [leftOpen,   setLeftOpen]   = useState(true)
  const [rightOpen,  setRightOpen]  = useState(true)
  const [acVisible,  setAcVisible]  = useState(false)  // autocomplete dropdown
  const [acIndex,    setAcIndex]    = useState(-1)      // selected item in dropdown

  const tipTimer   = useRef(null)
  const acRef      = useRef(null)
  const inputRef   = useRef(null)

  const tips = t.form.tips

  useEffect(() => {
    tipTimer.current = setInterval(() => setTipIdx(i => (i + 1) % tips.length), 5000)
    return () => clearInterval(tipTimer.current)
  }, [tips.length])

  // Close dropdown when clicked outside
  useEffect(() => {
    const handler = e => {
      if (acRef.current && !acRef.current.contains(e.target)) {
        setAcVisible(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filtered suggestions
  const acFiltered = skillInput.trim().length >= 1
    ? SKILL_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(skillInput.toLowerCase()) &&
        !form.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())
      ).slice(0, 8)
    : []

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const addSkill = (raw) => {
    const s = raw.trim()
    if (s && !form.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())) {
      set('skills', [...form.skills, s])
    }
    setSkillInput('')
    setAcVisible(false)
    setAcIndex(-1)
    inputRef.current?.focus()
  }

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s))

  const handleSkillKey = (e) => {
    if (acVisible && acFiltered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setAcIndex(i => Math.min(i + 1, acFiltered.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setAcIndex(i => Math.max(i - 1, -1))
        return
      }
      if (e.key === 'Enter' && acIndex >= 0) {
        e.preventDefault()
        addSkill(acFiltered[acIndex])
        return
      }
      if (e.key === 'Escape') {
        setAcVisible(false)
        setAcIndex(-1)
        return
      }
    }
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault()
      if (skillInput.trim()) addSkill(skillInput)
    }
    if (e.key === 'Backspace' && !skillInput && form.skills.length) {
      set('skills', form.skills.slice(0, -1))
    }
  }

  const handleSkillInput = (e) => {
    setSkillInput(e.target.value)
    setAcVisible(true)
    setAcIndex(-1)
  }

  const validate = () => {
    const e = {}
    if (!form.gpa || form.gpa < 0 || form.gpa > 4) e.gpa = t.errors.gpa
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, gpa: Number(form.gpa), lang })
  }

  const techChecked  = TECH_SKILLS.filter(s => form[s.key] === 1).length
  const softAvg      = SOFT_KEYS.reduce((a, k) => a + form[k], 0) / SOFT_KEYS.length
  const hasSkills    = form.skills.length > 0
  const hasGpa       = form.gpa !== '' && Number(form.gpa) >= 0 && Number(form.gpa) <= 4
  const completedSteps = [hasSkills, hasGpa, techChecked > 0, true].filter(Boolean).length
  const progress     = Math.round((completedSteps / 4) * 100)

  const layoutClass = [
    styles.pageLayout,
    !leftOpen  ? styles.pageLayoutLeftClosed  : '',
    !rightOpen ? styles.pageLayoutRightClosed : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={layoutClass}>

      {/* LEFT TOGGLE */}
      <button
        className={[styles.sidebarToggle, styles.sidebarToggleLeft, !leftOpen ? styles.sidebarToggleLeftClosed : ''].join(' ')}
        onClick={() => setLeftOpen(v => !v)}
        title={leftOpen ? t.form.collapseLeft : t.form.expandLeft}
      >
        <ChevronIcon dir={leftOpen ? 'left' : 'right'}/>
      </button>

      {/* RIGHT TOGGLE */}
      <button
        className={[styles.sidebarToggle, styles.sidebarToggleRight, !rightOpen ? styles.sidebarToggleRightClosed : ''].join(' ')}
        onClick={() => setRightOpen(v => !v)}
        title={rightOpen ? t.form.collapseRight : t.form.expandRight}
      >
        <ChevronIcon dir={rightOpen ? 'right' : 'left'}/>
      </button>

      {/* LEFT SIDEBAR */}
      <aside className={styles.formSidebar}>
        <div className={styles.formSidebarInner}>
          <div className={styles.sidebarBrand}>
            <div className={styles.sidebarBrandDot}/>
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>{t.form.sidebar.progress}</div>
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }}/>
              </div>
              <span className={styles.progressPct}>{progress}%</span>
            </div>
            <div className={styles.progressSteps}>
              {[
                { label: t.form.sidebar.steps.customSkills, done: hasSkills       },
                { label: t.form.sidebar.steps.gpa,          done: hasGpa          },
                { label: t.form.sidebar.steps.tech,         done: techChecked > 0 },
                { label: t.form.sidebar.steps.soft,         done: true            },
              ].map(({ label, done }) => (
                <div key={label} className={`${styles.progressStep} ${done ? styles.progressStepDone : ''}`}>
                  <span className={styles.progressDot}>{done ? '✓' : '○'}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>{t.form.sidebar.selectedTech}</div>
            {techChecked === 0
              ? <div className={styles.sidebarEmpty}>{t.form.sidebar.noTech}</div>
              : (
                <div className={styles.sidebarTags}>
                  {TECH_SKILLS.filter(s => form[s.key] === 1).map(s => (
                    <span key={s.key} className={styles.sidebarTag}>{s.label}</span>
                  ))}
                </div>
              )
            }
          </div>

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>{t.form.sidebar.softAvg}</div>
            <div className={styles.softAvgRow}>
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`${styles.softAvgDot} ${softAvg >= n ? styles.softAvgDotOn : ''}`}/>
              ))}
              <span className={styles.softAvgVal}>{softAvg.toFixed(1)}</span>
            </div>
          </div>

          <div className={styles.tipBox}>
            <div className={styles.tipIcon}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <div className={styles.tipText}>{tips[tipIdx]}</div>
          </div>
        </div>
      </aside>

      {/* MAIN FORM */}
      <div className={styles.formMain}>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t.form.title}</h1>
            <p className={styles.subtitle}>{t.form.subtitle}</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>

            {/* ── Custom Skills with Autocomplete ── */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>{t.form.skills.label}</div>
              <p className={styles.hint}>{t.form.skills.hint}</p>
              <div className={styles.tagsInputWrap} ref={acRef}>
                <div
                  className={`${styles.tagsInput} ${errors.skills ? styles.error : ''}`}
                  onClick={() => inputRef.current?.focus()}
                >
                  {form.skills.map(s => (
                    <span key={s} className={styles.tag}>
                      {s}
                      <button type="button" className={styles.tagX} onClick={() => removeSkill(s)}>×</button>
                    </span>
                  ))}
                  <input
                    ref={inputRef}
                    className={styles.tagsInner}
                    value={skillInput}
                    onChange={handleSkillInput}
                    onKeyDown={handleSkillKey}
                    onFocus={() => skillInput.trim() && setAcVisible(true)}
                    onBlur={() => setTimeout(() => setAcVisible(false), 150)}
                    placeholder={form.skills.length ? '' : t.form.skills.placeholder}
                    autoComplete="off"
                  />
                </div>

                {/* Autocomplete dropdown */}
                {acVisible && acFiltered.length > 0 && (
                  <div className={styles.acDropdown}>
                    {acFiltered.map((s, i) => (
                      <button
                        key={s}
                        type="button"
                        className={`${styles.acItem} ${i === acIndex ? styles.acItemActive : ''}`}
                        onMouseDown={() => addSkill(s)}
                        onMouseEnter={() => setAcIndex(i)}
                      >
                        <span className={styles.acItemText}>{s}</span>
                        {/* highlight matching part */}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick suggestions - popular skills */}
              <div className={styles.skillQuick}>
                {['Python', 'SQL', 'React','Git','PostgreSQL'].map(s => {
                  const already = form.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.skillQuickBtn} ${already ? styles.skillQuickBtnAdded : ''}`}
                      onClick={() => already ? removeSkill(form.skills.find(x => x.toLowerCase() === s.toLowerCase())) : addSkill(s)}
                    >
                      {already ? '✓ ' : '+ '}{s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Personal ── */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>{t.form.personal.label}</div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>{t.form.personal.gpa}</label>
                  <input
                    className={`${styles.input} ${errors.gpa ? styles.error : ''}`}
                    type="number" min="0" max="4" step="0.1"
                    value={form.gpa} placeholder="3.5"
                    onChange={e => set('gpa', e.target.value)}
                  />
                  {errors.gpa && <span className={styles.errorMsg}>{errors.gpa}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t.form.personal.field}</label>
                  <select
                    className={styles.select}
                    value={form.field_of_study}
                    onChange={e => set('field_of_study', e.target.value)}
                  >
                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Technical Skills ── */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>{t.form.technical.label}</div>
              <p className={styles.hint}>{t.form.technical.hint}</p>
              <div className={styles.checkGrid}>
                {TECH_SKILLS.map(({ key, label }) => (
                  <label key={key} className={styles.checkItem}>
                    <input
                      type="checkbox" className={styles.checkbox}
                      checked={form[key] === 1}
                      onChange={e => set(key, e.target.checked ? 1 : 0)}
                    />
                    <span className={styles.checkBox}>{form[key] === 1 ? '✓' : ''}</span>
                    <span className={styles.checkLabel}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Soft Skills ── */}
            <div className={styles.section}>
              <div className={styles.sectionLabel}>{t.form.soft.label}</div>
              <p className={styles.hint}>{t.form.soft.hint}</p>
              <div className={styles.softGrid}>
                {SOFT_KEYS.map(key => (
                  <div key={key} className={styles.softItem}>
                    <span className={styles.softLabel}>{t.form.soft[key]}</span>
                    <div className={styles.stars}>
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n} type="button"
                          className={`${styles.star} ${form[key] >= n ? styles.starOn : ''}`}
                          onClick={() => set(key, n)}
                        >●</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading && <span className={styles.spinner}/>}
              {loading ? t.form.submitting : t.form.submit}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT GUIDE */}
      <aside className={styles.formChat}>
        <div className={styles.chatHeader}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className={styles.chatTitle}>{t.form.guide.title}</span>
        </div>
        <div className={styles.chatBody}>
          <div className={styles.chatMsg}>
            <div className={styles.chatBubble}>{t.form.guide.msg1}</div>
          </div>
          <div className={styles.chatMsg}>
            <div className={styles.chatBubble}>{t.form.guide.msg2}</div>
          </div>
          <div className={styles.chatMsg}>
            <div className={styles.chatBubble}>
              <strong>{t.form.guide.professionsTitle}</strong>
              <ul className={styles.chatList}>
                <li>Data Analyst</li><li>Data Engineer</li><li>Data Scientist</li>
                <li>ML Engineer</li><li>Business Analyst</li>
                <li>Cloud Engineer</li><li>Software Engineer</li>
              </ul>
            </div>
          </div>
          <div className={styles.chatMsg}>
            <div className={styles.chatBubble}>
              <strong>{t.form.guide.scoringTitle}</strong>
              <div className={styles.formula}>
                {t.form.guide.scoring.map(({ label, sub }, i) => (
                  <div key={i} className={styles.formulaStep}>
                    <div className={styles.formulaStepNum}>{i + 1}</div>
                    <div className={styles.formulaStepBody}>
                      <span className={styles.formulaStepLabel}>{label}</span>
                      <span className={styles.formulaStepSub}>{sub}</span>
                    </div>
                  </div>
                ))}
                <div className={styles.formulaFooter}>
                  <span className={styles.formulaArrow}>↑</span>
                  <span className={styles.formulaResult}>{t.form.guide.finalScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
