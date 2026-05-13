import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Hero from './pages/Hero'
import Form from './pages/Form'
import Results from './pages/Results'
import { getRecommendation } from './utils/api'
import './index.css'

function AppInner() {
  const { t } = useApp()
  const [page, setPage] = useState('hero')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleStart  = () => setPage('form')
  const handleBack   = () => setPage('hero')
  const handleToForm = () => setPage('form')

  const handleSubmit = async (profile) => {
    setLoading(true)
    setError('')
    try {
      const data = await getRecommendation(profile)
      setResults({ ...data, _formData: profile })
      setPage('results')
    } catch (e) {
      setError(t.errors.api)
    } finally {
      setLoading(false)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, scale: 0.975, y: 18, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.025, y: -18, filter: 'blur(10px)' },
  }

  return (
    <div className="appShell">
      <div className="dataGrid" aria-hidden="true" />

      <Navbar onLogoClick={handleBack} />

      <AnimatePresence mode="wait">
        {page === 'hero' && (
          <motion.main
            key="hero"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <Hero onStart={handleStart} />
          </motion.main>
        )}

        {page === 'form' && (
          <motion.main
            key="form"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {error && (
              <div className="appError">
                {error}
              </div>
            )}
            <Form onSubmit={handleSubmit} loading={loading} />
          </motion.main>
        )}

        {page === 'results' && results && (
          <motion.main
            key="results"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <Results results={results} onBack={handleBack} onRetry={handleToForm} />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
