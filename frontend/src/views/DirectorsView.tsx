import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createDirector, fetchDirectors } from '../api/directors'
import type { Director, DirectorForm } from '../types/director'
import './DirectorsView.css'

const initialForm: DirectorForm = {
  name: '',
  country: '',
}

function DirectorsView() {
  const [directors, setDirectors] = useState<Director[]>([])
  const [form, setForm] = useState<DirectorForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 1 && form.country.trim().length >= 2
  }, [form])

  useEffect(() => {
    void loadDirectors()
  }, [])

  async function loadDirectors() {
    setIsLoading(true)
    setError(null)

    try {
      setDirectors(await fetchDirectors())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateDirector(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const createdDirector = await createDirector({
        name: form.name.trim(),
        country: form.country.trim(),
      })

      setDirectors((currentDirectors) => [...currentDirectors, createdDirector])
      setForm(initialForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h2>Directors</h2>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadDirectors()}>
          Refresh
        </button>
      </header>

      <div className="directors-layout">
        <section className="panel">
          <h3>Add director</h3>
          <form className="director-form" onSubmit={(event) => void handleCreateDirector(event)}>
            <label>
              Name
              <input
                minLength={1}
                name="name"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Roman Polanski"
                required
                type="text"
                value={form.name}
              />
            </label>

            <label>
              Country
              <input
                minLength={2}
                name="country"
                onChange={(event) => setForm({ ...form, country: event.target.value })}
                placeholder="Poland"
                required
                type="text"
                value={form.country}
              />
            </label>

            <button className="primary-button" disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? 'Adding...' : 'Add director'}
            </button>
          </form>
        </section>

        <section className="panel directors-panel">
          <div className="panel-title-row">
            <h3>All directors</h3>
            <span>{directors.length}</span>
          </div>

          {error ? <p className="message error-message">{error}</p> : null}
          {isLoading ? <p className="message">Loading directors...</p> : null}

          {!isLoading && directors.length === 0 ? (
            <p className="message">No directors yet.</p>
          ) : null}

          {!isLoading && directors.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {directors.map((director) => (
                    <tr key={director.id}>
                      <td>{director.name}</td>
                      <td>{director.country}</td>
                      <td className="muted-cell">{director.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </>
  )
}

export default DirectorsView
