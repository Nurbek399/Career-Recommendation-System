import { useState } from 'react'
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

  return (
    <>
      <Navbar />

      {page === 'hero' && (
        <Hero onStart={handleStart} />
      )}

      {page === 'form' && (
        <>
          {error && (
            <div style={{
              maxWidth: 600,
              margin: '1rem auto',
              padding: '0.75rem 1rem',
              background: 'var(--color-error-highlight)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
            }}>
              {error}
            </div>
          )}
          <Form onSubmit={handleSubmit} loading={loading} />
        </>
      )}

      {page === 'results' && results && (
        <Results results={results} onBack={handleBack} onRetry={handleToForm} />
      )}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
