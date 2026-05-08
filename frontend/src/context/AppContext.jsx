import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n'

const AppContext = createContext()

const safeGet = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback }
  catch { return fallback }
}
const safeSave = (key, val) => {
  try { localStorage.setItem(key, val) } catch {}
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => safeGet('theme', 'dark'))
  const [lang,  setLang]  = useState(() => safeGet('lang',  'ru'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    safeSave('theme', theme)
  }, [theme])

  useEffect(() => {
    safeSave('lang', lang)
  }, [lang])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const toggleLang  = () => setLang(l => l === 'ru' ? 'en' : 'ru')

  const t = translations[lang]

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)