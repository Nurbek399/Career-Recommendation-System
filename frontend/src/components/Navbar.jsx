import { useApp } from '../context/AppContext'
import styles from './Navbar.module.css'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

// Minimal hexagon/path logo mark — Linear-style
const LogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 9h8M9 5v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export default function Navbar({ onLogoClick }) {
  const { theme, toggleTheme, toggleLang, t } = useApp()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <button className={styles.logo} onClick={onLogoClick}>
          <span className={styles.logoMark}><LogoMark /></span>
          <span className={styles.logoText}>Build Career</span>
        </button>
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className={styles.langBtn} onClick={toggleLang}>{t.nav.lang}</button>
        </div>
      </div>
    </nav>
  )
}
