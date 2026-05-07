import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createActor, fetchActors } from '../api/actors'
import type { Actor, ActorForm } from '../types/actor'
import './ActorsView.css'

const initialForm: ActorForm = {
  name: '',
  age: '',
  country: '',
}

function ActorsView() {
  const [actors, setActors] = useState<Actor[]>([])
  const [form, setForm] = useState<ActorForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 1 &&
      Number.isInteger(Number(form.age)) &&
      Number(form.age) >= 0 &&
      Number(form.age) <= 120 &&
      form.country.trim().length >= 2
    )
  }, [form])

  useEffect(() => {
    void loadActors()
  }, [])

  async function loadActors() {
    setIsLoading(true)
    setError(null)

    try {
      setActors(await fetchActors())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateActor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const createdActor = await createActor({
        name: form.name.trim(),
        age: Number(form.age),
        country: form.country.trim(),
      })

      setActors((currentActors) => [...currentActors, createdActor])
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
          <h2>Actors</h2>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadActors()}>
          Refresh
        </button>
      </header>

      <div className="actors-layout">
        <section className="panel">
          <h3>Add actor</h3>
          <form className="actor-form" onSubmit={(event) => void handleCreateActor(event)}>
            <label>
              Name
              <input
                minLength={1}
                name="name"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Cezary Zak"
                required
                type="text"
                value={form.name}
              />
            </label>

            <label>
              Age
              <input
                max={120}
                min={0}
                name="age"
                onChange={(event) => setForm({ ...form, age: event.target.value })}
                placeholder="67"
                required
                type="number"
                value={form.age}
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
              {isSubmitting ? 'Adding...' : 'Add actor'}
            </button>
          </form>
        </section>

        <section className="panel actors-panel">
          <div className="panel-title-row">
            <h3>All actors</h3>
            <span>{actors.length}</span>
          </div>

          {error ? <p className="message error-message">{error}</p> : null}
          {isLoading ? <p className="message">Loading actors...</p> : null}

          {!isLoading && actors.length === 0 ? <p className="message">No actors yet.</p> : null}

          {!isLoading && actors.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Country</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {actors.map((actor) => (
                    <tr key={actor.id}>
                      <td>{actor.name}</td>
                      <td>{actor.age}</td>
                      <td>{actor.country}</td>
                      <td className="muted-cell">{actor.id}</td>
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

export default ActorsView
