import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  assignActorToMovie,
  createActor,
  fetchActorMovies,
  fetchActors,
} from '../api/actors'
import { fetchMovies } from '../api/movies'
import type {
  ActedMovie,
  Actor,
  ActorForm,
  ActorMovieAssignmentForm,
} from '../types/actor'
import type { Movie } from '../types/movie'
import './ActorsView.css'

const initialForm: ActorForm = {
  name: '',
  age: '',
  country: '',
}

const initialAssignmentForm: ActorMovieAssignmentForm = {
  actor_id: '',
  movie_id: '',
  role_type: '',
}

const roleTypes = [
  'Lead',
  'Supporting',
  'Cameo',
  'Guest',
]

function ActorsView() {
  const [actors, setActors] = useState<Actor[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [actedMovies, setActedMovies] = useState<ActedMovie[]>([])
  const [selectedActorId, setSelectedActorId] = useState('')
  const [form, setForm] = useState<ActorForm>(initialForm)
  const [assignmentForm, setAssignmentForm] =
    useState<ActorMovieAssignmentForm>(initialAssignmentForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isLoadingActedMovies, setIsLoadingActedMovies] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 1 &&
      Number.isInteger(Number(form.age)) &&
      Number(form.age) >= 0 &&
      Number(form.age) <= 120 &&
      form.country.trim().length >= 2
    )
  }, [form])

  const canAssignMovie = useMemo(() => {
    return (
      assignmentForm.actor_id.length > 0 &&
      assignmentForm.movie_id.length > 0 &&
      assignmentForm.role_type.length > 0
    )
  }, [assignmentForm])

  useEffect(() => {
    void loadActors()
  }, [])

  async function loadActors() {
    setIsLoading(true)
    setError(null)

    try {
      const [actorsData, moviesData] = await Promise.all([
        fetchActors(),
        fetchMovies(),
      ])

      setActors(actorsData)
      setMovies(moviesData)
      setActedMovies([])
      setSelectedActorId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAssignActorToMovie(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canAssignMovie) {
      return
    }

    setIsAssigning(true)
    setError(null)
    setAssignmentMessage(null)

    try {
      await assignActorToMovie({
        actor_id: assignmentForm.actor_id,
        movie_id: assignmentForm.movie_id,
        role_type: assignmentForm.role_type,
      })

      setAssignmentForm(initialAssignmentForm)
      setAssignmentMessage('Actor assigned to movie.')

      if (selectedActorId === assignmentForm.actor_id) {
        setActedMovies(await fetchActorMovies(selectedActorId))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsAssigning(false)
    }
  }

  async function handleSelectedActorChange(actorId: string) {
    setSelectedActorId(actorId)
    setActedMovies([])
    setError(null)

    if (!actorId) {
      return
    }

    setIsLoadingActedMovies(true)

    try {
      setActedMovies(await fetchActorMovies(actorId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystapil nieznany blad.')
    } finally {
      setIsLoadingActedMovies(false)
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
        <div className="actors-side">
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

          <section className="panel">
            <h3>Assign movie</h3>
            <form className="actor-form" onSubmit={(event) => void handleAssignActorToMovie(event)}>
              <label>
                Actor
                <select
                  disabled={actors.length === 0}
                  name="actor_id"
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      actor_id: event.target.value,
                    })
                  }
                  required
                  value={assignmentForm.actor_id}
                >
                  <option value="">Select actor</option>
                  {actors.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {actor.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Movie
                <select
                  disabled={movies.length === 0}
                  name="movie_id"
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      movie_id: event.target.value,
                    })
                  }
                  required
                  value={assignmentForm.movie_id}
                >
                  <option value="">Select movie</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Role type
                <select
                  name="role_type"
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      role_type: event.target.value,
                    })
                  }
                  required
                  value={assignmentForm.role_type}
                >
                  <option value="">Select role type</option>
                  {roleTypes.map((roleType) => (
                    <option key={roleType} value={roleType}>
                      {roleType}
                    </option>
                  ))}
                </select>
              </label>

              {assignmentMessage ? (
                <p className="message success-message">{assignmentMessage}</p>
              ) : null}

              <button
                className="primary-button"
                disabled={!canAssignMovie || isAssigning}
                type="submit"
              >
                {isAssigning ? 'Assigning...' : 'Assign actor'}
              </button>
            </form>
          </section>

          <section className="panel">
            <h3>Played in</h3>
            <div className="actor-form">
              <label>
                Actor
                <select
                  disabled={actors.length === 0}
                  name="selected_actor_id"
                  onChange={(event) => void handleSelectedActorChange(event.target.value)}
                  value={selectedActorId}
                >
                  <option value="">Select actor</option>
                  {actors.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {actor.name}
                    </option>
                  ))}
                </select>
              </label>

              {isLoadingActedMovies ? (
                <p className="message">Loading actor movies...</p>
              ) : null}

              {!isLoadingActedMovies && selectedActorId && actedMovies.length === 0 ? (
                <p className="message">No movies assigned.</p>
              ) : null}

              {!isLoadingActedMovies && actedMovies.length > 0 ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Role</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actedMovies.map((actedMovie) => (
                        <tr key={actedMovie.movie.id}>
                          <td>{actedMovie.movie.title}</td>
                          <td>{actedMovie.role_type}</td>
                          <td>{actedMovie.movie.category.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </section>
        </div>

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
