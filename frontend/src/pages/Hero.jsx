import { useApp } from '../context/AppContext'
import styles from './Hero.module.css'

const features = [
  { icon: '◎', key: 0 },
  { icon: '◈', key: 1 },
  { icon: '◇', key: 2 },
]

export default function Hero({ onStart }) {
  const { t } = useApp()

  return (
    <div className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          {t.hero.badge}
        </div>

        <h1 className={styles.title}>
          {t.hero.title}
        </h1>

        <p className={styles.subtitle}>{t.hero.subtitle}</p>

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
      </div>
    </div>
  )
}
