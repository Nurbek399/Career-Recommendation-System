import { useApp } from '../context/AppContext'
import styles from './Hero.module.css'

const features = [
  { icon: '01', key: 0 },
  { icon: '02', key: 1 },
  { icon: '03', key: 2 },
]

export default function Hero({ onStart }) {
  const { t, lang } = useApp()
  const metrics = [
    { value: '7', label: t.hero.metrics?.[0] || 'career tracks' },
    { value: '41k+', label: t.hero.metrics?.[1] || 'courses' },
    { value: '4', label: t.hero.metrics?.[2] || 'signals' },
  ]

  return (
    <div className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.orbit} aria-hidden="true">
        <span className={styles.nodeA} />
        <span className={styles.nodeB} />
        <span className={styles.nodeC} />
      </div>

      <section className={styles.content}>
        <div className={styles.kicker}>
          <span className={styles.kickerLine} />
          <span>{t.hero.badge}</span>
        </div>

        <h1 className={`${styles.title} ${lang !== 'en' ? styles.titleCyrillic : ''}`}>
          <span>{t.hero.title}</span>
        </h1>

        <p className={styles.subtitle}>{t.hero.subtitle}</p>

        <div className={styles.metrics} aria-label="Project capabilities">
          {metrics.map(item => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.features}>
          {features.map((f, i) => (
            <div key={f.key} className={styles.feature} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <span>{t.hero.features[i]}</span>
            </div>
          ))}
        </div>

        <button className={styles.cta} onClick={onStart}>
          {t.hero.cta}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

        <div className={styles.scrollCue} aria-hidden="true">
          <span />
          <small>{t.hero.footer || 'profile · skills · market'}</small>
        </div>
      </section>

      <aside className={styles.methodPanel} aria-label={t.hero.panelTitle}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIndex}>04</span>
          <span>{t.hero.panelTitle}</span>
        </div>
        <div className={styles.panelSteps}>
          {(t.hero.panelItems || []).map((item, index) => (
            <div key={item.label} className={styles.panelStep}>
              <div className={styles.panelStepNum}>{String(index + 1).padStart(2, '0')}</div>
              <div className={styles.panelStepBody}>
                <strong>{item.label}</strong>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.panelFooter}>
          <span />
          <small>{t.hero.features?.join(' · ')}</small>
        </div>
      </aside>
    </div>
  )
}
